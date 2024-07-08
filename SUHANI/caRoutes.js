
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

const CertificateAuthority = require('../models/CertificateAuthority');
const Certificate = require('../models/Certificate'); // Added this line

// Directory to store CA and certificate files
const caDir = path.join(__dirname, '..', 'ca');

const certDir = path.join(__dirname, '..', 'certs');
//const certDir = path.join(caDir, 'certs'); // Added this line
const archiveDir = path.join(caDir, 'archive');

if (!fs.existsSync(caDir)) {
    fs.mkdirSync(caDir);
}

if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir); // Added this line
}

if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
}


const executeCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        console.log(`Executing: ${cmd}`);
        exec(cmd, { cwd: caDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${stderr}`);
                reject(`Error: ${stderr}`);
            } else {
                console.log(`Output: ${stdout}`);
                resolve(stdout);
            }
        });
    });
};


// Function to archive CA files under the archive directory with common name and original file names
const archiveCAFiles = async (commonName) => {
    // Create a directory with commonName under archive if it doesn't exist
    const archiveCommonDir = path.join(archiveDir, commonName);
    if (!fs.existsSync(archiveCommonDir)) {
        fs.mkdirSync(archiveCommonDir);
    }

    // Archive CA files under commonName directory with corrected file names
    const filesToArchive = ['ca.crt', 'ca.key', 'ca.srl'];
    filesToArchive.forEach((file) => {
        const filePath = path.join(caDir, file);
        if (fs.existsSync(filePath)) {
            fs.renameSync(filePath, path.join(archiveCommonDir, file));
            console.log(`Archived ${file} for ${commonName}`);
        } else {
            console.warn(`File not found: ${file}`);
        }
    });
};


// Initialize MongoDB GridFSBucket
const initGridFS = async () => {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, {
        bucketName: 'ca_files'  // Name of the GridFS bucket
    });

    return bucket;
};

// Function to upload file to MongoDB GridFS
const uploadFileToGridFS = async (bucket, commonName, fileName) => {
    const filePath = path.join(archiveDir, commonName, fileName);
    console.log(`archiveDir:${archiveDir}`);
    console.log(`commonName:${commonName}`);
    console.log(`fileName:${fileName}`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found SLAY: ${filePath}`);
    }

    const uploadStream = bucket.openUploadStream(fileName);
    const fileStream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
        fileStream.pipe(uploadStream)
            .on('finish', () => resolve(uploadStream.id))
            .on('error', (error) => reject(error));
    });
};

// Function to download file from MongoDB GridFS
const downloadFileFromGridFS = (bucket, fileId, res) => {
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    downloadStream.pipe(res)
        .on('error', (error) => {
            console.error(`Error downloading file: ${error}`);
            res.status(500).send(`Error downloading file: ${error}`);
        });
};

/* // Step 1: Generate the Root Certificate and Private Key
const generateRootCertificate = (commonName) => {
    const cmd = `openssl req -x509 -newkey rsa:2048 -nodes -keyout ${path.join(caDir, 'ca.key')} -out ${path.join(caDir, 'ca.crt')} -days 3650 -subj "/C=US/ST=State/L=Locality/O=Organization/CN=${commonName}"`;
    return executeCommand(cmd);
}; */
const generateRootCertificate = async (commonName) => {
    const privateKeyPath = path.join(caDir, 'ca.key');
    const certificatePath = path.join(caDir, 'ca.crt');
    
    // OpenSSL command to generate the root certificate and private key
    const cmd = `openssl req -x509 -newkey rsa:2048 -nodes -keyout ${privateKeyPath} -out ${certificatePath} -days 3650 -subj "/C=US/ST=State/L=Locality/O=Organization/CN=${commonName}"`;

    // Execute the command
    await executeCommand(cmd);

    // Extract the public key from the generated certificate
    const extractCmd = `openssl x509 -in ${certificatePath} -noout -pubkey`;
    const publicKey = await executeCommand(extractCmd);

    // Return the public key
    return publicKey;
};


// Step 2: Create a Certificate Signing Request (CSR)
const createCSR = () => {
    const cmd = `openssl req -new -key ${path.join(caDir, 'ca.key')} -out ${path.join(caDir, 'ca.csr')} -subj "/C=US/ST=State/L=Locality/O=Organization/CN=Root CA"`;
    return executeCommand(cmd);
};

// Step 3: Sign the Certificate Signing Request (CSR)
const signCSR = () => {
    const cmd = `openssl x509 -req -in ${path.join(caDir, 'ca.csr')} -CA ${path.join(caDir, 'ca.crt')} -CAkey ${path.join(caDir, 'ca.key')} -CAcreateserial -out ${path.join(caDir, 'ca.crt')}`;
    return executeCommand(cmd);
};

