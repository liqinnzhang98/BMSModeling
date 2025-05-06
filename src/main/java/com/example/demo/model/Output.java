package com.example.demo.model;


import com.example.demo.model.enums.CableType;
import com.example.demo.model.enums.OutputType;
import jakarta.persistence.*;

@Entity
@Table(name = "output")

public class Output extends IOComponent {

    @Enumerated(EnumType.STRING)
    private OutputType type;

    @ManyToOne
    @JoinColumn(name = "controller_id")
    private Controller controller;
    public Output() {

    }
    public Output(OutputType outputType, CableType cableType, String controlTerminalsln, String controlTerminalsCm, String controllerPointDescription, String ddcFieldDevice, String specialNotesComments, String fieldDeviceInputOutputType) {
        super();
    }
    public OutputType getType() {
        return type;
    }
    public void setType(OutputType type) {
        this.type = type;
    }
    public Controller getController() {
        return controller;
    }
    @Override
    public void setController(Controller controller) {
        this.controller = controller;
    }
}
