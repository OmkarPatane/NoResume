const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/user.model');
const Trainer = require('../model/trainer.model');
const auth = require('../middleware/auth');


// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: 'user' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// View own trainer info and fees
router.get('/me', auth(['user']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('trainer');
    res.json({
      name: user.name,
      email: user.email,
      trainer: user.trainer,
      feesPaid: user.feesPaid,
      dueDate: user.dueDate,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
