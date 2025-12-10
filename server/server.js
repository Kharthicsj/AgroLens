import express, { urlencoded } from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"

import router from "./routes/index.js"

dotenv.config()

const app = express();

// CORS Configuration - Allow all for development (mobile devices & browsers)
app.use(cors({
    origin: '*', // Allow all origins
    credentials: false, // Set to false when origin is '*'
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204
}))

// Body parsing middleware
app.use(express.json({ limit: '50mb' })) // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check endpoint (root)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AgroLens Backend Server is Running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/',
            auth: '/api/signup, /api/signin',
            disease: '/api/disease/detect',
        }
    });
});

// Routes
app.use("/api", router)

async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_DB)
        console.log("MongoDB connected successfully")
    } catch (err) {
        console.log(err)
    }
}

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    connectDb();
    console.log("\n" + "=".repeat(50));
    console.log("🚀 AgroLens Backend Server");
    console.log("=".repeat(50));
    console.log("Status: ✅ Running");
    console.log("Port: 3000");
    console.log("\nAccess URLs:");
    console.log("  📱 Mobile/Network: http://192.168.1.41:3000");
    console.log("  💻 Localhost: http://localhost:3000");
    console.log("\nAPI Endpoints:");
    console.log("  - GET  /api/ (Health Check)");
    console.log("  - POST /api/disease/detect (Disease Detection)");
    console.log("  - POST /api/signup (Sign Up)");
    console.log("  - POST /api/signin (Sign In)");
    console.log("=".repeat(50) + "\n");
})