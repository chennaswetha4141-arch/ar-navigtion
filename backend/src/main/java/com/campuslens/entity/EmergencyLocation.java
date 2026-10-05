package com.campuslens.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "emergency_locations")
public class EmergencyLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // medical, security, exit, police

    @Column(nullable = false)
    private Long nodeId;

    private String buildingName;

    private String contactNumber;

    @Column(length = 1000)
    private String description;

    public EmergencyLocation() {}

    public EmergencyLocation(Long id, String name, String type, Long nodeId, String buildingName, String contactNumber, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.nodeId = nodeId;
        this.buildingName = buildingName;
        this.contactNumber = contactNumber;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getNodeId() { return nodeId; }
    public void setNodeId(Long nodeId) { this.nodeId = nodeId; }
    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
