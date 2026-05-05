package com.arek.inpostfinder;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class InPostControllerTest {

    @Test
    void shouldCalculateDistanceBetweenWarsawAndPoznan() {
        InPostController controller = new InPostController();

        double distance = controller.calculateDistance(
                52.2297, 21.0122,
                52.4064, 16.9252
        );

        assertTrue(distance > 200 && distance < 300);
    }

    @Test
    void shouldReturnZeroDistanceForSameCoordinates() {
        InPostController controller = new InPostController();

        double distance = controller.calculateDistance(
                52.2297, 21.0122,
                52.2297, 21.0122
        );

        assertEquals(0.0, distance);
    }

    @Test
    void shouldCalculateShortDistanceInsideSameCity() {
        InPostController controller = new InPostController();

        double distance = controller.calculateDistance(
                52.2297, 21.0122,
                52.2370, 21.0175
        );

        assertTrue(distance > 0 && distance < 2);
    }

    @Test
    void shouldCalculateDistanceSymmetrically() {
        InPostController controller = new InPostController();

        double distanceA = controller.calculateDistance(
                52.2297, 21.0122,
                52.4064, 16.9252
        );

        double distanceB = controller.calculateDistance(
                52.4064, 16.9252,
                52.2297, 21.0122
        );

        assertEquals(distanceA, distanceB);
    }

    @Test
    void shouldCalculateLongDistanceBetweenPolishCities() {
        InPostController controller = new InPostController();

        double distance = controller.calculateDistance(
                54.3520, 18.6466,
                50.0647, 19.9450
        );

        assertTrue(distance > 450 && distance < 550);
    }

    @Test
    void shouldRoundDistanceToTwoDecimalPlaces() {
        InPostController controller = new InPostController();

        double distance = controller.calculateDistance(
                52.2297, 21.0122,
                52.4064, 16.9252
        );

        double multiplied = distance * 100;

        assertEquals(Math.round(multiplied), multiplied);
    }
}