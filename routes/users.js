const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

// Define MongoDB URI securely via environment variables
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://WonderfulStay:WonderfulStay_DB@database.l0nuk1b.mongodb.net/?retryWrites=true&w=majority&appName=DataBase';

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connection Successful'))
  .catch(err => console.error('Connection Error:', err));

// Define the user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
  dp: String, // Profile picture URL
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true }
}, { timestamps: true }); // Add timestamps

// Apply passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose);

// Export the user model
module.exports = mongoose.model('User', userSchema);
