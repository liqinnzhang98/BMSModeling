import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';

import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
  } from '@hello-pangea/dnd';

import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import * as XLSX from 'xlsx';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from './styles/GenerateExcel.module.css';

interface Controller {
  id: number;
  name: string;
  modelNumber: string;
  configuration: string;
  inputList: any[];
  outputList: any[];
}

interface Spreadsheet {
  id: string;
  name: string;
  controllers: Controller[];
  orderInExcel?: number;
}

interface ProjectInfo {
  name: string;
  revision?: string;
  date?: string;
  jobNumber?: string;
  // Add any other properties that projectData.data might contain
}

interface RawSpreadsheetData {
  id: number;
  name: string;
  orderInExcel: number;
  controllerOrder?: number[];
  controllers?: any[];
}

const GenerateExcel: React.FC = () => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState<string>('');
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [openCreateSpreadSheetDialog, setCreateSpreadSheetDialog] = useState(false);
  const [openSaveSpreadSheetDialog, setSaveSpreadSheetDialog] = useState(false);
  const [newSpreadsheetName, setNewSpreadsheetName] = useState('');
  const [editingSpreadsheet, setEditingSpreadsheet] = useState<Spreadsheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);


  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch project name
      const projectResponse = await fetch(`${apiBaseUrl}/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const projectData = await projectResponse.json();
      if (projectData.status === 200) {
        setProjectName(projectData.data.name);
        setProjectInfo(projectData.data);
      }

      // Fetch controllers
      const controllersResponse = await fetch(`${apiBaseUrl}/controller/projectControllers/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const controllersData = await controllersResponse.json();
      
      if (controllersData.status === 200) {
        setControllers(controllersData.data || []);
      } else {
        setControllers([]);
      }

      

      // Fetch stored spreadsheets
      const spreadsheetsResponse = await fetch(`${apiBaseUrl}/spreadsheets/fetchByProject/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const spreadsheetsData = await spreadsheetsResponse.json();
      
      if (spreadsheetsData.status === 200) {
        // Get all controllers first
        const allControllers = controllersData.data || [];
        
        // Sort spreadsheets by orderInExcel and process controllers
        const sortedSpreadsheets = spreadsheetsData.data
          .filter((item: any) => typeof item === 'object' && item !== null)
          .sort((a: any, b: any) => a.orderInExcel - b.orderInExcel)
          .map((spreadsheet: RawSpreadsheetData) => {
            const { id, ...restOfSpreadsheet } = spreadsheet; // Destructure 'id' from spreadsheet
            const orderedControllers = spreadsheet.controllerOrder
              ? spreadsheet.controllerOrder
                  .map((controllerId: number) => 
                    allControllers.find((c: Controller) => c.id === controllerId)
                  )
                  .filter(Boolean) 
              : [];

            return {
              ...restOfSpreadsheet, // Spread the rest of the properties
              id: `sheet-${id}`,
              controllers: orderedControllers,
              // orderInExcel is already included in restOfSpreadsheet if it's a direct property
            } as Spreadsheet; // Explicitly cast to Spreadsheet for final type safety
          });

        // Remove controllers that are in spreadsheets from the available list
        const usedControllerIds = new Set(
          spreadsheetsData.data.flatMap((sheet: any) => sheet.controllerOrder || [])
        );
        const availableControllers = allControllers.filter(
          (controller: Controller) => !usedControllerIds.has(controller.id)
        );

        setSpreadsheets(sortedSpreadsheets);
        setControllers(availableControllers);
      } else {
        setSpreadsheets([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setControllers([]);
      setSpreadsheets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpreadsheet = () => {
    if (newSpreadsheetName.trim()) {
      const newSpreadsheet: Spreadsheet = {
        id: `sheet-${Date.now()}`,
        name: newSpreadsheetName,
        controllers: [],
      };
      setSpreadsheets([...spreadsheets, newSpreadsheet]);
      setNewSpreadsheetName('');
      setCreateSpreadSheetDialog(false);
    }
  };

  const handleEditSpreadsheet = (spreadsheet: Spreadsheet) => {
    setEditingSpreadsheet(spreadsheet);
    setNewSpreadsheetName(spreadsheet.name);
    setCreateSpreadSheetDialog(true);
  };

  const handleUpdateSpreadsheet = () => {
    if (editingSpreadsheet && newSpreadsheetName.trim()) {
      setSpreadsheets(spreadsheets.map(sheet =>
        sheet.id === editingSpreadsheet.id
          ? { ...sheet, name: newSpreadsheetName }
          : sheet
      ));
      setNewSpreadsheetName('');
      setCreateSpreadSheetDialog(false);
      setEditingSpreadsheet(null);
    }
  };

  const handleSaveSpreadSheet = async () => {
    try {
      // Check if there are any spreadsheets
      if (spreadsheets.length === 0) {
        alert('Please create at least one spreadsheet before saving.');
        return;
      }

      // Check if any spreadsheet has controllers
      const hasControllers = spreadsheets.some(sheet => sheet.controllers.length > 0);
      if (!hasControllers) {
        alert('Please add controllers to your spreadsheets before saving.');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Save each spreadsheet with its order and controllers
      for (let i = 0; i < spreadsheets.length; i++) {
        const spreadsheet = spreadsheets[i];
        const controllerIds = spreadsheet.controllers.map(controller => controller.id);
        
        const requestBody = {
          name: spreadsheet.name,
          orderInExcel: i,
          controllerIds: controllerIds
        };

        console.log('Sending request:', requestBody);

        const response = await fetch(`${apiBaseUrl}/spreadsheets/create/${projectId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        // Log response status and headers
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        // Get response text first
        const responseText = await response.text();
        console.log('Response text:', responseText);
      }

      // If all spreadsheets are saved successfully, show the success dialog
      setSaveSpreadSheetDialog(true);
    } catch (error) {
      console.error('Error saving spreadsheets:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      alert('Failed to save spreadsheets. Please try again.');
    }
  };

  const handleCreateExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      console.log(projectInfo)

      spreadsheets.forEach((spreadsheet) => {
        let sheetData: any[][] = [];
        let currentRow = 0;

        // Project Info Header
        sheetData[currentRow] = []; // Ensure row exists
        sheetData[currentRow][0] = 'PROJECT NAME';
        sheetData[currentRow][1] = projectName; // Use projectName from state
        sheetData[currentRow][8] = 'Revision';
        sheetData[currentRow][9] = projectInfo?.revision || 'A.2'; // Use projectInfo.revision
        currentRow++;

        sheetData[currentRow] = [];
        sheetData[currentRow][8] = 'Date';
        sheetData[currentRow][9] = projectInfo?.date ? new Date(projectInfo.date).toLocaleDateString() : new Date().toLocaleDateString(); // Use projectInfo.date
        currentRow++;

        sheetData[currentRow] = [];
        sheetData[currentRow][8] = 'Job No';
        sheetData[currentRow][9] = projectInfo?.jobNumber || 'P-XXXX'; // Use projectInfo.jobNo
        currentRow++;

        // sheetData[currentRow] = [];
        // sheetData[currentRow][15] = 'ELLIOT'; // Logo placeholder
        // currentRow++;

        sheetData[currentRow] = [];
        sheetData[currentRow][0] = 'CONTROLLER NAME';
        sheetData[currentRow][1] = spreadsheet.name; // Use spreadsheet name as controller name
        currentRow++;

        sheetData[currentRow] = [];
        sheetData[currentRow][0] = 'CONTROLLER LOCATION';
        sheetData[currentRow][1] = 'FCU-G.01'; // Example, ideally dynamic
        currentRow++;

        sheetData[currentRow] = [];
        sheetData[currentRow][0] = 'CONTROLLER ADDRESS';
        sheetData[currentRow][1] = 'Refer N/W schematic'; // Example, ideally dynamic
        currentRow++;

        // Blank row before main headers
        currentRow++;

        // Main Headers: INPUT / OUTPUT SCHEDULE | VERIFICATION / VALIDATION
        sheetData[currentRow] = [];
        sheetData[currentRow][0] = 'INPUT / OUTPUT SCHEDULE'; // Spans 8 columns
        sheetData[currentRow][8] = 'VERIFICATION / VALIDATION'; // Spans 12 columns
        currentRow++;

        // Sub-headers for I/O and Verification
        sheetData[currentRow] = [
          'I/O Reference',
          'In', 'Cm', // Controller Terminals
          'Controller Point Description',
          'DDC Field Device',
          'Cable Type',
          'Field Device Input/Output Type',
          'Special Notes/Comments',
          // Verification / Validation columns
          'Install OK',
          'ON State',
          'OFF State',
          'Direction OK',
          '0% Check',
          '50% Check',
          '100% Check',
          'DDC Controller Reading',
          'Actual Field Reading',
          'DDC Controller Offset Value',
          'Sensor Range / Pulse Value',
          'Checked By (Initial)',
        ];
        const headerStartRow = currentRow; // Remember this row for merging
        currentRow++;

        // Add controller inputs and outputs
        spreadsheet.controllers.forEach((controller, controllerIndex) => {

          // Universal Inputs
          if (controller.inputList && controller.inputList.length > 0) {
            sheetData[currentRow] = [];
            sheetData[currentRow][0] = 'UNIVERSAL INPUTS';
            currentRow++;

            controller.inputList.forEach((input: any, inputIndex: number) => {
              sheetData[currentRow] = [
                input.ioReference || '',
                input.terminalIn || '',
                input.terminalCm || '',
                input.description || '',
                input.ddcFieldDevice || '',
                input.cableType || '',
                input.fieldDeviceIOType || '',
                input.specialNotesComments || '',
                '', '', '', '', '', '', '', '', '', '', '', '' // Verification columns
              ];
              currentRow++;
            });
          }

          // Binary Outputs and Analog Outputs (combined from outputList, distinguished by type)
          if (controller.outputList && controller.outputList.length > 0) {
            const binaryOutputs = controller.outputList.filter((output: any) => 
              output.fieldDeviceIOType && output.fieldDeviceIOType.includes('VAC')
            );
            const analogOutputs = controller.outputList.filter((output: any) => 
              output.fieldDeviceIOType && output.fieldDeviceIOType.includes('VDC')
            );

            if (binaryOutputs.length > 0) {
              sheetData[currentRow] = [];
              sheetData[currentRow][0] = 'BINARY OUTPUTS';
              currentRow++;

              binaryOutputs.forEach((output: any, outputIndex: number) => {
                sheetData[currentRow] = [
                  output.ioReference || '',
                  output.terminalIn || '',
                  output.terminalCm || '',
                  output.description || '',
                  output.ddcFieldDevice || '',
                  output.cableType || '',
                  output.fieldDeviceIOType || '',
                  output.specialNotesComments || '',
                  '', '', '', '', '', '', '', '', '', '', '', '' // Verification columns
                ];
                currentRow++;
              });
            }

            if (analogOutputs.length > 0) {
              sheetData[currentRow] = [];
              sheetData[currentRow][0] = 'ANALOG OUTPUTS';
              currentRow++;

              analogOutputs.forEach((output: any, outputIndex: number) => {
                sheetData[currentRow] = [
                  output.ioReference || '',
                  output.terminalIn || '',
                  output.terminalCm || '',
                  output.description || '',
                  output.ddcFieldDevice || '',
                  output.cableType || '',
                  output.fieldDeviceIOType || '',
                  output.specialNotesComments || '',
                  '', '', '', '', '', '', '', '', '', '', '', '' // Verification columns
                ];
                currentRow++;
              });
            }
          }

          // Add a blank row after each controller's data for separation
          currentRow++;
        });

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

        // Initialize merges array if it doesn't exist
        if (!worksheet['!merges']) {
          worksheet['!merges'] = [];
        }

        // Define static merges for headers
        worksheet['!merges']!.push(
          // PROJECT NAME and Project Name value
          { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, // PROJECT NAME
          { s: { r: 0, c: 1 }, e: { r: 0, c: 7 } }, // Project Name value
          
          // CONTROLLER NAME and value
          { s: { r: 4, c: 0 }, e: { r: 4, c: 0 } }, // CONTROLLER NAME
          { s: { r: 4, c: 1 }, e: { r: 4, c: 7 } }, // Controller Name value

          // CONTROLLER LOCATION and value
          { s: { r: 5, c: 0 }, e: { r: 5, c: 0 } }, // CONTROLLER LOCATION
          { s: { r: 5, c: 1 }, e: { r: 5, c: 7 } }, // Controller Location value

          // CONTROLLER ADDRESS and value
          { s: { r: 6, c: 0 }, e: { r: 6, c: 0 } }, // CONTROLLER ADDRESS
          { s: { r: 6, c: 1 }, e: { r: 6, c: 7 } }, // Controller Address value

          // INPUT / OUTPUT SCHEDULE
          { s: { r: 8, c: 0 }, e: { r: 8, c: 7 } }, 
          // VERIFICATION / VALIDATION
          { s: { r: 8, c: 8 }, e: { r: 8, c: 19 } }, 
          
          // Controller Terminals header merge (In and Cm)
          { s: { r: 9, c: 1 }, e: { r: 9, c: 2 } } 
        );

        // Dynamic merges for category titles (UNIVERSAL INPUTS, BINARY OUTPUTS, ANALOG OUTPUTS)
        sheetData.forEach((row, rowIndex) => {
          if (row[0] === 'UNIVERSAL INPUTS' || row[0] === 'BINARY OUTPUTS' || row[0] === 'ANALOG OUTPUTS') {
            worksheet['!merges']!.push({
              s: { r: rowIndex, c: 0 },
              e: { r: rowIndex, c: 19 } // Merge across all data columns
            });
          }
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, spreadsheet.name);
      });

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${projectName.replace(/\s+/g, '_')}_Controllers.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      setSaveSpreadSheetDialog(false);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  const handleDeleteSpreadsheet = (spreadsheetId: string) => {
    // Find the spreadsheet being deleted
    const deletedSpreadsheet = spreadsheets.find(sheet => sheet.id === spreadsheetId);
    
    if (deletedSpreadsheet) {
      // Add all controllers from the deleted spreadsheet back to the available controllers list
      setControllers([...controllers, ...deletedSpreadsheet.controllers]);
      
      // Remove the spreadsheet
      setSpreadsheets(spreadsheets.filter(sheet => sheet.id !== spreadsheetId));
    }
  };

  const onDragEnd = (result: any) => {

    const { source, destination } = result;

    console.log(projectInfo)

    //setLastDroppedId(destination);

    if (!destination) return;

    if (source.droppableId === 'controllers' && destination.droppableId.startsWith('sheet-')) {
      // Moving from controllers list to a spreadsheet
      const controller = controllers[source.index];
      const spreadsheetId = destination.droppableId;
      
      // Remove the controller from the available controllers list
      setControllers(controllers.filter((_, index) => index !== source.index));
      
      // Add the controller to the spreadsheet at the specific position
      setSpreadsheets(spreadsheets.map(sheet => {
        if (sheet.id === spreadsheetId) {
          const newControllers = [...sheet.controllers];
          newControllers.splice(destination.index, 0, controller);
          return {
            ...sheet,
            controllers: newControllers,
          };
        }
        return sheet;
      }));
    } else if (source.droppableId.startsWith('sheet-') && destination.droppableId.startsWith('sheet-')) {
      // Moving between spreadsheets
      const sourceSpreadsheetId = source.droppableId;
      const destSpreadsheetId = destination.droppableId;
      
      setSpreadsheets(spreadsheets.map(sheet => {
        if (sheet.id === sourceSpreadsheetId) {
          const newControllers = [...sheet.controllers];
          const [movedController] = newControllers.splice(source.index, 1);
          
          if (sourceSpreadsheetId === destSpreadsheetId) {
            newControllers.splice(destination.index, 0, movedController);
          }
          
          return { ...sheet, controllers: newControllers };
        }
        if (sheet.id === destSpreadsheetId && sourceSpreadsheetId !== destSpreadsheetId) {
          const sourceSheet = spreadsheets.find(s => s.id === sourceSpreadsheetId);
          const movedController = sourceSheet?.controllers[source.index];
          if (movedController) {
            const newControllers = [...sheet.controllers];
            newControllers.splice(destination.index, 0, movedController);
            return { ...sheet, controllers: newControllers };
          }
        }
      console.log(spreadsheets)  
        return sheet;
      }));
    } else if (source.droppableId.startsWith('sheet-') && destination.droppableId === 'controllers') {
      // Moving from spreadsheet back to controllers list
      const sourceSpreadsheetId = source.droppableId;
      const sourceSheet = spreadsheets.find(s => s.id === sourceSpreadsheetId);
      const movedController = sourceSheet?.controllers[source.index];
      
      if (movedController) {
        // Add the controller back to the available controllers list at the specific position
        const newControllers = [...controllers];
        newControllers.splice(destination.index, 0, movedController);
        setControllers(newControllers);
        
        // Remove the controller from the spreadsheet
        setSpreadsheets(spreadsheets.map(sheet => {
          if (sheet.id === sourceSpreadsheetId) {
            return {
              ...sheet,
              controllers: sheet.controllers.filter((_, index) => index !== source.index),
            };
          }
          return sheet;
        }));
      }
    }
  };

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.headerContainer}>
        <Button
                startIcon={<ArrowBackIcon />}
                color="secondary"
                onClick={() => navigate(`/projects/${projectId}`)}
            >
                Back to Project
        </Button>
        <Box className={styles.header}>
          <Typography variant="h4">{projectName} - Generate Excel</Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              setEditingSpreadsheet(null);
              setNewSpreadsheetName('');
              handleSaveSpreadSheet();
            }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSpreadsheet(null);
              setNewSpreadsheetName('');
              setCreateSpreadSheetDialog(true);
            }}
          >
            New Spreadsheet
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box className={styles.emptyState}>
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper className= {styles.controllerPaper}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Available Controllers
                  </Typography>
                  <Droppable droppableId="controllers">
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={styles.draggableContainer}
                        sx={{ minHeight: 200, maxHeight: 600, overflowY: 'auto' }}
                      >
                        {controllers && controllers.length > 0 ? (
                          controllers.map((controller, index) => (
                            <Draggable
                              key={`controller-${controller.id}`}
                              draggableId={`controller-${controller.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <Paper
                                    {...provided.dragHandleProps}
                                    className={`${styles.draggableItem} ${snapshot.isDragging ? styles.draggableItemDragging : ''}`}
                                  >
                                    <Box className={styles.draggableContent}>
                                      <Box className={styles.draggableInfo}>
                                        <Typography variant="subtitle1">{controller.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                          Model: {controller.modelNumber}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                          Configuration: {controller.configuration}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Paper>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <Box className={styles.emptyState}>
                            <Typography color="textSecondary">No controllers available</Typography>
                          </Box>
                        )}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {spreadsheets.map((spreadsheet) => (
                  <Grid item xs={12} key={spreadsheet.id}>
                    <Paper className={styles.spreadsheetPaper}>
                      <Box sx={{ p: 2 }}>
                        <Box className={styles.spreadsheetHeader}>
                          <Typography variant="h6">{spreadsheet.name}</Typography>
                          <Box className={styles.spreadsheetActions}>
                            <IconButton onClick={() => handleEditSpreadsheet(spreadsheet)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color='error' onClick={() => handleDeleteSpreadsheet(spreadsheet.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        <Droppable droppableId={spreadsheet.id}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={styles.spreadsheetContainer}
                            >
                              {spreadsheet.controllers && spreadsheet.controllers.length > 0 ? (
                                spreadsheet.controllers.map((controller, index) => (
                                  <Draggable
                                    key={`${spreadsheet.id}-controller-${controller.id}`}
                                    draggableId={`${spreadsheet.id}-controller-${controller.id}`}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                      >
                                        <Paper
                                          {...provided.dragHandleProps}
                                          className={`${styles.draggableItem} ${snapshot.isDragging ? styles.draggableItemDragging : ''}`}
                                        >
                                          <Box className={styles.draggableContent}>
                                            <Box className={styles.draggableInfo}>
                                              <Typography variant="subtitle1">{controller.name}</Typography>
                                              <Typography variant="body2" color="textSecondary">
                                                Model: {controller.modelNumber}
                                              </Typography>
                                              <Typography variant="body2" color="textSecondary">
                                                Configuration: {controller.configuration}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Paper>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              ) : (
                                <Box className={styles.emptyState}>
                                  <Typography color="textSecondary">Drag controllers here</Typography>
                                </Box>
                              )}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DragDropContext>
      )}

      <Dialog open={openCreateSpreadSheetDialog} onClose={() => setCreateSpreadSheetDialog(false)}>
        <DialogTitle>
          {editingSpreadsheet ? 'Edit Spreadsheet' : 'New Spreadsheet'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            color='secondary'
            margin="dense"
            label="Spreadsheet Name"
            fullWidth
            value={newSpreadsheetName}
            onChange={(e) => setNewSpreadsheetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button color= 'secondary' onClick={() => setCreateSpreadSheetDialog(false)}>Cancel</Button>
          <Button
            onClick={editingSpreadsheet ? handleUpdateSpreadsheet : handleCreateSpreadsheet}
            variant="contained"
          >
            {editingSpreadsheet ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSaveSpreadSheetDialog} onClose={() => setSaveSpreadSheetDialog(false)}>
        <DialogTitle>
          Success
        </DialogTitle>
        <DialogContent>
          Would you like to save it as Excel?
        </DialogContent>
        <DialogActions>
          <Button color='secondary' onClick={() => setSaveSpreadSheetDialog(false)}>No</Button>
          <Button
            onClick={handleCreateExcel}
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GenerateExcel;
