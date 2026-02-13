const express = require("express");
const XLSX=require('xlsx');
const cors = require("cors");
const app = express();
const PORT = 5501;
const { MongoClient } = require('mongodb');
const client=new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
let allData=[];
let attendanceDict = {}; 

app.use(cors());
app.use(express.json());

//const path = require('path');

function createAttendanceDictionary(records) {
    const dict = {};
    if (!Array.isArray(records)) return dict;

    function formatTimeOnly(dt) {
        const h = String(dt.getUTCHours()).padStart(2, '0');
        const m = String(dt.getUTCMinutes()).padStart(2, '0');
        const s = String(dt.getUTCSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    records.forEach(rec => {
        const emp = rec.EmployeeCode || rec['Employee Code'] || rec.DeviceCode;
        if (!emp) return;

        const timeStr = rec.LogDateTime || rec['LogDateTime'] || rec['Log DateTime'];
        if (!timeStr) return;

        const dt = new Date(timeStr);
        if (isNaN(dt)) return;

        const dateKey = dt.toISOString().split('T')[0];
        const timeOnly = formatTimeOnly(dt);
        dict[dateKey] = dict[dateKey] || {};

        function addEmployeeFields(empObj) {
            const excluded = ['Employee Code', 'EmployeeCode', 'LogDateTime', 'Log Date Time', 'DeviceCode', '_id', '__v','NAME','SEX','DOR','EDPNO'];
            for (const key in rec) {
                if (!excluded.includes(key) && !(key in empObj)) {
                    empObj[key] = rec[key];
                }
            }
        }

        const empObj = dict[dateKey][emp];
        // If empObj doesn't exist, create it for this employee on this date
        if (!empObj) {
            // initialize employee object for this date
            dict[dateKey][emp] = {
                EmployeeCode: emp,
                date: dateKey,
                InTime: timeOnly,
                OutTime: null,
                EmployeeName: rec.EmployeeName || rec['Employee Name'] || '',
                HoursWorked: 0
            };
            // add other non-repeating fields at employee level
            addEmployeeFields(dict[dateKey][emp]);
        } else {
            // existing object for same employee & date
            const inTStr = dict[dateKey][emp].InTime;
            const outTStr = dict[dateKey][emp].OutTime;

            // Parse stored times back to Date for comparison (add Z for UTC)
            const inT = new Date(`${dateKey}T${inTStr}Z`);
            const outT = outTStr ? new Date(`${dateKey}T${outTStr}Z`) : null;

            // Only set OutTime if time difference is >= 30 minutes
            const diffMinutes = (dt - inT) / (1000 * 60);
            if (diffMinutes >= 10) {
                if (!outT || dt > outT) {
                    dict[dateKey][emp].OutTime = timeOnly;
                }
            }

            // Ensure InTime is the earliest punch
            if (dt < inT) {
                dict[dateKey][emp].InTime = timeOnly;
            }

            // Add any new non-repeating fields from this record to employee object
            addEmployeeFields(dict[dateKey][emp]);

            // Recalculate HoursWorked with updated times
            const finalInT = new Date(`${dateKey}T${dict[dateKey][emp].InTime}Z`);
            const finalOutT = dict[dateKey][emp].OutTime ? new Date(`${dateKey}T${dict[dateKey][emp].OutTime}Z`) : null;
            if (finalOutT && !isNaN(finalInT) && !isNaN(finalOutT)) {
                const diffHours = (finalOutT - finalInT) / (1000 * 60 * 60);
                dict[dateKey][emp].HoursWorked = Number(Math.max(0, diffHours).toFixed(2));
            }
        }
    });

    return dict;
}

//getData();
async function uploadAttendanceDictToMongo() {
    const docs = [];
    const today = new Date().toISOString().split('T')[0];
    
    for (const dateKey in attendanceDict) {
       // if (!Object.prototype.hasOwnProperty.call(attendanceDict, dateKey)) continue;
        if (dateKey === today) continue; // Skip today's data
        
        const dateData = attendanceDict[dateKey] || {};

        for (const emp in dateData) {
            if (!Object.prototype.hasOwnProperty.call(dateData, emp)) continue;
            const entry = dateData[emp] || {};

            const doc = {
                EmployeeCode: entry.EmployeeCode || emp,
                date: entry.date || dateKey,
                InTime: entry.InTime || null,
                OutTime: entry.OutTime || null,
                EmployeeName: entry.EmployeeName || entry['Employee Name'] || '',
                HoursWorked: typeof entry.HoursWorked === 'number' ? entry.HoursWorked : (entry.HoursWorked ? Number(entry.HoursWorked) : 0),
                SECTION: entry.SECTION || entry.SECT || '',
                CAT: entry.CAT || '',
                DESIG: entry.DESIG || entry.DESIGNATION || entry.Designation || '',
                Department: entry.Department || '',
                Designation: entry.Designation || ''
            };

            docs.push(doc);
        }
    }

    if (docs.length === 0) return { inserted: 0 };

    const uploadClient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await uploadClient.connect();
        const db = uploadClient.db('attendance');
        const col = db.collection('data');
        const result = await col.insertMany(docs);
        return { inserted: result.insertedCount };
    } finally {
        await uploadClient.close();
    }
}

app.get("/userPasswords", async (req, res) => {
    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        const docs = await col.find({}).toArray();
       
        res.json({ userPasswords: docs });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    } finally {
        await mclient.close();
    }
});

app.get("/data",(req,res)=>{
    const start = req.query.start;
    const end = req.query.end;
    if (!start || !end) return res.status(400).json({ status: "error", message: "Invalid date range" });
    getOldData(start, end)
        .then(docs => res.json(docs))
        .catch(err => res.status(500).json({ status: 'error', message: err.message }));

});


