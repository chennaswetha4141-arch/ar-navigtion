package com.campuslens.repository;

import com.campuslens.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByCategoryIgnoreCase(String category);

    @Query("SELECT f FROM Facility f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.department) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.buildingName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.category) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.code) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Facility> searchFacilities(@Param("query") String query);
}
