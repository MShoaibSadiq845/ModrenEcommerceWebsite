import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB || 'EcommerceWebApplicationSocket', // database name
    connectionOptions: {
        family: 4,                        // IPv4 force karne ke liye
        serverSelectionTimeoutMS: 5000,   // 5 seconds timeout
    },
}));