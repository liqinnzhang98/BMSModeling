package com.example.demo.utils;

import com.example.demo.dto.ControllerResponseDTO;
import com.example.demo.dto.InputDTO;
import com.example.demo.dto.OutputDTO;
import com.example.demo.dto.ControllerRequestDTO;
import com.example.demo.model.*;
import com.example.demo.service.ControllerService;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class ControllerMapperUtil {

    private static ControllerService controllerService;

    public ControllerMapperUtil(ControllerService controllerService) {
        ControllerMapperUtil.controllerService = controllerService;
    }

    // Method to map Controller entity to ControllerRequestDTO

    // Method to map Controller entity to ControllerResponseDTO
    public static ControllerResponseDTO toDTO(Controller controller) {
        ControllerResponseDTO dto = new ControllerResponseDTO();
        dto.setId(controller.getId());
        dto.setName(controller.getName());
        dto.setModelNumber(controller.getModelNumber());
        dto.setConfiguration(controller.getConfiguration());
        dto.setUseAsTemplate(controller.isUseAsTemplate());
        dto.setIsCreatedFromTemplate(controller.getIsCreatedFromTemplate());
        dto.setTemplateName(controller.getTemplateName());
        dto.setInputOrder(controller.getInputOrder());
        dto.setOutputOrder(controller.getOutputOrder());
        dto.setAuthorName(controller.getAuthor().getEmail());
        dto.setProjectName(controller.getProject().getName());
        dto.setDateCreated(controller.getDateCreated());
        dto.setTemplateCreatedFrom(controller.getTemplateCreatedFrom());
        dto.setChildControllers(controller.getChildControllers());

        // Safe check for parent controller
        if (controller.getParentController() != null) {
            dto.setParentControllerId(controller.getParentController().getId());
        } else {
            dto.setParentControllerId(null); // or handle as needed
        }

        // Map inputList to InputDTO
        dto.setInputList(controller.getInputList().stream()
                .map(ControllerMapperUtil::toInputDTO)
                .collect(Collectors.toList()));

        // Map outputList to OutputDTO
        dto.setOutputList(controller.getOutputList().stream()
                .map(ControllerMapperUtil::toOutputDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    // Helper method to map Input entity to InputDTO
    public static InputDTO toInputDTO(Input input) {
        InputDTO inputDTO = new InputDTO();
        inputDTO.setId(input.getId());
        inputDTO.setInputType(input.getType());  // Map InputType
        inputDTO.setCableType(input.getCableType());
        inputDTO.setControlTerminalsln(input.getControlTerminalsln());
        inputDTO.setControlTerminalsCm(input.getControlTerminalsCm());
        inputDTO.setControllerPointDescription(input.getControllerPointDescription());
        inputDTO.setDdcFieldDevice(input.getDdcFieldDevice());
        inputDTO.setFieldDeviceInputOutputType(input.getFieldDeviceInputOutputType());
        inputDTO.setSpecialNotesComments(input.getSpecialNotesComments());
        return inputDTO;
    }

    // Helper method to map Output entity to OutputDTO
    public static OutputDTO toOutputDTO(Output output) {
        OutputDTO outputDTO = new OutputDTO();
        outputDTO.setId(output.getId());
        outputDTO.setOutputType(output.getType());  // Map OutputType
        outputDTO.setCableType(output.getCableType());
        outputDTO.setControlTerminalsln(output.getControlTerminalsln());
        outputDTO.setControlTerminalsCm(output.getControlTerminalsCm());
        outputDTO.setControllerPointDescription(output.getControllerPointDescription());
        outputDTO.setDdcFieldDevice(output.getDdcFieldDevice());
        outputDTO.setFieldDeviceInputOutputType(output.getFieldDeviceInputOutputType());
        outputDTO.setSpecialNotesComments(output.getSpecialNotesComments());
        return outputDTO;
    }

    // Method to update Controller entity with new data from ControllerRequestDTO
    public static void updateEntity(Controller controller, ControllerRequestDTO requestDTO) {
        if (requestDTO.getName() != null) {
            controller.setName(requestDTO.getName());
        }
        if (requestDTO.getModelNumber() != null) {
            controller.setModelNumber(requestDTO.getModelNumber());
        }
        if (requestDTO.getConfiguration() != null) {
            controller.setConfiguration(requestDTO.getConfiguration());
        }

        // Update Input and Output lists based on DTO
        if (requestDTO.getInputList() != null) {
            List<Input> inputs = requestDTO.getInputList().stream()
                    .map(inputDTO -> {
                        Input input = new Input(inputDTO.getInputType(), inputDTO.getCableType(), inputDTO.getControlTerminalsln(),
                                inputDTO.getControlTerminalsCm(), inputDTO.getControllerPointDescription(), inputDTO.getDdcFieldDevice(), inputDTO.getSpecialNotesComments(),
                                inputDTO.getFieldDeviceInputOutputType());
                        input.setController(controller);
                        return input;
                    }).collect(Collectors.toList());
            controller.setInputList(inputs);
        }

        if (requestDTO.getOutputList() != null) {
            List<Output> outputs = requestDTO.getOutputList().stream()
                    .map(outputDTO -> {
                        Output output = new Output(outputDTO.getOutputType(), outputDTO.getCableType(), outputDTO.getControlTerminalsln(),
                                outputDTO.getControlTerminalsCm(), outputDTO.getControllerPointDescription(), outputDTO.getDdcFieldDevice(),
                                outputDTO.getFieldDeviceInputOutputType(), outputDTO.getSpecialNotesComments());
                        output.setController(controller);
                        return output;
                    }).collect(Collectors.toList());
            controller.setOutputList(outputs);
        }
    }

    public static Controller toEntity(ControllerRequestDTO requestDTO, User user, Project project) {
        Controller controller = new Controller();
        controller.setName(requestDTO.getName());
        controller.setModelNumber(requestDTO.getModelNumber());
        controller.setConfiguration(requestDTO.getConfiguration());
        controller.setProject(project);
        controller.setIsCreatedFromTemplate(requestDTO.getIsCreatedFromTemplate());
        controller.setTemplateCreatedFrom(requestDTO.getTemplateCreatedFrom());
        controller.setDateCreated(requestDTO.getDateCreated());
        controller.setAuthor(user);
        controller.setChildControllers(requestDTO.getChildControllers());
        // Map inputs
        List<Input> inputs = requestDTO.getInputList().stream()
                .map(inputDTO -> {
                    Input input = new Input();
                    input.setType(inputDTO.getInputType());
                    input.setCableType(inputDTO.getCableType());
                    input.setControlTerminalsln(inputDTO.getControlTerminalsln());
                    input.setControlTerminalsCm(inputDTO.getControlTerminalsCm());
                    input.setControllerPointDescription(inputDTO.getControllerPointDescription());
                    input.setDdcFieldDevice(inputDTO.getDdcFieldDevice());
                    input.setFieldDeviceInputOutputType(inputDTO.getFieldDeviceInputOutputType());
                    input.setSpecialNotesComments(inputDTO.getSpecialNotesComments());
                    input.setController(controller);
                    return input;
                }).collect(Collectors.toList());

        // Map outputs
        List<Output> outputs = requestDTO.getOutputList().stream()
                .map(outputDTO -> {
                    Output output = new Output();
                    output.setType(outputDTO.getOutputType());
                    output.setCableType(outputDTO.getCableType());
                    output.setControlTerminalsln(outputDTO.getControlTerminalsln());
                    output.setControlTerminalsCm(outputDTO.getControlTerminalsCm());
                    output.setControllerPointDescription(outputDTO.getControllerPointDescription());
                    output.setDdcFieldDevice(outputDTO.getDdcFieldDevice());
                    output.setFieldDeviceInputOutputType(outputDTO.getFieldDeviceInputOutputType());
                    output.setSpecialNotesComments(outputDTO.getSpecialNotesComments());
                    output.setController(controller);
                    return output;
                }).collect(Collectors.toList());

        controller.setInputList(inputs);
        controller.setOutputList(outputs);

        return controller;
    }

    public static Controller childtoNewChild(Controller oldChild, Controller newParent, Project project) {
        Controller newChild = new Controller();
        newChild.setName(oldChild.getName());
        newChild.setModelNumber(oldChild.getModelNumber());
        newChild.setConfiguration(oldChild.getConfiguration());
        newChild.setProject(project);
        newChild.setIsCreatedFromTemplate(false);
        newChild.setTemplateCreatedFrom("origin");
        newChild.setDateCreated(new Date());
        newChild.setAuthor(oldChild.getAuthor());
        newChild.setParentController(newParent);

        // Map inputs
        List<Input> inputs = oldChild.getInputList().stream()
                .map(inputDTO -> {
                    Input input = new Input();
                    input.setType(inputDTO.getType());
                    input.setCableType(inputDTO.getCableType());
                    input.setControlTerminalsln(inputDTO.getControlTerminalsln());
                    input.setControlTerminalsCm(inputDTO.getControlTerminalsCm());
                    input.setControllerPointDescription(inputDTO.getControllerPointDescription());
                    input.setDdcFieldDevice(inputDTO.getDdcFieldDevice());
                    input.setFieldDeviceInputOutputType(inputDTO.getFieldDeviceInputOutputType());
                    input.setSpecialNotesComments(inputDTO.getSpecialNotesComments());
                    input.setController(newChild);
                    return input;
                }).collect(Collectors.toList());

        // Map outputs
        List<Output> outputs = oldChild.getOutputList().stream()
                .map(outputDTO -> {
                    Output output = new Output();
                    output.setType(outputDTO.getType());
                    output.setCableType(outputDTO.getCableType());
                    output.setControlTerminalsln(outputDTO.getControlTerminalsln());
                    output.setControlTerminalsCm(outputDTO.getControlTerminalsCm());
                    output.setControllerPointDescription(outputDTO.getControllerPointDescription());
                    output.setDdcFieldDevice(outputDTO.getDdcFieldDevice());
                    output.setFieldDeviceInputOutputType(outputDTO.getFieldDeviceInputOutputType());
                    output.setSpecialNotesComments(outputDTO.getSpecialNotesComments());
                    output.setController(newChild);
                    return output;
                }).collect(Collectors.toList());

        newChild.setInputList(inputs);
        newChild.setOutputList(outputs);


        return newChild;
    }
}
