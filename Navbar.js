import React from 'react';
import { IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav style={{ 
      height: '60px', 
      backgroundColor: '#701f70', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
        <MenuIcon />
      </IconButton>
      <h1 style={{ marginLeft: '20px' }}>Admin Dashboard</h1>
    </nav>
  );
};

export default Navbar;
