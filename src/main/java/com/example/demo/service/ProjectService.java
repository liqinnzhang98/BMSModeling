package com.example.demo.service;

import com.example.demo.model.Project;
import com.example.demo.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsByUserEmail(String email) {
        return projectRepository.findByUserEmail(email);
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project saveProject(Project project) {
        return projectRepository.save(project);
    }

    public Optional<Project> updateProject(Long id, Project updatedProject) {
        return projectRepository.findById(id).map(existing -> {
            existing.setName(updatedProject.getName());
            existing.setRevision(updatedProject.getRevision());
            existing.setDate(updatedProject.getDate());
            existing.setJobNumber(updatedProject.getJobNumber());
            existing.setControllerList(updatedProject.getControllerList());
            existing.setUser(updatedProject.getUser());
            return projectRepository.save(existing);
        });
    }

    public boolean deleteProject(Long id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return true;
        }
        return false;
    }
}