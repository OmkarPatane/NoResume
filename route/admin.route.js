const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../model/admin.model');
const Trainer = require('../model/trainer.model');
const User = require('../model/user.model');
const auth = require('../middleware/auth');



router.post('/create-trainer', auth(['admin']), async (req, res) => {
  const { name, email, password, phone, alternatePhone, joiningDate } = req.body;

  try {
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res.status(400).json({ msg: "Trainer already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTrainer = new Trainer({
      name,
      email,
      password: hashedPassword,
      phone,
      alternatePhone,
      joiningDate: new Date(joiningDate), // ✅ convert string to Date object
    });

    await newTrainer.save();

    res.status(201).json({ msg: "Trainer created", trainer: newTrainer });
  } catch (err) {
    console.error("Error creating trainer:", err);
    res.status(500).json({ msg: err.message });
  }
});

// Get all trainers
router.get('/trainers', auth(['admin']), async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.status(200).json(trainers);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update trainer
router.put('/update-trainer/:id', auth(['admin']), async (req, res) => {
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ msg: "Trainer updated", trainer: updatedTrainer });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete trainer
router.delete('/delete-trainer/:id', auth(['admin']), async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Trainer deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// Admin creates a new user
router.post("/create-user", auth(["admin"]), async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    phone,
    height,
    weight,
    trainer,
    paymentDate,
    feesPaid,
    feeCycleDays
  } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const cycleDays = feeCycleDays || 30;
    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();
    const dueDate = new Date(paymentDateObj.getTime() + cycleDays * 24 * 60 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      phone,
      height,
      weight,
      trainer,
      paymentDate: paymentDateObj,
      feesPaid: feesPaid ?? false,
      feeCycleDays: cycleDays,
      dueDate,
    });

    await newUser.save();
    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// Admin Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exist = await Admin.findOne({ email });
    if (exist) return res.status(400).json({ msg: 'Admin already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashed });
    await newAdmin.save();

    res.status(201).json({ msg: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: 'admin' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all trainers
router.get('/trainers', auth(['admin']), async (req, res) => {
  const trainers = await Trainer.find();
  res.json(trainers);
});

// Get all users
router.get('/users', auth(['admin']), async (req, res) => {
  const users = await User.find().populate('trainer');
  res.json(users);
});

// Delete trainer
router.delete('/trainer/:id', auth(['admin']), async (req, res) => {
  await Trainer.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Trainer deleted' });
});

// Delete user
router.delete('/user/:id', auth(['admin']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: 'User deleted' });
});

router.get("/allUserss",async(req,res)=>{
  try {
    const users = await User.find();
    res.status(200).json(users);
    
  } catch (error) {
    res.status(500).json({ msg: err.message });
  }
})

module.exports = router;
