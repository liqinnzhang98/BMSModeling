package com.example.demo.dto;

import java.util.List;

// for the use of creating new Controller with lists of input and output.
public class ControllerRequestDTO {
    private String name;
    private String modelNumber;
    private String configuration;
    private List<InputDTO> inputList;
    private List<OutputDTO> outputList;

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

}
