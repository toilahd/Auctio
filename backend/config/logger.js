import winston from 'winston';
import DailyRotateFile from "winston-daily-rotate-file";
import {ElasticsearchTransport} from "winston-elasticsearch";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}


// 1. Config the Daily Rotate File transport
const fileRotateTransport = new DailyRotateFile({
    filename: path.join(logDir, "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchieve: true,
    maxSize: "20m",
    maxFiles: "14d"
})
// 2. esTransformer
const esTransformer = (logData) => {
    const { timestamp, level, message, ...rest } = logData;

    const meta = rest.meta?.meta;

    const buildRequestInfo = (req) => {
        if (!req) return undefined;

        return {
            method: req.method,
            url: req.originalUrl || req.url,
            ip: req.ip,
            host: req.hostname,
            userAgent: req.headers?.['user-agent'],
            body: safeJson(req.body),
            params: req.params,
            query: req.query,
            headers: pickHeaders(req.headers),
        };
    };

    const buildResponseInfo = (res) => {
        if (!res) return undefined;

        return {
            statusCode: res.statusCode,
            headers: pickHeaders(res.getHeaders?.() || res._headers),
        };
    };

    function safeJson(obj) {
        try {
            if (typeof obj === "object" && obj !== null) {
                return JSON.parse(JSON.stringify(obj));
            }
            return obj;
        } catch (e) {
            return "[Unserializable Object]";
        }
    }

    // Pick only necessary headers
    function pickHeaders(headers) {
        if (!headers) return {};
        return {
            'content-type': headers['content-type'],
            'user-agent': headers['user-agent'],
            'accept': headers['accept'],
            'content-length': headers['content-length'],
        };
    }

    return {
        "@timestamp": timestamp || new Date().toISOString(),

        message,
        severity: level,

        http: meta
            ? {
                request: buildRequestInfo(meta.req),
                response: buildResponseInfo(meta.res),
                response_time_ms: meta.responseTime,
            }
            : undefined
    };
};
// 3. Elasticsearch transport
const esTransport = new ElasticsearchTransport({
    level: process.env.LOG_LEVEL || "info",
    clientOpts: {
        node: process.env.ELASTICSEARCH_NODE || "http://localhost:9200",
    },
    indexPrefix: "logs",
    transformer: esTransformer,
});

// 4. Logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        fileRotateTransport,
        esTransport,
    ],
});

export const getLogger = (label) => logger.child({ label });
export default logger;