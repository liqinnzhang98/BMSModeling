package com.example.demo.dto;

import com.example.demo.model.enums.CableType;
import com.example.demo.model.enums.InputType;

public class InputDTO {

    private Long id;
    private InputType inputType;  // New field for InputType
    private CableType cableType;
    private String controlTerminalsln;
    private String controlTerminalsCm;
    private String controllerPointDescription;
    private String ddcFieldDevice;
    private String fieldDeviceInputOutputType;
    private String specialNotesComments;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public InputType getInputType() {
        return inputType;
    }

    public void setInputType(InputType inputType) {
        this.inputType = inputType;
    }

    public String getControlTerminalsln() {
        return controlTerminalsln;
    }

    public void setControlTerminalsln(String controlTerminalsln) {
        this.controlTerminalsln = controlTerminalsln;
    }

    public String getControlTerminalsCm() {
        return controlTerminalsCm;
    }

    public void setControlTerminalsCm(String controlTerminalsCm) {
        this.controlTerminalsCm = controlTerminalsCm;
    }

    public String getDdcFieldDevice() {
        return ddcFieldDevice;
    }

    public void setDdcFieldDevice(String ddcFieldDevice) {
        this.ddcFieldDevice = ddcFieldDevice;
    }

    public String getFieldDeviceInputOutputType() {
        return fieldDeviceInputOutputType;
    }

    public void setFieldDeviceInputOutputType(String fieldDeviceInputOutputType) {
        this.fieldDeviceInputOutputType = fieldDeviceInputOutputType;
    }

    public String getSpecialNotesComments() {
        return specialNotesComments;
    }

    public void setSpecialNotesComments(String specialNotesComments) {
        this.specialNotesComments = specialNotesComments;
    }

    public CableType getCableType() { return this.cableType;
    }

    public void setCableType(CableType cableType) {
        this.cableType = cableType;
    }

    public String getControllerPointDescription() {
        return controllerPointDescription;
    }

    public void setControllerPointDescription(String controllerPointDescription) {
        this.controllerPointDescription = controllerPointDescription;
    }
}
