package com.campuslens.controller;

import com.campuslens.dto.PathReportRequestDto;
import com.campuslens.entity.PathReport;
import com.campuslens.service.PathReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/path-reports")
@CrossOrigin(origins = "*")
public class PathReportController {

    private final PathReportService pathReportService;

    public PathReportController(PathReportService pathReportService) {
        this.pathReportService = pathReportService;
    }

    @GetMapping
    public ResponseEntity<List<PathReport>> getAllReports() {
        return ResponseEntity.ok(pathReportService.getAllReports());
    }

    @PostMapping
    public ResponseEntity<PathReport> submitReport(@Valid @RequestBody PathReportRequestDto dto) {
        PathReport report = pathReportService.submitReport(dto);
        return new ResponseEntity<>(report, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<PathReport> approveReport(@PathVariable Long id) {
        return ResponseEntity.ok(pathReportService.approveReport(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<PathReport> rejectReport(@PathVariable Long id) {
        return ResponseEntity.ok(pathReportService.rejectReport(id));
    }
}
