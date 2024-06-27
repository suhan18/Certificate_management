const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    commonName: { type: String, required: true },
    ca: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateAuthority', required: true },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'ca_files.files' },
    key: { type: mongoose.Schema.Types.ObjectId, ref: 'ca_files.files' },
}, { collection: 'certificates' });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
