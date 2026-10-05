package com.campuslens.repository;

import com.campuslens.entity.PathReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PathReportRepository extends JpaRepository<PathReport, Long> {
    List<PathReport> findByStatusOrderByReportedAtDesc(String status);
    List<PathReport> findAllByOrderByReportedAtDesc();
}
