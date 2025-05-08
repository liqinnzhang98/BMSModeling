package com.example.demo.utils;

import com.example.demo.dto.InputDTO;
import com.example.demo.model.Input;

public class InputMapperUtil {

    public static Input toEntity(InputDTO dto) {
        if (dto == null) return null;

        Input input = new Input();
        input.setId(dto.getId());
        input.setType(dto.getInputType());
        input.setCableType(dto.getCableType());
        input.setControlTerminalsln(dto.getControlTerminalsln());
        input.setControlTerminalsCm(dto.getControlTerminalsCm());
        input.setControllerPointDescription(dto.getControllerPointDescription());
        input.setDdcFieldDevice(dto.getDdcFieldDevice());
        input.setFieldDeviceInputOutputType(dto.getFieldDeviceInputOutputType());
        input.setSpecialNotesComments(dto.getSpecialNotesComments());

        return input;
    }

    public static InputDTO toDTO(Input input) {
        if (input == null) return null;

        InputDTO dto = new InputDTO();
        dto.setId(input.getId());
        dto.setInputType(input.getType());
        dto.setCableType(input.getCableType());
        dto.setControlTerminalsln(input.getControlTerminalsln());
        dto.setControlTerminalsCm(input.getControlTerminalsCm());
        dto.setControllerPointDescription(input.getControllerPointDescription());
        dto.setDdcFieldDevice(input.getDdcFieldDevice());
        dto.setFieldDeviceInputOutputType(input.getFieldDeviceInputOutputType());
        dto.setSpecialNotesComments(input.getSpecialNotesComments());

        return dto;
    }
}
