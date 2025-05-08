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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import styles from '../styles/ControllerDetail.module.css';

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

interface Controller {
  id: string;
  name: string;
  inputs: Input[];
  outputs: Output[];
}

const ControllerDetail = () => {
  const { projectId, controllerId } = useParams<{ projectId: string; controllerId: string }>();
  const navigate = useNavigate();
  const [controller, setController] = useState<Controller | null>(null);
  const [openInput, setOpenInput] = useState(false);
  const [openOutput, setOpenOutput] = useState(false);
  const [newInput, setNewInput] = useState({ name: '', type: '' });
  const [newOutput, setNewOutput] = useState({ name: '', type: '' });
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (controllerId) {
      fetchController();
    }
  }, [controllerId]);

  const fetchController = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/controllers/${controllerId}`);
      setController(response.data);
      setEditedName(response.data.name);
    } catch (error) {
      console.error('Error fetching controller:', error);
    }
  };

  const handleCreateInput = async () => {
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/controllers/${controllerId}/inputs`,
        newInput
      );
      if (controller) {
        setController({
          ...controller,
          inputs: [...controller.inputs, response.data],
        });
      }
      setOpenInput(false);
      setNewInput({ name: '', type: '' });
    } catch (error) {
      console.error('Error creating input:', error);
    }
  };

  const handleCreateOutput = async () => {
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/controllers/${controllerId}/outputs`,
        newOutput
      );
      if (controller) {
        setController({
          ...controller,
          outputs: [...controller.outputs, response.data],
        });
      }
      setOpenOutput(false);
      setNewOutput({ name: '', type: '' });
    } catch (error) {
      console.error('Error creating output:', error);
    }
  };

  const handleUpdateController = async () => {
    try {
      const response = await axios.put(`/api/projects/${projectId}/controllers/${controllerId}`, {
        name: editedName,
      });
      setController(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating controller:', error);
    }
  };

  const handleDeleteInput = async (inputId: string) => {
    try {
      await axios.delete(
        `/api/projects/${projectId}/controllers/${controllerId}/inputs/${inputId}`
      );
      if (controller) {
        setController({
          ...controller,
          inputs: controller.inputs.filter((input) => input.id !== inputId),
        });
      }
    } catch (error) {
      console.error('Error deleting input:', error);
    }
  };

  const handleDeleteOutput = async (outputId: string) => {
    try {
      await axios.delete(
        `/api/projects/${projectId}/controllers/${controllerId}/outputs/${outputId}`
      );
      if (controller) {
        setController({
          ...controller,
          outputs: controller.outputs.filter((output) => output.id !== outputId),
        });
      }
    } catch (error) {
      console.error('Error deleting output:', error);
    }
  };

  if (!controller) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box className={styles.header}>
        <Box>
          {editMode ? (
            <Box className={styles.editForm}>
              <TextField
                label="Controller Name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
              <Button variant="contained" onClick={handleUpdateController}>
                Save
              </Button>
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
            </Box>
          ) : (
            <Box className={styles.titleContainer}>
              <Typography variant="h4" component="h1">
                {controller.name}
              </Typography>
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className={styles.card}>
            <CardContent>
              <Box className={styles.cardHeader}>
                <Typography variant="h6">Inputs</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setOpenInput(true)}
                >
                  Add Input
                </Button>
              </Box>
              <List className={styles.list}>
                {controller.inputs.map((input) => (
                  <ListItem key={input.id} className={styles.listItem}>
                    <ListItemText
                      primary={input.name}
                      secondary={`Type: ${input.type}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteInput(input.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={styles.card}>
            <CardContent>
              <Box className={styles.cardHeader}>
                <Typography variant="h6">Outputs</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setOpenOutput(true)}
                >
                  Add Output
                </Button>
              </Box>
              <List className={styles.list}>
                {controller.outputs.map((output) => (
                  <ListItem key={output.id} className={styles.listItem}>
                    <ListItemText
                      primary={output.name}
                      secondary={`Type: ${output.type}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteOutput(output.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openInput} onClose={() => setOpenInput(false)}>
        <DialogTitle>Add New Input</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Input Name"
            fullWidth
            value={newInput.name}
            onChange={(e) => setNewInput({ ...newInput, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={newInput.type}
              label="Type"
              onChange={(e) => setNewInput({ ...newInput, type: e.target.value })}
            >
              <MenuItem value="analog">Analog</MenuItem>
              <MenuItem value="digital">Digital</MenuItem>
              <MenuItem value="temperature">Temperature</MenuItem>
              <MenuItem value="pressure">Pressure</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInput(false)}>Cancel</Button>
          <Button onClick={handleCreateInput} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOutput} onClose={() => setOpenOutput(false)}>
        <DialogTitle>Add New Output</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Output Name"
            fullWidth
            value={newOutput.name}
            onChange={(e) => setNewOutput({ ...newOutput, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={newOutput.type}
              label="Type"
              onChange={(e) => setNewOutput({ ...newOutput, type: e.target.value })}
            >
              <MenuItem value="analog">Analog</MenuItem>
              <MenuItem value="digital">Digital</MenuItem>
              <MenuItem value="temperature">Temperature</MenuItem>
              <MenuItem value="pressure">Pressure</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOutput(false)}>Cancel</Button>
          <Button onClick={handleCreateOutput} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ControllerDetail; 