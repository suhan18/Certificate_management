import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IssueCertificateForm = () => {
    const [commonName, setCommonName] = useState('');
    const [cas, setCas] = useState([]);
    const [selectedCa, setSelectedCa] = useState('');

    const fetchCas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/ca/list');
            setCas(response.data);
        } catch (error) {
            console.error('Error fetching CAs', error);
        }
    };

    useEffect(() => {
        fetchCas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/ca/issue', { commonName, caId: selectedCa });
            alert('Certificate issued successfully');
            setCommonName('');
            setSelectedCa('');
            fetchCas(); // Refetch Certificate Authorities after successful creation
        } catch (error) {
            console.error('Error issuing certificate', error);
            alert('Error issuing certificate');
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
            <select value={selectedCa} onChange={(e) => setSelectedCa(e.target.value)} required>
                <option value="" disabled>Select Certificate Authority</option>
                {cas.length === 0 ? (
                    <option value="" disabled>No Certificate Authorities available</option>
                ) : (
                    cas.map(ca => (
                        <option key={ca._id} value={ca._id}>{ca.commonName}</option>
                    ))
                )}
            </select>
            <button type="submit">Issue Certificate</button>
        </form>
    );
};

export default IssueCertificateForm;
