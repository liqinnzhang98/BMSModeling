package com.example.demo.dto;

import com.example.demo.model.Input;
import com.example.demo.model.Output;
import com.example.demo.model.enums.CableType;

import java.util.List;

public class ControllerResponseDTO {

    private Long id;
    private String name;
    private String modelNumber;
    private String configuration;
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
}
