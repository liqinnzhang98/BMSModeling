package com.example.demo.utils;

import com.example.demo.dto.ProjectRequestDTO;
import com.example.demo.dto.ProjectResponseDTO;
import com.example.demo.model.Project;
import com.example.demo.model.User;

public class ProjectMapperUtil {

    public static Project toEntity(ProjectRequestDTO dto, User user) {
        Project project = new Project();
        updateEntity(project, dto);
        project.setUser(user);
        return project;
    }

    public static ProjectResponseDTO toDTO(Project project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setRevision(project.getRevision());
        dto.setDate(project.getDate());
        dto.setJobNumber(project.getJobNumber());
        return dto;
    }

    public static void updateEntity(Project project, ProjectRequestDTO dto) {
        project.setName(dto.getName());
        project.setRevision(dto.getRevision());
        project.setDate(dto.getDate());
        project.setJobNumber(dto.getJobNumber());
    }
}
