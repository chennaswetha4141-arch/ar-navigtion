package com.campuslens.service;

import com.campuslens.entity.Facility;
import com.campuslens.exception.ResourceNotFoundException;
import com.campuslens.repository.FacilityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public List<Facility> searchFacilities(String query) {
        if (query == null || query.trim().isEmpty()) {
            return facilityRepository.findAll();
        }
        return facilityRepository.searchFacilities(query.trim());
    }

    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + id));
    }
}
