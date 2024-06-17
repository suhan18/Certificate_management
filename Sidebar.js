import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Collapse, ListItemIcon, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore, Home, Info, Settings, Dashboard, BarChart, Menu as MenuIcon } from '@mui/icons-material';

const Sidebar = ({ open }) => {
  const [menuOpen, setMenuOpen] = useState({ A: false, B: false, C: false, D: false, E: false });

  const handleClick = (name) => {
    setMenuOpen({ ...menuOpen, [name]: !menuOpen[name] });
  };

  const menuItems = [
    { name: 'A', icon: <Home /> },
    { name: 'B', icon: <Info /> },
    { name: 'C', icon: <Settings /> },
    { name: 'D', icon: <Dashboard /> },
    { name: 'E', icon: <BarChart /> },
  ];

  return (
    <Drawer
      variant="persistent"
      open={open}
      style={{
        width: open ? 240 : 0,
        transition: 'width 0.3s',
        zIndex: 1000,
      }}
      PaperProps={{
        style: {
          position: 'fixed',
          backgroundColor: '#e3afed',
          top: 60,
          left: 0,
          width: 240,
          height: 'calc(100% - 60px)',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <div key={item.name}>
            <ListItem button onClick={() => handleClick(item.name)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
              {menuOpen[item.name] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={menuOpen[item.name]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[1, 2, 3].map((subItem) => (
                  <ListItem button key={subItem} component={Link} to={`/${item.name}/${subItem}`}>
                    <ListItemText primary={subItem} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
