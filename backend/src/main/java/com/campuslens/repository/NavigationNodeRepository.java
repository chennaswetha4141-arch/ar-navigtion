package com.campuslens.repository;

import com.campuslens.entity.NavigationNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavigationNodeRepository extends JpaRepository<NavigationNode, Long> {
    List<NavigationNode> findByFloor(Integer floor);
    List<NavigationNode> findByIsEmergencyTrue();
    List<NavigationNode> findByBuildingId(Long buildingId);
}
