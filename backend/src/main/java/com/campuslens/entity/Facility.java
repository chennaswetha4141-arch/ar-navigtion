package com.campuslens.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private Long nodeId;

    private Long buildingId;

    private String buildingName;

    @Column(nullable = false)
    private Integer floor = 0;

    private String department;

    @Column(nullable = false)
    private String category; // lab, classroom, library, canteen, auditorium, hostel, medical, security, parking, restroom, office

    @Column(length = 1000)
    private String features; // Comma-separated tags

    @Column(nullable = false)
    private String status = "open"; // open, closed, restricted

    @Column(length = 2000)
    private String description;

    public Facility() {}

    public Facility(Long id, String name, String code, Long nodeId, Long buildingId, String buildingName, Integer floor, String department, String category, String features, String status, String description) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.nodeId = nodeId;
        this.buildingId = buildingId;
        this.buildingName = buildingName;
        this.floor = floor;
        this.department = department;
        this.category = category;
        this.features = features;
        this.status = status;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Long getNodeId() { return nodeId; }
    public void setNodeId(Long nodeId) { this.nodeId = nodeId; }
    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
