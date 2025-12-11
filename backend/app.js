import express from 'express';
import {getLogger} from "./config/logger.js";
import {sendEmail} from "./config/email.js";
import dotenv from 'dotenv';
import {testDatabase} from "./config/prisma.js";

// Routes
import authRouter from "./routes/auth.routes.js"
import docsRouter from "./routes/docs.routes.js"

dotenv.config()
const app = express();
const port = process.env.PORT || 3000;
const appLogger = getLogger('App');

app.use(docsRouter);
app.use(authRouter);

const startServer = async () => {
    try {
        app.listen(port, () => {
            appLogger.info(`Server is running on port ${port}`);
        });

        testDatabase();

        // Send test email after server starts
        await sendEmail("qhuy180624@gmail.com", "Test Email", "This is a test email from the Node.js application.");
        appLogger.info('Test email sent successfully');
    } catch (error) {
        appLogger.error('Failed to run server or send email', error);
        process.exit(1);
    }
}


startServer();
