package com.example.demo.service;

import com.example.demo.model.Input;
import com.example.demo.repository.InputRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class InputService {

    private final InputRepository inputRepository;

    @Autowired
    public InputService(InputRepository inputRepository) {
        this.inputRepository = inputRepository;
    }

    public Optional<Input> getInputById(Long inputId) {
        return inputRepository.findById(inputId);
    }

    public void deleteInput(Long inputId) {
        inputRepository.deleteById(inputId);
    }

    public Input updateInput(Input input) {
        return inputRepository.save(input);  // Save or update based on ID
    }

    public Input saveInput(Input input) {
        return inputRepository.save(input);
    }

}