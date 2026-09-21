import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

// Try loading env from backend/.env then root .env
dotenv.config({ path: path.resolve('backend/.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve('.env') });
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/human_management';

async function run() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    const usersCollection = mongoose.connection.collection('users');
    const users = await usersCollection.find({}, { projection: { password: 0, refreshToken: 0 } }).toArray();

    if (!users || users.length === 0) {
      console.log('DATABASE_EMPTY: Không tìm thấy tài khoản nào trong collection "users".');
    } else {
      console.log(`FOUND_USERS_COUNT: ${users.length}`);
      for (const u of users) {
        console.log(`- Username: ${u.username} | Email: ${u.email || '(trống)'} | Họ tên: ${u.hoTen || '(trống)'} | Vai trò: ${u.role}`);
      }
    }
  } catch (err) {
    console.error('CONNECT_ERROR:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
