package com.campuslens.dto;

public class EmergencyRouteRequestDto {
    private Long sourceNodeId;
    private String emergencyType; // medical, security, exit, police
    private Boolean accessibleOnly = false;

    public EmergencyRouteRequestDto() {}

    public Long getSourceNodeId() { return sourceNodeId; }
    public void setSourceNodeId(Long sourceNodeId) { this.sourceNodeId = sourceNodeId; }
    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }
    public Boolean getAccessibleOnly() { return accessibleOnly != null ? accessibleOnly : false; }
    public void setAccessibleOnly(Boolean accessibleOnly) { this.accessibleOnly = accessibleOnly; }
}
