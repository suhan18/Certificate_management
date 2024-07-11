const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const caRoutes = require('./routes/caRoutes'); // Import CA routes
const { Schema } = mongoose;
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const password = encodeURIComponent('LcDL6n?&8RzY$kgJ');
const uri = `mongodb+srv://mongo:${password}@cluster0.wccrmo0.mongodb.net/netflix_dummy_server?retryWrites=true&w=majority`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Could not connect to MongoDB Atlas...', err));

const userSchema = new mongoose.Schema({
  d_username: { type: String, required: true },
  d_password: { type: String, required: true },
}, { collection: 'login_info' });

const User = mongoose.model('User', userSchema);

const csrSchema = new mongoose.Schema({
  username: { type: String, required: true },
  csrPath: { type: String, required: true },
  keyPath: { type: String, required: true },
  organization: { type: String, required: true },
  country: { type: String, required: true },
  subscriptionDays: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
}, { collection: 'cloud_csr_info' });

const CSR = mongoose.model('CSR', csrSchema);

const infoSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true },
  commonName: { type: String, required: true },
  certificate: { type: mongoose.Schema.Types.ObjectId, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  ca: { type: mongoose.Schema.Types.ObjectId, required: true },
  username: { type: String, required: true },
  csrId: { type: mongoose.Schema.Types.ObjectId, required: true },
  country: { type: String, required: true },
  dateAuthorized: { type: Date, required: true },
  _v: { type: Number, required: true },
}, { collection: 'certificates' });

const Info = mongoose.model('Info', infoSchema);

//const CSR = mongoose.model('CSR', csrSchema);

// Define a schema for the Expired collection (similar to Info schema)
const ExpiredSchema = new mongoose.Schema({
  commonName: String,
  certificate: String,
  issuedBy: String,
  ca: String,
  username: String,
  csrId: String,
  country: String,
  dateAuthorized: Date,
  publicKey: String,
  subscriptionDays: Number,
  expiryDate: Date,
});

const Expired = mongoose.model('Expired', ExpiredSchema);


const createCSR = async (username, organization, subscriptionDays) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + subscriptionDays);

  const newCSR = new CSR({ username, expiryDate });
  await newCSR.save();

  // Simulated notification or processing of new CSR
  console.log(`New CSR created for ${username}`);
};

/* // Function to remove expired certificates
const removeExpiredCertificates = async () => {
  try {
    const currentDate = new Date();
    await Info.deleteMany({ expiryDate: { $lte: currentDate } });
    console.log('Expired certificates removed');
  } catch (error) {
    console.error('Error removing expired certificates:', error);
  }
}; */

// Polling function to fetch pending CSRs every 5 seconds
const fetchPendingCSRs = async () => {
  try {
    const pendingCSRs = await CSR.find({ status: 'Pending' });
    console.log('Fetched pending CSRs:', pendingCSRs);
    // Process pending CSRs here (authorize, notify, etc.)
  } catch (error) {
    console.error('Error fetching pending CSRs:', error);
  }

  /*   // Remove expired certificates after fetching pending CSRs
    await removeExpiredCertificates(); */
};

// Initial fetch of pending CSRs
fetchPendingCSRs();

// Polling interval in milliseconds (e.g., every 10 mins)
const pollingInterval = 10 * 60 * 1000;

setInterval(fetchPendingCSRs, pollingInterval);

