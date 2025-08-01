import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  slug: { type: String, required: true, unique: true, autoIndex: true },
  title: { type: String, required: true, autoIndex: true },
  description: { type: String, required: true },
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  deleteFlag: { type: Boolean, default: false },
  reactions: { type: Boolean, default: false, required: false },
  comments : { type: Boolean, default: false, required: false },
  votes: { type: Boolean, default: false, required: false },
  acceptedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }],
  rejectedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now } 
});
 
const Discussion = mongoose.model('discussion', discussionSchema);
export default Discussion;