package com.example.demo.controller;

import com.example.demo.dto.ControllerRequestDTO;
import com.example.demo.dto.ControllerResponseDTO;
import com.example.demo.model.Controller;
import com.example.demo.model.Project;
import com.example.demo.model.User;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ControllerMapperUtil;
import com.example.demo.service.JwtUtil;
import com.example.demo.service.ControllerService;
import com.example.demo.response.ApiResponse;
import com.example.demo.service.ProjectService;
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

    @Autowired
    public ControllerController(ControllerService controllerService, ProjectService projectService, JwtUtil jwtUtil,
                                UserRepository userRepository, ProjectRepository projectRepository) {
        this.controllerService = controllerService;
        this.projectService = projectService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    @Operation(
            summary = "creates a controller, project Id and controller with Inputs and Outputs are required"
    )
    @PostMapping("/{projectId}/createController")
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
            summary = "updates a controller, project Id and controller Id and Controller parameters are required"
    )

    @PutMapping("/{projectId}/updateController/{controllerId}")
    public ResponseEntity<?> updateController(@RequestHeader("Authorization") String token,
                                              @PathVariable Long projectId,
                                              @PathVariable Long controllerId,
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

            // Fetch the Controller entity
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Controller not found", null));
            }

            Controller controller = controllerOptional.get();

            // Update the controller entity
            ControllerMapperUtil.updateEntity(controller, requestDTO);

            // Save the updated controller
            Controller updatedController = controllerService.saveController(controller);

            // Return success response
            ControllerResponseDTO responseDTO = ControllerMapperUtil.toDTO(updatedController);
            return ResponseEntity.ok(new ApiResponse<>(200, "Controller updated successfully", responseDTO));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }

    @Operation(
            summary = "deletes a controller, project Id and controller Id are required"
    )
    @DeleteMapping("/{projectId}/{controllerId}")
    public ResponseEntity<?> deleteController(@RequestHeader("Authorization") String token,
                                              @PathVariable Long projectId,
                                              @PathVariable Long controllerId) {
        try {
            String email = extractEmailFromToken(token);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            // Fetch the Project entity
            Optional<Project> projectOptional = projectRepository.findById(projectId);
            if (!projectOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Project not found", null));
            }

            Project project = projectOptional.get();

            // Fetch the Controller entity
            Optional<Controller> controllerOptional = controllerService.getControllerById(controllerId);
            if (!controllerOptional.isPresent()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Controller not found", null));
            }

            // Delete the controller
            controllerService.deleteController(controllerId);

            return ResponseEntity.ok(new ApiResponse<>(200, "Controller deleted successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }

    @Operation(
            summary = "returns are controllers involved with one single project"
    )
    @GetMapping("/projectControls/{projectId}/")
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

            return ResponseEntity.ok(new ApiResponse<>(200, "Controllers retrieved successfully", dtoList));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }


}
