const sql = require('mssql/msnodesqlv8');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// The IP you provided in the logs
const GLOBAL_API_URL = 'http://13.205.0.74:5000/api/sync'; 
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
    // 1. If no cursor file, start from 1970 to get ALL history
    if (!fs.existsSync(CURSOR_FILE)) {
        return new Date('1970-01-01T00:00:00.000'); 
    }

    const data = JSON.parse(fs.readFileSync(CURSOR_FILE, 'utf8'));
    
    // 2. CRITICAL TIMEZONE FIX: 
    // We remove 'Z' so Node.js treats this string as LOCAL TIME.
    // This aligns the cursor with your SQL Server's local clock.
    let cleanString = data.lastSync.replace('Z', ''); 
    return new Date(cleanString);
}

function updateLastSyncTime(newTimestamp) {
    // We save the raw date object; JSON.stringify adds the 'Z' automatically,
    // but our reader above handles removing it.
    fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastSync: newTimestamp }));
}

// --- MAIN SYNC FUNCTION ---
async function sync() {
    let pool;
    try {
        const lastSync = getLastSyncTime();
        
        // 1. Connect
        pool = await sql.connect(MSSQL_CONFIG);
        
        // 2. Query (Using LogDateTime)
        // This grabs everything newer than our local cursor time
        const query = `
            SELECT 
                p.EmployeeCode,
                p.LogDateTime,
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
            WHERE p.LogDateTime > @lastSync
            ORDER BY p.LogDateTime DESC
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
            // Since we sort DESC (Newest First), the latest time is at index 0
            const latestLog = newRows[0].LogDateTime; 
            updateLastSyncTime(latestLog);
            
            console.log(`   -> Uploaded! Cursor moved to: ${latestLog.toISOString()}`);
        }

    } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] ❌ Sync Error:`, err.message);
        
        if (err.message.includes('ECONNREFUSED')) {
            console.log("   -> HINT: Check if EC2 server is running.");
        }
    } finally {
        if (pool) pool.close();
    }
}

// --- RUN LOOP ---
console.log("🚀 Biometric Bridge Started. Watching for new swipes...");
setInterval(sync, POLLING_INTERVAL_MS);
