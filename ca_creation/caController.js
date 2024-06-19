// backend/controllers/caController.js
const CertificateAuthority = require('../models/caModel');
const createCertificate = require('../openssl');

const addCertificateAuthority = async (req, res) => {
    try {
        const { commonName } = req.body;

        console.log('Received request to create CA with commonName:', commonName);

        // Create the certificate
        createCertificate(commonName, async (error, certificatePath) => {
            if (error) {
                console.error('Certificate creation error:', error);
                return res.status(500).send({ error: 'Error generating certificate' });
            }

            console.log('Certificate created at:', certificatePath);

            // Save the CA information to the database
            const ca = new CertificateAuthority({ commonName });
            await ca.save();
            res.status(201).send({ message: 'Certificate Authority created successfully', certificatePath });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const getCertificateAuthorities = async (req, res) => {
    try {
        const cas = await CertificateAuthority.find();
        res.status(200).send(cas);
    } catch (error) {
        console.error('Error fetching Certificate Authorities:', error);
        res.status(500).send(error);
    }
};

module.exports = {
    addCertificateAuthority,
    getCertificateAuthorities,
};
