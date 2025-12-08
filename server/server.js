import express, { urlencoded } from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"

import router from "./routes/index.js"

dotenv.config()

const app = express();

app.use(cors({
    origin: ["http://192.168.1.41:3000", "http://localhost:3000", "exp://192.168.1.41:8081"],
    origin: ["http://localhost:5000", "exp://192.168.1.41:8081"],
    origin: ["http://localhost:5000", "exp://192.168.1.41:8081"],
    origin: ["http://localhost:5000", "exp://192.168.1.41:8081"],
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}))

app.use(express.json(urlencoded({ extended: true })))

app.use(router)

async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_DB)
        console.log("MongoDB connected successfully")
    } catch (err) {
        console.log(err)
    }
}

app.listen(process.env.PORT || 3000, () => {
    connectDb();
    console.log("Server Running on Port", process.env.PORT || 3000);
})