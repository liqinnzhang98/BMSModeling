package com.example.demo.service;

import com.example.demo.model.Controller;
import com.example.demo.model.Project;
import com.example.demo.repository.ControllerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ControllerService {

    private final ControllerRepository controllerRepository;

    @Autowired
    public ControllerService(ControllerRepository controllerRepository) {
        this.controllerRepository = controllerRepository;
    }

    public Controller saveController(Controller controller) {
        return controllerRepository.save(controller);
    }

    public Optional<Controller> getControllerById(Long id) {
        return controllerRepository.findById(id);
    }

    public void deleteController(Long id) {
        controllerRepository.deleteById(id);
    }

    public List<Controller> getAllControllersByProjectId(Long projectId) {
        return controllerRepository.findByProjectId(projectId);
    }
}