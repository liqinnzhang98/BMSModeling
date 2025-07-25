package com.example.demo.controller;

import com.example.demo.dto.ProjectRequestDTO;
import com.example.demo.dto.ProjectResponseDTO;
import com.example.demo.model.Controller;
import com.example.demo.model.Project;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.response.ApiResponse;
import com.example.demo.service.ControllerService;
import com.example.demo.service.ExcelExportService;
import com.example.demo.utils.JwtUtil;
import com.example.demo.utils.ProjectMapperUtil;
import com.example.demo.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/project")
public class ProjectController {

    private final ProjectService projectService;
    private final ControllerService controllerService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private ExcelExportService excelExportService;

    @Autowired
    public ProjectController(ProjectService projectService, JwtUtil jwtUtil, UserRepository userRepository
    , ControllerService controllerService, ExcelExportService excelExportService) {
        this.projectService = projectService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.controllerService = controllerService;
        this.excelExportService = new ExcelExportService();
    }

    @Operation(
            summary = "returns all projects"
    )
    @GetMapping
    public ResponseEntity<?> getAllProjects(@RequestHeader("Authorization") String token) {
        try {
            String email = extractEmailFromToken(token);
            List<Project> projects = projectService.getAllProjects();
            List<ProjectResponseDTO> dtoList = projects.stream()
                    .map(ProjectMapperUtil::toDTO)
                    .toList();
            return ResponseEntity.ok(new ApiResponse<>(200, "Projects retrieved successfully", dtoList));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Failed to retrieve projects: " + e.getMessage(), null));
        }
    }

    @Operation(
            summary = "creates a project"
    )
    @PostMapping
    public ResponseEntity<?> createProject(
            @RequestHeader("Authorization") String token,
            @RequestBody ProjectRequestDTO requestDTO) {
        try {
            String email = extractEmailFromToken(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Project project = ProjectMapperUtil.toEntity(requestDTO, user);
            Project savedProject = projectService.saveProject(project);
            return ResponseEntity.status(201)
                    .body(new ApiResponse<>(201, "Project created", ProjectMapperUtil.toDTO(savedProject)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new ApiResponse<>(400, "Error creating project: " + e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Server error: " + e.getMessage(), null));
        }
    }

    @Operation(
            summary = "Updates a project by entering its project Id"
    )
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody ProjectRequestDTO requestDTO) {
        try {
            return projectService.getProjectById(id).map(project -> {
                ProjectMapperUtil.updateEntity(project, requestDTO);
                Project updated = projectService.saveProject(project);
                return ResponseEntity.ok(new ApiResponse<>(200, "Project updated", ProjectMapperUtil.toDTO(updated)));
            }).orElse(ResponseEntity.status(404).body(new ApiResponse<>(404, "Project not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Error updating project: " + e.getMessage(), null));
        }
    }

    @Operation(
            summary = "deletes a project by project Id"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            boolean deleted = projectService.deleteProject(id);
            if (deleted) {
                return ResponseEntity.ok(new ApiResponse<>(200, "Project deleted successfully", null));
            }
            return ResponseEntity.status(404).body(new ApiResponse<>(404, "Project not found", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Error deleting project: " + e.getMessage(), null));
        }
    }

    private String extractEmailFromToken(String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            return jwtUtil.extractUsername(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token");
        }
    }

    @Operation(
            summary = "Retrieve project details by project ID"
    )
    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProjectDetails(@RequestHeader("Authorization") String token, @PathVariable Long projectId) {
        try {
            // Extract email from the token
            String email = extractEmailFromToken(token);

            // Check if the user exists
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Retrieve the project by projectId
            Optional<Project> projectOpt = projectService.getProjectById(projectId);
            if (projectOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Project not found", null));
            }

            Project project = projectOpt.get();
            // Ensure that the project belongs to the current user
            if (!project.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(new ApiResponse<>(403, "You are not authorized to view this project", null));
            }

            // Convert the project entity to DTO for response
            ProjectResponseDTO projectResponseDTO = ProjectMapperUtil.toDTO(project);

            return ResponseEntity.ok(new ApiResponse<>(200, "Project details retrieved successfully", projectResponseDTO));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Error retrieving project details: " + e.getMessage(), null));
        }
    }

    @GetMapping("/exportProject/{projectId}")
    public ResponseEntity<?> exportProjectToExcel(@PathVariable Long projectId) {
        try {
            // Fetch the project
            Optional<Project> projectOpt = projectService.getProjectById(projectId);
            if (projectOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ApiResponse<>(404, "Project not found", null));
            }
            Project project = projectOpt.get();

            // Fetch controllers with inputs and outputs
            List<Controller> controllers = controllerService.getAllControllersByProjectId(projectId);

            // Export to Excel
            ByteArrayInputStream excelFile = excelExportService.exportControllersToExcel(project, controllers);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=project_" + projectId + "_export.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(excelFile));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Failed to export Excel: " + e.getMessage(), null));
        }
    }
}