import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Certificates from './components/Certificates';
import Login from './components/Login';
import Register from './components/Register';
import axios from 'axios';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogin = async (formData) => {
    try {
      const response = await axios.post('http://localhost:5000/login', formData);
      console.log(response.data);
      setLoggedIn(true);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRegister = async (formData) => {
    try {
      const response = await axios.post('http://localhost:5000/register', formData);
      console.log(response.data);
      setLoggedIn(true);
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {loggedIn && <Navbar toggleSidebar={toggleSidebar} />}
        <div style={{ display: 'flex', flexGrow: 1, marginTop: loggedIn ? '60px' : 0 }}>
          {loggedIn && <Sidebar open={sidebarOpen} />}
          <div style={{ flexGrow: 1 }}>
            <Routes>
              {loggedIn ? (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/A/1" element={<Certificates />} />
                  {/* Add more routes as needed */}
                </>
              ) : (
                <>
                  <Route path="/" element={<Login handleLogin={handleLogin} />} />
                  <Route path="/register" element={<Register handleRegister={handleRegister} />} />
                  <Route path="/login" element={<Login handleLogin={handleLogin} />} />
                </>
              )}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
