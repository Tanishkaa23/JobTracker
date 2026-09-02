import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import applicationRoutes from './routes/application.routes.js';
import cronRoutes from './routes/cron.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config({});
const app = express();
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

console.log('[cors] Allowed origins:', allowedOrigins);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//Authentication routes
app.use('/api/auth', authRoutes);

//Application routes
app.use('/api/applications', applicationRoutes);

//Cron test routes
app.use('/api/cron', cronRoutes);

//Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

export default app;
