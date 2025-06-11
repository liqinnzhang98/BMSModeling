package com.example.demo.service;

import com.example.demo.model.Controller;
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
        System.out.println("deleted" + id);
    }

    public List<Controller> getAllControllersByProjectId(Long projectId) {
        return controllerRepository.findByProjectId(projectId);
    }

    public Controller updateOrderList(Long controllerId, List<Long> newOrder, boolean isInputOrder) {
        Controller controller = controllerRepository.findById(controllerId)
                .orElseThrow(() -> new RuntimeException("Controller not found with ID: " + controllerId));

        if (isInputOrder) {
            controller.setInputOrder(newOrder);
        } else {
            controller.setOutputOrder(newOrder);
        }
        controllerRepository.save(controller);

        return controller;
    }

    public void deleteFromOrderList(Long controllerId, Long IOid, boolean isInputOrder) {
        Controller controller = controllerRepository.findById(controllerId)
                .orElseThrow(() -> new RuntimeException("Controller not found with ID: " + controllerId));

        if (isInputOrder) {
            controller.getInputOrder().remove(IOid);
        } else {
            controller.getOutputOrder().remove(IOid);
        }
        controllerRepository.save(controller);
    }

    public void appendToOrderList(Long controllerId, Long IOid, boolean isInputOrder) {
        Controller controller = controllerRepository.findById(controllerId)
                .orElseThrow(() -> new RuntimeException("Controller not found with ID: " + controllerId));

        if (isInputOrder) {
            if ( !controller.getInputOrder().contains(IOid)) {
                controller.getInputOrder().add(IOid);
            }
        } else {
            if ( !controller.getOutputOrder().contains(IOid)) {
                controller.getOutputOrder().add(IOid);
            }
        }
        controllerRepository.save(controller);
    }

    public void updateUseAsTemplateFlag(Long controllerId, boolean useAsTemplate, String templateName) {
        Controller controller = controllerRepository.findById(controllerId)
                .orElseThrow(() -> new RuntimeException("Controller not found"));

        controller.setUseAsTemplate(useAsTemplate);
        controller.setTemplateName(templateName);
        controllerRepository.save(controller);
    }
    public List<Controller> getAllTemplates() {
        return controllerRepository.findByUseAsTemplateTrue();
    }
}