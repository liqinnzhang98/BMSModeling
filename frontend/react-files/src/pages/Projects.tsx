import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import styles from './styles/Projects.module.css';

interface Project {
  id: string;
  name: string;
  jobNumber: string;
  dateCreated: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    jobNumber: '',
    date: '',
    revision: '',
    dateCreated: new Date().toISOString()
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');      
      const response = await axios.get(`${apiBaseUrl}/project`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const projectData = {
        ...newProject,
        dateCreated: new Date().toISOString(),
        date: newProject.date ? new Date(newProject.date).toISOString() : null
      };
      
      const response = await axios.post(`${apiBaseUrl}/project`, projectData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update projects list with the new project from response
      setProjects(prevProjects => [...prevProjects, response.data.data]);
      setOpen(false);
      setNewProject({ name: '', jobNumber: '', date: '', revision: '', dateCreated: new Date().toISOString() });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiBaseUrl}/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update projects list by removing the deleted project
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.headerContainer}>
        <Box className={styles.header}>
          <Typography variant="h4" component="h1">
            Projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            New Project
          </Button>
        </Box>
      </Box>

      <Box className={styles.projectCardContainer}>
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card className={styles.card}>
                <CardContent className={styles.cardContent}>
                  <Typography variant="h6" component="h2">
                    {project.name}
                  </Typography>
                  <Typography color="textSecondary">
                    Job Number: {project.jobNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Created: {new Date(project.dateCreated).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions className={styles.cardActions}>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View Details
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Revision"
            fullWidth
            value={newProject.revision}
            onChange={(e) => setNewProject({ ...newProject, revision: e.target.value })}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={newProject.date ? new Date(newProject.date) : null}
              onChange={(newValue: Date | null) => {
                setNewProject({ ...newProject, date: newValue ? newValue.toISOString() : '' });
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "dense"
                }
              }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            label="Job Number"
            fullWidth
            value={newProject.jobNumber}
            onChange={(e) => setNewProject({ ...newProject, jobNumber: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button color='secondary' onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects; 