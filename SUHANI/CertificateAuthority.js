const mongoose = require('mongoose');
const CertificateAuthoritySchema = new mongoose.Schema({
    commonName: String,
    certificate: mongoose.Schema.Types.ObjectId,
    key: mongoose.Schema.Types.ObjectId,
    srl: mongoose.Schema.Types.ObjectId,
    publicKey: String,
    // Other fields if any
});

const CertificateAuthority = mongoose.model('CertificateAuthority', CertificateAuthoritySchema);
module.exports = CertificateAuthority;
