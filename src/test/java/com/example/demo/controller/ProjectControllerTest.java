package com.example.demo.controller;

import com.example.demo.dto.ProjectRequestDTO;
import com.example.demo.model.Project;
import com.example.demo.model.User;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Date;
import java.util.ArrayList;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private String authToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setName("Test User");
        userRepository.save(testUser);

        // Get UserDetails for token generation
        UserDetails userDetails = userDetailsService.loadUserByUsername(testUser.getEmail());
        // Add "Bearer " prefix to the token
        authToken = "Bearer " + jwtUtil.generateToken(userDetails);
    }

    // @Test
    // void createProject_Success() throws Exception {
    //     ProjectRequestDTO request = new ProjectRequestDTO();
    //     request.setName("Test Project");
    //     request.setRevision("1.0");
    //     request.setDate(new Date());
    //     request.setJobNumber("JOB-001");

    //     mockMvc.perform(post("/api/project")
    //             .header("Authorization", authToken)
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(objectMapper.writeValueAsString(request)))
    //             .andExpect(status().isCreated())
    //             .andExpect(jsonPath("$.status").value(201))
    //             .andExpect(jsonPath("$.message").value("Project created"));
    // }

    // @Test
    // void getAllProjects_Success() throws Exception {
    //     // Create a test project
    //     Project project = new Project();
    //     project.setName("Test Project");
    //     project.setRevision("1.0");
    //     project.setDate(new Date());
    //     project.setJobNumber("JOB-001");
    //     project.setUser(testUser);
    //     projectRepository.save(project);

    //     mockMvc.perform(get("/api/project")
    //             .header("Authorization", authToken))
    //             .andExpect(status().isOk())
    //             .andExpect(jsonPath("$.status").value(200))
    //             .andExpect(jsonPath("$.data").isArray())
    //             .andExpect(jsonPath("$.data[0].name").value("Test Project"));
    // }

    // @Test
    // void getProjectDetails_Success() throws Exception {
    //     // Create a test project
    //     Project project = new Project();
    //     project.setName("Test Project");
    //     project.setRevision("1.0");
    //     project.setDate(new Date());
    //     project.setJobNumber("JOB-001");
    //     project.setUser(testUser);
    //     projectRepository.save(project);

    //     mockMvc.perform(get("/api/project/" + project.getId())
    //             .header("Authorization", authToken))
    //             .andExpect(status().isOk())
    //             .andExpect(jsonPath("$.status").value(200))
    //             .andExpect(jsonPath("$.data.name").value("Test Project"));
    // }

    // @Test
    // void updateProject_Success() throws Exception {
    //     // Create a test project
    //     Project project = new Project();
    //     project.setName("Test Project");
    //     project.setRevision("1.0");
    //     project.setDate(new Date());
    //     project.setJobNumber("JOB-001");
    //     project.setUser(testUser);
    //     projectRepository.save(project);

    //     ProjectRequestDTO updateRequest = new ProjectRequestDTO();
    //     updateRequest.setName("Updated Project");
    //     updateRequest.setRevision("2.0");
    //     updateRequest.setDate(new Date());
    //     updateRequest.setJobNumber("JOB-002");

    //     mockMvc.perform(put("/api/project/" + project.getId())
    //             .header("Authorization", authToken)
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(objectMapper.writeValueAsString(updateRequest)))
    //             .andExpect(status().isOk())
    //             .andExpect(jsonPath("$.status").value(200))
    //             .andExpect(jsonPath("$.message").value("Project updated"));
    // }

    // @Test
    // void deleteProject_Success() throws Exception {
    //     // Create a test project
    //     Project project = new Project();
    //     project.setName("Test Project");
    //     project.setRevision("1.0");
    //     project.setDate(new Date());
    //     project.setJobNumber("JOB-001");
    //     project.setUser(testUser);
    //     projectRepository.save(project);

    //     mockMvc.perform(delete("/api/project/" + project.getId())
    //             .header("Authorization", authToken))
    //             .andExpect(status().isOk())
    //             .andExpect(jsonPath("$.status").value(200))
    //             .andExpect(jsonPath("$.message").value("Project deleted successfully"));
    // }

    // @Test
    // void getProjectDetails_NotFound() throws Exception {
    //     mockMvc.perform(get("/api/project/999")
    //             .header("Authorization", authToken))
    //             .andExpect(status().isNotFound())
    //             .andExpect(jsonPath("$.status").value(404));
    // }
} 