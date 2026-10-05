package com.campuslens.repository;

import com.campuslens.entity.NavigationPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavigationPathRepository extends JpaRepository<NavigationPath, Long> {
    List<NavigationPath> findByIsBlockedFalse();
    List<NavigationPath> findByIsBlockedTrue();
}
