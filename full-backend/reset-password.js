require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models/user'); // adjust path if different

const MONGO_URI = process.env.CONNECTION_STRING;

async function updatePassword() {
    try {
        await mongoose.connect(MONGO_URI);

        const userEmail = 'niallmcaffrey@gmail.com'; // or use _id if preferred
        const newPlainPassword = 'redmane1995';
        const newPasswordHash = bcrypt.hashSync(newPlainPassword, 10);

        const updatedUser = await User.findOneAndUpdate({ email: userEmail }, { passwordHash: newPasswordHash }, { new: true });

        if (updatedUser) {
            console.log(`✅ Password updated for user: ${updatedUser.email}`);
        } else {
            console.log(`❌ User not found.`);
        }

        mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error updating password:', err);
    }
}

updatePassword();