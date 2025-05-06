package com.example.demo.service;

import com.example.demo.dto.ProjectResponseDTO;
import com.example.demo.model.Project;
import com.example.demo.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Get projects by user email
    public List<Project> getProjectsByUserEmail(String email) {
        return projectRepository.findByUserEmail(email);
    }

    // Get a project by ID
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    // Save a project (used for both create and update)
    public Project saveProject(Project project) {
        return projectRepository.save(project);
    }

    // Update a project by ID
    public Optional<Project> updateProject(Long id, Project updatedProject) {
        return projectRepository.findById(id).map(existing -> {
            existing.setName(updatedProject.getName());
            existing.setRevision(updatedProject.getRevision());
            existing.setDate(updatedProject.getDate());
            existing.setJobNumber(updatedProject.getJobNumber());
            return projectRepository.save(existing);
        });
    }

    // Delete project by ID
    public boolean deleteProject(Long id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return true;
        }
        return false;
    }
}