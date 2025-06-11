package com.example.demo.dto;

import java.util.List;

public class SpreadsheetResponseDTO {
    private Long id;
    private String name;
    private int orderInExcel;
    // private String s3FileUrl;
    private List<Long> controllerIds;
    private List<Long> controllerOrder;
    private Long projectId;

    // Getters and Setters

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

    // public String getS3FileUrl() {
    //     return s3FileUrl;
    // }

    // public void setS3FileUrl(String s3FileUrl) {
    //     this.s3FileUrl = s3FileUrl;
    // }

    public List<Long> getControllerIds() {
        return controllerIds;
    }

    public void setControllerIds(List<Long> controllerIds) {
        this.controllerIds = controllerIds;
    }

    public List<Long> getControllerOrder() {
        return controllerOrder;
    }

    public void setControllerOrder(List<Long> controllerOrder) {
        this.controllerOrder = controllerOrder;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

}
