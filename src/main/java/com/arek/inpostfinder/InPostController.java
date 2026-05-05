package com.arek.inpostfinder;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class InPostController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.maps.api.key}")
    private String googleApiKey;

    @GetMapping("/api/points/dashboard")
    public List<PointDto> getDashboardPoints(
            @RequestParam String address,
            @RequestParam(defaultValue = "parcel_locker") String type
    ) {
        double[] userCoords = getCoordinatesFromAddress(address);

        if (userCoords == null) {
            return new ArrayList<>();
        }

        double userLat = userCoords[0];
        double userLon = userCoords[1];

        Map<String, PointDto> uniqueResults = new LinkedHashMap<>();

        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString("https://api-pl-points.easypack24.net/v1/points")
                .queryParam("relative_point", userLat + "," + userLon)
                .queryParam("max_distance", 20000)
                .queryParam("per_page", 50)
                .queryParam("status", "Operating");

        if (!type.equalsIgnoreCase("all")) {
            builder.queryParam("type", type);
        }

        URI uri = builder
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();

        Map response = restTemplate.getForObject(uri, Map.class);

        if (response == null || !response.containsKey("items")) {
            return new ArrayList<>();
        }

        List<Map<String, Object>> items =
                (List<Map<String, Object>>) response.get("items");

        if (items == null || items.isEmpty()) {
            return new ArrayList<>();
        }

        for (Map<String, Object> item : items) {
            Map<String, Object> addressDetails =
                    (Map<String, Object>) item.get("address_details");

            Map<String, Object> location =
                    (Map<String, Object>) item.get("location");

            if (addressDetails == null || location == null) {
                continue;
            }

            String name = clean(item.get("name"));

            if (name.isEmpty() || uniqueResults.containsKey(name)) {
                continue;
            }

            String status = clean(item.get("status"));
            String description = clean(item.get("location_description"));
            String openingHours = clean(item.get("opening_hours"));
            String pointType = clean(item.get("type"));

            String city = clean(addressDetails.get("city"));
            String street = clean(addressDetails.get("street"));
            String buildingNumber = clean(addressDetails.get("building_number"));
            String postCode = clean(addressDetails.get("post_code"));

            String pointAddress = buildAddress(street, buildingNumber, postCode, city);

            double latitude = Double.parseDouble(String.valueOf(location.get("latitude")));
            double longitude = Double.parseDouble(String.valueOf(location.get("longitude")));

            double distanceKm = calculateDistance(userLat, userLon, latitude, longitude);

            boolean open24h = openingHours.equalsIgnoreCase("24/7");

            PointDto point = new PointDto(
                    name,
                    city,
                    pointAddress,
                    description,
                    openingHours,
                    open24h,
                    status,
                    pointType,
                    latitude,
                    longitude,
                    distanceKm
            );

            uniqueResults.put(name, point);
        }

        return uniqueResults.values()
                .stream()
                .sorted(Comparator.comparingDouble(PointDto::distanceKm))
                .limit(10)
                .toList();
    }

    private double[] getCoordinatesFromAddress(String address) {
        URI uri = UriComponentsBuilder
                .fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("address", address + ", Polska")
                .queryParam("components", "country:PL")
                .queryParam("region", "pl")
                .queryParam("key", googleApiKey)
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();

        Map response = restTemplate.getForObject(uri, Map.class);

        if (response == null || !"OK".equals(response.get("status"))) {
            return null;
        }

        List results = (List) response.get("results");

        if (results == null || results.isEmpty()) {
            return null;
        }

        Map firstResult = (Map) results.get(0);
        Map geometry = (Map) firstResult.get("geometry");
        Map location = (Map) geometry.get("location");

        double lat = Double.parseDouble(String.valueOf(location.get("lat")));
        double lon = Double.parseDouble(String.valueOf(location.get("lng")));

        return new double[]{lat, lon};
    }

    private String clean(Object value) {
        if (value == null) return "";
        String text = String.valueOf(value);
        return text.equalsIgnoreCase("null") ? "" : text;
    }

    private String buildAddress(String street, String number, String post, String city) {
        String part1 = (street + " " + number).trim();
        String part2 = (post + " " + city).trim();

        if (part1.isEmpty()) return part2;
        if (part2.isEmpty()) return part1;

        return part1 + ", " + part2;
    }

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2)
                * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c * 100.0) / 100.0;
    }
}