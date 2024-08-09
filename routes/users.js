const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

const mongoURI = 'mongodb+srv://Ayush101:Ayush70041Anand@wonderfulstay.wmzzn.mongodb.net/?retryWrites=true&w=majority&appName=WonderfulStay';

mongoose.connect(mongoURI).then(() => {
  console.log(`Connection Successful`);
}).catch((err) => console.error(`Connection Error:`, err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
  dp: String, // Profile picture URL
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true }
});

userSchema.plugin(plm);
module.exports = mongoose.model('User', userSchema);
