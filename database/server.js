const express = require("express");
const XLSX=require('xlsx');
//const fs = require("fs");
const cors = require("cors");
//const bcrypt = require('bcrypt');
//const User = require('./user');
const app = express();
const PORT = 5500;
const { MongoClient } = require('mongodb');
const client=new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
let allData=[];
//let dataNotInExcel=[];
let attendanceDict = {}; // stores per-employee per-date InTime/OutTime/HoursWorked
//let unmatchedAttendanceDict = {}; // same for dataNotInExcel

app.use(cors());
app.use(express.json());

//const path = require('path');

/**
 * Create an attendance dictionary from raw Mongo records.
 * Structure: { [employeeCode]: { [yyyy-mm-dd]: { date, InTime (HH:MM:SS), OutTime (HH:MM:SS), EmployeeName, DeviceCode, HoursWorked } } }
 */
function createAttendanceDictionary(records) {
    const dict = {};
    if (!Array.isArray(records)) return dict;

    // Helper to convert Date to HH:MM:SS format
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
        // ensure employee object exists
        dict[emp] = dict[emp] || {};

        // Helper to add non-repeating fields to employee object
        function addEmployeeFields(empObj) {
            const excluded = ['Employee Code', 'EmployeeCode', 'LogDateTime', 'Log Date Time', 'DeviceCode', '_id', '__v','NAME','SEX','DOR','EDPNO'];
            for (const key in rec) {
                if (!excluded.includes(key) && !(key in empObj)) {
                    empObj[key] = rec[key];
                }
            }
        }

        const empObj = dict[emp];
        // If empObj has a different date or no date, create/replace it for this date
        if (!empObj.date || empObj.date !== dateKey) {
            // initialize employee object for this date
            dict[emp] = {
                EmployeeCode: emp,
                date: dateKey,
                InTime: timeOnly,
                OutTime: null,
                EmployeeName: rec.EmployeeName || rec['Employee Name'] || '',
                HoursWorked: 0
            };
            // add other non-repeating fields at employee level
            addEmployeeFields(dict[emp]);
        } else {
            // existing object for same employee & date
            const inTStr = dict[emp].InTime;
            const outTStr = dict[emp].OutTime;

            // Parse stored times back to Date for comparison (add Z for UTC)
            const inT = new Date(`${dateKey}T${inTStr}Z`);
            const outT = outTStr ? new Date(`${dateKey}T${outTStr}Z`) : null;

            // Only set OutTime if time difference is >= 30 minutes
            const diffMinutes = (dt - inT) / (1000 * 60);
            if (diffMinutes >= 30) {
                if (!outT || dt > outT) {
                    dict[emp].OutTime = timeOnly;
                }
            }

            // Ensure InTime is the earliest punch
            if (dt < inT) {
                dict[emp].InTime = timeOnly;
            }

            // Add any new non-repeating fields from this record to employee object
            addEmployeeFields(dict[emp]);

            // Recalculate HoursWorked with updated times
            const finalInT = new Date(`${dateKey}T${dict[emp].InTime}Z`);
            const finalOutT = dict[emp].OutTime ? new Date(`${dateKey}T${dict[emp].OutTime}Z`) : null;
            if (finalOutT && !isNaN(finalInT) && !isNaN(finalOutT)) {
                const diffHours = (finalOutT - finalInT) / (1000 * 60 * 60);
                dict[emp].HoursWorked = Number(Math.max(0, diffHours).toFixed(2));
            }
        }
    });

    return dict;
}

/**
 * Create attendance dictionary for unmatched data records.
 * Records have shape like:
 * { EmployeeCode: 'A1555', LogDateTime: '2026-01-31T04:43:57.000Z', EmployeeName: 'Name', DeviceCode: 'A1555', Department: 'KAN', Designation: 'SG.SR.COOK' }
 */
// function createUnmatchedAttendanceDictionary(records) {
//     const dict = {};
//     if (!Array.isArray(records)) return dict;

//     function formatTimeOnly(dt) {
//         const h = String(dt.getUTCHours()).padStart(2, '0');
//         const m = String(dt.getUTCMinutes()).padStart(2, '0');
//         const s = String(dt.getUTCSeconds()).padStart(2, '0');
//         return `${h}:${m}:${s}`;
//     }

//     records.forEach(rec => {
//         const emp = rec.EmployeeCode || rec.DeviceCode || rec['Employee Code'];
//         if (!emp) return;

