import express from 'express';
import authRoutes from './routes/auth.routes.js';
import applicationRoutes from './routes/application.routes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//Authentication routes
app.use('/api/auth', authRoutes);

//Application routes
app.use('/api/applications', applicationRoutes);


export default app;
