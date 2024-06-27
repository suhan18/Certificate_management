import React from 'react';
import CertificateAuthorityForm from './components/CertificateAuthorityForm';
import IssueCertificateForm from './components/IssueCertificateForm';

const App = () => {
    return (
        <div>
            <h1>Certificate Manager</h1>
            <h2>Create Certificate Authority</h2>
            <CertificateAuthorityForm />
            <h2>Issue User Certificate</h2>
            <IssueCertificateForm />
        </div>
    );
};

export default App;
