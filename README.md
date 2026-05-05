# InPost Smart Dashboard

Full-stack application for finding the nearest InPost parcel lockers and pickup points based on a user-provided address.

The project uses real data from the InPost API and Google Maps API.

---

## 🚀 What I built

I built a dashboard that helps users quickly find the closest InPost point near a given address.

The application:
- geocodes the entered address using Google Maps Geocoding API
- fetches real InPost points from the InPost API
- calculates distance between the user location and each point
- sorts results by distance
- displays the best matching point
- shows points on a Google Map
- provides analytics and distance visualizations

---

## 📸 Screenshots

### Dashboard view
Shows the closest point, statistics and distance visualization.

![Map](https://github.com/user-attachments/assets/6f7487a4-d8b1-4aaa-beb1-27701a3c836a)

---

### Map view
Displays nearby points with markers and navigation.
![Dashboard](https://github.com/user-attachments/assets/e2511860-fa35-4d25-9972-ba342cd0fbc4)


---

## 🧰 Tech stack

### Backend
- Java
- Spring Boot
- REST API
- JUnit

### Frontend
- React
- TypeScript
- CSS
- @vis.gl/react-google-maps

### External APIs
- InPost Points API  
- Google Maps Geocoding API  
- Google Maps JavaScript API  

---

## ✨ Features

- Search InPost points by address  
- Filter only 24/7 points  
- Choose point type:
  - parcel lockers  
  - pickup points  
  - all points  
- Display top 10 nearest points  
- Highlight the closest point  
- Map with markers  
- Navigation via Google Maps  
- Dashboard statistics:
  - number of points  
  - average distance  
  - closest point  
  - 24/7 points count  
- Distance chart  
- Heatmap  

---

## ⚙️ How it works

1. User enters an address  
2. Frontend sends request:

```txt
GET http://localhost:8080/api/points/dashboard?address=Ochocza&type=parcel_locker
```

---
## 3 Backend:

- converts address → coordinates (Google API)
- fetches points from InPost API
- calculates distances
- sorts and returns top 10 results
- Frontend renders dashboard
---

# Controller
## InPostController
```
@GetMapping("/api/points/dashboard")
```
- Get coordinates
- Fetch points
- Process data
- Calculate distance
- Return sorted results
# DTO 
```
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
)
```

---
# Distance calculation
Uses Haversine formula:
- spherical Earth model
- returns km
- rounded to 2 decimals
### Error handling
- address not found
- API fails
#### returns empty list

---

# Frontend architecture
## Responsibilities
- handle user input
- call backend
- render UI
- filter data
- display map and charts
  ## Main component
  ``` App.tsx ```
  ### Handles:
  - state
  - API calls
  - rendering
## State
```
address
points
loading
only24h
pointType
activeIndex
```
## Data flow
1. User input
2. API call
3. Save state
4. Filter
5. Render
## Map 
- Google Maps integration
- markers for points
- centered on active point
## UI features
- best point highlight
- slider navigation
- bar chart
- heatmap
- responsive design
# Testing
JUnit tests for backend logic.
### Covered
- correct distance calculation
- symmetry
- zero distance
- short and long distances
- rounding
### Example
```
@Test
void shouldCalculateDistanceBetweenWarsawAndPoznan() {
    double distance = controller.calculateDistance(...);
    assertTrue(distance > 200 && distance < 300);
}
```

# 📦 Setup
### Backend
```
./mvnw spring-boot:run
```
### Windows: 
```
mvnw.cmd spring-boot:run
```
### Frontend
```
npm install
npm run dev
```
### Environment
```
google.maps.api.key=YOUR_API_KEY
```


---

## 🧩 Variables and data model

This section explains the most important variables used in the backend and frontend.

---

## Backend variables

### `address`

```java
@RequestParam String address

Example:
```
Ochocza Warszawa
```
The backend sends this value to Google Geocoding API to get latitude and longitude.
 ```

### type
Possible values:
| Value           | Meaning         |
| --------------- | --------------- |
| `parcel_locker` | parcel lockers  |
| `pop`           | pickup points   |
| `all`           | all point types |
If the user does not select anything, the backend uses parcel_locker by default.

### googleApiKey

```
@Value("${google.maps.api.key}")
private String googleApiKey;
```

### ```userLat``` and ``` userLon ```

```
double userLat = userCoords[0];
double userLon = userCoords[1];
```
Latitude and longitude of the user address.
### They are used to: 
- search nearby InPost points
- calculate distance between user and point
### ``` uniqueResults ```
```
Map<String, PointDto> uniqueResults = new LinkedHashMap<>();
```
Stores processed points without duplicates.
The point name is used as the key.

### Why ``` LinkedHashMap ```
- keeps insertion order
- allows easy duplicate removal
- prevents the same point from appearing multiple times
### ```builder```
```
UriComponentsBuilder builder = UriComponentsBuilder
```
Builds the request URL for the InPost API.

## The backend sends:
- user coordinates
- maximum distance
- number of results
- point status
- selected point type
### ```response```
```
Map response = restTemplate.getForObject(uri, Map.class);
```
Stores raw response from the external API.
The backend checks whether the response contains ``` items ```.
If not, it returns an empty list.
### ```items```

```
List<Map<String, Object>> items =
    (List<Map<String, Object>>) response.get("items");

```

List of InPost points returned by the API.
### Each item contains details such as:
- name
- status
- address
- opening hours
- location
- type
### ``` addressDetails ```
```
Map<String, Object> addressDetails =
    (Map<String, Object>) item.get("address_details");
```
Contains address data of a point.
### Used fields: 
- city
- street
- building number
- post code
  ### ```location```
  ```
  Map<String, Object> location =
    (Map<String, Object>) item.get("location");

  ```
  Contains geographic coordinates of an InPost point.
  ### Used fields:
  - latitude
  - longitude
 ### ```distanceKm```

 ```
double distanceKm = calculateDistance(userLat, userLon, latitude, longitude);
```
Distance between the entered address and the InPost point.

The value is calculated using the Haversine formula and rounded to two decimal places.

### ```open24h```
```

boolean open24h = openingHours.equalsIgnoreCase("24/7");
```
Boolean value that tells whether the point is open 24/7.

Used later in the frontend filter.


### ```PointDto point```

  ```
PointDto point = new PointDto(...)
```
Represents one cleaned and processed point returned to the frontend.

It contains only the data needed by the UI.

---
# Frontend variables
---
### ```Point```

```
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

```
TypeScript type matching the backend ```PointDto```.

It gives the frontend information about what data is expected from the API.

### ```googleMapsApiKey```

```
const googleMapsApiKey = "KOD_API";
```
Google Maps JavaScript API key used by the frontend map.

In a production version, this should be moved to an environment variable.

### ```address```
```
const [address, setAddress] = useState("");
```
Stores the address typed by the user.

It is sent to the backend when the user clicks **Szukaj** or presses Enter.

### ```points```
```
const [points, setPoints] = useState<Point[]>([]);
```
Stores points returned from the backend.

Initially it is an empty array.

After successful API response, it contains nearby InPost points.
### ``` loading  ```
```
const [loading, setLoading] = useState(false);
```
Stores information whether the app is currently fetching data.
### Used to:
- disable the search button
- show loading text
- prevent confusing UI state
### ``` only24h  ```  
```
const [only24h, setOnly24h] = useState(false);
```
Controls the 24/7 filter.
If **true**, only points with ```open24h === true``` are displayed.
### ``` pointType  ```  
```
const [pointType, setPointType] = useState("parcel_locker");
```
Stores selected point type.

Possible values:
| Value           | Meaning         |
| --------------- | --------------- |
| `parcel_locker` | parcel lockers  |
| `pop`           | pickup points   |
| `all`           | all point types |

This value is sent to the backend as query parameter **type**.


### ``` searched  ```  
```
const [searched, setSearched] = useState(false);

```
Stores information whether the user has already performed a search.

This prevents showing **Brak wyników** before the first search.

### ```activeIndex```
```
const [activeIndex, setActiveIndex] = useState(0);
```
Stores index of the currently selected point in the slider.

Used to display one active point card and center the map around it

### ```filteredPoints```
```
const filteredPoints = only24h
  ? points.filter((p) => p.open24h)
  : points;
```
Contains points after applying the 24/7 filter.

If only24h is disabled, it contains all points.

### ```bestPoint```

```
const bestPoint = filteredPoints[0];

```
The first point from sorted results.

Because the backend sorts points by distance, this is the closest point.

### ```activePoint```
```
const activePoint =
  filteredPoints.length > 0
    ? filteredPoints[Math.min(activeIndex, filteredPoints.length - 1)]
    : undefined;
```
Currently selected point displayed in the right-side card.

**Math.min** protects the app from using an index that does not exist after filtering.

### ```mapCenter```

```const mapCenter = activePoint
  ? { lat: activePoint.latitude, lng: activePoint.longitude }
  : { lat: 52.2297, lng: 21.0122 };
```
Defines the map center.

Priority:
1. active point
2. best point
3. default Warsaw coordinates

### ```totalPoints```
```
const totalPoints = filteredPoints.length;
```
Number of currently displayed points.

Used in dashboard statistics.

### ```avgDistance```
```
const avgDistance =
  totalPoints > 0
    ? (
        filteredPoints.reduce((sum, p) => sum + p.distanceKm, 0) /
        totalPoints
      ).toFixed(2)
    : "0.00";
```
Average distance of displayed points.

Used in the analytics card.

### ```closestDistance```


```
const closestDistance = totalPoints > 0 ? filteredPoints[0].distanceKm : 0;
```
Distance to the closest point.

Because the backend sorts results by distance, the first item is the closest.

### ```open24hCount```
```
const open24hCount = filteredPoints.filter((p) => p.open24h).length;
```
Counts how many displayed points are open 24/7.

### ```maxDistance```

```
const maxDistance =
  totalPoints > 0
    ? Math.max(...filteredPoints.map((p) => p.distanceKm))
    : 1;
```
Largest distance in current results.

Used to calculate bar chart width.

Default value **1** prevents division by zero.


### ``` heatBuckets ```


```
const heatBuckets = [
  { label: "0-1 km", count: ... },
  { label: "1-3 km", count: ... },
  { label: "3-5 km", count: ... },
  { label: "5-10 km", count: ... },
  { label: "10+ km", count: ... }
];
```

Groups points by distance ranges.

Used to render the heatmap.

### ``` maxBucketCount ```
```
const maxBucketCount = Math.max(...heatBuckets.map((b) => b.count), 1);
```
Highest number of points in a heatmap bucket.

Used to calculate visual intensity.

Default value **1** prevents division by zero.

## fetchPoints
```
const fetchPoints = async () => { ... }
```
Main function responsible for fetching data.
### It:
- validates address
- sets loading state
- calls backend
- saves returned points
- resets active index
- handles errors
### ``` nextPoint ```

```
const nextPoint = () => { ... }
```
Moves slider to the next point.

If the user is on the last point, it returns to the first one.

### ``` previousPoint```
```
const previousPoint = () => { ... }
```
Moves slider to the previous point.

If the user is on the first point, it jumps to the last one.

### ``` openNavigation ```
```
const openNavigation = (point: Point) => { ... }
```
Opens Google Maps navigation for selected point.

It uses point latitude and longitude as destination.

  







