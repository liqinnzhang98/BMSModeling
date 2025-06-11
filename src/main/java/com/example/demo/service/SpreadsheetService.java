package com.example.demo.service;



import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.SpreadsheetRequestDTO;
import com.example.demo.model.Controller;
import com.example.demo.model.Project;
import com.example.demo.model.Spreadsheet;
import com.example.demo.repository.SpreadsheetRepository;

@Service
public class SpreadsheetService {

    private final SpreadsheetRepository spreadsheetRepository;

    @Autowired
    public SpreadsheetService(SpreadsheetRepository spreadsheetRepository) {
        this.spreadsheetRepository = spreadsheetRepository;
    }
    

    public Spreadsheet saveSpreadsheetWithControllers(SpreadsheetRequestDTO dto, List<Controller> controllers, Project project) {
        Spreadsheet spreadsheet = new Spreadsheet();
        spreadsheet.setName(dto.getName());
        spreadsheet.setOrderInExcel(dto.getOrderInExcel());
        // spreadsheet.setS3FileUrl(s3FileUrl);
        spreadsheet.setProject(project);
        spreadsheet.setControllers(controllers);
        spreadsheet.setControllerOrder(dto.getControllerIds());

        return spreadsheetRepository.save(spreadsheet);
    }
}
