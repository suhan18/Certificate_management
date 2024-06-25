const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Local MongoDB Connection
mongoose.connect('mongodb://localhost:27017/certificate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const localDb = mongoose.connection;
localDb.on('error', console.error.bind(console, 'Local MongoDB connection error:'));
localDb.once('open', () => {
  console.log('Connected to local MongoDB');
});

// Cloud MongoDB Connection
const password = encodeURIComponent('LcDL6n?&8RzY$kgJ'); // Replace with your actual password
const cloudUri = `mongodb+srv://mongo:${password}@cluster0.wccrmo0.mongodb.net/netflix_dummy_server?retryWrites=true&w=majority`;

const cloudConnection = mongoose.createConnection(cloudUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

cloudConnection.on('error', console.error.bind(console, 'Cloud MongoDB connection error:'));
cloudConnection.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define MongoDB Schemas and Models
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gender: String,
  country: String,
  age: String,
  creditCard: { type: Number, default: '' },
  validTill: { type: String, default: '' },
  ccv: { type: Number, default: '' },
  subscriptionDays: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  isCert: { type: Boolean, default: false },
});

const LocalContact = mongoose.model('localcontacts', ContactSchema);

const CloudContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  country: String,
  subscriptionDays: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  isCert: { type: Boolean, default: false },
});

const CloudContact = cloudConnection.model('contacts', CloudContactSchema);

const csrSchema = new mongoose.Schema({
  username: { type: String, required: true },
  csrPath: { type: String, required: true },
  keyPath: { type: String, required: true },
  certPath: { type: String },
  organization: { type: String, default: "PES University" },
  signingCA: { type: String },
  expiryDate: { type: Date },
  status: { type: String, default: 'Pending' },
}, { collection: 'csr_info' });

const CSR = mongoose.model('CSR', csrSchema);

// Helper function to synchronize data between local and cloud databases
const syncContact = async (contact) => {
  try {
    // Update or create in local database
    let localContact = await LocalContact.findOne({ email: contact.email });

    if (!localContact) {
      localContact = new LocalContact({
        name: contact.name,
        email: contact.email,
        password: contact.password,
        gender: contact.gender,
        country: contact.country,
        age: contact.age,
        subscriptionDays: contact.subscriptionDays,
        isPaid: contact.isPaid,
        isCert: contact.isCert,
      });
    } else {
      localContact.name = contact.name;
      localContact.password = contact.password;
      localContact.gender = contact.gender;
      localContact.country = contact.country;
      localContact.age = contact.age;
      localContact.subscriptionDays = contact.subscriptionDays;
      localContact.isPaid = contact.isPaid;
      localContact.isCert = contact.isCert;
    }

    await localContact.save();

    // Update or create in cloud database
    let cloudContact = await CloudContact.findOne({ email: contact.email });

    if (!cloudContact) {
      cloudContact = new CloudContact({
        name: contact.name,
        email: contact.email,
        password: contact.password,
        country: contact.country,
        subscriptionDays: contact.subscriptionDays,
        isPaid: contact.isPaid,
        isCert: contact.isCert,
      });
    } else {
      cloudContact.name = contact.name;
      cloudContact.password = contact.password;
      cloudContact.country = contact.country;
      cloudContact.subscriptionDays = contact.subscriptionDays;
      cloudContact.isPaid = contact.isPaid;
      cloudContact.isCert = contact.isCert;
    }

    await cloudContact.save();

  } catch (error) {
    console.error('Error syncing contact:', error);
    throw new Error('Failed to sync contact');
  }
};

// Function to create CSR
const createCSR = async (username, organization, subscriptionDays) => {
  const csrPath = path.join(__dirname, 'certs', `${username}.csr`);
  const keyPath = path.join(__dirname, 'certs', `${username}.key`);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + subscriptionDays);

  const csrCommand = `
    openssl req -new -newkey rsa:2048 -nodes -keyout ${keyPath} -out ${csrPath} -subj "/C=US/ST=State/L=City/O=${organization}/OU=Unit/CN=${username}"
  `;

  exec(csrCommand, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error creating CSR for ${username}:`, error);
      return;
    }
    console.log(`CSR created for ${username}:\n`, stdout);

    const newCSR = new CSR({ username, csrPath, keyPath, expiryDate });
    await newCSR.save();
  });
};

// Watch for 'isPaid' becoming true in the 'contacts' collection
localDb.collection('localcontacts').watch().on('change', async (change) => {
  if (change.operationType === 'update' && change.updateDescription.updatedFields.isPaid === true) {
    const contact = await LocalContact.findById(change.documentKey._id);
    if (contact) {
      const subscriptionDays = contact.subscriptionDays;
      createCSR(contact.email, 'PES University', subscriptionDays);
    }
  }
});

// Routes
app.post('/api/register', async (req, res) => {
  const { name, email, password, gender, country, age } = req.body;
  try {
    const existingContact = await LocalContact.findOne({ email });
    if (existingContact) {
      return res.status(409).json({ error: 'Email is already registered' });
    }
    const newContact = new LocalContact({ name, email, password, gender, country, age });
    await newContact.save();
    await syncContact(newContact);
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register contact' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const contact = await LocalContact.findOne({ email, password });
    if (!contact) {
      return res.status(404).json({ error: 'Invalid email or password' });
    }
    if (!contact.isPaid) {
      return res.status(200).json({ message: 'Login successful, but subscription not paid', isPaid: false });
    }
    res.status(200).json({ message: 'Login successful', isPaid: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Endpoint to check if the email has already made a payment
app.post('/api/check-payment', async (req, res) => {
  const { email } = req.body;
  try {
    const contact = await LocalContact.findOne({ email });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (contact.isPaid) {
      return res.status(200).json({ message: 'Payment already made' });
    }
    res.status(200).json({ isPaid: contact.isPaid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Endpoint to handle payment
app.post('/api/payment', async (req, res) => {
  const { email, creditCard, validTill, ccv, subscriptionDays } = req.body;
  try {
    const localContact = await LocalContact.findOne({ email });
    const cloudContact = await CloudContact.findOne({ email });

    if (!localContact || !cloudContact) {
      return res.status(404).json({ error: 'Contact not found in one of the databases' });
    }

    if (localContact.isPaid || cloudContact.isPaid) {
      return res.status(400).json({ error: 'Payment already made for this email' });
    }

    if (localContact.subscriptionDays > 0 || cloudContact.subscriptionDays > 0) {
      return res.status(400).json({ error: 'You already have an ongoing subscription plan' });
    }

    // Assuming all validations pass, update both databases
    localContact.creditCard = creditCard;
    localContact.validTill = validTill;
    localContact.ccv = ccv;
    localContact.subscriptionDays = subscriptionDays;
    localContact.isPaid = true;

    // Update only relevant fields in the cloud database
    cloudContact.subscriptionDays = subscriptionDays;
    cloudContact.isPaid = true;

    await localContact.save();
    await syncContact(localContact); // Sync local contact to cloud
    await cloudContact.save();

    res.status(200).json({ message: 'Payment information saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save payment information' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
