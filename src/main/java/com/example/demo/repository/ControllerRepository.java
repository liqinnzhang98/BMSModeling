package com.example.demo.repository;

import com.example.demo.model.Controller;
import com.example.demo.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ControllerRepository extends JpaRepository<Controller, Long> {
    List<Controller> findByProjectId(Long projectId);
    List<Controller> findByUseAsTemplateTrue();
}