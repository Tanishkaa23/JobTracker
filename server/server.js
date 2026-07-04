import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { startCron } from './src/services/cron.service.js';
const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        await connectDB();
        startCron();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to bootstrap server:', error);
        process.exit(1);
    }
}

bootstrap();
