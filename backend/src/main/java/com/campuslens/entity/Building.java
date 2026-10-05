package com.campuslens.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "buildings")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false)
    private String category; // academic, administrative, amenity, residential, emergency

    private String floors; // Comma separated: 0,1,2

    private String entranceNodeIds; // Comma separated: 9,18

    @Column(length = 2000)
    private String description;

    private String openHours;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Building() {}

    public Building(Long id, String name, String code, String category, String floors, String entranceNodeIds, String description, String openHours) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.category = category;
        this.floors = floors;
        this.entranceNodeIds = entranceNodeIds;
        this.description = description;
        this.openHours = openHours;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFloors() { return floors; }
    public void setFloors(String floors) { this.floors = floors; }
    public String getEntranceNodeIds() { return entranceNodeIds; }
    public void setEntranceNodeIds(String entranceNodeIds) { this.entranceNodeIds = entranceNodeIds; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOpenHours() { return openHours; }
    public void setOpenHours(String openHours) { this.openHours = openHours; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
