package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.*;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.*;
import com.example.demo.response.ApiResponse;
import com.example.demo.utils.ControllerMapperUtil;
import com.example.demo.utils.InputMapperUtil;
import com.example.demo.utils.JwtUtil;
import com.example.demo.utils.OutputMapperUtil;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/controller")
public class ControllerController {

    private final ControllerService controllerService;
    private final ProjectService projectService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final InputService inputService;  // Add InputService for handling Input deletions
    private final OutputService outputService;


    @Autowired
    public ControllerController(ControllerService controllerService, ProjectService projectService, JwtUtil jwtUtil,
                                UserRepository userRepository, ProjectRepository projectRepository,
                                InputService inputService, OutputService outputService) {
        this.controllerService = controllerService;
        this.projectService = projectService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.inputService = inputService;
        this.outputService = outputService;
    }

    @Operation(
            summary = "creates a controller, project Id and controller with Inputs and Outputs are required"
    )
    @PostMapping("/createController/{projectId}")
    public ResponseEntity<?> createController(@RequestHeader("Authorization") String token,
                                              @PathVariable Long projectId,
                                              @RequestBody ControllerRequestDTO requestDTO) {
        try {
            String email = extractEmailFromToken(token);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            // Fetch the Project entity
            Optional<Project> projectOptional = projectRepository.findById(projectId);
            if (projectOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Project not found", null));
            }
            Project project = projectOptional.get();
            // Map the DTO to the entity
            Controller controller = ControllerMapperUtil.toEntity(requestDTO, user, project);

            System.out.println(requestDTO.getChildControllers());

            // update the parent controller in child entity
            if (requestDTO.getParentControllerId() != null) {
                Optional<Controller> parentControllerOptional = controllerService.getControllerById(requestDTO.getParentControllerId());
                // update parent controllers
                parentControllerOptional.ifPresent(controller::setParentController);
            }

            // Save the new added controller to the database
            Controller savedController = controllerService.saveController(controller);

            // update childLst from the parent controllers
            System.out.println(savedController.getParentController());
            if (savedController.getParentController() != null) {
                List<Long> updatedChildLst;
                Controller updatingParentController = savedController.getParentController();
                if (updatingParentController.getChildControllers() != null) {
                    updatedChildLst = updatingParentController.getChildControllers();
                    updatedChildLst.add(savedController.getId());
                } else {
                    updatedChildLst = new ArrayList<>();
                    updatedChildLst.add(savedController.getId());
                }
                controllerService.saveController(updatingParentController);
            }

            //update inputOrder if the inputList is not empty
            if (controller.getInputList() != null && !controller.getInputList().isEmpty()) {
                List<Long> inputIds = controller.getInputList().stream()
                        .map(Input::getId)
                        .collect(Collectors.toList());
                controllerService.updateOrderList(savedController.getId(), inputIds, true);
            }

            //update outputOrder if the outputList is not empty

            if (controller.getOutputList() != null && !controller.getOutputList().isEmpty()) {
                List<Long> outputIds = controller.getOutputList().stream()
                        .map(Output::getId)
                        .collect(Collectors.toList());
                controllerService.updateOrderList(savedController.getId(), outputIds, false);
            }

            // if the saved controller is a parent Controller, create the child controllers and link them together
            if (!savedController.getChildControllers().isEmpty()) {
                System.out.println("1");
                for (long childControllerId : savedController.getChildControllers()) { // for each child in parent
                    System.out.println("2");
                    Optional<Controller> childControllerOptional = controllerService.getControllerById(childControllerId);
                    if (childControllerOptional.isPresent()) { // if the child exists, make a copy and store
                        System.out.println("3");
                        Controller newChildController = ControllerMapperUtil.childtoNewChild(childControllerOptional.get(), savedController, project);
                        System.out.println("4");
                        controllerService.saveController(newChildController);
                    }
                }
            }

            // Return success response
            ControllerResponseDTO responseDTO = ControllerMapperUtil.toDTO(savedController);


            return ResponseEntity.status(201).body(new ApiResponse<>(201,
                    "Controller created successfully",
                    responseDTO));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(),
                    null));
        }
    }

    private String extractEmailFromToken(String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        return jwtUtil.extractUsername(token);
    }

    @Operation(
            summary = "updates a controller, everything except the lists of inputs and outputs"
    )

    @PutMapping("/updateController/{controllerId}")
    public ResponseEntity<?> updateController(@RequestHeader("Authorization") String token,
                                              @PathVariable Long controllerId,
                                              @RequestBody ControllerUpdateDTO controllerUpdateDTO) {
        try {
            String email = extractEmailFromToken(token);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));


            // Fetch the Controller entity
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(
                        404,
                        "Controller updated successfully",
                        null));
            }

            Controller controller = controllerOptional.get();

            // Update only the provided fields
            if (controllerUpdateDTO.getName() != null) {
                controller.setName(controllerUpdateDTO.getName());
            }

            if (controllerUpdateDTO.getModelNumber() != null) {
                controller.setModelNumber(controllerUpdateDTO.getModelNumber());
            }

            if (controllerUpdateDTO.getConfiguration() != null) {
                controller.setConfiguration(controllerUpdateDTO.getConfiguration());
            }

            // save and send response back
            Controller updatedController = controllerService.saveController(controller);

            ControllerResponseDTO responseDTO = ControllerMapperUtil.toDTO(updatedController);


            return ResponseEntity.ok(new ApiResponse<>(
                    200,
                    "Controller updated successfully",
                    responseDTO));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(),
                    null));
        }
    }

    @Operation(
            summary = "deletes a controller, project Id and controller Id are required"
    )

    @DeleteMapping("/deleteController/{projectId}/{controllerId}")
    public ResponseEntity<?> deleteController(@RequestHeader("Authorization") String token,
                                              @PathVariable Long projectId,
                                              @PathVariable Long controllerId) {
        try {
            String email = extractEmailFromToken(token);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            // Fetch the Project entity
            Optional<Project> projectOptional = projectRepository.findById(projectId);
            if (projectOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Project not found",
                        null));
            }

            Project project = projectOptional.get();

            // Fetch the Controller entity
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }
            // update parent child relationship
            if (controllerService.getControllerById(controllerId).isPresent() && controllerService.getControllerById(controllerId).get().getParentController() != null) {
                Controller deletingController = controllerService.getControllerById(controllerId).get();
                Controller parentController = deletingController.getParentController();
                if (!parentController.getChildControllers().isEmpty()) {
                    // update child controllers
                    parentController.getChildControllers().remove(deletingController.getId());
                }
                controllerService.saveController(parentController);
            }
            // Delete the controller
            controllerService.deleteController(controllerId);

            return ResponseEntity.ok(new ApiResponse<>(200,
                    "Controller deleted successfully",
                    null));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(),
                    null));
        }
    }

    @Operation(
            summary = "returns are controllers involved with one single project"
    )

    @GetMapping("/projectControllers/{projectId}")
    public ResponseEntity<?> getControllersByProject(@RequestHeader("Authorization") String token,
                                                     @PathVariable Long projectId) {
        try {

            // Extract email from the token
            String email = extractEmailFromToken(token);

            // Check if the user exists
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if the project exists
            Project project = projectService.getProjectById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Retrieve the list of controllers for the project
            List<Controller> controllers = controllerService.getAllControllersByProjectId(projectId);
            List<ControllerResponseDTO> dtoList = controllers.stream()
                    .map(ControllerMapperUtil::toDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(200,
                    "Controllers retrieved successfully",
                    dtoList));
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(
                    404, e.getMessage(),
                            null));
        }
    }

    @Operation(
            summary = "Creates a new input and associates it with a controller"
    )
    @PostMapping("/createInput/{controllerId}")
    public ResponseEntity<?> createInput(
            @RequestHeader("Authorization") String token, @PathVariable Long controllerId,
                                         @RequestBody InputDTO inputDTO) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }

            Input inputToCreate = InputMapperUtil.toEntity(inputDTO);
            inputToCreate.setController(controllerOptional.get());

            Input createdInput = inputService.saveInput(inputToCreate);

            InputDTO createdDTO = InputMapperUtil.toDTO(createdInput);

            controllerService.appendToOrderList(controllerId, createdDTO.getId(), true);

            return ResponseEntity.ok(new ApiResponse<>(201, "Input created successfully", createdDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: "
                    + e.getMessage(),
                    null));
        }
    }

    @Operation(
            summary = "Creates a new output and associates it with a controller"
    )
    @PostMapping("/createOutput/{controllerId}")
    public ResponseEntity<?> createOutput(@RequestHeader("Authorization") String token, @PathVariable Long controllerId,
                                          @RequestBody OutputDTO outputDTO) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }

            System.out.println(outputDTO.getSpecialNotesComments());

            Output outputToCreate = OutputMapperUtil.toEntity(outputDTO);
            outputToCreate.setController(controllerOptional.get());

            Output createdOutput = outputService.saveOutput(outputToCreate);
            controllerService.appendToOrderList(controllerId, createdOutput.getId(), false);

            OutputDTO createdDTO = OutputMapperUtil.toDTO(createdOutput);

            return ResponseEntity.ok(new ApiResponse<>(201, "Output created successfully", createdDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(),
                    null));
        }
    }


    @Operation(
            summary = "Get a controller by its ID",
            description = "Returns controller details along with input and output lists by controller ID"
    )
    @GetMapping("/{controllerId}")
    public ResponseEntity<?> getControllerById(@RequestHeader("Authorization") String token, @PathVariable Long controllerId) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }

            ControllerResponseDTO responseDTO = ControllerMapperUtil.toDTO(controllerOptional.get());
            return ResponseEntity.ok(new ApiResponse<>(200,
                    "Controller retrieved successfully",
                    responseDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(),
                    null));
        }
    }

    // Delete input by controller ID and input ID
    @Operation(
            summary = "Deletes an input from a controller, controller ID and input ID are required"
    )
    @DeleteMapping("/deleteInput/{controllerId}/{inputId}")
    public ResponseEntity<?> deleteInput(@RequestHeader("Authorization") String token, @PathVariable Long controllerId, @PathVariable Long inputId) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }

            Optional<Input> inputOptional = inputService.getInputById(inputId);
            if (inputOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Input not found",
                        null));
            }

            // Remove the input from the controller
            inputService.deleteInput(inputId);
            controllerService.deleteFromOrderList(controllerId, inputId,true);

            return ResponseEntity.ok(new ApiResponse<>(200,
                    "Input deleted successfully",
                    null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(),
                    null));
        }
    }

    // Delete output by controller ID and output ID
    @Operation(
            summary = "Deletes an output from a controller, controller ID and output ID are required"
    )
    @DeleteMapping("/deleteOutput/{controllerId}/{outputId}")
    public ResponseEntity<?> deleteOutput(@RequestHeader("Authorization") String token, @PathVariable Long controllerId, @PathVariable Long outputId) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }

            Optional<Output> outputOptional = outputService.getOutputById(outputId);
            if (outputOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Output not found", null));
            }

            // Remove the output from the controller
            outputService.deleteOutput(outputId);
            controllerService.deleteFromOrderList(controllerId, outputId, false);

            return ResponseEntity.ok(new ApiResponse<>(200, "Output deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(), null));
        }
    }

    // Update Input by controller ID and input ID
    @Operation(
            summary = "Updates an input in a controller"
    )
    @PutMapping("/updateInput/{controllerId}/{inputId}")
    public ResponseEntity<?> updateInput(@RequestHeader("Authorization") String token, @PathVariable Long controllerId,
                                         @PathVariable Long inputId,
                                         @RequestBody InputDTO inputDTO) {
        try {
            // Check if the controller exists
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found", null));
            }

            // Check if the input exists
            Optional<Input> inputOptional = inputService.getInputById(inputId);
            if (inputOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Input not found", null));
            }

            // Convert DTO to entity and set IDs and controller
            Input inputToUpdate = InputMapperUtil.toEntity(inputDTO);
            inputToUpdate.setId(inputId);
            inputToUpdate.setController(controllerOptional.get());

            // Save updated input
            Input updatedInput = inputService.updateInput(inputToUpdate);

            // Convert back to DTO
            InputDTO updatedInputDTO = InputMapperUtil.toDTO(updatedInput);

            return ResponseEntity.ok(new ApiResponse<>(200,
                    "Input updated successfully", updatedInputDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(), null));
        }
    }


    // Update Output by controller ID and output ID
    @Operation(
            summary = "Updates an output in a controller"
    )
    @PutMapping("/updateOutput/{controllerId}/{outputId}")
    public ResponseEntity<?> updateOutput(@RequestHeader("Authorization") String token, @PathVariable Long controllerId,
                                          @PathVariable Long outputId,
                                          @RequestBody OutputDTO outputDTO) {
        try {
            // Check if the controller exists
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found", null));
            }

            // Check if the input exists
            Optional<Output> outputOptional = outputService.getOutputById(outputId);
            if (outputOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Output not found", null));
            }

            // Convert DTO to entity and set IDs and controller
            Output outputToUpdate = OutputMapperUtil.toEntity(outputDTO);
            outputToUpdate.setId(outputId);
            outputToUpdate.setController(controllerOptional.get());

            // Save updated input
            Output updatedOutput = outputService.updateOutput(outputToUpdate);

            // Convert back to DTO
            OutputDTO updatedInputDTO = OutputMapperUtil.toDTO(updatedOutput);

            return ResponseEntity.ok(new ApiResponse<>(200,
                    "Input updated successfully", updatedInputDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(), null));
        }
    }

    @PutMapping("/rearrangeOrder/{controllerId}/inputs")
    public ResponseEntity<?> rearrangeInputOrder(@RequestHeader("Authorization") String token, @PathVariable Long controllerId, @RequestBody ReorderListDTO newInputOrder) {

        try {

            // Check if the controller exists
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found", null));
            }

        Controller reorderedController = controllerService.updateOrderList(controllerId, newInputOrder.getIds(), true);
        ControllerResponseDTO updatedController  = ControllerMapperUtil.toDTO(reorderedController);
        return ResponseEntity.ok(new ApiResponse<>(200,
                "Input updated successfully", updatedController));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(), null));
        }
    }

    @PutMapping("/rearrangeOrder/{controllerId}/outputs")
    public ResponseEntity<?> rearrangeOutputOrder(@PathVariable Long controllerId, @RequestBody ReorderListDTO newOutputOrder) {
        try {

            // Check if the controller exists
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (controllerOptional.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found", null));
            }

            Controller reorderedController = controllerService.updateOrderList(controllerId, newOutputOrder.getIds(), false);
            ControllerResponseDTO updatedController  = ControllerMapperUtil.toDTO(reorderedController);
            return ResponseEntity.ok(new ApiResponse<>(200,
                    "Output updated successfully", updatedController));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500,
                    "An error occurred: " + e.getMessage(), null));
        }
    }

    @PutMapping("/useAsTemplate/{id}")
    public ResponseEntity<?> markAsTemplate(
            @PathVariable Long id,
            @RequestBody UseAsTemplateRequestDTO request
    ) {
        try {
            controllerService.updateUseAsTemplateFlag(id, request.isUseAsTemplate(), request.getTemplateName());
            return ResponseEntity.ok("Template flag updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating template flag: " + e.getMessage());
        }
    }

    @GetMapping("/templates")
    public ResponseEntity<?> getAllTemplateControllers() {
        try {
            List<Controller> templates = controllerService.getAllTemplates();
            List<ControllerResponseDTO> dtoList = templates.stream()
                    .map(ControllerMapperUtil::toDTO)
                    .toList();
            return ResponseEntity.ok(new ApiResponse<>(200, "Template controllers fetched", dtoList));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Error fetching templates: " + e.getMessage(), null));
        }
    }
}
