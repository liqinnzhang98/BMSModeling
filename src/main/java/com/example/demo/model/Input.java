package com.example.demo.model;

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

    public InputType getType() {
        return type;
    }

    public void setType(InputType type) {
        this.type = type;
    }
}
