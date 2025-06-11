// components/navbar/Navbar.tsx
import React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
  navItems: { name: string; path: string }[];
}

const Navbar: React.FC<NavBarProps> = ({ brandName, imageSrcPath, navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Hide navbar on login/register pages
  const hideOnPaths = ['/login', '/register'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar className="navbar-toolbar"sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <img 
              src={imageSrcPath} 
              alt={brandName} 
              style={{ height: 40, marginRight: 12, cursor: 'pointer' }} 
              onClick={() => navigate('/login')}
            />
            <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white' }}>
              {brandName}
            </Typography>
          </Box>

          {/* Desktop nav */}
          {!isAuthPage && (
            <>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    sx={{ ml: 2 }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>

              <IconButton
                color="inherit"
                edge="end"
                onClick={toggleDrawer(true)}
                sx={{ display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer only if not on auth pages */}
      {!isAuthPage && (
        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
          >
            <List>
              {navItems.map((item) => (
                <ListItem button key={item.name} component={Link} to={item.path}>
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

    </>
  );
};

export default Navbar;
