package com.example.demo.utils;

import com.example.demo.dto.OutputDTO;
import com.example.demo.model.Output;

public class OutputMapperUtil {
    public static Output toEntity(OutputDTO dto) {
        if (dto == null) return null;

        Output output = new Output();
        output.setId(dto.getId());
        output.setType(dto.getOutputType());
        output.setCableType(dto.getCableType());
        output.setControlTerminalsln(dto.getControlTerminalsln());
        output.setControlTerminalsCm(dto.getControlTerminalsCm());
        output.setControllerPointDescription(dto.getControllerPointDescription());
        output.setDdcFieldDevice(dto.getDdcFieldDevice());
        output.setFieldDeviceInputOutputType(dto.getFieldDeviceInputOutputType());
        output.setSpecialNotesComments(dto.getSpecialNotesComments());

        return output;
    }

    public static OutputDTO toDTO(Output output) {
        if (output == null) return null;

        OutputDTO dto = new OutputDTO();
        dto.setId(output.getId());
        dto.setOutputType(output.getType());
        dto.setCableType(output.getCableType());
        dto.setControlTerminalsln(output.getControlTerminalsln());
        dto.setControlTerminalsCm(output.getControlTerminalsCm());
        dto.setControllerPointDescription(output.getControllerPointDescription());
        dto.setDdcFieldDevice(output.getDdcFieldDevice());
        dto.setFieldDeviceInputOutputType(output.getFieldDeviceInputOutputType());
        dto.setSpecialNotesComments(output.getSpecialNotesComments());

        return dto;
    }
}
