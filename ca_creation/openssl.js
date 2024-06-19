const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const createCertificate = (commonName, callback) => {
    // Specify the directory where files will be saved
    const outputDirectory = 'C:/Users/SUHANI/certificates';

    // Check if the directory exists and has write permission
    fs.access(outputDirectory, fs.constants.F_OK | fs.constants.W_OK, (err) => {
        if (err) {
            console.error(`Error accessing directory: ${outputDirectory}`);
            console.error(`Directory does not exist or write permission is denied.`);
            return callback(err);
        }

        console.log(`Directory exists and has write permission: ${outputDirectory}`);

        console.log(`Current working directory: ${process.cwd()}`);
        const keyFile = path.join(outputDirectory, `${commonName}.key.pem`);
        const certFile = path.join(outputDirectory, `${commonName}.cert.pem`);
        const password = `${commonName}passwd`;

        // Command to generate the private key
        const genKeyCommand = `openssl genrsa -out ${keyFile} -aes256 -passout pass:${password}`;

        // Command to generate the certificate signing request and self-signed certificate
        const genCertCommand = `openssl req -new -newkey rsa:2048 -nodes -keyout ${keyFile} \
            -subj "/C=US/ST=Florida/L=Anytown/O=Acme Software Inc./OU=Database CA/CN=Database CA Root1/emailAddress=dba_ca1@acme.info" \
            -x509 -days 365 -out ${certFile}`;

        // Execute the private key generation command
        exec(genKeyCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error generating private key: ${error}`);
                return callback(error);
            }

            console.log(`Private key generated successfully: ${keyFile}`);

            // Execute the certificate generation command
            exec(genCertCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error generating certificate: ${error}`);
                    return callback(error);
                }

                console.log(`Certificate generated successfully: ${certFile}`);
                callback(null, certFile);
            });
        });
    });
};

module.exports = createCertificate;
