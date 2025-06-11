import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import styles from './styles/ControllerDetail.module.css';

interface ControllerInput {
  id: number;
  inputType: string;
  cableType: string | null;
  controlTerminalsln: string;
  controlTerminalsCm: string;
  controllerPointDescription: string | null;
  ddcFieldDevice: string;
  fieldDeviceInputOutputType: string;
  specialNotesComments: string | null;
}

interface ControllerOutput {
  id: number;
  outputType: string;
  cableType: string | null;
  controlTerminalsln: string;
  controlTerminalsCm: string;
  controllerPointDescription: string | null;
  ddcFieldDevice: string;
  fieldDeviceInputOutputType: string;
  specialNotesComments: string | null;
}

interface Controller {
  id: number;
  name: string;
  modelNumber: string;
  configuration: string;
  inputList: ControllerInput[];
  outputList: ControllerOutput[];
  inputOrder: number[];
  outputOrder: number[];
  useAsTemplate?: boolean;
  parentControllerId: number | null;
  templateName?: string;
}

const ControllerDetail = () => {
  const { projectId, controllerId } = useParams<{ projectId: string; controllerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialController = location.state?.controller as Controller;
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  
  const [controller, setController] = useState<Controller>(initialController);
  const [openInput, setOpenInput] = useState(false);
  const [openOutput, setOpenOutput] = useState(false);
  const [editingInput, setEditingInput] = useState<ControllerInput | null>(null);
  const [editingOutput, setEditingOutput] = useState<ControllerOutput | null>(null);
  const [newInput, setNewInput] = useState({
    inputType: 'UNIVERSAL',
    cableType: 'ONE_PAIR',
    ddcFieldDevice: '',
    fieldDeviceInputOutputType: '',
    controlTerminalsln: '',
    controlTerminalsCm: '',
    controllerPointDescription: '',
    specialNotesComments: ''
  });
  const [newOutput, setNewOutput] = useState({
    outputType: 'ANALOG',
    cableType: 'ONE_PAIR',
    ddcFieldDevice: '',
    fieldDeviceInputOutputType: '',
    controlTerminalsln: '',
    controlTerminalsCm: '',
    controllerPointDescription: '',
    specialNotesComments: ''
  });

  const [inputList, setInputList] = useState<ControllerInput[]>([]);
  const [outputList, setOutputList] = useState<ControllerOutput[]>([]);
  const [isTemplate, setIsTemplate] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [openEditController, setOpenEditController] = useState(false);
  const [openChildController, setOpenChildController] = useState(false);
  const [editedController, setEditedController] = useState({
    name: '',
    modelNumber: '',
    configuration: ''
  });
  const [newChildController, setNewChildController] = useState({
    name: '',
    modelNumber: '',
    configuration: '',
    parentControllerId: null as number | null,
    inputList: [],
    outputList: []
  });

  useEffect(() => {
    if (controller && !inputList.length && !outputList.length) {
      const { inputList, outputList, inputOrder, outputOrder } = controller;

      // Sort outputs by outputOrder
      const sortedOutputs = outputOrder
        .map(id => outputList.find(output => output.id === id))
        .filter((output): output is ControllerOutput => output !== undefined);
      setOutputList(sortedOutputs);

      // Sort inputs by inputOrder
      const sortedInputs = inputOrder
        .map(id => inputList.find(input => input.id === id))
        .filter((input): input is ControllerInput => input !== undefined);

      setInputList(sortedInputs);
    }
  }, [controller, inputList.length, outputList.length]);
  
  useEffect(() => {
    if (controller) {
      setIsTemplate(controller.useAsTemplate || false);
    }
  }, [controller]);

  if (!controller) {
    return <Typography>Controller not found</Typography>;
  }

  const handleInputDragEnd = (result: DropResult) => {
    if (!result.destination) return;
  
    const reordered = Array.from(inputList);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
  
    setInputList(reordered);
    handleUpdateInputOrder(reordered);
  };

  const handleOutputDragEnd = (result: DropResult) => {
    if (!result.destination) return;
  
    const reordered = Array.from(outputList);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
  
    setOutputList(reordered);
    handleUpdateOutputOrder(reordered);
  };

  const handleUpdateInputOrder = async (reordered: ControllerInput[]) => {
    try {
      const token = localStorage.getItem('token');
      const orderedIds = reordered.map(input => input.id);
      await axios.put(
        `${apiBaseUrl}/controller/rearrangeOrder/${controller.id}/inputs`,
        { ids: orderedIds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error updating input order:', error);
    }
  };

  const handleUpdateOutputOrder = async (reordered: ControllerOutput[]) => {
    try {
      const token = localStorage.getItem('token');
      const orderedIds = reordered.map(output => output.id);
      await axios.put(
        `${apiBaseUrl}/controller/rearrangeOrder/${controller.id}/outputs`,
        { ids: orderedIds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error updating output order:', error);
    }
  };

  const handleDeleteInput = async (inputId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${apiBaseUrl}/controller/deleteInput/${controllerId}/${inputId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update both local state and controller state
      const updatedInputList = inputList.filter(input => input.id !== inputId);
      setInputList(updatedInputList);
      setController(prev => ({
        ...prev,
        inputList: updatedInputList,
        inputOrder: prev.inputOrder.filter(id => id !== inputId)
      }));
    } catch (error) {
      console.error('Error deleting input:', error);
    }
  };

  const handleDeleteOutput = async (outputId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${apiBaseUrl}/controller/deleteOutput/${controllerId}/${outputId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update both local state and controller state
      const updatedOutputList = outputList.filter(output => output.id !== outputId);
      setOutputList(updatedOutputList);
      setController(prev => ({
        ...prev,
        outputList: updatedOutputList,
        outputOrder: prev.outputOrder.filter(id => id !== outputId)
      }));
    } catch (error) {
      console.error('Error deleting output:', error);
    }
  };

  const handleCreateInput = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiBaseUrl}/controller/createInput/${controllerId}`,
        newInput,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update both local state and controller state
      const updatedInputList = [...inputList, response.data.data];
      setInputList(updatedInputList);
      setController(prev => ({
        ...prev,
        inputList: updatedInputList,
        inputOrder: [...prev.inputOrder, response.data.data.id]
      }));
      
      setOpenInput(false);
      setNewInput({
        inputType: 'UNIVERSAL',
        cableType: 'ONE_PAIR',
        ddcFieldDevice: '',
        fieldDeviceInputOutputType: '',
        controlTerminalsln: '',
        controlTerminalsCm: '',
        controllerPointDescription: '',
        specialNotesComments: ''
      });
    } catch (error) {
      console.error('Error creating input:', error);
    }
  };

  const handleCreateOutput = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiBaseUrl}/controller/createOutput/${controllerId}`,
        newOutput,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update both local state and controller state
      const updatedOutputList = [...outputList, response.data.data];
      setOutputList(updatedOutputList);
      setController(prev => ({
        ...prev,
        outputList: updatedOutputList,
        outputOrder: [...prev.outputOrder, response.data.data.id]
      }));
      
      setOpenOutput(false);
      setNewOutput({
        outputType: 'ANALOG',
        cableType: 'ONE_PAIR',
        ddcFieldDevice: '',
        fieldDeviceInputOutputType: '',
        controlTerminalsln: '',
        controlTerminalsCm: '',
        controllerPointDescription: '',
        specialNotesComments: ''
      });
    } catch (error) {
      console.error('Error creating output:', error);
    }
  };

  const handleUpdateInput = async () => {
    if (!editingInput) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiBaseUrl}/controller/updateInput/${controllerId}/${editingInput.id}`,
        editingInput,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update both local state and controller state
      const updatedInputList = inputList.map(input => 
        input.id === editingInput.id ? response.data.data : input
      );
      setInputList(updatedInputList);
      setController(prev => ({
        ...prev,
        inputList: updatedInputList
      }));
      setEditingInput(null);
    } catch (error) {
      console.error('Error updating input:', error);
    }
  };

  const handleUpdateOutput = async () => {
    if (!editingOutput) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiBaseUrl}/controller/updateOutput/${controllerId}/${editingOutput.id}`,
        editingOutput,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update both local state and controller state
      const updatedOutputList = outputList.map(output => 
        output.id === editingOutput.id ? response.data.data : output
      );
      setOutputList(updatedOutputList);
      setController(prev => ({
        ...prev,
        outputList: updatedOutputList
      }));
      setEditingOutput(null);
    } catch (error) {
      console.error('Error updating output:', error);
    }
  };

  const handleTemplateToggle = () => {
    if (!isTemplate) {
      // If turning into template, open dialog with existing template name if any
      setOpenTemplateDialog(true);
      setTemplateName(controller.templateName || '');
    } else {
      // If removing template status, keep the template name for future use
      handleSaveTemplate(false, controller.templateName || '');
    }
  };

  const handleSaveTemplate = async (isTemplateStatus: boolean, name: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${apiBaseUrl}/controller/useAsTemplate/${controllerId}`,
        { 
          useAsTemplate: isTemplateStatus,
          templateName: name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setIsTemplate(isTemplateStatus);
      setController(prev => ({
        ...prev,
        useAsTemplate: isTemplateStatus,
        templateName: name
      }));
      setOpenTemplateDialog(false);
      setTemplateName('');
    } catch (error) {
      console.error('Error updating template status:', error);
    }
  };

  const handleUpdateController = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiBaseUrl}/controller/updateController/${controllerId}`,
        editedController,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setController(response.data.data);
      setOpenEditController(false);
    } catch (error) {
      console.error('Error updating controller:', error);
    }
  };

  const handleCreateChildController = async () => {
    try {
      const token = localStorage.getItem('token');
      const childControllerWithDate = {
        ...newChildController,
        parentControllerId: controller.id,
        dateCreated: new Date().toISOString(),
        templateCreatedFrom: "origin",
        isCreatedFromTemplate: false,
        inputList: [],
        outputList: [],
        inputOrder: [],
        outputOrder: []
      };
      
      const response = await axios.post(
        `${apiBaseUrl}/controller/createController/${projectId}`,
        childControllerWithDate,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setOpenChildController(false);
      setNewChildController({
        name: '',
        modelNumber: '',
        configuration: '',
        parentControllerId: null,
        inputList: [],
        outputList: []
      });
      
      // Navigate to the project page to see the updated controller list
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error creating child controller:', error);
      // Add error handling to show the error to the user
      alert('Failed to create child controller. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.headerContainer}>
        <Box className={styles.header}>
          <Button
            startIcon={<ArrowBackIcon />}
            color="secondary"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Back to Project
          </Button>
          <Box className={styles.headerControls}>
            <Box className={styles.toggleContainer}>
              <Typography variant="body2" color="textSecondary">
                USE AS TEMPLATE
              </Typography>
              <Switch
                checked={controller.useAsTemplate}
                onChange={handleTemplateToggle}
                color="success"
              />
            </Box>
            {controller.parentControllerId === null && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setOpenChildController(true);
                  setNewChildController({
                    name: '',
                    modelNumber: '',
                    configuration: '',
                    parentControllerId: controller.id,
                    inputList: [],
                    outputList: []
                  });
                }}
              >
                Create Child Controller
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Box className={styles.contentContainer}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Controller Information Card */}
          <Card>
            <CardHeader 
              title="Controller Information"
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => {
                    setEditedController({
                      name: controller.name,
                      modelNumber: controller.modelNumber,
                      configuration: controller.configuration
                    });
                    setOpenEditController(true);
                  }}>
                    <EditIcon />
                  </IconButton>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                <strong>Controller Name:</strong> {controller.name}
              </Typography>
              <Typography variant="body1">
                <strong>Model Number:</strong> {controller.modelNumber}
              </Typography>
              <Typography variant="body1">
                <strong>Configuration:</strong> {controller.configuration}
              </Typography>
            </CardContent>
          </Card>

          {/* Inputs Card */}
          <Card>
            <CardHeader 
              title="Inputs"
              action={
                <IconButton onClick={() => setOpenInput(true)}>
                  <AddIcon />
                </IconButton>
              }
            />
            <Divider />
            <DragDropContext onDragEnd={handleInputDragEnd}>
              <Droppable droppableId="inputList">
                {(provided) => (
                  <List ref={provided.innerRef} {...provided.droppableProps}>
                    {inputList.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '2rem',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                          No Inputs in this Controller
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Add inputs to get started
                        </Typography>
                      </Box>
                    ) : (
                      inputList.map((input, index) => (
                        <Draggable key={input.id.toString()} draggableId={input.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <ListItem
                                {...provided.dragHandleProps}
                                className={`${styles.listItem} ${snapshot.isDragging ? styles.listItemDragging : ''}`}
                              >
                                <div className={styles.listItemContent}>
                                  <div className={styles.listItemInfo}>
                                    <ListItemText
                                      primary={input.controllerPointDescription}
                                      secondary={
                                        <>
                                          <Typography variant="body2" color="textPrimary">Type: {input.inputType}</Typography>
                                          <Typography variant="body2" color="textPrimary">DDC Field Device: {input.ddcFieldDevice}</Typography>
                                          <Typography variant="body2" color="textPrimary">Field Device I/O Type: {input.fieldDeviceInputOutputType}</Typography>
                                          <Typography variant="body2" color="textPrimary">Cable Type: {input.cableType}</Typography>
                                        </>
                                      }
                                    />
                                  </div>
                                  {!snapshot.isDragging && (
                                    <div className={styles.listItemActions}>
                                      <IconButton edge="end" onClick={() => setEditingInput(input)}>
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        edge="end"
                                        onClick={() => handleDeleteInput(input.id)}
                                        className={styles.deleteButton}
                                        size="small"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </div>
                                  )}
                                </div>
                              </ListItem>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Card>

          {/* Outputs Card */}
          <Card>
            <CardHeader 
              title="Outputs"
              action={
                <IconButton onClick={() => setOpenOutput(true)}>
                  <AddIcon />
                </IconButton>
              }
            />
            <Divider />
            <DragDropContext onDragEnd={handleOutputDragEnd}>
              <Droppable droppableId="outputList">
                {(provided) => (
                  <List ref={provided.innerRef} {...provided.droppableProps}>
                    {outputList.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '2rem',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                          No Outputs in this Controller
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Add outputs to get started
                        </Typography>
                      </Box>
                    ) : (
                      (outputList || []).map((output, index) => (
                        <Draggable key={output.id.toString()} draggableId={output.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <ListItem
                                {...provided.dragHandleProps}
                                className={`${styles.listItem} ${snapshot.isDragging ? styles.listItemDragging : ''}`}
                              >
                                <div className={styles.listItemContent}>
                                  <div className={styles.listItemInfo}>
                                    <ListItemText
                                      primary={output.controllerPointDescription}
                                      secondary={
                                        <>
                                          <Typography variant="body2" color="textPrimary">Type: {output.outputType}</Typography>
                                          <Typography variant="body2" color="textPrimary">DDC Field Device: {output.ddcFieldDevice}</Typography>
                                          <Typography variant="body2" color="textPrimary">Field Device I/O Type: {output.fieldDeviceInputOutputType}</Typography>
                                          <Typography variant="body2" color="textPrimary">Cable Type: {output.cableType}</Typography>
                                        </>
                                      }
                                    />
                                  </div>
                                  {!snapshot.isDragging && (
                                    <div className={styles.listItemActions}>
                                      <IconButton edge="end" onClick={() => setEditingOutput(output)}>
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        edge="end"
                                        onClick={() => handleDeleteOutput(output.id)}
                                        className={styles.deleteButton}
                                        size="small"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </div>
                                  )}
                                </div>
                              </ListItem>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </Box>
      </Box>

      {/* Input Dialog */}
      <Dialog open={openInput} onClose={() => setOpenInput(false)}>
        <DialogTitle>Add New Input</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Input Type</InputLabel>
            <Select
              value={newInput.inputType}
              onChange={(e) => setNewInput({ ...newInput, inputType: e.target.value })}
              label="Input Type"
            >
              <MenuItem value="UNIVERSAL">UNIVERSAL</MenuItem>
              <MenuItem value="BINARY">BINARY</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cable Type</InputLabel>
            <Select
              value={newInput.cableType}
              onChange={(e) => setNewInput({ ...newInput, cableType: e.target.value })}
              label="Cable Type"
            >
              <MenuItem value="ONE_PAIR">ONE_PAIR</MenuItem>
              <MenuItem value="TWO_PAIR">TWO_PAIR</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="DDC Field Device"
            fullWidth
            value={newInput.ddcFieldDevice}
            onChange={(e) => setNewInput({ ...newInput, ddcFieldDevice: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Field Device I/O Type"
            fullWidth
            value={newInput.fieldDeviceInputOutputType}
            onChange={(e) => setNewInput({ ...newInput, fieldDeviceInputOutputType: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Control Terminals (ln)"
            fullWidth
            value={newInput.controlTerminalsln}
            onChange={(e) => setNewInput({ ...newInput, controlTerminalsln: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Control Terminals (cm)"
            fullWidth
            value={newInput.controlTerminalsCm}
            onChange={(e) => setNewInput({ ...newInput, controlTerminalsCm: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Controller Point Description"
            fullWidth
            value={newInput.controllerPointDescription}
            onChange={(e) => setNewInput({ ...newInput, controllerPointDescription: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Special Notes/Comments"
            fullWidth
            multiline
            rows={2}
            value={newInput.specialNotesComments}
            onChange={(e) => setNewInput({ ...newInput, specialNotesComments: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setOpenInput(false)}>Cancel</Button>
          <Button onClick={handleCreateInput} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Output Dialog */}
      <Dialog open={openOutput} onClose={() => setOpenOutput(false)}>
        <DialogTitle>Add New Output</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Output Type</InputLabel>
            <Select
              value={newOutput.outputType}
              onChange={(e) => setNewOutput({ ...newOutput, outputType: e.target.value })}
              label="Output Type"
            >
              <MenuItem value="ANALOG">ANALOG</MenuItem>
              <MenuItem value="BINARY">BINARY</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cable Type</InputLabel>
            <Select
              value={newOutput.cableType}
              onChange={(e) => setNewOutput({ ...newOutput, cableType: e.target.value })}
              label="Cable Type"
            >
              <MenuItem value="ONE_PAIR">ONE_PAIR</MenuItem>
              <MenuItem value="TWO_PAIR">TWO_PAIR</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="DDC Field Device"
            fullWidth
            value={newOutput.ddcFieldDevice}
            onChange={(e) => setNewOutput({ ...newOutput, ddcFieldDevice: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Field Device I/O Type"
            fullWidth
            value={newOutput.fieldDeviceInputOutputType}
            onChange={(e) => setNewOutput({ ...newOutput, fieldDeviceInputOutputType: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Control Terminals (ln)"
            fullWidth
            value={newOutput.controlTerminalsln}
            onChange={(e) => setNewOutput({ ...newOutput, controlTerminalsln: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Control Terminals (cm)"
            fullWidth
            value={newOutput.controlTerminalsCm}
            onChange={(e) => setNewOutput({ ...newOutput, controlTerminalsCm: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Controller Point Description"
            fullWidth
            value={newOutput.controllerPointDescription}
            onChange={(e) => setNewOutput({ ...newOutput, controllerPointDescription: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Special Notes/Comments"
            fullWidth
            multiline
            rows={2}
            value={newOutput.specialNotesComments}
            onChange={(e) => setNewOutput({ ...newOutput, specialNotesComments: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setOpenOutput(false)}>Cancel</Button>
          <Button onClick={handleCreateOutput}  variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Input Dialog */}
      <Dialog open={!!editingInput} onClose={() => setEditingInput(null)}>
        <DialogTitle>Edit Input</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="DDC Field Device"
            fullWidth
            value={editingInput?.ddcFieldDevice || ''}
            onChange={(e) => setEditingInput(prev => prev ? { ...prev, ddcFieldDevice: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Input Type</InputLabel>
            <Select
              value={editingInput?.inputType || 'UNIVERSAL'}
              onChange={(e) => setEditingInput(prev => prev ? { ...prev, inputType: e.target.value } : null)}
              label="Input Type"
            >
              <MenuItem value="UNIVERSAL">UNIVERSAL</MenuItem>
              <MenuItem value="BINARY">BINARY</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cable Type</InputLabel>
            <Select
              value={editingInput?.cableType || 'ONE_PAIR'}
              onChange={(e) => setEditingInput(prev => prev ? { ...prev, cableType: e.target.value } : null)}
              label="Cable Type"
            >
              <MenuItem value="ONE_PAIR">ONE_PAIR</MenuItem>
              <MenuItem value="TWO_PAIR">TWO_PAIR</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Field Device I/O Type"
            fullWidth
            value={editingInput?.fieldDeviceInputOutputType || ''}
            onChange={(e) => setEditingInput(prev => prev ? { ...prev, fieldDeviceInputOutputType: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Control Terminals (ln)"
            fullWidth
            value={editingInput?.controlTerminalsln || ''}
            onChange={(e) => setEditingInput(prev => prev ? { ...prev, controlTerminalsln: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Control Terminals (cm)"
            fullWidth
            value={editingInput?.controlTerminalsCm || ''}
            onChange={(e) => setEditingInput(prev => prev ? { ...prev, controlTerminalsCm: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Controller Point Description"
            fullWidth
            value={editingInput?.controllerPointDescription || ''}
            onChange={(e) => setEditingInput(prev => prev ? { ...prev, controllerPointDescription: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Special Notes/Comments"
            fullWidth
            multiline
            rows={2}
            value={editingInput?.specialNotesComments || ''}
            onChange={(e) => setEditingInput(prev => prev ? { ...prev, specialNotesComments: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setEditingInput(null)}>Cancel</Button>
          <Button onClick={handleUpdateInput} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Output Dialog */}
      <Dialog open={!!editingOutput} onClose={() => setEditingOutput(null)}>
        <DialogTitle>Edit Output</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="DDC Field Device"
            fullWidth
            value={editingOutput?.ddcFieldDevice || ''}
            onChange={(e) => setEditingOutput(prev => prev ? { ...prev, ddcFieldDevice: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Output Type</InputLabel>
            <Select
              value={editingOutput?.outputType || 'ANALOG'}
              onChange={(e) => setEditingOutput(prev => prev ? { ...prev, outputType: e.target.value } : null)}
              label="Output Type"
            >
              <MenuItem value="ANALOG">ANALOG</MenuItem>
              <MenuItem value="BINARY">BINARY</MenuItem>
              <MenuItem value="UNIVERSAL">BINARY</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cable Type</InputLabel>
            <Select
              value={editingOutput?.cableType || 'ONE_PAIR'}
              onChange={(e) => setEditingOutput(prev => prev ? { ...prev, cableType: e.target.value } : null)}
              label="Cable Type"
            >
              <MenuItem value="ONE_PAIR">ONE_PAIR</MenuItem>
              <MenuItem value="TWO_PAIR">TWO_PAIR</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Field Device I/O Type"
            fullWidth
            value={editingOutput?.fieldDeviceInputOutputType || ''}
            onChange={(e) => setEditingOutput(prev => prev ? { ...prev, fieldDeviceInputOutputType: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Control Terminals (ln)"
            fullWidth
            value={editingOutput?.controlTerminalsln || ''}
            onChange={(e) => setEditingOutput(prev => prev ? { ...prev, controlTerminalsln: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Control Terminals (cm)"
            fullWidth
            value={editingOutput?.controlTerminalsCm || ''}
            onChange={(e) => setEditingOutput(prev => prev ? { ...prev, controlTerminalsCm: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Controller Point Description"
            fullWidth
            value={editingOutput?.controllerPointDescription || ''}
            onChange={(e) => setEditingOutput(prev => prev ? { ...prev, controllerPointDescription: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Special Notes/Comments"
            fullWidth
            multiline
            rows={2}
            value={editingOutput?.specialNotesComments || ''}
            onChange={(e) => setEditingOutput(prev => prev ? { ...prev, specialNotesComments: e.target.value } : null)}
            InputLabelProps={{
              sx: {
                color: 'text.primary',
                '&.Mui-focused': {
                  color: 'text.primary'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setEditingOutput(null)}>Cancel</Button>
          <Button onClick={handleUpdateOutput} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Confirmation Dialog */}
      <Dialog 
        open={openTemplateDialog} 
        onClose={() => {
          setOpenTemplateDialog(false);
          setTemplateName('');
        }}
      >
        <DialogTitle>Save as Template</DialogTitle>
        <DialogContent>
          <TextField
            color='secondary'
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            required
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            error={!templateName.trim()}
            helperText={!templateName.trim() ? "Template name is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenTemplateDialog(false);
              setTemplateName('');
            }} 
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSaveTemplate(true, templateName.trim())}
            variant="contained"
            disabled={!templateName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Controller Dialog */}
      <Dialog open={openEditController} onClose={() => setOpenEditController(false)}>
        <DialogTitle>Edit Controller</DialogTitle>
        <DialogContent>
          <TextField
            color='secondary'
            autoFocus
            margin="dense"
            label="Controller Name"
            fullWidth
            required
            value={editedController.name}
            onChange={(e) => setEditedController({ ...editedController, name: e.target.value })}
          />
          <TextField
            color='secondary'
            margin="dense"
            label="Model Number"
            fullWidth
            required
            value={editedController.modelNumber}
            onChange={(e) => setEditedController({ ...editedController, modelNumber: e.target.value })}
          />
          <TextField
            color='secondary'
            margin="dense"
            label="Configuration"
            fullWidth
            required
            value={editedController.configuration}
            onChange={(e) => setEditedController({ ...editedController, configuration: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setOpenEditController(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateController} 
            variant="contained"
            disabled={!editedController.name || !editedController.modelNumber || !editedController.configuration}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Child Controller Dialog */}
      <Dialog open={openChildController} onClose={() => setOpenChildController(false)}>
        <DialogTitle>Create Child Controller</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            color="secondary"
            margin="dense"
            label="Controller Name"
            fullWidth
            required
            value={newChildController.name}
            onChange={(e) => setNewChildController({ ...newChildController, name: e.target.value })}
          />
          <TextField
            margin="dense"
            color="secondary"
            label="Model Number"
            fullWidth
            required
            value={newChildController.modelNumber}
            onChange={(e) => setNewChildController({ ...newChildController, modelNumber: e.target.value })}
          />
          <TextField
            color="secondary"
            margin="dense"
            label="Configuration"
            fullWidth
            required
            value={newChildController.configuration}
            onChange={(e) => setNewChildController({ ...newChildController, configuration: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setOpenChildController(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateChildController} 
            variant="contained"
            disabled={!newChildController.name || !newChildController.modelNumber || !newChildController.configuration}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ControllerDetail; 