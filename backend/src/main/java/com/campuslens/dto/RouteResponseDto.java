package com.campuslens.dto;

import com.campuslens.entity.NavigationNode;
import java.util.List;

public class RouteResponseDto {
    private Double distance;
    private Integer estimatedTime;
    private Boolean accessibleOnly;
    private List<NavigationNode> nodes;
    private List<Long> pathIds;
    private List<String> route;
    private List<TurnInstructionDto> instructions;
    private Boolean isRerouted = false;
    private String rerouteReason;
    private Boolean alternativeRouteAvailable = false;

    public RouteResponseDto() {}

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
    public Integer getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(Integer estimatedTime) { this.estimatedTime = estimatedTime; }
    public Boolean getAccessibleOnly() { return accessibleOnly; }
    public void setAccessibleOnly(Boolean accessibleOnly) { this.accessibleOnly = accessibleOnly; }
    public List<NavigationNode> getNodes() { return nodes; }
    public void setNodes(List<NavigationNode> nodes) { this.nodes = nodes; }
    public List<Long> getPathIds() { return pathIds; }
    public void setPathIds(List<Long> pathIds) { this.pathIds = pathIds; }
    public List<String> getRoute() { return route; }
    public void setRoute(List<String> route) { this.route = route; }
    public List<TurnInstructionDto> getInstructions() { return instructions; }
    public void setInstructions(List<TurnInstructionDto> instructions) { this.instructions = instructions; }
    public Boolean getIsRerouted() { return isRerouted; }
    public void setIsRerouted(Boolean isRerouted) { this.isRerouted = isRerouted; }
    public String getRerouteReason() { return rerouteReason; }
    public void setRerouteReason(String rerouteReason) { this.rerouteReason = rerouteReason; }
    public Boolean getAlternativeRouteAvailable() { return alternativeRouteAvailable; }
    public void setAlternativeRouteAvailable(Boolean alternativeRouteAvailable) { this.alternativeRouteAvailable = alternativeRouteAvailable; }
}
