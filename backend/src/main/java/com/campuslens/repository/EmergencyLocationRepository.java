package com.campuslens.repository;

import com.campuslens.entity.EmergencyLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyLocationRepository extends JpaRepository<EmergencyLocation, Long> {
    List<EmergencyLocation> findByType(String type);
}
