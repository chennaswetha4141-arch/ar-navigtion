package com.campuslens.dto;

public class TurnInstructionDto {
    private Integer stepNumber;
    private Long nodeId;
    private String nodeName;
    private String action; // straight, turn_left, turn_right, slight_left, slight_right, stairs_up, stairs_down, elevator, arrive
    private String text;
    private Double distanceMeters;
    private Integer floorChange;
    private String landmark;

    public TurnInstructionDto() {}

    public TurnInstructionDto(Integer stepNumber, Long nodeId, String nodeName, String action, String text, Double distanceMeters, Integer floorChange, String landmark) {
        this.stepNumber = stepNumber;
        this.nodeId = nodeId;
        this.nodeName = nodeName;
        this.action = action;
        this.text = text;
        this.distanceMeters = distanceMeters;
        this.floorChange = floorChange;
        this.landmark = landmark;
    }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }
    public Long getNodeId() { return nodeId; }
    public void setNodeId(Long nodeId) { this.nodeId = nodeId; }
    public String getNodeName() { return nodeName; }
    public void setNodeName(String nodeName) { this.nodeName = nodeName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }
    public Integer getFloorChange() { return floorChange; }
    public void setFloorChange(Integer floorChange) { this.floorChange = floorChange; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
}
