package com.campuslens.controller;

import com.campuslens.entity.NavigationNode;
import com.campuslens.entity.NavigationPath;
import com.campuslens.exception.ResourceNotFoundException;
import com.campuslens.repository.NavigationNodeRepository;
import com.campuslens.repository.NavigationPathRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class NodePathController {

    private final NavigationNodeRepository nodeRepository;
    private final NavigationPathRepository pathRepository;

    public NodePathController(NavigationNodeRepository nodeRepository, NavigationPathRepository pathRepository) {
        this.nodeRepository = nodeRepository;
        this.pathRepository = pathRepository;
    }

    @GetMapping("/nodes")
    public ResponseEntity<List<NavigationNode>> getAllNodes() {
        return ResponseEntity.ok(nodeRepository.findAll());
    }

    @GetMapping("/paths")
    public ResponseEntity<List<NavigationPath>> getAllPaths() {
        return ResponseEntity.ok(pathRepository.findAll());
    }

    @PostMapping("/paths/{id}/toggle-block")
    public ResponseEntity<NavigationPath> togglePathBlock(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        NavigationPath path = pathRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Path not found with ID: " + id));

        boolean newState = !Boolean.TRUE.equals(path.getIsBlocked());
        path.setIsBlocked(newState);

        if (newState) {
            String reason = body != null && body.containsKey("reason") ? body.get("reason") : "Manual maintenance blockage";
            path.setBlockedReason(reason);
        } else {
            path.setBlockedReason(null);
        }

        NavigationPath saved = pathRepository.save(path);
        return ResponseEntity.ok(saved);
    }
}
