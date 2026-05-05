import { useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import "./App.css";

type Point = {
    name: string;
    city: string;
    address: string;
    description: string;
    openingHours: string;
    open24h: boolean;
    status: string;
    type: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
};

const googleMapsApiKey = "KOD_API";

function App() {
    const [address, setAddress] = useState("");
    const [points, setPoints] = useState<Point[]>([]);
    const [loading, setLoading] = useState(false);
    const [only24h, setOnly24h] = useState(false);
    const [pointType, setPointType] = useState("parcel_locker");
    const [searched, setSearched] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const fetchPoints = async () => {
        if (!address.trim()) return;

        setLoading(true);
        setSearched(true);

        try {
            const response = await fetch(
                `http://localhost:8080/api/points/dashboard?address=${encodeURIComponent(
                    address
                )}&type=${encodeURIComponent(pointType)}`
            );

            if (!response.ok) {
                throw new Error("Błąd odpowiedzi serwera");
            }

            const data: Point[] = await response.json();
            setPoints(data);
            setActiveIndex(0);
        } catch (error) {
            console.error(error);
            setPoints([]);
            setActiveIndex(0);
        } finally {
            setLoading(false);
        }
    };

    const filteredPoints = only24h
        ? points.filter((p) => p.open24h)
        : points;

    const bestPoint = filteredPoints[0];

    const activePoint =
        filteredPoints.length > 0
            ? filteredPoints[Math.min(activeIndex, filteredPoints.length - 1)]
            : undefined;

    const mapCenter = activePoint
        ? { lat: activePoint.latitude, lng: activePoint.longitude }
        : bestPoint
            ? { lat: bestPoint.latitude, lng: bestPoint.longitude }
            : { lat: 52.2297, lng: 21.0122 };

    const totalPoints = filteredPoints.length;

    const avgDistance =
        totalPoints > 0
            ? (
                filteredPoints.reduce((sum, p) => sum + p.distanceKm, 0) /
                totalPoints
            ).toFixed(2)
            : "0.00";

    const closestDistance = totalPoints > 0 ? filteredPoints[0].distanceKm : 0;

    const open24hCount = filteredPoints.filter((p) => p.open24h).length;

    const maxDistance =
        totalPoints > 0
            ? Math.max(...filteredPoints.map((p) => p.distanceKm))
            : 1;

    const heatBuckets = [
        {
            label: "0-1 km",
            count: filteredPoints.filter((p) => p.distanceKm <= 1).length
        },
        {
            label: "1-3 km",
            count: filteredPoints.filter(
                (p) => p.distanceKm > 1 && p.distanceKm <= 3
            ).length
        },
        {
            label: "3-5 km",
            count: filteredPoints.filter(
                (p) => p.distanceKm > 3 && p.distanceKm <= 5
            ).length
        },
        {
            label: "5-10 km",
            count: filteredPoints.filter(
                (p) => p.distanceKm > 5 && p.distanceKm <= 10
            ).length
        },
        {
            label: "10+ km",
            count: filteredPoints.filter((p) => p.distanceKm > 10).length
        }
    ];

    const maxBucketCount = Math.max(...heatBuckets.map((b) => b.count), 1);

    const nextPoint = () => {
        setActiveIndex((prev) =>
            prev === filteredPoints.length - 1 ? 0 : prev + 1
        );
    };

    const previousPoint = () => {
        setActiveIndex((prev) =>
            prev === 0 ? filteredPoints.length - 1 : prev - 1
        );
    };

    const openNavigation = (point: Point) => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`,
            "_blank"
        );
    };

    return (
        <APIProvider apiKey={googleMapsApiKey}>
            <div className="app">
                <header className="header">
                    <h1>InPost Smart Dashboard</h1>
                    <p>Znajdź najbliższe punkty względem wpisanego adresu.</p>
                </header>

                <section className="search-panel">
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchPoints()}
                        placeholder="Wpisz adres"
                    />

                    <select
                        value={pointType}
                        onChange={(e) => setPointType(e.target.value)}
                    >
                        <option value="parcel_locker">Paczkomaty</option>
                        <option value="pop">Punkty odbioru</option>
                        <option value="all">Wszystkie</option>
                    </select>

                    <button onClick={fetchPoints} disabled={loading}>
                        {loading ? "Szukam..." : "Szukaj"}
                    </button>

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={only24h}
                            onChange={(e) => {
                                setOnly24h(e.target.checked);
                                setActiveIndex(0);
                            }}
                        />
                        Tylko 24/7
                    </label>
                </section>

                {loading && <p className="loading">Szukam najbliższych punktów...</p>}

                {!loading && searched && filteredPoints.length === 0 && (
                    <p className="loading">Brak wyników.</p>
                )}

                {bestPoint && (
                    <section className="best-card">
                        <span className="badge">Najlepszy wybór</span>
                        <h2>{bestPoint.name}</h2>
                        <p>{bestPoint.address}</p>
                        <p>{bestPoint.description}</p>
                        <p>
                            <strong>Dystans:</strong> {bestPoint.distanceKm} km
                        </p>
                        <p>
                            <strong>Godziny:</strong>{" "}
                            {bestPoint.open24h ? "24/7" : bestPoint.openingHours}
                        </p>
                        <p>
                            <strong>Status:</strong> {bestPoint.status}
                        </p>

                        <button onClick={() => openNavigation(bestPoint)}>
                            Nawiguj
                        </button>
                    </section>
                )}

                <section className="dashboard">
                    <div className="map-column">
                        <div className="map-card">
                            <Map
                                key={activePoint ? activePoint.name : "default-map"}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "12px"
                                }}
                                defaultCenter={mapCenter}
                                defaultZoom={13}
                                gestureHandling="greedy"
                                zoomControl={true}
                                scrollwheel={true}
                                draggable={true}
                                disableDoubleClickZoom={false}
                                fullscreenControl={true}
                                streetViewControl={true}
                                mapTypeControl={true}
                            >
                                {filteredPoints.map((point, index) => (
                                    <Marker
                                        key={point.name}
                                        position={{
                                            lat: point.latitude,
                                            lng: point.longitude
                                        }}
                                        label={String(index + 1)}
                                    />
                                ))}
                            </Map>
                        </div>

                        {filteredPoints.length > 0 && (
                            <>
                                <div className="analysis-card">
                                    <h3>📊 Analiza wyników</h3>

                                    <div className="stats-grid">
                                        <div>
                                            <span>Liczba punktów</span>
                                            <strong>{totalPoints}</strong>
                                        </div>

                                        <div>
                                            <span>Średnia odległość</span>
                                            <strong>{avgDistance} km</strong>
                                        </div>

                                        <div>
                                            <span>Najbliższy punkt</span>
                                            <strong>{closestDistance} km</strong>
                                        </div>

                                        <div>
                                            <span>Punkty 24/7</span>
                                            <strong>{open24hCount}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="chart-card">
                                    <h3>📈 Wykres odległości</h3>

                                    <div className="bar-chart">
                                        {filteredPoints.map((point) => {
                                            const width = Math.max(
                                                8,
                                                (point.distanceKm / maxDistance) * 100
                                            );

                                            return (
                                                <div className="bar-row" key={point.name}>
                                                    <span className="bar-label">
                                                        {point.name}
                                                    </span>

                                                    <div className="bar-track">
                                                        <div
                                                            className="bar-fill"
                                                            style={{
                                                                width: `${width}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="bar-value">
                                                        {point.distanceKm} km
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="heatmap-card">
                                    <h3>🔥 Heatmapa dystansu</h3>

                                    <div className="heatmap-grid">
                                        {heatBuckets.map((bucket) => {
                                            const intensity =
                                                bucket.count / maxBucketCount;

                                            return (
                                                <div
                                                    key={bucket.label}
                                                    className="heat-box"
                                                    style={{
                                                        opacity:
                                                            bucket.count === 0
                                                                ? 0.35
                                                                : 0.45 + intensity * 0.55
                                                    }}
                                                >
                                                    <strong>{bucket.count}</strong>
                                                    <span>{bucket.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="list">
                        <h2>Najbliższe punkty: {filteredPoints.length}</h2>

                        {activePoint && (
                            <div className="slider-wrapper">
                                <div className="slider-controls">
                                    <button onClick={previousPoint}>←</button>

                                    <span>
                                        {activeIndex + 1} / {filteredPoints.length}
                                    </span>

                                    <button onClick={nextPoint}>→</button>
                                </div>

                                <div
                                    className={
                                        activeIndex === 0
                                            ? "point-card highlighted"
                                            : "point-card"
                                    }
                                >
                                    <h3>
                                        {activeIndex + 1}. {activePoint.name}
                                    </h3>

                                    <p>
                                        <strong>Adres:</strong> {activePoint.address}
                                    </p>

                                    <p>
                                        <strong>Opis:</strong>{" "}
                                        {activePoint.description || "Brak opisu"}
                                    </p>

                                    <p>
                                        <strong>Dystans:</strong>{" "}
                                        {activePoint.distanceKm} km
                                    </p>

                                    <p>
                                        <strong>Godziny:</strong>{" "}
                                        {activePoint.open24h
                                            ? "24/7"
                                            : activePoint.openingHours}
                                    </p>

                                    <p>
                                        <strong>Status:</strong> {activePoint.status}
                                    </p>

                                    <button onClick={() => openNavigation(activePoint)}>
                                        Nawiguj
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </APIProvider>
    );
}

export default App;