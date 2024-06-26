// frontend/src/components/CertificateAuthorityForm.js
import React, { useState } from 'react';
import axios from 'axios';

const CertificateAuthorityForm = () => {
    const [commonName, setCommonName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/ca/add', { commonName });
            alert('Certificate Authority created successfully');
            setCommonName(''); // Clear input after successful submission if needed
        } catch (error) {
            console.error('Error creating CA', error);
            alert('Error creating Certificate Authority');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="Common Name"
                required
            />
            <button type="submit">Create Certificate Authority</button>
        </form>
    );
};

export default CertificateAuthorityForm;
