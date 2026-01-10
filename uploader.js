const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// --- CONFIGURATION SECTION ---
// Replace with your connection string
// Format: mongodb+srv://<username>:<password>@<cluster-address>/
const MONGO_URI = "mongodb+srv://myuser:mypassword@cluster0.example.mongodb.net/";

const DB_NAME = "my_database";
const COLLECTION_NAME = "my_collection";
const CSV_FILENAME = "data.csv";
// -----------------------------

async function uploadCsvToMongo() {
  const client = new MongoClient(MONGO_URI);

  try {
    // 1. Check if file exists
    if (!fs.existsSync(CSV_FILENAME)) {
      console.error(`Error: The file '${CSV_FILENAME}' was not found.`);
      return;
    }

    // 2. Read and Parse CSV (Wrapped in a Promise to await completion)
    console.log(`Reading '${CSV_FILENAME}'...`);
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILENAME)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', (err) => reject(err))
        .on('end', () => resolve());
    });

    if (results.length === 0) {
      console.log("CSV file is empty. Nothing to upload.");
      return;
    }

    // 3. Connect to MongoDB
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("Connection successful!");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // 4. Insert Data
    console.log(`Inserting ${results.length} records...`);
    const result = await collection.insertMany(results);

    console.log(`Success! Inserted ${result.insertedCount} documents.`);

  } catch (err) {
    console.error("An error occurred:", err.message);
  } finally {
    // 5. Close Connection
    await client.close();
  }
}

uploadCsvToMongo();
