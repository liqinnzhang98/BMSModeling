package com.example.demo.model;


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


    public OutputType getType() {
        return type;
    }

    public void setType(OutputType type) {
        this.type = type;
    }
}
