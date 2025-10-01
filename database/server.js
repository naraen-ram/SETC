const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 5500;
const { MongoClient } = require('mongodb');
const client=new MongoClient("mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net");
let allData;

app.use(cors());
app.use(express.json());

const path = require('path');

getData();
app.use(express.json());
// Route to get all users
app.get("/userPasswords", (req, res) => {
    fs.readFile("./userPasswords.json", "utf8", (err, data) => {
        if (err) return res.status(500).json({ status: "error", message: "Cannot read file" });
        res.json(JSON.parse(data));
    });
});
//returning allData
app.get("/data",(req,res)=>{
        if(!allData)
            return res.status(500).json({status:"error",message: "No data"});
        res.json({allData});

});
// Add new user
app.post("/addUser", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

    fs.readFile("./userPasswords.json", "utf8", (err, data) => {
        if (err) return res.status(500).json({ status: "error", message: "Cannot read file" });
        let users = JSON.parse(data);
        users.userPasswords.push({ username, password });

        fs.writeFile("./userPasswords.json", JSON.stringify(users, null, 2), err => {
            if (err) return res.status(500).json({ status: "error", message: "Cannot write file" });
            res.json({ status: "success" });
        });
    });
});

// Edit user
app.post("/updateUser", (req, res) => {
    const { oldUsername, username, password } = req.body;
    if (!oldUsername || !username || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

    fs.readFile("./userPasswords.json", "utf8", (err, data) => {
        if (err) return res.status(500).json({ status: "error", message: "Cannot read file" });
        let users = JSON.parse(data);

        const index = users.userPasswords.findIndex(u => u.username === oldUsername);
        if (index === -1) return res.status(400).json({ status: "error", message: "User not found" });

        users.userPasswords[index] = { username, password };

        fs.writeFile("./userPasswords.json", JSON.stringify(users, null, 2), err => {
            if (err) return res.status(500).json({ status: "error", message: "Cannot write file" });
            res.json({ status: "success" });
        });
    });
});
const DATA_FILE = path.join(__dirname, 'userPasswords.json');

app.post('/deleteUser', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ status: 'error', message: 'Missing username' });

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Failed to read file' });

        let usersData;
        try {
            usersData = JSON.parse(data);
        } catch {
            return res.status(500).json({ status: 'error', message: 'Invalid JSON format' });
        }

        const index = usersData.userPasswords.findIndex(u => u.username === username);
        if (index === -1) return res.status(404).json({ status: 'error', message: 'User not found' });

        usersData.userPasswords.splice(index, 1); // remove user

        fs.writeFile(DATA_FILE, JSON.stringify(usersData, null, 2), (err) => {
            if (err) return res.status(500).json({ status: 'error', message: 'Failed to write file' });
            res.json({ status: 'success' });
        });
    });
});

async function getData() {
    try{
        await client.connect();
        console.log("connected with mongo");
        const database=client.db("essltest");
        const collection=database.collection("table");
        allData=await collection.find({}).toArray();
        console.log(allData[0])
        
    }
    catch(e)
    {
        console.error("Error while fetching data from mongo: ",e);
    }
    finally{
        await client.close();
        console.log("Mongo closed");
    }
}
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
