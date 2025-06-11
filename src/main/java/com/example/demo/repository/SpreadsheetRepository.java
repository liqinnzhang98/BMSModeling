package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Spreadsheet;

@Repository
public interface SpreadsheetRepository extends JpaRepository<Spreadsheet, Long> {
    List<Spreadsheet> findByProjectId(Long projectId);
}
