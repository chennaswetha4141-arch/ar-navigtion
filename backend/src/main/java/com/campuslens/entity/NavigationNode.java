package com.campuslens.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "navigation_nodes")
public class NavigationNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Long buildingId;

    private String buildingName;

    @Column(nullable = false)
    private Integer floor = 0;

    @Column(nullable = false)
    private String type; // gate, building_entrance, junction, room, stairs, elevator, emergency, etc.

    @Column(nullable = false)
    private Double x;

    @Column(nullable = false)
    private Double y;

    @Column(nullable = false)
    private Boolean isAccessible = true;

    private Boolean isEmergency = false;

    private String emergencyType; // medical, security, exit, police

    @Column(length = 1000)
    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();

    public NavigationNode() {}

    public NavigationNode(Long id, String name, Long buildingId, String buildingName, Integer floor, String type, Double x, Double y, Boolean isAccessible, Boolean isEmergency, String emergencyType, String description) {
        this.id = id;
        this.name = name;
        this.buildingId = buildingId;
        this.buildingName = buildingName;
        this.floor = floor;
        this.type = type;
        this.x = x;
        this.y = y;
        this.isAccessible = isAccessible;
        this.isEmergency = isEmergency;
        this.emergencyType = emergencyType;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }
    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }
    public Boolean getIsAccessible() { return isAccessible; }
    public void setIsAccessible(Boolean isAccessible) { this.isAccessible = isAccessible; }
    public Boolean getIsEmergency() { return isEmergency; }
    public void setIsEmergency(Boolean isEmergency) { this.isEmergency = isEmergency; }
    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
