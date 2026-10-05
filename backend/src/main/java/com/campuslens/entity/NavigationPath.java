package com.campuslens.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "navigation_paths")
public class NavigationPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sourceNodeId;

    @Column(nullable = false)
    private Long destinationNodeId;

    @Column(nullable = false)
    private Double distance; // meters

    @Column(nullable = false)
    private Boolean isIndoor = false;

    @Column(nullable = false)
    private Boolean isStairs = false;

    @Column(nullable = false)
    private Boolean isElevator = false;

    @Column(nullable = false)
    private Boolean isAccessible = true;

    @Column(nullable = false)
    private Boolean isBlocked = false;

    private String blockedReason;

    @Column(nullable = false)
    private Integer floor = 0;

    @Column(nullable = false)
    private Boolean bidirectional = true;

    public NavigationPath() {}

    public NavigationPath(Long id, Long sourceNodeId, Long destinationNodeId, Double distance, Boolean isIndoor, Boolean isStairs, Boolean isElevator, Boolean isAccessible, Boolean isBlocked, String blockedReason, Integer floor, Boolean bidirectional) {
        this.id = id;
        this.sourceNodeId = sourceNodeId;
        this.destinationNodeId = destinationNodeId;
        this.distance = distance;
        this.isIndoor = isIndoor;
        this.isStairs = isStairs;
        this.isElevator = isElevator;
        this.isAccessible = isAccessible;
        this.isBlocked = isBlocked;
        this.blockedReason = blockedReason;
        this.floor = floor;
        this.bidirectional = bidirectional;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSourceNodeId() { return sourceNodeId; }
    public void setSourceNodeId(Long sourceNodeId) { this.sourceNodeId = sourceNodeId; }
    public Long getDestinationNodeId() { return destinationNodeId; }
    public void setDestinationNodeId(Long destinationNodeId) { this.destinationNodeId = destinationNodeId; }
    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
    public Boolean getIsIndoor() { return isIndoor; }
    public void setIsIndoor(Boolean isIndoor) { this.isIndoor = isIndoor; }
    public Boolean getIsStairs() { return isStairs; }
    public void setIsStairs(Boolean isStairs) { this.isStairs = isStairs; }
    public Boolean getIsElevator() { return isElevator; }
    public void setIsElevator(Boolean isElevator) { this.isElevator = isElevator; }
    public Boolean getIsAccessible() { return isAccessible; }
    public void setIsAccessible(Boolean isAccessible) { this.isAccessible = isAccessible; }
    public Boolean getIsBlocked() { return isBlocked; }
    public void setIsBlocked(Boolean isBlocked) { this.isBlocked = isBlocked; }
    public String getBlockedReason() { return blockedReason; }
    public void setBlockedReason(String blockedReason) { this.blockedReason = blockedReason; }
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
    public Boolean getBidirectional() { return bidirectional; }
    public void setBidirectional(Boolean bidirectional) { this.bidirectional = bidirectional; }
}
