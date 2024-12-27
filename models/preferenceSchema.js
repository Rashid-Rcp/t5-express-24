import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  languages: { type: Array, required: true },
  interestingAreas: { type: Array, required: true },
  deleteFlag: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Preference = mongoose.model('Preference', preferenceSchema);
export default Preference;