//         const timeStr = rec.LogDateTime || rec['Log DateTime'] || rec['LogDateTime'];
//         if (!timeStr) return;

//         const dt = new Date(timeStr);
//         if (isNaN(dt)) return;

//         const dateKey = dt.toISOString().split('T')[0];
//         const timeOnly = formatTimeOnly(dt);

//         dict[emp] = dict[emp] || {};

//         function addFields(target) {
//             const excluded = ['_id', '__v', 'LogDateTime', 'Log DateTime', 'LogDate', 'Employee Code', 'DeviceCode'];
//             for (const k in rec) {
//                 if (!excluded.includes(k) && !(k in target)) {
//                     target[k] = rec[k];
//                 }
//             }
//         }

//         const empObj = dict[emp];
//         if (!empObj.date || empObj.date !== dateKey) {
//             dict[emp] = {
//                 EmployeeCode: emp,
//                 date: dateKey,
//                 InTime: timeOnly,
//                 OutTime: null,
//                 EmployeeName: rec.EmployeeName || rec['Employee Name'] || '',
//                 DeviceCode: rec.DeviceCode || '',
//                 Department: rec.Department || '',
//                 Designation: rec.Designation || '',
//                 HoursWorked: 0
//             };
//             addFields(dict[emp]);
//         } else {
//             const inTStr = dict[emp].InTime;
//             const outTStr = dict[emp].OutTime;
//             const inT = new Date(`${dateKey}T${inTStr}Z`);
//             const outT = outTStr ? new Date(`${dateKey}T${outTStr}Z`) : null;

//             const diffMinutes = (dt - inT) / (1000 * 60);
//             if (diffMinutes >= 30) {
//                 if (!outT || dt > outT) dict[emp].OutTime = timeOnly;
//             }
//             if (dt < inT) dict[emp].InTime = timeOnly;

//             addFields(dict[emp]);

//             const finalInT = new Date(`${dateKey}T${dict[emp].InTime}Z`);
//             const finalOutT = dict[emp].OutTime ? new Date(`${dateKey}T${dict[emp].OutTime}Z`) : null;
//             if (finalOutT && !isNaN(finalInT) && !isNaN(finalOutT)) {
//                 const diffHours = (finalOutT - finalInT) / (1000 * 60 * 60);
//                 dict[emp].HoursWorked = Number(Math.max(0, diffHours).toFixed(2));
//             }
//         }
//     });

//     return dict;
// }

getData();
app.use(express.json());
// Upload attendanceDict to MongoDB (db: 'attendance', collection: 'data')
async function uploadAttendanceDictToMongo() {
    const docs = [];
    for (const emp in attendanceDict) {
        if (!Object.prototype.hasOwnProperty.call(attendanceDict, emp)) continue;
        const entry = attendanceDict[emp] || {};

        const doc = {
            EmployeeCode: entry.EmployeeCode || emp,
            date: entry.date || '',
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

// Route to get all users (from MongoDB userData.users)
app.get("/userPasswords", async (req, res) => {
    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        const docs = await col.find({}).toArray();
        // Return similar shape as previous file: { userPasswords: [...] }
        res.json({ userPasswords: docs });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    } finally {
        await mclient.close();
    }
});
//returning allData
app.get("/data",(req,res)=>{
    const start = req.query.start;
    const end = req.query.end;
    if (!start || !end) return res.status(400).json({ status: "error", message: "Invalid date range" });
    getOldData(start, end)
        .then(docs => res.json(docs))
        .catch(err => res.status(500).json({ status: 'error', message: err.message }));

});

/**
 * Fetch attendance documents from `attendance.data` between start and end (inclusive).
 * Expects `start` and `end` as 'YYYY-MM-DD' strings.
 */
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
        //console.log(docs)
        return docs;
    } finally {
        await mclient.close();
    }
}

// Route: fetch attendance records for a given employee code passed as URL parameter
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

// app.get("/unmatchedData",(req,res)=>{
//         if(!allData)
//             return res.status(500).json({status:"error",message: "No data"});
//         res.json({dataNotInExcel});

