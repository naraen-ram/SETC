const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

/**
 * Connects to MongoDB and fetches insert operations from local oplogs
 * @returns {Promise<Array>} Array of insert operation documents from oplogs
 */
async function fetchInsertOplogs() {
  const uri = 'mongodb+srv://josh:josh123@test1.8ofqapk.mongodb.net';
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Access the local database (where oplogs are stored)
    const localDb = client.db('local');
    const oplogCollection = localDb.collection('oplog.rs');

    // Query for insert operations (op: "i")
    const insertOps = await oplogCollection
      .find({ op: 'i' })
      .sort({ $natural: -1 }) // Get most recent first
      .toArray();

    // Extract the 'o' field from each oplog entry
    const extractedData = insertOps.map(op => op.o);
    
    // Write the extracted data to rcoverData.json
    const jsonPath = path.join(__dirname, 'rcoverData.json');
    await fs.writeFile(jsonPath, JSON.stringify(extractedData, null, 2));
    console.log(`Data written to ${jsonPath}`);
    
    //console.log(extractedData[0])
    console.log(`Found ${insertOps.length} insert operations`);
    console.log(`Extracted ${extractedData.length} documents`);
    //return extractedData;

  } catch (error) {
    console.error('Error connecting to MongoDB or fetching oplogs:', error);
    throw error;
  } finally {
    // Close the connection
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}


fetchInsertOplogs()