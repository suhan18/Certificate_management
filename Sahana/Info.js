import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Info.css';  // Import a CSS file for styling if needed

const Info = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/info');
        setCertificates(response.data);
      } catch (error) {
        if (error.response) {
          console.error('Request made but server responded with status:', error.response.status);
        } else if (error.request) {
          console.error('Request made but no response received:', error.request);
        } else {
          console.error('Error setting up the request:', error.message);
        }
      }
    };

    fetchCertificates();
  }, []);

  const calculateExpiryDate = (dateAuthorized, subscriptionDays) => {
    if (!dateAuthorized) {
      return 'Unknown';
    }

    const authDate = new Date(dateAuthorized);

    if (isNaN(authDate)) {
      return 'Invalid Date';
    }

    authDate.setDate(authDate.getDate() + subscriptionDays);
    return authDate.toLocaleDateString();
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Unknown';
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj)) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) {
      return 'Unknown';
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj)) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleTimeString();
  };

  return (
    <div className="info-container">
      <h1>Certificates Information</h1>
      <table className="info-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Issued By</th>
            <th>Organization</th>
            <th>Country</th>
            <th>Subscription Days</th>
            <th>Date Authorized</th>
            <th>Time Authorized</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.id}>
              <td>{cert.username}</td>
              <td>{cert.commonName}</td>
              <td>Cinezo</td>
              <td>{cert.country}</td>
              <td>{cert.subscriptionDays}</td>
              <td>{formatDate(cert.dateAuthorized)}</td>
              <td>{formatTime(cert.dateAuthorized)}</td>
              <td>{calculateExpiryDate(cert.dateAuthorized, cert.subscriptionDays)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Info;
