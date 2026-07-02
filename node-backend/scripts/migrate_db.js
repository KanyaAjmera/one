import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const parentEnvPath = path.resolve(__dirname, '../../.env');
const localEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(parentEnvPath)) {
    dotenv.config({ path: parentEnvPath });
}
if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
}

const runMigration = async () => {
    console.log('=== STARTING DATABASE CONSOLIDATION MIGRATION ===');
    
    // Connect to database (uses Mongoose default connection)
    console.log('[Migration] Connecting to MongoDB...');
    await connectDB();

    try {
        const client = mongoose.connection.client;
        const sourceDb = client.db('test');
        const targetDb = client.db('lawsask_db');

        const collectionsToMigrate = ['users', 'generations', 'scores', 'bestscores'];

        for (const colName of collectionsToMigrate) {
            console.log(`\n--------------------------------------------`);
            console.log(`[Migration] Migrating collection: "${colName}"`);
            console.log(`--------------------------------------------`);

            const sourceCol = sourceDb.collection(colName);
            const targetCol = targetDb.collection(colName);

            // 1. Fetch all documents from source
            const docs = await sourceCol.find({}).toArray();
            console.log(`[Migration] Found ${docs.length} documents in source: test.${colName}`);

            if (docs.length > 0) {
                let insertCount = 0;
                let skipCount = 0;

                for (const doc of docs) {
                    // Check if document already exists in target database to avoid duplicate key errors
                    const exists = await targetCol.findOne({ _id: doc._id });
                    if (!exists) {
                        await targetCol.insertOne(doc);
                        insertCount++;
                    } else {
                        skipCount++;
                    }
                }

                console.log(`[Migration] Insertion stats: ${insertCount} inserted, ${skipCount} skipped (already existed in target).`);
            } else {
                console.log(`[Migration] Collection test.${colName} is empty. No documents to copy.`);
            }

            // 2. Fetch and migrate indexes
            console.log(`[Migration] Checking indexes for: "${colName}"...`);
            try {
                const indexes = await sourceCol.indexes();
                for (const index of indexes) {
                    // Skip the default _id index as it's automatically created
                    if (index.name === '_id_') continue;

                    const key = index.key;
                    const options = { name: index.name };
                    if (index.unique) options.unique = true;
                    if (index.sparse) options.sparse = true;

                    console.log(`[Migration] Creating index: ${index.name} on lawsask_db.${colName}`);
                    await targetCol.createIndex(key, options);
                }
                console.log(`[Migration] Indexes migration for "${colName}" complete.`);
            } catch (idxErr) {
                console.warn(`[Migration] [WARN] Failed to migrate indexes for "${colName}":`, idxErr.message);
            }
        }

        console.log('\n=== MIGRATION VERIFICATION ===');
        for (const colName of collectionsToMigrate) {
            const sourceCount = await sourceDb.collection(colName).countDocuments({});
            const targetCount = await targetDb.collection(colName).countDocuments({});
            console.log(`Collection: "${colName}" | Source (test): ${sourceCount} | Target (lawsask_db): ${targetCount}`);
        }

        console.log('\n=== DATABASE CONSOLIDATION MIGRATION COMPLETED SUCCESSFULLY ===');
    } catch (error) {
        console.error('\n=== MIGRATION ENCOUNTERED ERROR ===');
        console.error(error);
    } finally {
        console.log('[Migration] Closing database connection...');
        await mongoose.connection.close();
        process.exit(0);
    }
};

runMigration();
