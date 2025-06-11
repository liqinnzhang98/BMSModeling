package com.example.demo.utils;

import java.util.List;
import java.util.stream.Collectors;

import com.example.demo.dto.SpreadsheetResponseDTO;
import com.example.demo.model.Controller;
import com.example.demo.model.Spreadsheet;

public class SpreadsheetMapperUtil {

    public static SpreadsheetResponseDTO toDTO(Spreadsheet spreadsheet) {
        SpreadsheetResponseDTO dto = new SpreadsheetResponseDTO();
        dto.setId(spreadsheet.getId());
        dto.setName(spreadsheet.getName());
        dto.setOrderInExcel(spreadsheet.getOrderInExcel());
        dto.setControllerOrder(spreadsheet.getControllerOrder());
        // dto.setS3FileUrl(spreadsheet.getS3FileUrl());

        // Extract controller IDs
        List<Long> controllerIds = spreadsheet.getControllers()
                .stream()
                .map(Controller::getId)
                .collect(Collectors.toList());
        dto.setControllerIds(controllerIds);

        // Extract project ID
        if (spreadsheet.getProject() != null) {
            dto.setProjectId(spreadsheet.getProject().getId());
        }

        return dto;
    }
}
