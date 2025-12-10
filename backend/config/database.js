// config/database.js
// Exports database clients for Prisma and Supabase
import dotenv from 'dotenv';
import prisma from 'prisma'

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Supabase client (for storage, auth, realtime features)
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('Warning: SUPABASE_URL or SUPABASE_KEY not set. Supabase features will be disabled.');
}

module.exports = {
    prisma,    // Use for database operations
    supabase   // Use for storage, auth, realtime
};

