//backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const caRoutes = require('./routes/caRoutes'); // Import CA routes

const app = express();
app.use(cors());
app.use(bodyParser.json());

const password = encodeURIComponent('LcDL6n?&8RzY$kgJ');
const uri = `mongodb+srv://mongo:${password}@cluster0.wccrmo0.mongodb.net/netflix_dummy_server?retryWrites=true&w=majority`;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Could not connect to MongoDB Atlas...', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
}, { collection: 'login_info' });

const User = mongoose.model('User', userSchema);

app.use('/api/ca', caRoutes); // Use CA routes with correct prefix

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app};
