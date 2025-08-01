import mongoose from 'mongoose';
// Define the schema
const userSchema = new mongoose.Schema({
 fullName: { type: String, required: true },
 username: { type: String, unique: true, required: true, index: true },
 email: { type: String, unique: true, required: true, index: true },
 phone: { type: String, unique: false, required: false, index: false },
 emailVerified: { type: Boolean, default: false },
 phoneVerified: { type: Boolean, default: false },
 password: { type: String, required: true },
 coverImage: { type: String, required: false },
 profileImage: { type: String, required: false },
 about: { type: String, required: false },
 socialLinks: { type: Array, required: false },
 deleteFlag: { type: Boolean, default: false },
 createdAt: { type: Date, default: Date.now },
 updatedAt: { type: Date, default: Date.now },
 asContributor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: false }],
 asCreator: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: false }],
 asFollower: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: false }],
});
// Create the model
const User = mongoose.model('User', userSchema);
export default User;  