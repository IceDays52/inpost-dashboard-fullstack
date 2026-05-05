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

![Dashboard](https://github.com/user-attachments/assets/e2511860-fa35-4d25-9972-ba342cd0fbc4)

---

### Map view
Displays nearby points with markers and navigation.

![Map](https://github.com/user-attachments/assets/6f7487a4-d8b1-4aaa-beb1-27701a3c836a)

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
