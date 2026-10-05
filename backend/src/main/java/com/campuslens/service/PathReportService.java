package com.campuslens.service;

import com.campuslens.dto.PathReportRequestDto;
import com.campuslens.entity.NavigationPath;
import com.campuslens.entity.PathReport;
import com.campuslens.exception.ResourceNotFoundException;
import com.campuslens.repository.NavigationPathRepository;
import com.campuslens.repository.PathReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PathReportService {

    private final PathReportRepository pathReportRepository;
    private final NavigationPathRepository navigationPathRepository;

    public PathReportService(PathReportRepository pathReportRepository, NavigationPathRepository navigationPathRepository) {
        this.pathReportRepository = pathReportRepository;
        this.navigationPathRepository = navigationPathRepository;
    }

    public List<PathReport> getAllReports() {
        return pathReportRepository.findAllByOrderByReportedAtDesc();
    }

    public PathReport submitReport(PathReportRequestDto dto) {
        PathReport report = new PathReport();
        report.setPathId(dto.getPathId());
        report.setLocationName(dto.getLocationName());
        report.setProblemType(dto.getProblemType());
        report.setDescription(dto.getDescription());
        report.setSeverity(dto.getSeverity() != null ? dto.getSeverity() : "MEDIUM");
        report.setReporterName(dto.getReporterName() != null ? dto.getReporterName() : "Student");
        report.setStatus("PENDING");
        report.setReportedAt(LocalDateTime.now());
        return pathReportRepository.save(report);
    }

    @Transactional
    public PathReport approveReport(Long reportId) {
        PathReport report = pathReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

        report.setStatus("APPROVED");

        // Automatically update the associated path in the navigation graph
        if (report.getPathId() != null) {
            navigationPathRepository.findById(report.getPathId()).ifPresent(path -> {
                path.setIsBlocked(true);
                path.setBlockedReason(report.getProblemType().toUpperCase() + ": " + report.getDescription());
                navigationPathRepository.save(path);
            });
        }

        return pathReportRepository.save(report);
    }

    @Transactional
    public PathReport rejectReport(Long reportId) {
        PathReport report = pathReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

        report.setStatus("REJECTED");
        return pathReportRepository.save(report);
    }
}
