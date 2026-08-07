
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// ─── Fill in your admin credentials here ─────────────────────────────────────
const ADMIN_EMAIL = 'certificate@mstblockchain.com';       // e.g. 'admin@example.com'
const ADMIN_PASSWORD = 'Admin123!@#'; // e.g. 'Admin@1234'
const ADMIN_NAME = 'NewAdmin';
// ─────────────────────────────────────────────────────────────────────────────

// Load .env manually using Node's built-in fs (no dotenv package needed)
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const [key, ...rest] = line.split('=');
        if (key && rest.length) {
            process.env[key.trim()] = rest.join('=').trim();
        }
    }
}

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: 'user' },
        name: { type: String },
    },
    { timestamps: true },
);

async function seed() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MONGODB_URI is not set in your .env file');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const UserModel = mongoose.model('User', UserSchema);

    const existing = await UserModel.findOne({ email: ADMIN_EMAIL });

    if (existing) {
        console.log(`⚠️  Admin already exists (${ADMIN_EMAIL}), skipping.`);
    } else {
        await UserModel.create({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            name: ADMIN_NAME,
        });
        console.log(`✅ Admin user seeded successfully (${ADMIN_EMAIL})`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
