const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: {type:String,required:true},
  alternatePhone:{type:Number},
  joiningDate:{
    type:Date,
    required:true,
  }
});

module.exports = mongoose.model('Trainer', trainerSchema);
