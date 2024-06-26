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
        const genKeyCommand = `openssl genrsa -out "${keyFile}" -aes256 -passout pass:${password}`;

        // Command to generate the certificate signing request and self-signed certificate
        const genCertCommand = `openssl req -new -newkey rsa:2048 -nodes -keyout "${keyFile}" \
            -subj "/C=US/ST=Florida/L=Anytown/O=Acme Software Inc./OU=Database CA/CN=${commonName}/emailAddress=dba_ca1@acme.info" \
            -x509 -days 365 -out "${certFile}"`;

        // Update the PATH environment variable
        const opensslDir = 'C:/Program Files/OpenSSL-Win64/bin'; // Change this to your OpenSSL bin directory
        process.env.PATH = `${opensslDir};${process.env.PATH}`;

        // Log the PATH environment variable
        console.log(`PATH: ${process.env.PATH}`);

        console.log(`Executing: ${genKeyCommand}`);
        exec(genKeyCommand, (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (error) {
                console.error(`Error generating private key: ${error}`);
                return callback(error);
            }

            console.log(`Private key generated successfully: ${keyFile}`);

            console.log(`Executing: ${genCertCommand}`);
            exec(genCertCommand, (error, stdout, stderr) => {
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                if (error) {
                    console.error(`Error generating certificate: ${error}`);
                    return callback(error);
                }

                console.log(`Certificate generated successfully: ${certFile}`);

                // Adding a delay before checking for the file's existence
                setTimeout(() => {
                    fs.access(certFile, fs.constants.F_OK, (err) => {
                        if (err) {
                            console.error(`Certificate file not found: ${certFile}`);
                            return callback(new Error(`Certificate file not found: ${certFile}`));
                        }

                        console.log(`Certificate created at: ${certFile}`);
                        callback(null, certFile);
                    });
                }, 1000); // 1 second delay to ensure file system has caught up
            });
        });
    });
};

module.exports = createCertificate;
