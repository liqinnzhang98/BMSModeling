package com.example.demo.model;

import com.example.demo.model.enums.CableType;
import jakarta.persistence.*;

@MappedSuperclass
public class IOComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private CableType cableType;

    private String controlTerminalsln;
    private String controlTerminalsCm;
    private String ddcFieldDevice;
    private String fieldDeviceInputOutputType;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CableType getCableType() {
        return cableType;
    }

    public void setCableType(CableType cableType) {
        this.cableType = cableType;
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

    private String specialNotesComments;

}
