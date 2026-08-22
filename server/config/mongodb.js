import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("Database Connected Successfully");
    });
    mongoose.connection.on('error', (err) => {
        console.log("MongoDB connection error:", err.message);
    });

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imagify';
    mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).catch((err) => {
        console.warn("Could not connect to MongoDB:", err.message);
    });
}

export default connectDB;