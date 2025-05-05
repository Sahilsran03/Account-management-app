

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  accountNumber: String,
  rupees: Number,
  date: { type: Date, default: Date.now },
  createdDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

module.exports = mongoose.model('Customer', customerSchema);