async function getOldData(start, end) {
    const queryStart = String(start);
    const queryEnd = String(end);
    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const db = mclient.db('attendance');
        const col = db.collection('data');
        const docs = await col.find({ date: { $gte: queryStart, $lte: queryEnd } }).toArray();
        return docs;
    } finally {
        await mclient.close();
    }
}


async function getDataByEmployeeCode(empCode) {
    const code = String(empCode);
    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const db = mclient.db('attendance');
        const col = db.collection('data');
        const docs = await col.find({ EmployeeCode: code }).toArray();
        return docs;
    } finally {
        await mclient.close();
    }
}


app.get('/employee', async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ status: 'error', message: 'Missing id parameter' });
    try {
        const docs = await getDataByEmployeeCode(id);
        res.json(docs);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});


app.get('/attendanceToday', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (!attendanceDict ) return res.status(500).json({ status: 'error', message: 'No attendance data for today' });
    
    const docs = [];
    
    
    for (const emp in attendanceDict) {
        if (!Object.prototype.hasOwnProperty.call(dateData, emp)) continue;
        const entry = dateData[emp] || {};

        const doc = {
            EmployeeCode: entry.EmployeeCode || emp,
            date: entry.date || today,
            InTime: entry.InTime || null,
            OutTime: entry.OutTime || null,
            EmployeeName: entry.EmployeeName || entry['Employee Name'] || '',
            HoursWorked: typeof entry.HoursWorked === 'number' ? entry.HoursWorked : (entry.HoursWorked ? Number(entry.HoursWorked) : 0),
            SECTION: entry.SECTION || entry.SECT || '',
            CAT: entry.CAT || '',
            DESIG: entry.DESIG || entry.DESIGNATION || entry.Designation || '',
            Department: entry.Department || '',
            Designation: entry.Designation || ''
        };

        docs.push(doc);
    }
    res.json(docs);
});

app.post("/addUser", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        await col.insertOne({ username, password });
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    } finally {
        await mclient.close();
    }
});

app.post("/updateUser", async (req, res) => {
    const { oldUsername, username, password } = req.body;
    if (!oldUsername || !username || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        const result = await col.updateOne({ username: oldUsername }, { $set: { username, password } });
        if (result.matchedCount === 0) return res.status(400).json({ status: "error", message: "User not found" });
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    } finally {
        await mclient.close();
    }
});
app.post('/deleteUser', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ status: 'error', message: 'Missing username' });

    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        const result = await col.deleteOne({ username });
        if (result.deletedCount === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        await mclient.close();
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: 'error', message: 'Missing fields' });

    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        const user = await col.findOne({ username });
        if (!user) return res.status(401).json({ status: 'error', message: 'Invalid username or password' });

        let match = false;
            if (user.password === password) {
                match = true;
              }
        

        if (!match) return res.status(401).json({ status: 'error', message: 'Invalid username or password' });

        res.json({ status: 'success', username: user.username });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        await mclient.close();
    }
});

async function getData() {
    
    const fs = require("fs");
    let file_name = "" 
    try 
    {
        if (fs.existsSync("Records.xls")) 
            file_name = "Records.xls"
        else
            file_name = "database/Records.xls"
    }
    catch (err) 
    {
        console.error("No such file found => error :", err.message);
    }

    const workbook=XLSX.readFile(file_name);
    const worksheet=workbook.Sheets["ALLMAS"];
    const records=XLSX.utils.sheet_to_json(worksheet);
    let recordset={};
    records.forEach(element=>{
        recordset[element.EDPNO]=element.SECTION;
    });
    let fullData;
    try{
        await client.connect();
        console.log("connected with mongo");
        const database=client.db("test");
        const collection=database.collection("biometriclogs");
        fullData=await collection.find().toArray();
    }
    catch(e)
    {
        console.error("Error while fetching data from mongo: ",e);
    }
    finally{
        await client.close();
        const map1=new Map(records.map(item=>[String(item.EDPNO),item]));
        allData=fullData.map(data=>{
            const match=map1.get(data["EmployeeCode"].toUpperCase());
            if(match)
            {
                return {
                    ...match,
                    ...data
                };
            }
            else
                return data;
        });
        attendanceDict = createAttendanceDictionary(allData);
     
        console.log("Mongo closed");
      // console.log(await uploadAttendanceDictToMongo());
    }
    
    
}
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));


async function deleteBiometricLogs() {
    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const db = mclient.db('test');
        const col = db.collection('biometriclogs');
        
        // Get today's date range in ISO format
        const today = new Date();
        const startOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0)).toISOString();
        const startOfTomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 0, 0, 0, 0)).toISOString();
        
        // Delete all records except today's
        const result = await col.deleteMany({
            $or: [
                { LogDateTime: { $lt: startOfToday } },
                { LogDateTime: { $gte: startOfTomorrow } }
            ]
        });
        console.log(`Deleted ${result.deletedCount} documents from biometriclogs `);
    } finally {
        await mclient.close();
    }
}

async function runUploadTask() {
    
    try {
        
        const sixHours = 6 * 60 * 60 * 1000;

        
            await getData();
            const r = await uploadAttendanceDictToMongo();
            console.log('Daily upload finished, inserted:', r.inserted);
            await deleteBiometricLogs();

           
            setTimeout(runUploadTask, sixHours);
     
    } catch (e) {
        console.error('Daily upload error:', e);
        setTimeout(runUploadTask, 60 * 60 * 1000);
    } 
}


setTimeout(getData,60*60*1000);
runUploadTask();