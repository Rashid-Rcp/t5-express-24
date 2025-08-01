import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, autoIndex: true },
  name: { type: String, required: true, unique: true, autoIndex: true },
  tagline: { type: String, required: true },
  about: { type: String, required: true },
  profileImage: { type: String, required: false },
  coverImage: { type: String, required: false },
  contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }],
  languages: { type: Array, required: true },
  intrest: { type: Array, required: true }, 
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPrivate: { type: Boolean, default: false },
  deleteFlag: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
 
const Club = mongoose.model('Club', clubSchema);
export default Club;