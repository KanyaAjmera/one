import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        const dbName = process.env.DATABASE_NAME || 'lawsask_db';
        const conn = await mongoose.connect(uri, { dbName });
        console.log(`MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
