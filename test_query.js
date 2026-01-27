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
// Currently set to: Today at 00:00:00
const startTime = new Date();
startTime.setHours(0, 0, 0, 0); 

async function testSync() {
    try {
        console.log("-----------------------------------------");
        console.log(`🔎 Testing DB Fetch starting from: ${startTime.toLocaleString()}`);

        // 1. Connect to Local MSSQL
        console.log("1. Connecting to MSSQL...");
        let pool = await sql.connect(MSSQL_CONFIG);
        console.log("   -> Connected!");
        
        // 2. The "Enriched" Query (JOIN paraller + EmployeeList)
        // We look for logs where LogDate is newer than our startTime
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
                e.[Employment Type] AS EmploymentType,
                e.Gender,
                e.DOJ,
                e.DOC,
                e.Status,
                e.DOR
            FROM paraller p
            LEFT JOIN EmployeeList e ON p.EmployeeCode = e.EmployeeCode
            WHERE p.LogDate >= @testTime 
            ORDER BY p.LogDate ASC
        `;
        
        const result = await pool.request()
            .input('testTime', sql.DateTime, startTime)
            .query(query);

        const rows = result.recordset;
        
        console.log(`\n2. Query Result: Found ${rows.length} records.`);
        
        if (rows.length > 0) {
            console.log("--- SAMPLE DATA (First 3 Rows) ---");
            console.log(rows.slice(0, 3)); // Show only first 3 to keep terminal clean
            
            console.log("\n--- DATA CHECK ---");
            console.log("Does the first row have an Employee Name?");
            if (rows[0].EmployeeName) {
                console.log(`✅ YES: ${rows[0].EmployeeName}`);
            } else {
                console.log("❌ NO: EmployeeName is null. Check if 'EmployeeCode' matches in both tables.");
            }
        } else {
            console.log("⚠️ No logs found for today. Try changing 'startTime' in the code to an older date.");
        }

        pool.close();

    } catch (err) {
        console.error("\n❌ ERROR:", err);
    }
}

testSync();
