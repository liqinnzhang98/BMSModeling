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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Divider,
  Badge,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import styles from './styles/ProjectDetail.module.css';

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
  useAsTemplate: boolean;
  templateName: string;
  parentControllerId: number | null;
  inputList: ControllerInput[];
  outputList: ControllerOutput[];
  inputOrder: [];
  outputOrder: [];
  dateCreated: string;
  projectName?: string;
  isCreatedFromTemplate: boolean;
  templateCreatedFrom?: string;
  childControllers: [];
}

interface Project {
  id: string;
  name: string;
  jobNumber: string;
  controllers: Controller[];
}

interface TemplateController extends Controller {
  selected?: boolean;
  expanded?: boolean;
  quantity?: number;
  projectName?: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [templateControllers, setTemplateControllers] = useState<TemplateController[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedControllerId, setExpandedControllerId] = useState<number | null>(null);
  const [openQuantityDialog, setOpenQuantityDialog] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateController[]>([]);
  const [openChildDetailsDialog, setOpenChildDetailsDialog] = useState(false);
  const [selectedChildControllers, setSelectedChildControllers] = useState<Controller[]>([]);

  const [newController, setNewController] = useState({
    name: '',
    modelNumber: '',
    configuration: '',
    inputList:[],
    outputList:[]
  });
  
