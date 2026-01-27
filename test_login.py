const sql = require('mssql/msnodesqlv8'); // Use the Windows native driver

// --- CONFIGURATION ---
const config = {
    // 1. Your Server Name 
    // In JS strings, we must escape the backslash, so we use two: \\
    server: 'SERVER\\SQLEXPRESS', 
    
    // 2. Your Database Name
    database: 'paraller',
    
    // 3. Authentication & Options
    options: {
        trustedConnection: true, // This enables Windows Authentication
        trustServerCertificate: true // Trust self-signed certs (common for local dev)
    },
    
    // This tells the library to use the native Windows driver installed in Step 1
    driver: 'msnodesqlv8'
};

async function testConnection() {
    console.log("--- MSSQL Connection Tester (Node.js) ---");
    console.log(`Attempting connection to ${config.server} -> ${config.database}...`);

    try {
        // Attempt to connect
        let pool = await sql.connect(config);
        
        // Run a simple query to verify the engine is responding
        let result = await pool.request().query('SELECT @@VERSION as version');
        
        console.log("\n✅ SUCCESS! Connection Established.");
        console.log("Server Version Info:");
        
        // Print the version string
        console.log(result.recordset[0].version.substring(0, 100) + "...");
        
        // Close the connection
        await pool.close();
        
    } catch (err) {
        console.log("\n❌ CONNECTION FAILED");
        console.log("Error Details:");
        console.error(err);
        
        console.log("\nTroubleshooting Tips:");
        console.log("1. Ensure you ran 'npm install mssql msnodesqlv8'");
        console.log("2. Check if 'SQL Server Browser' service is running.");
        console.log("3. Verify the SERVER name matches exactly what is in SSMS.");
    }
}

testConnection();
