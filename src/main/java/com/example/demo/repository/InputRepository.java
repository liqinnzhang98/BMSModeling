package com.example.demo.repository;

import com.example.demo.dto.InputDTO;
import com.example.demo.model.Input;
import com.example.demo.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InputRepository extends JpaRepository<Input, Long> {
}
