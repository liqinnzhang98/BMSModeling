package com.example.demo.dto;

import com.example.demo.model.Controller;
import com.example.demo.model.Input;
import com.example.demo.model.Output;
import com.example.demo.model.enums.CableType;

import java.util.ArrayList;
import java.util.List;
import java.util.Date;

public class ControllerResponseDTO {

    private Long id;
    private String name;
    private String modelNumber;
    private String configuration;
    private List<Long> inputOrder;
    private List<Long> outputOrder;
    private Boolean useAsTemplate;
    private Boolean isCreatedFromTemplate;
    private String templateCreatedFrom;
    private String templateName;
    private Long parentControllerId;
    private List<Long> childControllers;
    private String authorName;
    private String projectName;
    private Date dateCreated;
    private List<InputDTO> inputList;  // List of inputs associated with the controller
    private List<OutputDTO> outputList;  // List of outputs associated with the controller

    // Constructor
    public ControllerResponseDTO(Long id, String name, String modelNumber, String configuration,
                                 List<InputDTO> inputList, List<OutputDTO> outputList) {
        this.id = id;
        this.name = name;
        this.modelNumber = modelNumber;
        this.configuration = configuration;
        this.inputList = inputList;
        this.outputList = outputList;
    }

    public ControllerResponseDTO() {

    }


    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModelNumber() {
        return modelNumber;
    }

    public void setModelNumber(String modelNumber) {
        this.modelNumber = modelNumber;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    public List<InputDTO> getInputList() {
        return inputList;
    }

    public void setInputList(List<InputDTO> inputList) {
        this.inputList = inputList;
    }

    public List<OutputDTO> getOutputList() {
        return outputList;
    }

    public void setOutputList(List<OutputDTO> outputList) {
        this.outputList = outputList;
    }

    public List<Long> getInputOrder() {
        return inputOrder;
    }

    public void setInputOrder(List<Long> inputOrder) {
        this.inputOrder = inputOrder;
    }

    public List<Long> getOutputOrder() {
        return outputOrder;
    }

    public void setOutputOrder(List<Long> outputOrder) {
        this.outputOrder = outputOrder;
    }

    public Boolean getUseAsTemplate() {
        return useAsTemplate;
    }

    public void setUseAsTemplate(Boolean useAsTemplate) {
        this.useAsTemplate = useAsTemplate;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public Long getParentControllerId() {
        return parentControllerId;
    }

    public void setParentControllerId(Long parentControllerId) {
        this.parentControllerId = parentControllerId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Date getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(Date dateCreated) {
        this.dateCreated = dateCreated;
    }

    public Boolean getIsCreatedFromTemplate() {
        return isCreatedFromTemplate;
    }

    public void setIsCreatedFromTemplate(Boolean createdFromTemplate) {
        this.isCreatedFromTemplate = createdFromTemplate;
    }

    public String getTemplateCreatedFrom() {
        return templateCreatedFrom;
    }

    public void setTemplateCreatedFrom(String templateCreatedFrom) {
        this.templateCreatedFrom = templateCreatedFrom;
    }

    public List<Long> getChildControllers() {
        return childControllers;
    }

    public void setChildControllers(List<Long> childControllers) {
        this.childControllers = childControllers;
    }
}
