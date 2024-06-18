// backend/openssl.js
const { exec } = require('child_process');

const createCertificate = (commonName, callback) => {
    const keyFile = `${commonName}.key.pem`;
    const certFile = `${commonName}.cert.pem`;
    const password = `${commonName}passwd`;

    // Simplify the command for cross-platform compatibility
    const command = `openssl genrsa -out ${keyFile} -aes256 -passout pass:${password} && \
        openssl req -new -x509 -key ${keyFile} -passin pass:${password} \
        -subj "/C=US/ST=Florida/L=Anytown/O=Acme Software Inc./OU=Database CA/CN=Database CA Root1/emailAddress=dba_ca1@acme.info" \
        -days 365 -out ${certFile}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error generating certificate: ${error}`);
            return callback(`Error generating certificate: ${error}`);
        }
        if (stderr) {
            console.error(`Error output from command: ${stderr}`);
            return callback(`Error output from command: ${stderr}`);
        }
        console.log(`Certificate generated successfully: ${certFile}`);
        callback(null, certFile);
    });
};

module.exports = createCertificate;
