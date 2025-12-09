import express from 'express';
import {getLogger} from "./config/logger.js";
import {sendEmail} from "./config/email.js";
import dotenv from 'dotenv';

dotenv.config()
const app = express();
const port = process.env.PORT || 3000;
const appLogger = getLogger('App');

const startServer = async () => {
    try {
        app.listen(port, () => {
            appLogger.info(`Server is running on port ${port}`);
        });

        // Send test email after server starts
        await sendEmail("qhuy180624@gmail.com", "Test Email", "This is a test email from the Node.js application.");
        appLogger.info('Test email sent successfully');
    } catch (error) {
        appLogger.error('Failed to run server or send email', error);
        process.exit(1);
    }
}


startServer();




