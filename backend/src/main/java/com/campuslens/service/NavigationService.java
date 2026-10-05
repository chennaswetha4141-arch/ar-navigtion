package com.campuslens.service;

import com.campuslens.dto.*;
import com.campuslens.entity.EmergencyLocation;
import com.campuslens.entity.NavigationNode;
import com.campuslens.entity.NavigationPath;
import com.campuslens.exception.ResourceNotFoundException;
import com.campuslens.exception.RouteNotFoundException;
import com.campuslens.repository.EmergencyLocationRepository;
import com.campuslens.repository.NavigationNodeRepository;
import com.campuslens.repository.NavigationPathRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NavigationService {

    private final NavigationNodeRepository nodeRepository;
    private final NavigationPathRepository pathRepository;
    private final EmergencyLocationRepository emergencyLocationRepository;

    public NavigationService(NavigationNodeRepository nodeRepository,
                             NavigationPathRepository pathRepository,
                             EmergencyLocationRepository emergencyLocationRepository) {
        this.nodeRepository = nodeRepository;
        this.pathRepository = pathRepository;
        this.emergencyLocationRepository = emergencyLocationRepository;
    }

    private static class Edge {
        final Long targetNodeId;
        final double weight;
        final NavigationPath path;

        Edge(Long targetNodeId, double weight, NavigationPath path) {
            this.targetNodeId = targetNodeId;
            this.weight = weight;
            this.path = path;
        }
    }

    private static class NodeDistance implements Comparable<NodeDistance> {
        final Long nodeId;
        final double distance;

        NodeDistance(Long nodeId, double distance) {
            this.nodeId = nodeId;
            this.distance = distance;
        }

        @Override
        public int compareTo(NodeDistance other) {
            return Double.compare(this.distance, other.distance);
        }
    }

    private Map<Long, List<Edge>> buildAdjacencyList(List<NavigationNode> allNodes,
                                                     List<NavigationPath> allPaths,
                                                     boolean accessibleOnly,
                                                     boolean ignoreBlocked) {
        Map<Long, List<Edge>> adj = new HashMap<>();
        for (NavigationNode n : allNodes) {
            adj.put(n.getId(), new ArrayList<>());
        }

        for (NavigationPath p : allPaths) {
            if (Boolean.TRUE.equals(p.getIsBlocked()) && !ignoreBlocked) {
                continue;
            }
            if (accessibleOnly && Boolean.FALSE.equals(p.getIsAccessible())) {
                continue;
            }
            if (accessibleOnly && Boolean.TRUE.equals(p.getIsStairs())) {
                continue;
            }

            adj.computeIfAbsent(p.getSourceNodeId(), k -> new ArrayList<>())
                    .add(new Edge(p.getDestinationNodeId(), p.getDistance(), p));

            if (Boolean.TRUE.equals(p.getBidirectional())) {
                adj.computeIfAbsent(p.getDestinationNodeId(), k -> new ArrayList<>())
                        .add(new Edge(p.getSourceNodeId(), p.getDistance(), p));
            }
        }
        return adj;
    }

    private static class DijkstraResult {
        boolean found;
        double distance;
        List<Long> nodeIds = new ArrayList<>();
        List<Long> pathIds = new ArrayList<>();
    }

    private DijkstraResult runDijkstra(Long sourceId, Long destId, boolean accessibleOnly, boolean ignoreBlocked) {
        List<NavigationNode> allNodes = nodeRepository.findAll();
        List<NavigationPath> allPaths = pathRepository.findAll();
        Map<Long, List<Edge>> adj = buildAdjacencyList(allNodes, allPaths, accessibleOnly, ignoreBlocked);

        Map<Long, Double> distances = new HashMap<>();
        Map<Long, Long> prevNode = new HashMap<>();
        Map<Long, Long> prevPath = new HashMap<>();
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();

        for (NavigationNode n : allNodes) {
            distances.put(n.getId(), Double.MAX_VALUE);
        }

        distances.put(sourceId, 0.0);
        pq.add(new NodeDistance(sourceId, 0.0));

        Set<Long> visited = new HashSet<>();

        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            Long u = current.nodeId;

            if (visited.contains(u)) continue;
            visited.add(u);

            if (u.equals(destId)) break;

            List<Edge> edges = adj.getOrDefault(u, Collections.emptyList());
            for (Edge edge : edges) {
                Long v = edge.targetNodeId;
                if (visited.contains(v)) continue;

                double newDist = distances.get(u) + edge.weight;
                if (newDist < distances.get(v)) {
                    distances.put(v, newDist);
                    prevNode.put(v, u);
                    prevPath.put(v, edge.path.getId());
                    pq.add(new NodeDistance(v, newDist));
                }
            }
        }

        DijkstraResult res = new DijkstraResult();
        if (distances.get(destId) == null || distances.get(destId) == Double.MAX_VALUE) {
            res.found = false;
            return res;
        }

        res.found = true;
        res.distance = distances.get(destId);

        Long curr = destId;
        while (curr != null && !curr.equals(sourceId)) {
            res.nodeIds.add(0, curr);
            Long pId = prevPath.get(curr);
            if (pId != null) res.pathIds.add(0, pId);
            curr = prevNode.get(curr);
        }
        if (curr != null && curr.equals(sourceId)) {
            res.nodeIds.add(0, sourceId);
        }

        return res;
    }

    public RouteResponseDto calculateRoute(RouteRequestDto request) {
        NavigationNode source = nodeRepository.findById(request.getSourceNodeId())
                .orElseThrow(() -> new ResourceNotFoundException("Source node not found with ID: " + request.getSourceNodeId()));
        NavigationNode destination = nodeRepository.findById(request.getDestinationNodeId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination node not found with ID: " + request.getDestinationNodeId()));

        boolean accessible = request.getAccessibleOnly();

        DijkstraResult idealRoute = runDijkstra(source.getId(), destination.getId(), accessible, true);
        DijkstraResult activeRoute = runDijkstra(source.getId(), destination.getId(), accessible, false);

        if (!activeRoute.found) {
            throw new RouteNotFoundException("No walkable path found. All paths between these points may be blocked or restricted.");
        }

        boolean isRerouted = false;
        String rerouteReason = null;

        if (idealRoute.found) {
            List<NavigationPath> allPaths = pathRepository.findAll();
            Map<Long, NavigationPath> pathMap = new HashMap<>();
            allPaths.forEach(p -> pathMap.put(p.getId(), p));

            for (Long pId : idealRoute.pathIds) {
                NavigationPath p = pathMap.get(pId);
                if (p != null && Boolean.TRUE.equals(p.getIsBlocked())) {
                    isRerouted = true;
                    long extraDist = Math.max(0, Math.round(activeRoute.distance - idealRoute.distance));
                    rerouteReason = "Obstruction avoided: " + (p.getBlockedReason() != null ? p.getBlockedReason() : "Path under maintenance")
                            + ". Automatically rerouted via alternative bypass (+" + extraDist + "m).";
                    break;
                }
            }
        }

        List<NavigationNode> orderedNodes = new ArrayList<>();
        for (Long nId : activeRoute.nodeIds) {
            nodeRepository.findById(nId).ifPresent(orderedNodes::add);
        }

        List<TurnInstructionDto> instructions = generateInstructions(orderedNodes, activeRoute.pathIds);

        int floorTransitions = 0;
        for (int i = 1; i < orderedNodes.size(); i++) {
            if (!orderedNodes.get(i).getFloor().equals(orderedNodes.get(i - 1).getFloor())) {
                floorTransitions++;
            }
        }
        int estimatedTime = Math.max(1, (int) Math.round((activeRoute.distance / 75.0) + (floorTransitions * 1.2)));

        RouteResponseDto response = new RouteResponseDto();
        response.setDistance(activeRoute.distance);
        response.setEstimatedTime(estimatedTime);
        response.setAccessibleOnly(accessible);
        response.setNodes(orderedNodes);
        response.setPathIds(activeRoute.pathIds);
        response.setRoute(orderedNodes.stream().map(NavigationNode::getName).toList());
        response.setInstructions(instructions);
        response.setIsRerouted(isRerouted);
        response.setRerouteReason(rerouteReason);
        response.setAlternativeRouteAvailable(isRerouted);

        return response;
    }

    public EmergencyRouteResponseDto calculateEmergencyRoute(EmergencyRouteRequestDto request) {
        Long sourceId = request.getSourceNodeId() != null ? request.getSourceNodeId() : 1L;
        List<EmergencyLocation> candidates = (request.getEmergencyType() != null && !request.getEmergencyType().isEmpty())
                ? emergencyLocationRepository.findByType(request.getEmergencyType())
                : emergencyLocationRepository.findAll();

        if (candidates.isEmpty()) {
            candidates = emergencyLocationRepository.findAll();
        }

        RouteResponseDto bestRoute = null;
        EmergencyLocation bestLoc = null;

        for (EmergencyLocation loc : candidates) {
            try {
                RouteRequestDto subReq = new RouteRequestDto(sourceId, loc.getNodeId(), request.getAccessibleOnly());
                RouteResponseDto route = calculateRoute(subReq);
                if (bestRoute == null || route.getDistance() < bestRoute.getDistance()) {
                    bestRoute = route;
                    bestLoc = loc;
                }
            } catch (Exception ignored) {
            }
        }

        if (bestRoute == null || bestLoc == null) {
            throw new RouteNotFoundException("Could not calculate emergency evacuation route from current location.");
        }

        return new EmergencyRouteResponseDto(bestLoc, bestRoute);
    }

    private List<TurnInstructionDto> generateInstructions(List<NavigationNode> nodes, List<Long> pathIds) {
        List<TurnInstructionDto> instructions = new ArrayList<>();
        if (nodes == null || nodes.isEmpty()) {
            return instructions;
        }

        if (nodes.size() == 1) {
            NavigationNode only = nodes.get(0);
            instructions.add(new TurnInstructionDto(
                    1, only.getId(), only.getName(), "arrive",
                    "You are already at your destination: " + only.getName() + (only.getFloor() > 0 ? " (Floor " + only.getFloor() + ")" : "") + ".",
                    0.0, 0, only.getDescription()
            ));
            return instructions;
        }

        Map<Long, NavigationPath> pathMap = new HashMap<>();
        pathRepository.findAll().forEach(p -> pathMap.put(p.getId(), p));

        for (int i = 0; i < nodes.size(); i++) {
            NavigationNode curr = nodes.get(i);
            int stepNumber = i + 1;

            if (i == 0) {
                NavigationNode next = nodes.size() > 1 ? nodes.get(1) : null;
                double dist = (pathIds != null && !pathIds.isEmpty() && pathMap.containsKey(pathIds.get(0)))
                        ? pathMap.get(pathIds.get(0)).getDistance() : 80.0;
                instructions.add(new TurnInstructionDto(
                        stepNumber, curr.getId(), curr.getName(), "straight",
                        "Depart from " + curr.getName() + ". Proceed toward " + (next != null ? next.getName() : "destination") + ".",
                        dist, 0, curr.getDescription()
                ));
                continue;
            }

            if (i == nodes.size() - 1) {
                instructions.add(new TurnInstructionDto(
                        stepNumber, curr.getId(), curr.getName(), "arrive",
                        "You have reached " + curr.getName() + (curr.getFloor() > 0 ? " (Floor " + curr.getFloor() + ")" : "") + ".",
                        0.0, 0, curr.getDescription()
                ));
                continue;
            }

            NavigationNode prev = nodes.get(i - 1);
            NavigationNode next = nodes.get(i + 1);
            NavigationPath segPath = (pathIds != null && i < pathIds.size()) ? pathMap.get(pathIds.get(i)) : null;
            double segDist = segPath != null ? segPath.getDistance() : 75.0;

            if ("stairs".equalsIgnoreCase(curr.getType()) || (segPath != null && Boolean.TRUE.equals(segPath.getIsStairs()))) {
                int floorDiff = next.getFloor() - curr.getFloor();
                instructions.add(new TurnInstructionDto(
                        stepNumber, curr.getId(), curr.getName(), floorDiff >= 0 ? "stairs_up" : "stairs_down",
                        "Take the central stairs " + (floorDiff >= 0 ? "up" : "down") + " to Floor " + next.getFloor() + ".",
                        segDist, floorDiff, "Central indoor stairwell"
                ));
                continue;
            }

            if ("elevator".equalsIgnoreCase(curr.getType()) || (segPath != null && Boolean.TRUE.equals(segPath.getIsElevator()))) {
                int floorDiff = next.getFloor() - curr.getFloor();
                instructions.add(new TurnInstructionDto(
                        stepNumber, curr.getId(), curr.getName(), "elevator",
                        "Take the accessible elevator to Floor " + next.getFloor() + ".",
                        segDist, floorDiff, "ADA braille elevator"
                ));
                continue;
            }

            double v1x = curr.getX() - prev.getX();
            double v1y = curr.getY() - prev.getY();
            double v2x = next.getX() - curr.getX();
            double v2y = next.getY() - curr.getY();

            double crossProduct = v1x * v2y - v1y * v2x;
            double dotProduct = v1x * v2x + v1y * v2y;
            double mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
            double mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
            double angleCos = (mag1 > 0 && mag2 > 0) ? dotProduct / (mag1 * mag2) : 1.0;

            String action = "straight";
            String turnPhrase = "Continue straight past " + curr.getName();

            if (angleCos < 0.85) {
                if (crossProduct > 1500) {
                    action = "turn_right";
                    turnPhrase = "Turn right at " + curr.getName();
                } else if (crossProduct < -1500) {
                    action = "turn_left";
                    turnPhrase = "Turn left at " + curr.getName();
                } else if (crossProduct > 0) {
                    action = "slight_right";
                    turnPhrase = "Bear slightly right at " + curr.getName();
                } else {
                    action = "slight_left";
                    turnPhrase = "Bear slightly left at " + curr.getName();
                }
            }

            instructions.add(new TurnInstructionDto(
                    stepNumber, curr.getId(), curr.getName(), action,
                    turnPhrase + " and proceed " + Math.round(segDist) + "m toward " + next.getName() + ".",
                    segDist, 0, curr.getDescription()
            ));
        }

        return instructions;
    }
}
