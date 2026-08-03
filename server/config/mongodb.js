import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("Database Connected Successfully")
    })

    if (process.env.MONGODB_URI) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
            return
        } catch (err) {
            console.warn("Could not connect to MONGODB_URI:", err.message)
            console.log("Falling back to local In-Memory MongoDB Server...")
        }
    }

    try {
        const mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
        console.log("Connected to In-Memory MongoDB Server successfully")
    } catch (fallbackErr) {
        console.error("Failed to start In-Memory MongoDB Server:", fallbackErr.message)
    }
}

export default connectDB;