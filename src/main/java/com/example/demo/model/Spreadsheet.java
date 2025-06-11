package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

@Entity
public class Spreadsheet{                    

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int orderInExcel; // order of spreadsheet in the Excel file

    private String s3FileUrl; // link to the Excel file stored in S3

    @ManyToMany
    @JoinTable(
        name = "spreadsheet_controller",
        joinColumns = @JoinColumn(name = "spreadsheet_id"),
        inverseJoinColumns = @JoinColumn(name = "controller_id")
    )
    private List<Controller> controllers = new ArrayList<>();

    @ElementCollection
    private List<Long> controllerOrder = new ArrayList<>(); // stores controller IDs in order

    @ManyToOne
    private Project project;

    // --- Getters and Setters ---

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

    public int getOrderInExcel() {
        return orderInExcel;
    }

    public void setOrderInExcel(int orderInExcel) {
        this.orderInExcel = orderInExcel;
    }

    public String getS3FileUrl() {
        return s3FileUrl;
    }

    public void setS3FileUrl(String s3FileUrl) {
        this.s3FileUrl = s3FileUrl;
    }

    public List<Controller> getControllers() {
        return controllers;
    }

    public void setControllers(List<Controller> controllers) {
        this.controllers = controllers;
    }

    public List<Long> getControllerOrder() {
        return controllerOrder;
    }

    public void setControllerOrder(List<Long> controllerOrder) {
        this.controllerOrder = controllerOrder;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }
}
