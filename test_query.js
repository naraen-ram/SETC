const sql = require('mssql/msnodesqlv8');

// --- CONFIGURATION ---
const MSSQL_CONFIG = {
    server: 'SERVER\\SQLEXPRESS', 
    database: 'etimetracklite1',
    options: {
        trustedConnection: true, 
        trustServerCertificate: true
    },
    driver: 'msnodesqlv8'
};

// TEST SETTING: How far back do you want to check?
const startTime = new Date();
startTime.setHours(0, 0, 0, 0); // Start of today

async function testSync() {
    try {
        console.log("-----------------------------------------");
        console.log(`🔎 Testing DB Fetch (Most Recent First) starting from: ${startTime.toLocaleString()}`);

        console.log("1. Connecting to MSSQL...");
        let pool = await sql.connect(MSSQL_CONFIG);
        
        // --- UPDATED QUERY ---
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
            LEFT JOIN EmployeeList e ON p.EmployeeCode = e.EmployeeCode
            WHERE p.LogDate >= @testTime 
            ORDER BY p.LogDate DESC, p.LogTime DESC
        `;
        // ORDER BY DESC = Most Recent First
        
        const result = await pool.request()
            .input('testTime', sql.DateTime, startTime)
            .query(query);

        const rows = result.recordset;
        
        console.log(`\n2. Query Result: Found ${rows.length} records.`);
        
        if (rows.length > 0) {
            console.log("--- MOST RECENT LOG (Top of list) ---");
            console.log(rows[0]); 
            
            console.log("\n--- OLDEST LOG (Bottom of list) ---");
            console.log(rows[rows.length - 1]);
        } else {
            console.log("⚠️ No logs found.");
        }

        pool.close();

    } catch (err) {
        console.error("\n❌ ERROR:", err);
    }
}

testSync();
