package com.campuslens.dto;

import com.campuslens.entity.EmergencyLocation;

public class EmergencyRouteResponseDto {
    private EmergencyLocation emergencyLocation;
    private RouteResponseDto route;

    public EmergencyRouteResponseDto() {}

    public EmergencyRouteResponseDto(EmergencyLocation emergencyLocation, RouteResponseDto route) {
        this.emergencyLocation = emergencyLocation;
        this.route = route;
    }

    public EmergencyLocation getEmergencyLocation() { return emergencyLocation; }
    public void setEmergencyLocation(EmergencyLocation emergencyLocation) { this.emergencyLocation = emergencyLocation; }
    public RouteResponseDto getRoute() { return route; }
    public void setRoute(RouteResponseDto route) { this.route = route; }
}
