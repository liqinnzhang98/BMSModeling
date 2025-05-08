package com.example.demo.service;

import com.example.demo.model.Controller;
import com.example.demo.model.Input;
import com.example.demo.model.Output;
import com.example.demo.model.Project;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;


@Service
public class ExcelExportService {

    public ByteArrayInputStream exportControllersToExcel(Project project, List<Controller> controllers) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Controllers");
            int rowIdx = 0;
            // Add project details
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Project Name: " + project.getName());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Revision: " + project.getRevision());
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Date: " + (project.getDate() != null ? project.getDate().toString() : ""));
            sheet.createRow(rowIdx++).createCell(0).setCellValue("Job Number: " + project.getJobNumber());

            rowIdx += 2; // Add space before controller data

            for (Controller controller : controllers) {
                // Controller section
                sheet.createRow(rowIdx++).createCell(0).setCellValue("Controller: " + controller.getName());
                sheet.createRow(rowIdx++).createCell(0).setCellValue("Model Number: " + controller.getModelNumber());
                sheet.createRow(rowIdx++).createCell(0).setCellValue("Configuration: " + controller.getConfiguration());
                rowIdx++; // Empty row

                // Inputs header
                Row inputHeader = sheet.createRow(rowIdx++);
                inputHeader.createCell(0).setCellValue("Input Type");
                inputHeader.createCell(1).setCellValue("Cable Type");
                inputHeader.createCell(2).setCellValue("Control Terminals IN");
                inputHeader.createCell(3).setCellValue("Control Terminals CM");
                inputHeader.createCell(4).setCellValue("Description");
                inputHeader.createCell(5).setCellValue("Notes");

                for (Input input : controller.getInputList()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(input.getType() != null ? input.getType().toString() : "");
                    row.createCell(1).setCellValue(input.getCableType() != null ? input.getCableType().toString() : "");
                    row.createCell(2).setCellValue(input.getControlTerminalsln());
                    row.createCell(3).setCellValue(input.getControlTerminalsCm());
                    row.createCell(4).setCellValue(input.getControllerPointDescription());
                    row.createCell(5).setCellValue(input.getSpecialNotesComments());
                }

                rowIdx++; // Space before outputs

                // Outputs header
                Row outputHeader = sheet.createRow(rowIdx++);
                outputHeader.createCell(0).setCellValue("Output Type");
                outputHeader.createCell(1).setCellValue("Cable Type");
                outputHeader.createCell(2).setCellValue("Control Terminals");
                outputHeader.createCell(3).setCellValue("Description");
                outputHeader.createCell(4).setCellValue("Notes");

                for (Output output : controller.getOutputList()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(output.getType() != null ? output.getType().toString() : "");
                    row.createCell(1).setCellValue(output.getCableType() != null ? output.getCableType().toString() : "");
                    row.createCell(2).setCellValue(output.getControlTerminalsln());
                    row.createCell(3).setCellValue(output.getControlTerminalsCm());
                    row.createCell(4).setCellValue(output.getControllerPointDescription());
                    row.createCell(5).setCellValue(output.getSpecialNotesComments());
                }

                rowIdx += 2; // Gap between controllers
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel file: " + e.getMessage(), e);
        }
    }
}