  const [editedProject, setEditedProject] = useState({ name: '', jobNumber: '' });

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch project details
      const projectResponse = await axios.get(`${apiBaseUrl}/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Fetch project controllers
      const controllersResponse = await axios.get(`${apiBaseUrl}/controller/projectControllers/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Combine project details with controllers
      const projectData = {
        ...projectResponse.data.data,
        controllers: controllersResponse.data.data || []
      };

      setProject(projectData);
      setEditedProject({
        name: projectData.name,
        jobNumber: projectData.jobNumber,
      });

      //console.log(projectData)
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const handleCreateController = async () => {
    try {
      const token = localStorage.getItem('token');
      const controllerWithDate = {
        ...newController,
        dateCreated: new Date().toISOString(),
        templateCreatedFrom: "origin",
        isCreatedFromTemplate: false
      };
      // console.log(controllerWithDate)
      const response = await axios.post(
        `${apiBaseUrl}/controller/createController/${projectId}`,
        controllerWithDate,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (project) {
        setProject({
          ...project,
          controllers: [...(project.controllers || []), response.data.data]
        });
      }
      setOpen(false);
      setNewController({
        name: '',
        modelNumber: '',
        configuration: '',
        inputList:[],
        outputList:[]
      });
    } catch (error) {
      console.error('Error creating controller:', error);
    }
  };

  const handleUpdateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiBaseUrl}/project/${projectId}`,
        editedProject,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Fetch fresh project data after updating
      await fetchProject();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteController = async (controllerId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${apiBaseUrl}/controller/deleteController/${projectId}/${controllerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Fetch fresh project data after deleting controller
      await fetchProject();
    } catch (error) {
      console.error('Error deleting controller:', error);
    }
  };

  const fetchTemplateControllers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiBaseUrl}/controller/templates`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTemplateControllers(response.data.data.map((controller: Controller) => ({
        ...controller,
        selected: false,
        expanded: false,
        projectName: controller.projectName
      })));

      console.log(response.data.data)
    } catch (error) {
      console.error('Error fetching template controllers:', error);
    }
  };

  const handleTemplateSelect = (controllerId: number) => {
    setTemplateControllers(prev => prev.map(controller => 
      controller.id === controllerId 
        ? { ...controller, selected: !controller.selected }
        : controller
    ));
  };

  const handleTemplateExpand = (controllerId: number) => {
    setTemplateControllers(prev => prev.map(controller => 
      controller.id === controllerId 
        ? { ...controller, expanded: !controller.expanded }
        : controller
    ));
  };

  const handleCreateFromTemplates = async () => {
    const selected = templateControllers.filter(controller => controller.selected);
    if (selected.length > 0) {
      setSelectedTemplates(selected.map(template => ({ ...template, quantity: 1 })));
      setOpenQuantityDialog(true);
    }
  };

  const handleQuantityChange = (templateId: number, quantity: number) => {
    setSelectedTemplates(prev => prev.map(template => 
      template.id === templateId ? { ...template, quantity: Math.max(1, quantity) } : template
    ));
  };

  const handleCreateWithQuantities = async () => {
    try {
      const token = localStorage.getItem('token');
      
      for (const template of selectedTemplates) {
        for (let i = 0; i < (template.quantity || 1); i++) {
          const templateWithDate = {
            ...template,
            name: template.quantity && template.quantity > 1 
              ? `${template.templateName} (${i + 1})`
              : template.templateName,
            dateCreated: new Date().toISOString(),
            isCreatedFromTemplate: true,
            templateCreatedFrom: template.projectName
          };
          await axios.post(
            `${apiBaseUrl}/controller/createController/${projectId}`,
            templateWithDate,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        }
      }
      
      // Fetch fresh project data after creating controllers from templates
      await fetchProject();
      setOpenTemplate(false);
      setOpenQuantityDialog(false);
      setSelectedTemplates([]);
      setTemplateControllers(prev => prev.map(controller => ({ ...controller, selected: false, expanded: false })));
    } catch (error) {
      console.error('Error creating controllers from templates:', error);
    }
  };

  const filteredTemplates = templateControllers.filter(controller => {
    const searchLower = searchQuery.toLowerCase();
    return (
      controller.name.toLowerCase().includes(searchLower) ||
      controller.modelNumber.toLowerCase().includes(searchLower) ||
      controller.configuration.toLowerCase().includes(searchLower) ||
      controller.inputList?.some(input => 
        input.controllerPointDescription?.toLowerCase().includes(searchLower) ||
        input.ddcFieldDevice.toLowerCase().includes(searchLower)
      ) ||
      controller.outputList?.some(output => 
        output.controllerPointDescription?.toLowerCase().includes(searchLower) ||
        output.ddcFieldDevice.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleControllerExpand = (controllerId: number) => {
    setExpandedControllerId(expandedControllerId === controllerId ? null : controllerId);
  };

  const handleCardClick = (controller: Controller) => {
    navigate(`/projects/${projectId}/controllers/${controller.id}`, {
      state: { controller }
    });
  };

  const handleViewChildControllers = async (childControllerIds: number[]) => {
    try {
      const token = localStorage.getItem('token');
      const childControllers = await Promise.all(
        childControllerIds.map(id => 
          axios.get(`${apiBaseUrl}/controller/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      setSelectedChildControllers(childControllers.map(res => res.data.data));
      setOpenChildDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching child controllers:', error);
    }
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.topButtonRow}>
        <Button
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => navigate(`/projects`)}
        >
          Back to Projects
        </Button>
        <Button
          variant="contained"
        >
          Batch Edit
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => navigate(`/project/${projectId}/generate-excel`)}
          sx={{ ml: 2 }}
        >
          Generate Excel
        </Button>
      </Box>
      <Box className={styles.headerContainer}>
          <Box>
            {editMode ? (
              <Box className={styles.editForm}>
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
                <Button color="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </Box>
            ) : (
              <Box className={styles.titleContainer}>
                <Typography variant="h4" component="h1">
                  {project.name}
                </Typography>
                <IconButton onClick={() => setEditMode(true)}>
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Box>
          <Box className={styles.buttonGroup}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              CREATE A NEW CONTROLLER
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenTemplate(true);
                fetchTemplateControllers();
              }}
            >
              SELECT FROM TEMPLATES
            </Button>
          </Box>
      </Box>

      <Box className={styles.controllerContainer}>
        {project.controllers?.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '4rem',
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Controllers in this Project
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Create one now to get started
            </Typography>
          </Box>
        ) : (
          project.controllers
            ?.filter(controller => controller.parentControllerId === null)
            .map((controller) => (
            <Card 
              key={controller.id} 
              className={styles.card}
            >
              <CardContent className={styles.cardContent}>
                <Box className={styles.controllerInfo}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" component="h2">
                      {controller.name}
                    </Typography>
                    {controller.parentControllerId === null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {controller.isCreatedFromTemplate && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'error.main',
                              fontWeight: 'bold',
                              fontSize: '0.875rem'
                            }}
                          >
                            From: {controller.templateCreatedFrom}
                          </Typography>
                        )}
                        <Badge
                          badgeContent={project.controllers?.filter(child => child.parentControllerId === controller.id).length}
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: '#c52525',
                              color: 'white',
                              minWidth: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              padding: '0 6px',
                            }
                          }}
                        >
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleControllerExpand(controller.id);
                            }}
                            sx={{ ml: 1 }}
                          >
                            {expandedControllerId === controller.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Badge>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Model: {controller.modelNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Configuration: {controller.configuration}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Inputs: {controller.inputList?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Outputs: {controller.outputList?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Date Created: {controller.dateCreated}
                  </Typography>
                </Box>
                <Box className={styles.controllerActions}>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${projectId}/controllers/${controller.id}`, { 
                        state: { controller } 
                      });
                    }}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteController(controller.id);
                    }}
                    className={styles.deleteButton}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
              {controller.parentControllerId === null && (
                <Collapse in={expandedControllerId === controller.id} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                    {project.controllers?.filter(child => child.parentControllerId === controller.id).length > 0 ? (
                      <List dense>
                        {project.controllers?.filter(child => child.parentControllerId === controller.id).map((childController) => (
                          <ListItem key={childController.id}>
                            <ListItemText
                              primary={childController.name}
                              secondary={
                                <>
                                  <Typography variant="body2" color="textSecondary">
                                    Model: {childController.modelNumber}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Configuration: {childController.configuration}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Inputs: {childController.inputList?.length || 0}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Outputs: {childController.outputList?.length || 0}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Date Created: {childController.dateCreated}
                                  </Typography>
                                </>
                              }
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/projects/${projectId}/controllers/${childController.id}`, {
                                    state: { controller: childController }
                                  });
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                className={styles.deleteButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteController(childController.id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" color="textSecondary">
                          No Child Controllers
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              )}
            </Card>
          ))
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Controller</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            color="secondary"
            margin="dense"
            label="Controller Name"
            fullWidth
            required
            value={newController.name}
            onChange={(e) => setNewController({ ...newController, name: e.target.value })}
          />
          <TextField
            color="secondary"
            margin="dense"
            label="Model Number"
            fullWidth
            required
            value={newController.modelNumber}
            onChange={(e) => setNewController({ ...newController, modelNumber: e.target.value })}
          />
          <TextField
            color="secondary"
            margin="dense"
            label="Configuration"
            fullWidth
            required
            value={newController.configuration}
            onChange={(e) => setNewController({ ...newController, configuration: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)} 
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateController} 
            variant="contained"
            disabled={!newController.name || !newController.modelNumber || !newController.configuration}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog 
        open={openTemplate} 
        onClose={() => setOpenTemplate(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Template Controllers</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            color='secondary'
            margin="dense"
            label="Search Templates"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {filteredTemplates.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  {templateControllers.length === 0 
                    ? "No Templates Available"
                    : "No Templates Match Your Search"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {templateControllers.length === 0 
                    ? "Create a template by marking a controller as a template"
                    : "Try adjusting your search criteria"}
                </Typography>
              </Box>
            ) : (
              filteredTemplates.map((controller) => (
                <React.Fragment key={controller.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={controller.selected}
                        onChange={() => handleTemplateSelect(controller.id)}
                        sx={{
                          color: 'text.secondary',
                          '&.Mui-checked': {
                            color: 'success.main',
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{controller.templateName}</Typography>
                          {controller.childControllers && controller.childControllers.length > 0 && (
                            <Typography
                              variant="body2"
                              color="secondary"
                              sx={{ 
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                '&:hover': { color: 'primary.dark' }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewChildControllers(controller.childControllers);
                              }}
                            >
                              ({controller.childControllers.length} child controllers)
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            Model: {controller.modelNumber}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Configuration: {controller.configuration}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Inputs: {controller.inputList?.length || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Outputs: {controller.outputList?.length || 0}
                          </Typography>
                        </>
                      }
                    />
                    <IconButton onClick={() => handleTemplateExpand(controller.id)}>
                      {controller.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItem>
                  <Collapse in={controller.expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                      {controller.inputList && controller.inputList.length > 0 && (
                        <>
                          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                            Inputs
                          </Typography>
                          <List dense>
                            {controller.inputList.map((input) => (
                              <ListItem key={input.id}>
                                <ListItemText
                                  primary={input.controllerPointDescription || 'Unnamed Input'}
                                  secondary={
                                    <>
                                      <Typography variant="body2" color="textSecondary">
                                        Type: {input.inputType}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        DDC Field Device: {input.ddcFieldDevice}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Field Device I/O Type: {input.fieldDeviceInputOutputType}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Cable Type: {input.cableType}
                                      </Typography>
                                      {input.specialNotesComments && (
                                        <Typography variant="body2" color="textSecondary">
                                          Notes: {input.specialNotesComments}
                                        </Typography>
                                      )}
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                      {controller.outputList && controller.outputList.length > 0 && (
                        <>
                          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                            Outputs
                          </Typography>
                          <List dense>
                            {controller.outputList.map((output) => (
                              <ListItem key={output.id}>
                                <ListItemText
                                  primary={output.controllerPointDescription || 'Unnamed Output'}
                                  secondary={
                                    <>
                                      <Typography variant="body2" color="textSecondary">
                                        Type: {output.outputType}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        DDC Field Device: {output.ddcFieldDevice}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Field Device I/O Type: {output.fieldDeviceInputOutputType}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Cable Type: {output.cableType}
                                      </Typography>
                                      {output.specialNotesComments && (
                                        <Typography variant="body2" color="textSecondary">
                                          Notes: {output.specialNotesComments}
                                        </Typography>
                                      )}
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </Box>
                  </Collapse>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenTemplate(false);
              setSearchQuery('');
            }} 
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFromTemplates}
            variant="contained"
            disabled={!templateControllers.some(controller => controller.selected)}
          >
            Create Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quantity Selection Dialog */}
      <Dialog 
        open={openQuantityDialog} 
        onClose={() => {
          setOpenQuantityDialog(false);
          setSelectedTemplates([]);
        }}
      >
        <DialogTitle>Select Quantities</DialogTitle>
        <DialogContent>
          <List>
            {selectedTemplates.map((template) => (
              <ListItem key={template.id}>
                <ListItemText
                  primary={template.templateName}
                  secondary={`Model: ${template.modelNumber}`}
                />
                <TextField
                  type="number"
                  value={template.quantity}
                  onChange={(e) => handleQuantityChange(template.id, parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  size="small"
                  sx={{ width: '100px' }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenQuantityDialog(false);
              setSelectedTemplates([]);
            }} 
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateWithQuantities}
            variant="contained"
          >
            Create Controllers
          </Button>
        </DialogActions>
      </Dialog>

      {/* Child Controllers Details Dialog */}
      <Dialog
        open={openChildDetailsDialog}
        onClose={() => {
          setOpenChildDetailsDialog(false);
          setSelectedChildControllers([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Child Controllers Details</DialogTitle>
        <DialogContent>
          {selectedChildControllers.map((controller) => (
            <Box key={controller.id} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {controller.name}
              </Typography>
              
              {/* Basic Information */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Model Number:</strong> {controller.modelNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Configuration:</strong> {controller.configuration}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Date Created:</strong> {controller.dateCreated}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Template Source:</strong> {controller.templateCreatedFrom}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Inputs Section */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Inputs ({controller.inputList?.length || 0})
                </Typography>
                <List dense>
                  {controller.inputList?.map((input) => (
                    <ListItem key={input.id}>
                      <ListItemText
                        primary={input.controllerPointDescription || 'Unnamed Input'}
                        secondary={
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Type:</strong> {input.inputType}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>DDC Field Device:</strong> {input.ddcFieldDevice}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Field Device I/O Type:</strong> {input.fieldDeviceInputOutputType}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Cable Type:</strong> {input.cableType}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Control Terminals (ln):</strong> {input.controlTerminalsln}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Control Terminals (cm):</strong> {input.controlTerminalsCm}
                              </Typography>
                            </Grid>
                            {input.specialNotesComments && (
                              <Grid item xs={12}>
                                <Typography variant="body2">
                                  <strong>Special Notes:</strong> {input.specialNotesComments}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Outputs Section */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Outputs ({controller.outputList?.length || 0})
                </Typography>
                <List dense>
                  {controller.outputList?.map((output) => (
                    <ListItem key={output.id}>
                      <ListItemText
                        primary={output.controllerPointDescription || 'Unnamed Output'}
                        secondary={
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Type:</strong> {output.outputType}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>DDC Field Device:</strong> {output.ddcFieldDevice}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Field Device I/O Type:</strong> {output.fieldDeviceInputOutputType}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Cable Type:</strong> {output.cableType}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Control Terminals (ln):</strong> {output.controlTerminalsln}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Control Terminals (cm):</strong> {output.controlTerminalsCm}
                              </Typography>
                            </Grid>
                            {output.specialNotesComments && (
                              <Grid item xs={12}>
                                <Typography variant="body2">
                                  <strong>Special Notes:</strong> {output.specialNotesComments}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenChildDetailsDialog(false);
              setSelectedChildControllers([]);
            }}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail; 