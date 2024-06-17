import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const SecurityChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/api/certificates/security')
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching security data:', error));
  }, []);

  return (
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="security" fill="#8884d8" />
    </BarChart>
  );
};

export default SecurityChart;
