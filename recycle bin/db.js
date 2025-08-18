import mysql from "mysql2/promise";


export async function printAttendance() 
{
  
    const conn = await mysql.createConnection("mysql://root:fmoZWZQAFRKGjjdNjNsgfJxHFvGMhhau@shinkansen.proxy.rlwy.net:34472/railway");

    
    const [rows] = await conn.query("SELECT * FROM attendance");

   
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.name}, Depot: ${row.depot}, InTime: ${row.intime}, OutTime: ${row.out_time}, Date: ${row.date.toISOString().split('T')[0]}, Hours: ${row.hours}, Present: ${row.present}`);
    });

    await conn.end();
  
}

printAttendance();