package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.*;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.*;
import com.example.demo.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            if (!projectOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Project not found", null));
            }

            Project project = projectOptional.get();

            // Map the DTO to the entity
            Controller controller = ControllerMapperUtil.toEntity(requestDTO, user, project);

            // Save the controller to the database
            Controller savedController = controllerService.saveController(controller);

            // Return success response
            ControllerResponseDTO responseDTO = ControllerMapperUtil.toDTO(savedController);
            return ResponseEntity.status(201).body(new ApiResponse<>(201, "Controller created successfully", responseDTO));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
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
            if (!controllerOptional.isPresent()) {
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

            Controller updatedController = controllerService.saveController(controller);


            return ResponseEntity.ok(new ApiResponse<>(
                    200,
                    "Controller deleted successfully",
                    null));

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
            if (!projectOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Project not found",
                        null));
            }

            Project project = projectOptional.get();

            // Fetch the Controller entity
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
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

    @GetMapping("/projectControllers/{projectId}/")
    public ResponseEntity<?> getControllersByProject(@PathVariable Long projectId) {
        try {
            // Check if the project exists
            Project project = projectService.getProjectById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Retrieve the list of controllers for the project
            List<Controller> controllers = controllerService.getControllersByProject(project);
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
    public ResponseEntity<?> createInput(@PathVariable Long controllerId,
                                         @RequestBody InputDTO inputDTO) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }

            Input inputToCreate = InputMapperUtil.toEntity(inputDTO);
            inputToCreate.setController(controllerOptional.get());

            Input createdInput = inputService.saveInput(inputToCreate);
            InputDTO createdDTO = InputMapperUtil.toDTO(createdInput);

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
    public ResponseEntity<?> createOutput(@PathVariable Long controllerId,
                                          @RequestBody OutputDTO outputDTO) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404,
                        "Controller not found",
                        null));
            }

            Output outputToCreate = OutputMapperUtil.toEntity(outputDTO);
            outputToCreate.setController(controllerOptional.get());

            Output createdOutput = outputService.saveOutput(outputToCreate);
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
    public ResponseEntity<?> getControllerById(@PathVariable Long controllerId) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Controller not found", null));
            }

            ControllerResponseDTO responseDTO = ControllerMapperUtil.toDTO(controllerOptional.get());
            return ResponseEntity.ok(new ApiResponse<>(200, "Controller retrieved successfully", responseDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }

    // Delete input by controller ID and input ID
    @Operation(
            summary = "Deletes an input from a controller, controller ID and input ID are required"
    )
    @DeleteMapping("/deleteInput/{controllerId}/{inputId}")
    public ResponseEntity<?> deleteInput(@PathVariable Long controllerId, @PathVariable Long inputId) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Controller not found", null));
            }

            Optional<Input> inputOptional = inputService.getInputById(inputId);
            if (!inputOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Input not found", null));
            }

            // Remove the input from the controller
            inputService.deleteInput(inputId);

            return ResponseEntity.ok(new ApiResponse<>(200, "Input deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }

    // Delete output by controller ID and output ID
    @Operation(
            summary = "Deletes an output from a controller, controller ID and output ID are required"
    )
    @DeleteMapping("/deleteOutput/{controllerId}/{outputId}")
    public ResponseEntity<?> deleteOutput(@PathVariable Long controllerId, @PathVariable Long outputId) {
        try {
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Controller not found", null));
            }

            Optional<Output> outputOptional = outputService.getOutputById(outputId);
            if (!outputOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Output not found", null));
            }

            // Remove the output from the controller
            outputService.deleteOutput(outputId);

            return ResponseEntity.ok(new ApiResponse<>(200, "Output deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }

    // Update Input by controller ID and input ID
    @Operation(
            summary = "Updates an input in a controller"
    )
    @PutMapping("/updateInput/{controllerId}/{inputId}")
    public ResponseEntity<?> updateInput(@PathVariable Long controllerId,
                                         @PathVariable Long inputId,
                                         @RequestBody InputDTO inputDTO) {
        try {
            // Check if the controller exists
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Controller not found", null));
            }

            // Check if the input exists
            Optional<Input> inputOptional = inputService.getInputById(inputId);
            if (!inputOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Input not found", null));
            }

            // Convert DTO to entity and set IDs and controller
            Input inputToUpdate = InputMapperUtil.toEntity(inputDTO);
            inputToUpdate.setId(inputId);
            inputToUpdate.setController(controllerOptional.get());

            // Save updated input
            Input updatedInput = inputService.updateInput(inputToUpdate);

            // Convert back to DTO
            InputDTO updatedInputDTO = InputMapperUtil.toDTO(updatedInput);

            return ResponseEntity.ok(new ApiResponse<>(200, "Input updated successfully", updatedInputDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }


    // Update Output by controller ID and output ID
    @Operation(
            summary = "Updates an output in a controller"
    )
    @PutMapping("/updateOutput/{controllerId}/{outputId}")
    public ResponseEntity<?> updateOutput(@PathVariable Long controllerId,
                                          @PathVariable Long outputId,
                                          @RequestBody OutputDTO outputDTO) {
        try {
            // Check if the controller exists
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Controller not found", null));
            }

            // Check if the input exists
            Optional<Output> outputOptional = outputService.getOutputById(outputId);
            if (!outputOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Output not found", null));
            }

            // Convert DTO to entity and set IDs and controller
            Output outputToUpdate = OutputMapperUtil.toEntity(outputDTO);
            outputToUpdate.setId(outputId);
            outputToUpdate.setController(controllerOptional.get());

            // Save updated input
            Output updatedOutput = outputService.updateOutput(outputToUpdate);

            // Convert back to DTO
            OutputDTO updatedInputDTO = OutputMapperUtil.toDTO(updatedOutput);

            return ResponseEntity.ok(new ApiResponse<>(200, "Input updated successfully", updatedInputDTO));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }
}
