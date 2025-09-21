const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const path = require('path');


app.use(express.json());
// Route to get all users
app.get("/userPasswords", (req, res) => {
    fs.readFile("./userPasswords.json", "utf8", (err, data) => {
        if (err) return res.status(500).json({ status: "error", message: "Cannot read file" });
        res.json(JSON.parse(data));
    });
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

app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
