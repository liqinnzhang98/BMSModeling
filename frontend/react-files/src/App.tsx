import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ControllerDetail from './pages/ControllerDetail';
import GenerateExcel from './pages/GenerateExcel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NavBar from "./components/navbar/Navbar";
import imagePath from "./assets/logo.svg";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:  '#f0f2f1',
    },
    secondary: {
      main: '#010a06',
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const navItems = [
  { name: 'Projects', path: '/projects' },
  { name: 'Service', path: '/service' }, // Adjust as needed
];

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          {/* NavBar appears for all routes */}
          <NavBar brandName="" imageSrcPath={imagePath} navItems={navItems} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <PrivateRoute>
                  <ProjectDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:projectId/controllers/:controllerId"
              element={
                <PrivateRoute>
                  <ControllerDetail />
                </PrivateRoute>
              }
            />
            <Route path="/project/:projectId/generate-excel" element={<GenerateExcel />} />
            <Route path="/" element={<Navigate to="/projects" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
