const sql = require('mssql/msnodesqlv8');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const GLOBAL_API_URL = 'http://13.205.0.74:5000/api/sync'; // Update IP
const CURSOR_FILE = path.join(__dirname, 'cursor.json');
const POLLING_INTERVAL_MS = 5000; // Check every 5 seconds

const MSSQL_CONFIG = {
    server: 'SERVER\\SQLEXPRESS',
    database: 'etimetracklite1',
    options: { trustedConnection: true, trustServerCertificate: true },
    driver: 'msnodesqlv8'
};

// --- STATE MANAGEMENT ---
function getLastSyncTime() {
    if (!fs.existsSync(CURSOR_FILE)) {
        // Default: Start from today 00:00:00 if no file exists
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return startOfDay;
    }
    const data = JSON.parse(fs.readFileSync(CURSOR_FILE, 'utf8'));
    return new Date(data.lastSync);
}

function updateLastSyncTime(newTimestamp) {
    fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastSync: newTimestamp }));
}

// --- MAIN SYNC FUNCTION ---
async function sync() {
    let pool;
    try {
        const lastSync = getLastSyncTime();
        
        // 1. Connect
        pool = await sql.connect(MSSQL_CONFIG);
        
        // 2. Query (JOIN paraller + EmployeeList)
        // Includes all columns and Sorts by Newest First (DESC)
        const query = `
            SELECT 
                p.EmployeeCode,
                p.LogDate,
                p.LogTime,
                e.EmployeeName,
                e.DeviceCode,
                e.Department,
                e.Designation,
                e.Category,
                e.[EmploymentType] AS EmploymentType,
                e.Gender,
                e.DOJ,
                e.DOC,
                e.Status,
                e.DOR
            FROM paraller p
            JOIN EmployeeList e ON p.EmployeeCode = e.EmployeeCode
            WHERE p.LogDate > @lastSync
            ORDER BY p.LogDate DESC, p.LogTime DESC
        `;
        
        const result = await pool.request()
            .input('lastSync', sql.DateTime, lastSync)
            .query(query);

        const newRows = result.recordset;

        if (newRows.length > 0) {
            console.log(`[${new Date().toLocaleTimeString()}] Found ${newRows.length} new records.`);
            
            // 3. Push to AWS
            await axios.post(GLOBAL_API_URL, newRows);
            
            // 4. Update Cursor
            // CRITICAL CHANGE: Since we are sorting DESC, the NEWEST item is now at Index 0.
            const latestLog = newRows[0].LogDate; 
            updateLastSyncTime(latestLog);
            
            console.log(`   -> Uploaded! Cursor moved to: ${latestLog.toISOString()}`);
        }

    } catch (err) {
        console.error("Error in sync loop:", err.message);
    } finally {
        if (pool) pool.close();
    }
}

// --- RUN LOOP ---
console.log("🚀 Biometric Bridge Started. Watching for new swipes...");
setInterval(sync, POLLING_INTERVAL_MS);
