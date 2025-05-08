package com.example.demo.model;

import com.example.demo.model.enums.CableType;
import com.example.demo.model.enums.InputType;
import jakarta.persistence.*;

@Entity
@Table(name = "input")

public class Input extends IOComponent{

    @Enumerated(EnumType.STRING)
    private InputType type;

    @ManyToOne
    @JoinColumn(name = "controller_id")
    private Controller controller;
    public Input() {
    }
    public Input(InputType inputType, CableType cableType, String controlTerminalsln, String controlTerminalsCm, String controllerPointDescription, String ddcFieldDevice, String specialNotesComments, String fieldDeviceInputOutputType) {
        super();
    }

    public InputType getType() {
        return type;
    }

    public void setType(InputType type) {
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
