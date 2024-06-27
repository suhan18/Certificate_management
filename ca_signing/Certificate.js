const mongoose = require('mongoose');
const { Schema } = mongoose;

const CertificateSchema = new Schema({
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
    }
});

const Certificate = mongoose.model('Certificate', CertificateSchema);

module.exports = Certificate;
