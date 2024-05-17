const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/index');
const User = require('./models/user');
const bcrypt = require('bcrypt'); // Import bcrypt

// Sync all models
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error syncing the database:', err);
  });

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Define a POST endpoint for signup
app.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, username });
    res.status(201).json({ message: 'User registered successfully', user: { email, username } });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Server error');
  }
});

// Define a POST endpoint for signin
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send('User not found');
    }

    // Compare the hashed password with the provided password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Incorrect password');
    }

    // Send back user details
    res.status(200).json({ message: 'User signed in successfully', user: { email: user.email, username: user.username } });
    console.log(user.username + ' signed in successfully');
  } catch (err) {
    console.error('Error signing in user:', err);
    res.status(500).send('Server error');
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Close the connection gracefully when the server is terminated
process.on('SIGINT', () => {
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
