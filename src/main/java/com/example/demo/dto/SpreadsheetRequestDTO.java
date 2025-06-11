package com.example.demo.dto;

import java.util.List;

public class SpreadsheetRequestDTO {
    private String name;
    private int orderInExcel;
    private String s3FileUrl;
    private List<Long> controllerIds;

    // --- Getters and Setters ---

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

    public List<Long> getControllerIds() {
        return controllerIds;
    }

    public void setControllerIds(List<Long> controllerIds) {
        this.controllerIds = controllerIds;
    }
}
