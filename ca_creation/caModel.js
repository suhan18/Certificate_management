// backend/models/caModel.js
const mongoose = require('mongoose');

const caSchema = new mongoose.Schema({
    commonName: { type: String, required: true },
    // Other CA fields
});

const CertificateAuthority = mongoose.model('CertificateAuthority', caSchema);

module.exports = CertificateAuthority;
