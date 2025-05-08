package com.example.demo.service;

import com.example.demo.dto.OutputDTO;
import com.example.demo.model.Output;
import com.example.demo.repository.OutputRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OutputService {
    private final OutputRepository outputRepository;

    @Autowired
    public OutputService(OutputRepository outputRepository) {
        this.outputRepository = outputRepository;
    }

    public Optional<Output> getOutputById(Long outputId) {
        return outputRepository.findById(outputId);
    }

    public void deleteOutput(Long outputId) {
        outputRepository.deleteById(outputId);
    }

    public Output updateOutput(Output output) {
        return outputRepository.save(output);  // Save or update based on ID
    }

    public Output saveOutput(Output output) {
        return outputRepository.save(output);
    }
}
