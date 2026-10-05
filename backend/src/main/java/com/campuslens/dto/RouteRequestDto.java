package com.campuslens.dto;

import jakarta.validation.constraints.NotNull;

public class RouteRequestDto {

    @NotNull(message = "sourceNodeId is required")
    private Long sourceNodeId;

    @NotNull(message = "destinationNodeId is required")
    private Long destinationNodeId;

    private Boolean accessibleOnly = false;

    public RouteRequestDto() {}

    public RouteRequestDto(Long sourceNodeId, Long destinationNodeId, Boolean accessibleOnly) {
        this.sourceNodeId = sourceNodeId;
        this.destinationNodeId = destinationNodeId;
        this.accessibleOnly = accessibleOnly;
    }

    public Long getSourceNodeId() { return sourceNodeId; }
    public void setSourceNodeId(Long sourceNodeId) { this.sourceNodeId = sourceNodeId; }
    public Long getDestinationNodeId() { return destinationNodeId; }
    public void setDestinationNodeId(Long destinationNodeId) { this.destinationNodeId = destinationNodeId; }
    public Boolean getAccessibleOnly() { return accessibleOnly != null ? accessibleOnly : false; }
    public void setAccessibleOnly(Boolean accessibleOnly) { this.accessibleOnly = accessibleOnly; }
}
