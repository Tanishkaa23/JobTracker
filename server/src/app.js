import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import applicationRoutes from './routes/application.routes.js';
import googleRoutes from './routes/google.routes.js';
import cronRoutes from './routes/cron.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config({});
const app = express();

app.use(cors({
    origin:process.env.CLIENT_URL,   // your Vite dev server — change if different
    credentials: true                   // REQUIRED — allows cookies to be sent cross-origin
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//Authentication routes
app.use('/api/auth', authRoutes);

//Application routes
app.use('/api/applications', applicationRoutes);

//Google OAuth routes
app.use('/api/google', googleRoutes);

//Cron test routes
app.use('/api/cron', cronRoutes);

//Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

export default app;
