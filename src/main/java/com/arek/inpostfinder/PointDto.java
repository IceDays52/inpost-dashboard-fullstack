package com.arek.inpostfinder;

public record PointDto(
        String name,
        String city,
        String address,
        String description,
        String openingHours,
        boolean open24h,
        String status,
        String type,
        double latitude,
        double longitude,
        double distanceKm
) {
}