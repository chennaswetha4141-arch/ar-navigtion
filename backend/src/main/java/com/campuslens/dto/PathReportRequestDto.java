package com.campuslens.dto;

import jakarta.validation.constraints.NotBlank;

public class PathReportRequestDto {
    private Long pathId;

    @NotBlank(message = "locationName is required")
    private String locationName;

    @NotBlank(message = "problemType is required")
    private String problemType;

    @NotBlank(message = "description is required")
    private String description;

    private String severity = "MEDIUM";
    private String reporterName = "Anonymous Student";

    public PathReportRequestDto() {}

    public Long getPathId() { return pathId; }
    public void setPathId(Long pathId) { this.pathId = pathId; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    public String getProblemType() { return problemType; }
    public void setProblemType(String problemType) { this.problemType = problemType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }
}
