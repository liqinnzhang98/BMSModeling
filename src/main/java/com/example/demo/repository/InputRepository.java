package com.example.demo.repository;

import com.example.demo.model.Input;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InputRepository extends JpaRepository<Input, Long> {
}
