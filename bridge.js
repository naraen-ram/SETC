const sql = require('mssql/msnodesqlv8');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const GLOBAL_API_URL = 'http://13.205.0.74:5000/api/sync'; 
const CURSOR_FILE = path.join(__dirname, 'cursor.json');
const POLLING_INTERVAL_MS = 5000; 

const MSSQL_CONFIG = {
    server: 'SERVER\\SQLEXPRESS',
    database: 'etimetracklite1',
    options: { trustedConnection: true, trustServerCertificate: true },
    driver: 'msnodesqlv8'
};

// --- HELPER: Format Date to SQL String ---
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

// --- DEBUGGING: LOGGING THE CURSOR ---
function getLastSyncTime() {
    console.log(`\n📂 Looking for cursor file at: ${CURSOR_FILE}`);

    if (!fs.existsSync(CURSOR_FILE)) {
        console.log("⚠️ Cursor file NOT FOUND. Defaulting to 2025 (Backfill Mode).");
        return new Date('2025-01-01T00:00:00'); 
    }

    try {
        const fileContent = fs.readFileSync(CURSOR_FILE, 'utf8');
        console.log(`📄 Raw File Content: ${fileContent}`);
        
        const data = JSON.parse(fileContent);
        // Remove Z to treat as Local Time
        let cleanString = data.lastSync.replace('Z', ''); 
        let finalDate = new Date(cleanString);
        
        console.log(`✅ Read Success! Bridge will ask for data newer than: ${toLocalSqlString(finalDate)}`);
        return finalDate;
    } catch (err) {
        console.log(`❌ Error reading file (Permissions or Typo): ${err.message}`);
        console.log("⚠️ Defaulting to 2025 due to error.");
        return new Date('2025-01-01T00:00:00');
    }
}

function updateLastSyncTime(newTimestamp) {
    try {
        fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastSync: newTimestamp }));
        console.log("💾 Cursor Saved Successfully.");
    } catch (err) {
        console.error("❌ CRITICAL: Cannot save cursor! (Permission Denied)");
    }
}

async function sync() {
    let pool;
    try {
        const lastSyncDate = getLastSyncTime();
        const lastSyncString = toLocalSqlString(lastSyncDate);

        pool = await sql.connect(MSSQL_CONFIG);
        
        // Query: Get data strictly NEWER than our cursor
        const query = `
            SELECT TOP 500 
                p.EmployeeCode, 
                p.LogDateTime,
                e.EmployeeName
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
            console.log(`[${new Date().toLocaleTimeString()}] Found ${newRows.length} new records.`);
            console.log(`   -> First Record Time: ${newRows[0].LogDateTime}`);
            console.log(`   -> Last Record Time:  ${newRows[newRows.length - 1].LogDateTime}`);
            
            // 1. Upload to AWS
            await axios.post(GLOBAL_API_URL, newRows);
            
            // 2. Update Cursor to the NEWEST record
            const latestLog = newRows[newRows.length - 1].LogDateTime; 
            updateLastSyncTime(latestLog);
            
            console.log(`   -> Uploaded! Cursor moved to: ${toLocalSqlString(latestLog)}`);
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] No new records found.`);
        }

    } catch (err) {
        console.error(`❌ Sync Error:`, err.message);
    } finally {
        if (pool) pool.close();
    }
}

console.log("🚀 Debug Mode Started...");
sync(); // Run once immediately
// setInterval(sync, POLLING_INTERVAL_MS); // Commented out loop so you can read the log first
