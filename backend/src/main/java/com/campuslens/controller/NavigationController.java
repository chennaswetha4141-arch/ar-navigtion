package com.campuslens.controller;

import com.campuslens.dto.EmergencyRouteRequestDto;
import com.campuslens.dto.EmergencyRouteResponseDto;
import com.campuslens.dto.RouteRequestDto;
import com.campuslens.dto.RouteResponseDto;
import com.campuslens.service.NavigationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class NavigationController {

    private final NavigationService navigationService;

    public NavigationController(NavigationService navigationService) {
        this.navigationService = navigationService;
    }

    @PostMapping("/navigation/route")
    public ResponseEntity<RouteResponseDto> getRoute(@Valid @RequestBody RouteRequestDto request) {
        RouteResponseDto route = navigationService.calculateRoute(request);
        return ResponseEntity.ok(route);
    }

    @PostMapping("/emergency/route")
    public ResponseEntity<EmergencyRouteResponseDto> getEmergencyRoute(@RequestBody EmergencyRouteRequestDto request) {
        EmergencyRouteResponseDto route = navigationService.calculateEmergencyRoute(request);
        return ResponseEntity.ok(route);
    }
}
