# Google Maps Platform Integration Setup Guide for MedSync

This document outlines the step-by-step configuration required to connect your **MedSync** healthcare application with the official **Google Maps Platform** and **Google Places API (New)**.

---

## 1. Google Cloud Console Setup

### Step 1.1: Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top bar and select **New Project**.
3. Name your project (e.g., `MedSync-Healthcare-Platform`) and click **Create**.

### Step 1.2: Enable Billing (Required by Google)
Google Maps Platform requires an active billing account, but provides a **\$200 monthly free credit** (equivalent to approximately 28,000 map loads per month at zero charge).
1. Go to **Billing** in the Google Cloud navigation menu.
2. Link your billing account to the `MedSync` project.

---

## 2. Enable the 4 Required Google APIs

In the Google Cloud Console, navigate to **APIs & Services &rarr; Library**, search for and enable each of the following four APIs:

1. **Maps JavaScript API**
   * *Purpose*: Renders the interactive map canvas, custom patient GPS pulsing marker, doctor pins, and custom info windows.
2. **Places API (New)** / **Places API**
   * *Purpose*: Powers the real-time search for nearby clinics, hospitals, general practitioners, cardiologists, dermatologists, and other medical specialists around the patient's GPS coordinates.
3. **Geocoding API**
   * *Purpose*: Converts the patient's latitude and longitude into readable street addresses (reverse geocoding) and converts manual search queries into coordinates.
4. **Routes API** / **Directions API**
   * *Purpose*: Powers turn-by-turn driving, walking, and transit navigation from the patient's coordinates to the doctor's facility.

---

## 3. Create & Secure Your API Key

### Step 3.1: Generate the API Key
1. Go to **APIs & Services &rarr; Credentials**.
2. Click **+ Create Credentials &rarr; API key**.
3. Copy the generated API key string.

### Step 3.2: Set Application Restrictions (Best Practice)
To prevent unauthorized usage while testing locally:
1. Under **Application restrictions**, choose **Websites**.
2. Under **Website restrictions**, click **Add** and enter:
   * `http://localhost:5173/*`
   * `http://127.0.0.1:5173/*`
   * `http://localhost:8000/*`
3. Under **API restrictions**, choose **Restrict key** and check:
   * Maps JavaScript API
   * Places API (New)
   * Geocoding API
   * Routes API
4. Click **Save**.

---

## 4. Configure Your MedSync Project

Add your API key to the frontend environment configuration file:

1. Open `frontend/.env` (or create it if it doesn't exist).
2. Set the `VITE_GOOGLE_MAPS_API_KEY` variable:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourRealGoogleMapsApiKeyHere
```

3. Restart the Vite development server so the environment variable is loaded:
```powershell
cd frontend
npm run dev
```

---

## 5. Browser Geolocation & Security Requirements

Browser security standards (W3C Geolocation API) require:
* **HTTPS Protocol** in production environments.
* **`localhost` or `127.0.0.1`** is permitted without SSL for local development.
* Ensure you click **"Allow"** when the browser prompts: *"http://localhost:5173 wants to know your location"*.
* If location access is denied, MedSync displays a helpful banner and allows you to enter your city or neighborhood manually to center the map.

---

## 6. Verification Checklist

| Requirement | Implementation Status | How to Verify |
| :--- | :---: | :--- |
| **Real GPS Detection** | Implemented | Opens Nearby Doctors &rarr; prompts browser for location &rarr; centers map. |
| **Initial 3 km Search** | Implemented | Default search radius is set to 3 km, with 3, 5, 10, 20 km filter options. |
| **Distance Sorting** | Implemented | Nearest doctors are sorted first using the Haversine spherical formula. |
| **Google Maps Directions** | Implemented | Clicking "Get Directions" opens `https://www.google.com/maps/dir/?api=1&origin=...&destination=...`. |
| **Driving / Walking / Transit** | Implemented | Quick toggle buttons update the direction URL mode. |
| **Live Navigation** | Implemented | "Navigate" button opens live turn-by-turn navigation on supported devices. |
| **Verified Distinction** | Implemented | Distinct green badges for **MedSync Verified Partners** vs blue for **Google Verified Places**. |
