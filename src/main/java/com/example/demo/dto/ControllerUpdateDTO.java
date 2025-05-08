package com.example.demo.dto;

import java.util.List;

// for the use of updating controller details except the list of inputs and outputs
public class ControllerUpdateDTO {
    private String name;
    private String modelNumber;
    private String configuration;

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
}
