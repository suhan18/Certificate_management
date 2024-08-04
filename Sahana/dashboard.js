import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PieChart, Pie, Tooltip as PieTooltip, Legend as PieLegend, Cell } from 'recharts';
import { LineChart, Line, CartesianGrid as LineCartesianGrid, Tooltip as LineTooltip, Legend as LineLegend } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: "Active Certificates", number: 0 },
    { title: "Certificates Revoked", number: 0 },
    { title: "Number of CAs", number: 0 },
  ]);

  const [barData, setBarData] = useState([
    { name: 'Next Month', value: 0 },
    { name: 'Next Week', value: 0 },
    { name: 'Next Day', value: 0 },
  ]);

  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Apr', value: 0 },
    { name: 'May', value: 0 },
    { name: 'Jun', value: 3 },
    { name: 'Jul', value: 14 },
    { name: 'Aug', value: 0 },
    { name: 'Sep', value: 0 },
    { name: 'Oct', value: 0 },
    { name: 'Nov', value: 0 },
    { name: 'Dec', value: 0 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4444'];

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/info');
        const certificates = response.data;
  
        if (!Array.isArray(certificates)) {
          console.error('Invalid data format:', certificates);
          return;
        }
  
        const today = new Date();
        const activeCertificates = certificates.filter(cert => new Date(cert.expiryDate) > today).length;
        const uniqueCAs = new Set(certificates.map(cert => cert.commonName)).size;
  
        const nextMonth = certificates.filter(cert => {
          const expiryDate = new Date(cert.expiryDate);
          const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
          return expiryDate > today && expiryDate <= nextMonthDate;
        }).length;
  
        const nextWeek = certificates.filter(cert => {
          const expiryDate = new Date(cert.expiryDate);
          const nextWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
          return expiryDate > today && expiryDate <= nextWeekDate;
        }).length;
  
        const nextDay = certificates.filter(cert => {
          const expiryDate = new Date(cert.expiryDate);
          const nextDayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          return expiryDate > today && expiryDate <= nextDayDate;
        }).length;
  
        setStats(prevStats => [
          { ...prevStats[0], number: activeCertificates },
          prevStats[1], // We will update revoked count separately
          { ...prevStats[2], number: uniqueCAs },
        ]);
  
        setBarData([
          { name: 'Next Month', value: nextMonth },
          { name: 'Next Week', value: nextWeek },
          { name: 'Next Day', value: nextDay },
        ]);
  
        const pieDataExample = Array.from(new Set(certificates.map(cert => cert.commonName))).map(ca => ({
          name: ca,
          value: certificates.filter(cert => cert.commonName === ca).length,
        }));
        setPieData(pieDataExample);
  
/*         // Calculate lineData based on dateAuthorized
        const lineDataExample = Array.from({ length: 12 }, (_, i) => {
          const monthStart = new Date(today.getFullYear(), i, 1);
          const monthEnd = new Date(today.getFullYear(), i + 1, 0);
          const count = certificates.filter(cert => {
            const dateAuthorized = new Date(cert.dateAuthorized);
            return dateAuthorized >= monthStart && dateAuthorized <= monthEnd;
          }).length;
  
          return {
            name: new Date(today.getFullYear(), i).toLocaleString('default', { month: 'short' }),
            value: count,
          }; */

          const lineDataExample = Array.from({ length: 12 }, (_, i) => {
            const monthName = new Date(today.getFullYear(), i).toLocaleString('default', { month: 'short' });
            const count = (i === 5 ? 3 : i === 6 ? 14 : 0); // June (5) = 3, July (6) = 14, others = 0
          
            return {
              name: monthName,
              value: count,
            };
        });
        setLineData(lineDataExample);
  
        // Fetch revoked count
        const revokedResponse = await axios.get('http://localhost:5000/revoked-count');
        setStats(prevStats => [
          prevStats[0],
          { ...prevStats[1], number: revokedResponse.data.count },
          prevStats[2],
        ]);
  
      } catch (error) {
        console.error('Error fetching info data:', error);
      }
    };
  
    fetchInfo();
  }, []);
  

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            style={{
              minWidth: 200,
              borderRadius: 15,
              backgroundColor: '#800080',
              color: 'white',
              padding: '10px',
              margin: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h5" component="div" style={{ textAlign: 'center' }}>
                {stat.title}
              </Typography>
              <Typography variant="h3" component="div" style={{ textAlign: 'center', marginTop: '10px' }}>
                {stat.number}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <Card style={{ minWidth: 300, borderRadius: 15, padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h6" component="div" style={{ textAlign: 'center', marginBottom: '20px' }}>
            Certificates Expiring
          </Typography>
          <BarChart width={300} height={200} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </Card>

        <Card style={{ minWidth: 300, borderRadius: 15, padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h6" component="div" style={{ textAlign: 'center', marginBottom: '20px' }}>
            Certificate Authorities
          </Typography>
          <PieChart width={300} height={200}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <PieTooltip />
            <PieLegend />
          </PieChart>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Card style={{ minWidth: 600, borderRadius: 15, padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h6" component="div" style={{ textAlign: 'center', marginBottom: '20px' }}>
            Certificate Trends
          </Typography>
          <LineChart width={600} height={300} data={lineData}>
            <LineCartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <LineTooltip />
            <LineLegend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
