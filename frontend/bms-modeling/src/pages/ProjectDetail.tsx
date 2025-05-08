import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Controller {
  id: string;
  name: string;
  inputs: Input[];
  outputs: Output[];
}

interface Input {
  id: string;
  name: string;
  type: string;
}

interface Output {
  id: string;
  name: string;
  type: string;
}

interface Project {
  id: string;
  name: string;
  jobNumber: string;
  controllers: Controller[];
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newController, setNewController] = useState({ name: '' });
  const [editedProject, setEditedProject] = useState({ name: '', jobNumber: '' });

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
      setEditedProject({
        name: response.data.name,
        jobNumber: response.data.jobNumber,
      });
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const handleCreateController = async () => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/controllers`, newController);
      if (project) {
        setProject({
          ...project,
          controllers: [...project.controllers, response.data],
        });
      }
      setOpen(false);
      setNewController({ name: '' });
    } catch (error) {
      console.error('Error creating controller:', error);
    }
  };

  const handleUpdateProject = async () => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, editedProject);
      setProject(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteController = async (controllerId: string) => {
    try {
      await axios.delete(`/api/projects/${projectId}/controllers/${controllerId}`);
      if (project) {
        setProject({
          ...project,
          controllers: project.controllers.filter((c) => c.id !== controllerId),
        });
      }
    } catch (error) {
      console.error('Error deleting controller:', error);
    }
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          {editMode ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Project Name"
                value={editedProject.name}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              />
              <TextField
                label="Job Number"
                value={editedProject.jobNumber}
                onChange={(e) => setEditedProject({ ...editedProject, jobNumber: e.target.value })}
              />
              <Button variant="contained" onClick={handleUpdateProject}>
                Save
              </Button>
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" component="h1">
                {project.name}
              </Typography>
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Controller
        </Button>
      </Box>

      <Grid container spacing={3}>
        {project.controllers.map((controller) => (
          <Grid item xs={12} sm={6} md={4} key={controller.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {controller.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Inputs: {controller.inputs.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Outputs: {controller.outputs.length}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/projects/${projectId}/controllers/${controller.id}`)}
                >
                  View Details
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteController(controller.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Controller</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Controller Name"
            fullWidth
            value={newController.name}
            onChange={(e) => setNewController({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateController} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail; 