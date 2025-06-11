package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.response.ApiResponse;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.SpreadsheetRepository;
import com.example.demo.dto.SpreadsheetRequestDTO;
import com.example.demo.dto.SpreadsheetResponseDTO;
import com.example.demo.model.Controller;
import com.example.demo.model.Project;
import com.example.demo.model.Spreadsheet;
import com.example.demo.repository.ControllerRepository;
import com.example.demo.service.SpreadsheetService;
import com.example.demo.utils.SpreadsheetMapperUtil;


@RestController
@RequestMapping("/api/spreadsheets")
public class SpreadsheetController {

    private final SpreadsheetService spreadsheetService;
    private final ProjectRepository projectRepository;
    private final SpreadsheetRepository spreadsheetRepository;
    private final ControllerRepository controllerRepository;

    @Autowired
    public SpreadsheetController(SpreadsheetService spreadsheetService,
                                 ProjectRepository projectRepository,
                                 ControllerRepository controllerRepository,
                                 SpreadsheetRepository spreadsheetRepository) {
        this.spreadsheetService = spreadsheetService;
        this.projectRepository = projectRepository;
        this.spreadsheetRepository = spreadsheetRepository;
        this.controllerRepository = controllerRepository;
    }

    @PostMapping("/create/{projectId}")
    public ResponseEntity<?> createSpreadsheet(@RequestHeader("Authorization") String token,
                                                @PathVariable Long projectId,
                                               @RequestBody SpreadsheetRequestDTO dto) {
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            List<Controller> controllers = controllerRepository.findAllById(dto.getControllerIds());

            // If orderInExcel is 0, delete all existing spreadsheets under the project (safely)
            if (dto.getOrderInExcel() == 0) {
                List<Spreadsheet> existing = spreadsheetRepository.findByProjectId(projectId);
                if (existing != null && !existing.isEmpty()) {
                    spreadsheetRepository.deleteAll(existing);
                }
            }

            spreadsheetService.saveSpreadsheetWithControllers(
                    dto,
                    controllers,
                    project
            );

            return ResponseEntity.status(200).body(new ApiResponse<>(200, "Spreadsheet created", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(500, "Error: " + e.getMessage(), null));
        }
    }

    @GetMapping("/fetchByProject/{projectId}")
    public ResponseEntity<?> getSpreadsheetsByProjectId(@PathVariable Long projectId) {
        try {
            List<Spreadsheet> spreadsheets = spreadsheetRepository.findByProjectId(projectId);

            if (spreadsheets.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(404, "No spreadsheets found for project ID: " + projectId, null));
            }

            // Optional: map to DTOs if needed
            List<SpreadsheetResponseDTO> dtoList = spreadsheets.stream()
                    .map(SpreadsheetMapperUtil::toDTO)
                    .toList();

            return ResponseEntity.ok(new ApiResponse<>(200, "Spreadsheets retrieved successfully", dtoList));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, "Error retrieving spreadsheets: " + e.getMessage(), null));
        }
    }
}