app.post('/login', async (req, res) => {
  const { d_username, d_password } = req.body;
  try {
    const user = await User.findOne({ d_username, d_password });
    if (user) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  const { d_username, d_password } = req.body;
  try {
    const existingUser = await User.findOne({ d_username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ d_username, d_password });
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get a specific CSR by id
app.get('/csrs/:id', async (req, res) => {
  try {
    const csr = await CSR.findById(req.params.id);
    if (!csr) {
      return res.status(404).json({ message: 'CSR not found' });
    }
    res.status(200).json(csr);
  } catch (error) {
    console.error('Error fetching CSR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/csrs', async (req, res) => {
  try {
    const csrs = await CSR.find();
    res.status(200).json(csrs);
  } catch (error) {
    console.error('Error fetching CSRs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/* app.get('/certificates', async (req, res) => {
  try {
    const certificates = await CSR.find({ status: 'Authorized' });
    res.status(200).json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}); */
app.get('/certificates', async (req, res) => {
  try {
    const certificates = await CSR.find({ status: 'Authorized' });
    res.status(200).json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/info', async (req, res) => {
  try {
    const information = await Info.find();
    res.status(200).json(information);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to authorize a specific CSR by id
app.post('/authorize/:id', async (req, res) => {
  try {
    const csr = await CSR.findById(req.params.id);
    if (!csr) {
      return res.status(404).json({ message: 'CSR not found' });
    }

    // Update CSR status
    csr.status = 'Authorized';
    csr.signingCA = 'Your CA'; // Replace with your actual CA name or identifier
    await csr.save();

    res.status(200).json({ message: 'CSR authorized' });
  } catch (error) {
    console.error('Error authorizing CSR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/download/:id', async (req, res) => {
  try {
    const csr = await CSR.findById(req.params.id);
    if (!csr) {
      return res.status(404).json({ message: 'CSR not found' });
    }

    const certPath = csr.certPath;
    if (!fs.existsSync(certPath)) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.download(certPath, `${csr.username}.crt`, (err) => {
      if (err) {
        console.error('Error sending certificate:', err);
      }
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const RevokedSchema = new Schema({
  commonName: {
      type: String,
      required: true,
  },
  certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ca_files',
      required: true,
  },
  issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificateAuthority',
      required: true,
  },
  ca: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificateAuthority',
      required: true,
  },
  username: {
      type: String,
      ref: 'cloud_csr_info',
      required: true, 
  },
  csrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cloud_csr_info', 
      required: true, 
  },
  country: {
      type: String,
      ref: 'cloud_csr_info', 
      required: true, 
  },
  dateAuthorized: {
      type: Date,
      default: Date.now, 
  },
  publicKey: {
      type: String,
      ref: 'cloud_csr_info', 
      required: true, 
  },
  subscriptionDays: {
      type: Number,
      required: true, 
  },
  expiryDate: {
      type: Date, 
      required: true,
  },
  _v: { // Make _v optional if not set explicitly
      type: Number,
      default: 0
  },
  id: { // Make id optional if not set explicitly
      type: String,
      required: false
  }
});

const Revoked = mongoose.model('Revoked', RevokedSchema);

app.post('/revoke', async (req, res) => {
  const { id } = req.body; // Assuming `id` is passed from the frontend

  try {
    // Fetch the certificate by its ID
    const certificate = await Info.findById(id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Example logic: move certificate to expired collection
    const revokedCertificate = new Revoked(certificate.toObject());
    await revokedCertificate.save();
    await Info.deleteOne({ _id: id });

    res.status(200).json({ message: 'Certificate revoked successfully' });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

app.get('/revoked-count', async (req, res) => {
  try {
    console.log('Received request for revoked count'); // Logging the request
    const revokedCount = await Revoked.countDocuments();
    console.log(`Revoked count fetched successfully: ${revokedCount}`); // Logging the count
    res.status(200).json({ count: revokedCount });
  } catch (error) {
    console.error('Error fetching revoked certificates count:', error); // Logging the error
    res.status(500).json({ message: 'Internal server error' });
  }
});

/* 
// Function to execute shell commands
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout || stderr);
    });
  });
};

// Function to renew certificates
const renewCertificates = async () => {
  try {
    const currentDate = new Date();
    const certificates = await Info.find({ expiryDate: { $ne: currentDate } });

    for (const cert of certificates) {
      const csr = await CSR.findOne({ username: cert.username });
      if (csr) {
        // Renew the certificate logic here
        // You can use the information from the CSR and certificate to renew the certificate

        const certPath = path.join(certDir, `${cert.username}.crt`);
        const keyPath = path.join(certDir, `${cert.username}.key`);
        
        // Assuming you have the CA certificate and key paths stored in cert object
        const caCertPath = cert.caCertPath;
        const caKeyPath = cert.caKeyPath;

        const renewCommand = `openssl x509 -req -days ${csr.subscriptionDays} -in ${csr.csrPath} -CA ${caCertPath} -CAkey ${caKeyPath} -CAcreateserial -out ${certPath}`;
        
        await executeCommand(renewCommand);

        // Update the expiry date in the database
        cert.expiryDate.setDate(cert.expiryDate.getDate() + csr.subscriptionDays);
        await cert.save();

        console.log(`Certificate renewed for ${cert.username}`);
      } else {
        console.error(`CSR not found for username: ${cert.username}`);
      }
    }
  } catch (error) {
    console.error('Error renewing certificates:', error);
  }
};
/* 
// Initialize MongoDB GridFSBucket
const initGridFS = async () => {
  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, {
    bucketName: 'ca_files'  // Name of the GridFS bucket
  });
  return bucket;
};

// Function to check and renew certificates
const checkAndRenewCertificates = async () => {
  try {
    const currentDate = new Date();
    const certificates = await Info.find({ expiryDate: { $ne: currentDate } });
    const csrBucket = await initGridFS();

    for (const certificate of certificates) {
      const csr = await CSR.findById(certificate.csrId);
      if (csr) {
        await renewCertificate(csr, certificate);
      }
    }
  } catch (error) {
    console.error('Error checking and renewing certificates:', error);
  }
}; 

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', renewCertificates);

// Call the function immediately for testing purposes
renewCertificates(); */


/* // Function to remove expired certificates
const removeExpiredCertificates = async () => {
  try {
    const currentDate = new Date();
    const expiredCertificates = await Info.find({ expiryDate: { $lte: currentDate } });

    if (expiredCertificates.length > 0) {
      const removedUsernames = expiredCertificates.map(cert => cert.username);
      const removedCount = expiredCertificates.length;

      // Remove the expired certificates
      await Info.deleteMany({ expiryDate: { $lte: currentDate } });

      // Log the details
      console.log(`Removed ${removedCount} expired certificates. Usernames: ${removedUsernames.join(', ')}`);
    } else {
      console.log('No expired certificates found');
    }
  } catch (error) {
    console.error('Error removing expired certificates:', error);
  }
}; WORKS*/
// Function to remove expired certificates
const removeExpiredCertificates = async () => {
  try {
    const currentDate = new Date();
    const expiredCertificates = await Info.find({ expiryDate: { $lte: currentDate } });

    if (expiredCertificates.length > 0) {
      const removedUsernames = expiredCertificates.map(cert => cert.username);
      const removedCount = expiredCertificates.length;

      // Insert expired certificates into the Expired collection
      await Expired.insertMany(expiredCertificates);

      // Remove the expired certificates from the Info collection
      await Info.deleteMany({ expiryDate: { $lte: currentDate } });

      // Log the details
      console.log(`Moved ${removedCount} expired certificates to Expired collection. Usernames: ${removedUsernames.join(', ')}`);
    } else {
      console.log('No expired certificates found');
    }
  } catch (error) {
    console.error('Error removing expired certificates:', error);
  }
};

// Schedule the cron job to run every day at 12 PM
cron.schedule('0 12 * * *', removeExpiredCertificates);

// Initial call to remove expired certificates for testing purposes
removeExpiredCertificates();

// Function to find certificates expiring in the next week
const findExpiringCertificates = async () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  try {
    const expiringCertificates = await Info.find({ expiryDate: { $lte: nextWeek } });
    return expiringCertificates;
  } catch (error) {
    console.error('Error finding expiring certificates:', error);
    return [];
  }
};

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'meekn02@gmail.com',
        pass: 'gvoc uuux scwz qsiy' 
  }
});
/* 
const sendEmailNotifications = async (certificates) => {
  for (const cert of certificates) {
    try {
      // Check if expiryDate is defined and valid
      if (cert.expiryDate && cert.expiryDate instanceof Date && !isNaN(cert.expiryDate)) {
        const formattedExpiryDate = cert.expiryDate.toLocaleDateString();
        // Configure email options
        const mailOptions = {
          from: 'meekn02@gmail.com',
          to: cert.username, // Assuming username is the email
          subject: 'Subscription Ending at Cinezo',
          text: `Hi ${cert.username.split('@')[0]},

Your subscription is expiring soon on ${formattedExpiryDate}. To continue using Cinezo, please renew your subscription now.

For assistance, contact us at sahana.bhat27@gmail.com or 1234567890.

Thank you for choosing Cinezo.

Best regards,
The Cinezo Team`
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${cert.username}`);
      } else {
        console.error(`Invalid or missing expiryDate for certificate ${cert._id}`);
      }
    } catch (error) {
      console.error(`Error sending email to ${cert.username}:`, error);
    }
  }
}; */

// Function to send email notifications
const sendEmailNotifications = async (certificates) => {
  for (const cert of certificates) {
    //const formattedExpiryDate = cert.expiryDate.toLocaleDateString(); // Format expiryDate as needed

    const mailOptions = {
      from: 'meekn02@gmail.com',
      to: cert.username, // Assuming username is the email
      subject: 'Certificate Expiry Notification',
      text: `Hi ${cert.username.split('@')[0]},

Your subscription is expiring soon. To continue using Cinezo, please renew your subscription now.

For assistance, contact us at sahana.bhat27@gmail.com or 1234567890.

Thank you for choosing Cinezo.

Best regards,
The Cinezo Team`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${cert.username}`);
    } catch (error) {
      console.error(`Error sending email to ${cert.username}:`, error);
    }
  }
};

// Function to check and notify expiring certificates
const checkAndNotifyExpiringCertificates = async () => {
  const expiringCertificates = await findExpiringCertificates();
  if (expiringCertificates.length > 0) {
    await sendEmailNotifications(expiringCertificates);
  } else {
    console.log('No certificates expiring in the next week.');
  }
};

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', checkAndNotifyExpiringCertificates);

// Initial call for testing purposes
//checkAndNotifyExpiringCertificates();


app.use('/api/ca', caRoutes); // Mount the CA routes under the /api/ca path

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
