// server.js (Local Storage with 28-Column Excel Import)
// This version saves all data locally and can import Excel files with many columns.

const express = require('express');
const cors = require('cors'); // NEW: Added for local frontend access
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = 80;

const DB_FILE = './attendance_logs.json';

app.use(cors()); // NEW: Enable Cross-Origin Resource Sharing
app.use(bodyParser.text({ type: '*/*' }));

// Helper function to read/write from the local JSON file
function saveRecords(recordsToSave) {
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        let allRecords = [];
        if (!err && data) {
            try {
                allRecords = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing existing JSON data, starting fresh.', parseErr);
                allRecords = [];
            }
        }
        const updatedRecords = [...allRecords, ...recordsToSave];
        fs.writeFile(DB_FILE, JSON.stringify(updatedRecords, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error saving data to local file:', writeErr);
            } else {
                console.log(`${recordsToSave.length} new record(s) processed and saved locally.`);
            }
        });
    });
}

// Endpoint for the biometric device to push live attendance data
app.post('/iclock/cdata', async (req, res) => {
    console.log('=================================================');
    console.log(`[Data Received] Live attendance data POSTed at ${new Date().toISOString()}`);
    console.log('=================================================\n');

    const rawData = req.body;
    const lines = rawData.split('\n').filter(line => line.trim() !== '');

    const recordsToSave = lines.map(line => {
        const parts = line.split('\t');
        if (parts.length < 2) return null;
        return {
            UserID: parts[0].trim(), // Using UserID to be consistent with Excel header
            Timestamp: new Date(parts[1].trim()),
            Source: 'BiometricDevice',
            ReceivedAt: new Date()
        };
    }).filter(record => record !== null);

    if (recordsToSave.length > 0) {
        saveRecords(recordsToSave);
    }
    
    res.status(200).send('OK');
});

// Endpoint to upload data from the local Excel file
app.get('/upload-from-excel', async (req, res) => {
    const filePath = './attendance.xlsx';
    console.log(`[Excel Upload] Received request to upload data from ${filePath}`);

    try {
        if (!fs.existsSync(filePath)) {
            const msg = `Error: Excel file not found. Ensure '${filePath}' is in the server's folder.`;
            console.error(msg);
            return res.status(404).send(msg);
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // { cellDates: true } is crucial for parsing dates correctly from Excel
        // { defval: '' } ensures empty cells are included as empty strings
        const data = xlsx.utils.sheet_to_json(worksheet, { cellDates: true, defval: '' });

        if (data.length === 0) {
            return res.status(400).send('Excel sheet is empty.');
        }

        // Process all 28 columns (or however many are in the sheet)
        const recordsToSave = data.map(row => {
            // Create a new object for each row
            const record = {
                Source: 'ExcelUpload',
                ReceivedAt: new Date()
            };
            
            // Dynamically add all columns from the Excel row to our record
            for (const key in row) {
                // Sanitize the key to remove spaces or special characters if needed
                const cleanKey = key.trim();
                record[cleanKey] = row[key];
            }

            // Ensure the timestamp is a valid Date object if it exists
            if (record.Timestamp && !(record.Timestamp instanceof Date)) {
                record.Timestamp = new Date(record.Timestamp);
            }

            return record;
        });

        if (recordsToSave.length > 0) {
            saveRecords(recordsToSave);
            const msg = `Successfully processed ${recordsToSave.length} records from Excel and saved locally.`;
            console.log(`[Excel Upload] ${msg}`);
            res.status(200).send(msg);
        } else {
            res.status(400).send('No valid records found in the Excel file.');
        }
    } catch (error) {
        console.error('[Excel Upload] An error occurred during the upload process:', error);
        res.status(500).send('An internal server error occurred.');
    }
});

// NEW: Endpoint for the frontend to fetch the locally stored data
app.get('/get-attendance-data', (req, res) => {
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') return res.json([]); // If file doesn't exist, return empty array
            return res.status(500).send('Error reading data file.');
        }
        try {
            const records = JSON.parse(data || "[]");
            // Sort by timestamp, newest first
            records.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
            res.json(records);
        } catch (parseErr) {
            res.status(500).send('Error parsing data file.');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Local Uploader server is running on port ${PORT}`);
    console.log('Waiting for data from the biometric device...');
    console.log(`To upload from Excel, visit http://localhost:${PORT}/upload-from-excel in your browser.`);
});

