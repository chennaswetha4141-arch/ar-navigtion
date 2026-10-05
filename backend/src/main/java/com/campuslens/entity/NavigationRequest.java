package com.campuslens.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "navigation_requests")
public class NavigationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sourceNodeId;

    @Column(nullable = false)
    private Long destinationNodeId;

    @Column(nullable = false)
    private Boolean accessibleOnly;

    private Double calculatedDistance;

    private Integer estimatedMinutes;

    private Boolean isRerouted = false;

    private LocalDateTime timestamp = LocalDateTime.now();

    public NavigationRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSourceNodeId() { return sourceNodeId; }
    public void setSourceNodeId(Long sourceNodeId) { this.sourceNodeId = sourceNodeId; }
    public Long getDestinationNodeId() { return destinationNodeId; }
    public void setDestinationNodeId(Long destinationNodeId) { this.destinationNodeId = destinationNodeId; }
    public Boolean getAccessibleOnly() { return accessibleOnly; }
    public void setAccessibleOnly(Boolean accessibleOnly) { this.accessibleOnly = accessibleOnly; }
    public Double getCalculatedDistance() { return calculatedDistance; }
    public void setCalculatedDistance(Double calculatedDistance) { this.calculatedDistance = calculatedDistance; }
    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
    public Boolean getIsRerouted() { return isRerouted; }
    public void setIsRerouted(Boolean isRerouted) { this.isRerouted = isRerouted; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