// });
// Endpoint to fetch computed attendance dictionary
app.get('/attendanceToday', (req, res) => {
    if (!attendanceDict || Object.keys(attendanceDict).length === 0) return res.status(500).json({ status: 'error', message: 'No attendance data' });
    const docs = [];
    for (const emp in attendanceDict) {
        if (!Object.prototype.hasOwnProperty.call(attendanceDict, emp)) continue;
        const entry = attendanceDict[emp] || {};

        const doc = {
            EmployeeCode: entry.EmployeeCode || emp,
            date: entry.date || '',
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
// Add new user
app.post("/addUser", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        // hash password before storing
        // const hashed = await bcrypt.hash(password, 10);
        await col.insertOne({ username, password });
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    } finally {
        await mclient.close();
    }
});

// Edit user
app.post("/updateUser", async (req, res) => {
    const { oldUsername, username, password } = req.body;
    if (!oldUsername || !username || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

    const mclient = new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
    try {
        await mclient.connect();
        const col = mclient.db('userData').collection('users');
        // hash new password before update
        // const hashed = await bcrypt.hash(password, 10);
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

// Login route: verify username/password against MongoDB userData.users
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
        // if (typeof user.password === 'string' && user.password.startsWith('$2')) {
        //     // bcrypt hash
        //     match = await bcrypt.compare(password, user.password);
        // } else {
        //     // legacy plain-text fallback; if matches, migrate to hashed password
            if (user.password === password) {
                match = true;
                // try {
                //     const newHash = await bcrypt.hash(password, 10);
                //     await col.updateOne({ username }, { $set: { password: newHash } });
                // } catch (e) {
                //     console.warn('Password migration failed for', username, e.message);
                // }
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
    // const sheetName = workbook.SheetNames[0];
    const worksheet=workbook.Sheets["ALLMAS"];
    //console.log(sheetName);
    const records=XLSX.utils.sheet_to_json(worksheet);
    let recordset={};
    records.forEach(element=>{
        recordset[element.EDPNO]=element.SECTION;
    });
    //console.log(records);
    let fullData;
    try{
        await client.connect();
        console.log("connected with mongo");
        const database=client.db("test");
        const collection=database.collection("biometriclogs");
        // use today's UTC date range for query
        const now = new Date();
        const startUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        const endUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      //  console.log(startUTC.toISOString())
        fullData=await collection.find({
            LogDateTime: {
                $gte: startUTC.toISOString(),
                $lte: endUTC.toISOString()
            }
        }).toArray();
       // console.log(fullData[0])
    }
    catch(e)
    {
        console.error("Error while fetching data from mongo: ",e);
    }
    finally{
        await client.close();
        const map1=new Map(records.map(item=>[String(item.EDPNO),item]));
       // console.log(fullData)
        
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
        // console.log(map1.size+ " "+records.length)
        // console.log(allData.length)
        // allData=allData.filter(Boolean);
        // console.log(allData.length)
        // build attendance dictionary from raw mongo records
        attendanceDict = createAttendanceDictionary(allData);
      /*  fullData.forEach(element => {
            
        if(element["Employee Code"] in recordset)
        {   
            element["SECTION"]
            allData.push(element);
        }
        else
        {
            dataNotInExcel.push(element);
        }
    });
    */
//    fullData.forEach(element=>
//    {
//     if(element["EmployeeCode"] in recordset)
//         {   

//         }
//         else
//         {
//             dataNotInExcel.push(element);
//         }
//    }
  // );
       // build unmatched attendance dict from the raw elements not in excel
     //  unmatchedAttendanceDict = createUnmatchedAttendanceDictionary(dataNotInExcel);
       //console.log(unmatchedAttendanceDict)
        console.log("Mongo closed");
        //console.log(attendanceDict);
       // console.log(await uploadAttendanceDictToMongo());
        //console.log(dataNotInExcel.length)
      // console.log(allData)
    }
    
    
}
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));

// Schedule daily upload at 23:30 server local time
function scheduleDailyUpload() {
    const now = new Date();
    let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next - now;
    setTimeout(async function runOnce() {
        try {
            console.log('Daily task starting: refreshing data and uploading attendance');
            await getData();
            const r = await uploadAttendanceDictToMongo();
            console.log('Daily upload finished, inserted:', r.inserted);
        } catch (e) {
            console.error('Daily upload error:', e);
        }
        // schedule subsequent runs every 24 hours
        setInterval(async () => {
            try {
                console.log('Daily task starting: refreshing data and uploading attendance');
                await getData();
                const r = await uploadAttendanceDictToMongo();
                console.log('Daily upload finished, inserted:', r.inserted);
            } catch (e) {
                console.error('Daily upload error:', e);
            }
        }, 24 * 60 * 60 * 1000);
    }, delay);
}

//scheduleDailyUpload();
