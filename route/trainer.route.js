const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Trainer = require('../model/trainer.model');
const User = require('../model/user.model');
const auth = require('../middleware/auth');


router.get("/", async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.status(200).json(trainers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trainers", error: err });
  }
});

// Trainer sets payment date and feesPaid, and the server calculates dueDate
router.put('/set-payment/:userId', auth(['trainer']), async (req, res) => {
  const { userId } = req.params;
  const { paymentDate } = req.body; // Expecting a date like "2025-04-16"

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.paymentDate = new Date(paymentDate);
    const cycle = user.feeCycleDays || 30;

    const dueDate = new Date(paymentDate);
    dueDate.setDate(dueDate.getDate() + cycle); // ⬅️ This is where your logic goes

    user.dueDate = dueDate;
    user.feesPaid = true;

    await user.save();
    res.status(200).json({ msg: 'Payment and due date updated', user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// Trainer Signup
// router.post('/signup', auth(['admin']),async (req, res) => {
//   const { name, email, password, phone, experience, specialization, bio } = req.body;

//   try {
//     const exist = await Trainer.findOne({ email });
//     if (exist) return res.status(400).json({ msg: 'Trainer already exists' });

//     const hashed = await bcrypt.hash(password, 10);
//     const newTrainer = new Trainer({
//       name,
//       email,
//       password: hashed,
//       phone,
//       experience,
//       specialization,
//       bio,
//     });

//     await newTrainer.save();
//     res.status(201).json({ msg: 'Trainer created successfully' });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// });

// Trainer Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const trainer = await Trainer.findOne({ email });
    if (!trainer) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, trainer.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: trainer._id, role: 'trainer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: 'trainer' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Trainer can see all gym users
router.get('/all-users', auth(['trainer']), async (req, res) => {
  try {
    const users = await User.find().populate('trainer');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Trainer can see their own users
router.get('/my-users', auth(['trainer']), async (req, res) => {
  try {
    const trainerId = req.user.id;
    const users = await User.find({ trainer: trainerId });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
