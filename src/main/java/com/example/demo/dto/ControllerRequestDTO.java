package com.example.demo.dto;

import com.example.demo.model.Controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

// for the use of creating new Controller with lists of input and output.
public class ControllerRequestDTO {
    private String name;
    private String modelNumber;
    private String configuration;
    private List<InputDTO> inputList;
    private List<OutputDTO> outputList;
    private Long parentControllerId;
    private Boolean isCreatedFromTemplate;
    private Date dateCreated;
    private String templateCreatedFrom;
    private List<Long> childControllers = new ArrayList<>();

    // Getters and Setters
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

    public Long getParentControllerId() {
        return parentControllerId;
    }

    public void setParentControllerId(Long parentControllerId) {
        this.parentControllerId = parentControllerId;
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