// Step 4: Create a Certificate Revocation List (CRL)
const createCRL = () => {
    return new Promise((resolve, reject) => {
        const cmd = `openssl ca -gencrl -keyfile ${path.join(caDir, 'ca.key')} -cert ${path.join(caDir, 'ca.crt')} -out ${path.join(caDir, 'crl.pem')} -config ${path.join(__dirname, 'openssl.cnf')}`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating CRL: ${stderr}`);
                reject(`Error creating CRL: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
};


router.post('/add', async (req, res) => {
    const { commonName } = req.body;

    try {
        // Generate root certificate and private key
        console.log('Generating root certificate and private key...');
        const publicKey = await generateRootCertificate(commonName); // Assuming generateRootCertificate returns the public key
        console.log('Root certificate and private key generated.');

        // Create CSR
        console.log('Creating CSR...');
        await createCSR();
        console.log('CSR created.');

        // Sign CSR
        console.log('Signing CSR...');
        await signCSR();
        console.log('CSR signed.');

        // Create CRL
        console.log('Creating CRL...');
        await createCRL();
        console.log('CRL created.');

        // Archive CA files
        console.log('Archiving CA files...');
        await archiveCAFiles(commonName);
        console.log('CA files archived.');

        // Initialize GridFS bucket
        const bucket = await initGridFS();

        // Upload .crt, .key, and .srl files to GridFS
        const [crtFileId, keyFileId, srlFileId] = await Promise.all([
            uploadFileToGridFS(bucket, commonName, 'ca.crt'),
            uploadFileToGridFS(bucket, commonName, 'ca.key'),
            uploadFileToGridFS(bucket, commonName, 'ca.srl')
        ]);

        const newCA = new CertificateAuthority({
            commonName: commonName,
            certificate: new ObjectId(), // Example ObjectId
            key: new ObjectId(), // Example ObjectId
            srl: new ObjectId(), // Example ObjectId
            publicKey: publicKey // Assign the publicKey obtained from generateRootCertificate
        });

        await newCA.save();
        res.status(200).send('Certificate Authority created successfully');

        //res.status(200).send('Certificate Authority created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating Certificate Authority');
    }
});



// Ensure certDir exists
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
}

// Route to list all Certificate Authorities
// Route to list all Certificate Authorities
router.get('/list', async (req, res) => {
    try {
        const cas = await CertificateAuthority.find().select('-certificate -key -srl');
        res.status(200).json(cas);
    } catch (error) {
        console.error('Error fetching Certificate Authorities', error);
        res.status(500).send('Error fetching Certificate Authorities');
    }
});

// Route to download a CA file
router.get('/file/:id', async (req, res) => {
    try {
        const caId = req.params.id;

        const ca = await CertificateAuthority.findById(caId);
        if (!ca) {
            return res.status(404).send('Certificate Authority not found');
        }

        const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'ca_files' });

        const downloadStream = bucket.openDownloadStream(ca.certificate);

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="ca.crt"`);

        downloadStream.pipe(res)
            .on('error', (error) => {
                console.error(`Error downloading file: ${error}`);
                res.status(500).send(`Error downloading file: ${error}`);
            });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error downloading file');
    }
});


router.post('/issue', async (req, res) => {
    const { commonName, caId } = req.body;

    try {
        const ca = await CertificateAuthority.findById(caId);
        if (!ca) {
            return res.status(404).send('Certificate Authority not found');
        }

        const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'ca_files' });

        const caKeyFileId = ca.key;
        const caCrtFileId = ca.certificate;

        const caKeyPath = path.join(certDir, `${caId}_ca.key`);
        const caCrtPath = path.join(certDir, `${caId}_ca.crt`);

        console.log(`Downloading CA key to ${caKeyPath}`);
        await downloadFileFromGridFS(bucket, caKeyFileId, fs.createWriteStream(caKeyPath));
        console.log(`Downloading CA certificate to ${caCrtPath}`);
        await downloadFileFromGridFS(bucket, caCrtFileId, fs.createWriteStream(caCrtPath));

        const csrPath = path.join(certDir, `${commonName}.csr`);
        const certPath = path.join(certDir, `${commonName}.crt`);

        const cmdCreateCSR = `openssl req -new -newkey rsa:2048 -nodes -keyout ${path.join(certDir, `${commonName}.key`)} -out ${csrPath} -subj "/C=US/ST=State/L=Locality/O=Organization/CN=${commonName}"`;
        await executeCommand(cmdCreateCSR);

        const cmdSignCSR = `openssl x509 -req -in ${csrPath} -CA ${caCrtPath} -CAkey ${caKeyPath} -CAcreateserial -out ${certPath} -days 365`;
        await executeCommand(cmdSignCSR);
        console.log(`HELLO GUYS WASSUP : ${certPath}`);
        console.log(`Checking existence of file: ${certPath}`);
        if (!fs.existsSync(certPath)) {
            throw new Error(`File not found: ${certPath}`);
        }

        // Upload the issued certificate to GridFS
        const issuedCertFileId = await uploadFileToGridFS(bucket, `${commonName}`, `ca.crt`);

        // Save the issued certificate details to MongoDB
        const certificate = new Certificate({
            commonName,
            certificate: issuedCertFileId,
            issuedBy: caId,
            ca: caId // Add the ca field here
        });

        await certificate.save();
        console.log('Issued certificate saved to database.');

        res.status(200).send('Certificate issued successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error issuing certificate');
    }
});


module.exports = router;