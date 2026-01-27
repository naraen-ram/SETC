const sql = require('mssql/msnodesqlv8');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const GLOBAL_API_URL = 'http://13.205.0.74:5000/api/sync'; 
const CURSOR_FILE = path.join(__dirname, 'cursor.json');
const POLLING_INTERVAL_MS = 5000; // Checks every 5 seconds

const MSSQL_CONFIG = {
    server: 'SERVER\\SQLEXPRESS',
    database: 'etimetracklite1',
    options: { trustedConnection: true, trustServerCertificate: true },
    driver: 'msnodesqlv8'
};

// --- HELPER: Format Date to SQL String ---
// Prevents Timezone confusion by treating dates as plain text
function toLocalSqlString(dateObj) {
    const pad = (num) => (num < 10 ? '0' + num : num);
    const yyyy = dateObj.getFullYear();
    const mm = pad(dateObj.getMonth() + 1);
    const dd = pad(dateObj.getDate());
    const hh = pad(dateObj.getHours());
    const mi = pad(dateObj.getMinutes());
    const ss = pad(dateObj.getSeconds());
    const ms = dateObj.getMilliseconds(); 
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}.${ms}`;
}

// --- STATE MANAGEMENT ---
function getLastSyncTime() {
    if (!fs.existsSync(CURSOR_FILE)) {
        // Safe fallback if file is deleted
        return new Date('2026-01-01T00:00:00'); 
    }

    try {
        const data = JSON.parse(fs.readFileSync(CURSOR_FILE, 'utf8'));
        // Remove Z to ensure Local Time interpretation
        let cleanString = data.lastSync.replace('Z', ''); 
        return new Date(cleanString);
    } catch (err) {
        console.error("⚠️ Error reading cursor file. Using fallback.", err.message);
        return new Date('2026-01-01T00:00:00');
    }
}

function updateLastSyncTime(newTimestamp) {
    try {
        fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastSync: newTimestamp }));
    } catch (err) {
        console.error("❌ Critical Error: Could not save cursor position!", err.message);
    }
}

// --- MAIN SYNC LOOP ---
async function sync() {
    let pool;
    try {
        const lastSyncDate = getLastSyncTime();
        const lastSyncString = toLocalSqlString(lastSyncDate);

        pool = await sql.connect(MSSQL_CONFIG);
        
        // Query: strictly NEWER than cursor
        const query = `
            SELECT TOP 500 
                p.EmployeeCode, 
                p.LogDateTime,
                e.EmployeeName,
                e.DeviceCode,
                e.Department,
                e.Designation
            FROM paraller p
            JOIN EmployeeList e ON p.EmployeeCode = e.EmployeeCode
            WHERE p.LogDateTime > CAST(@lastSyncStr AS DATETIME)
            ORDER BY p.LogDateTime ASC 
        `;
        
        const result = await pool.request()
            .input('lastSyncStr', sql.VarChar, lastSyncString)
            .query(query);

        const newRows = result.recordset;

        if (newRows.length > 0) {
            console.log(`[${new Date().toLocaleTimeString()}] ⚡ Uploading ${newRows.length} new records...`);
            
            // 1. Upload to AWS
            await axios.post(GLOBAL_API_URL, newRows);
            
            // 2. Update Cursor to the NEWEST record
            const latestLog = newRows[newRows.length - 1].LogDateTime; 
            updateLastSyncTime(latestLog);
            
            console.log(`   ✅ Success! Cursor moved to: ${toLocalSqlString(latestLog)}`);
        } 
        // Note: No "else" log here to keep the console clean when nothing is happening.

    } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] ❌ Sync Error:`, err.message);
    } finally {
        if (pool) pool.close();
    }
}

// --- START ENGINE ---
console.log("🚀 Biometric Bridge Active. Running in background...");
setInterval(sync, POLLING_INTERVAL_MS);
