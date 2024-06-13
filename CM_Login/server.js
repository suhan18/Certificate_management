// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Change the MongoDB connection string to use your `project` database
mongoose.connect('mongodb://localhost:27017/project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define the schema and model to use the `logininfo` collection
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
}, { collection: 'login_info' });  // Specify the collection name here

const User = mongoose.model('User', userSchema);

// Endpoint to handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user exists in the database
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            // User already exists, return an error
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user instance
        const newUser = new User({ username, password });

        // Save the new user to the database
        await newUser.save();

        // Log the new user
        console.log('New user registered:', newUser);

        // Send a success response
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        // If an error occurs, send a server error response
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
