const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authJwt = require('../helpers/jwt'); // middleware to decode and validate token
const isAdmin = require('../helpers/isAdmin'); // checks req.user.isAdmin === true

// 🔐 Require authentication for all routes after this line
router.use(authJwt());

// ✅ Admin-only: Get all users
router.get(`/`, isAdmin, async (req, res) => {
  try {
    const userList = await User.find().select('-passwordHash');
    if (!userList) return res.status(404).json({ success: false, message: 'No users found.' });
    res.status(200).send(userList);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔐 Logged-in users (or admin) can get their own profile
router.get('/:id', async (req, res) => {
  const requestedId = req.params.id;
  const userId = req.user.userId;
  const isAdmin = req.user.isAdmin;

  if (userId !== requestedId && !isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const user = await User.findById(requestedId).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.status(200).send(user);
});

// ✅ Admin-only: Create a user via API (optional for admin panel)
router.post('/', isAdmin, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();
  if (!user) return res.status(400).send('The user cannot be created!');
  res.send(user);
});

// 🔐 Update profile (self or admin)
router.put('/:id', async (req, res) => {
  const requestedId = req.params.id;
  const userId = req.user.userId;
  const isAdmin = req.user.isAdmin;

  if (userId !== requestedId && !isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const userExist = await User.findById(requestedId);
  if (!userExist) return res.status(404).json({ message: 'User not found' });

  const newPassword = req.body.password
    ? bcrypt.hashSync(req.body.password, 10)
    : userExist.passwordHash;

  const updatedUser = await User.findByIdAndUpdate(
    requestedId,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: isAdmin ? req.body.isAdmin : userExist.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );

  if (!updatedUser) return res.status(500).send('The user could not be updated');
  res.send(updatedUser);
});

// 🔓 Public: Login
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;

  if (!user) return res.status(400).send('The user not found');

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: '1d' }
    );

    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send('Password is wrong!');
  }
});

// 🔓 Public: Register
router.post('/register', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: false, // prevent spoofing
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();
  if (!user) return res.status(400).send('The user cannot be created!');
  res.send(user);
});

// ✅ Admin-only: Delete user
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (user) {
      return res.status(200).json({ success: true, message: 'The user is deleted!' });
    } else {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

// ✅ Admin-only: User count
router.get(`/get/count`, isAdmin, async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) return res.status(500).json({ success: false });
  res.send({ userCount });
});

module.exports = router;
