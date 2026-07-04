import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () =>{
    try{
        console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("MONGO_URI:", process.env.MONGO_URI?.replace(/:\/\/.*?:.*?@/, "://<user>:<password>@"));
        await mongoose.connect(process.env.MONGO_URI).then(() => {
            console.log('MongoDB connected successfully');
        });
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        throw err;
    }
}
export default connectDB;