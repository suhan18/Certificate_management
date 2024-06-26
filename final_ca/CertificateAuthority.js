/* //backend/models/CertificateAuthority.js
const mongoose = require('mongoose');

const certificateAuthoritySchema = new mongoose.Schema({
    commonName: { type: String, required: true }
    // Add more fields as needed
}, { collection: 'certificateauthorities' }); // Specify collection name

module.exports = mongoose.model('CertificateAuthority', certificateAuthoritySchema); */
/* const mongoose = require('mongoose');

const caSchema = new mongoose.Schema({
    commonName: { type: String, required: true },
    // Other CA fields
});

const CertificateAuthority = mongoose.model('CertificateAuthority', caSchema);

module.exports = CertificateAuthority; */
// models/CertificateAuthority.js
const mongoose = require('mongoose');

const caSchema = new mongoose.Schema({
    commonName: { type: String, required: true },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },  // Store ObjectId of .crt file in GridFS
    key: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },  // Store ObjectId of .key file in GridFS
    srl: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },  // Store ObjectId of .srl file in GridFS
    // Other CA fields
});

const CertificateAuthority = mongoose.model('CertificateAuthority', caSchema);

module.exports = CertificateAuthority;
