/**
 * MedSync Google Maps & Places Platform Service
 * Handles dynamic API loading, real-time GPS geolocation, Places API (New) searching,
 * Haversine distance calculations, and official Google Maps Directions URLs.
 */

let googleMapsPromise = null;
let googleMapsAuthError = null;

// Track auth failures (e.g. InvalidKeyMapError, BillingNotEnabledMapError, RefererNotAllowedMapError)
if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    console.warn('[MedSync Google Maps] Authentication failure: please verify API key, billing, and HTTP referrer restrictions.');
    googleMapsAuthError = 'Google Maps API authentication failed. Please verify that your API key is valid, billing is active on Google Cloud, and HTTP referrer allows http://localhost:5173.';
    if (window.__medsync_onGoogleMapsAuthError) {
      window.__medsync_onGoogleMapsAuthError(googleMapsAuthError);
    }
  };
}

/**
 * Dynamically loads the Google Maps JavaScript API with places, geometry, and marker libraries.
 * Reads the key from import.meta.env.VITE_GOOGLE_MAPS_API_KEY.
 */
export function loadGoogleMapsScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is undefined'));
  }

  // If already loaded and ready
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google);
  }

  // If loading is in flight
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  // If no API key or placeholder
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return Promise.reject(new Error('MISSING_API_KEY'));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.getElementById('medsync-google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'medsync-google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry,marker&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps script loaded but window.google.maps is unavailable.'));
      }
    };

    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(new Error('Failed to load Google Maps script. Check network connectivity and API key settings.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Calculates accurate spherical Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 0;
  
  // Use google.maps geometry library if available
  if (window.google && window.google.maps && window.google.maps.geometry && window.google.maps.geometry.spherical) {
    try {
      const p1 = new window.google.maps.LatLng(lat1, lon1);
      const p2 = new window.google.maps.LatLng(lat2, lon2);
      const meters = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      return Math.round((meters / 1000) * 10) / 10;
    } catch {
      // fallback to manual haversine formula
    }
  }

  const R = 6371.0; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Generates an official Google Maps turn-by-turn Directions URL
 * Supports driving, walking, bicycling, transit.
 */
export function getGoogleMapsDirectionsUrl(originLat, originLng, destLat, destLng, travelMode = 'driving') {
  const origin = `${originLat},${originLng}`;
  const destination = `${destLat},${destLng}`;
  const validModes = {
    driving: 'driving',
    walking: 'walking',
    transit: 'transit',
    bicycling: 'bicycling',
  };
  const mode = validModes[travelMode] || 'driving';

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
}

/**
 * Generates an official Google Maps live turn-by-turn Navigation launch URL
 */
export function getGoogleMapsNavigationUrl(originLat, originLng, destLat, destLng) {
  const origin = `${originLat},${originLng}`;
  const destination = `${destLat},${destLng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&dir_action=navigate`;
}

/**
 * Searches nearby doctors, clinics, and hospitals using Google Places API (New/PlacesService)
 */
export function searchNearbyGooglePlaces(mapOrNode, { lat, lng, radiusKm = 3, specialty = 'All', keyword = '' }) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return reject(new Error('Google Places library is not loaded'));
    }

    try {
      const placesService = new window.google.maps.places.PlacesService(mapOrNode);
      const radiusMeters = Math.min(Math.max(radiusKm, 1), 50) * 1000;
      const center = new window.google.maps.LatLng(lat, lng);

      // Construct medical search terms
      let searchKeyword = 'doctor OR clinic OR hospital';
      if (specialty && specialty !== 'All') {
        searchKeyword = `${specialty} clinic OR ${specialty} doctor`;
      }
      if (keyword && keyword.trim()) {
        searchKeyword = `${keyword.trim()} ${searchKeyword}`;
      }

      const request = {
        location: center,
        radius: radiusMeters,
        type: ['doctor', 'hospital', 'health'],
        keyword: searchKeyword,
      };

      placesService.nearbySearch(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK ||
          status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          if (!results || results.length === 0) {
            return resolve([]);
          }

          const formatted = results.map((place, idx) => {
            const pLat = place.geometry?.location?.lat?.() || 0;
            const pLng = place.geometry?.location?.lng?.() || 0;
            const distance = calculateHaversineDistance(lat, lng, pLat, pLng);

            // Determine primary specialty label from types or name
            let derivedSpecialty = 'Healthcare Provider';
            const nameLower = (place.name || '').toLowerCase();
            const types = place.types || [];

            if (nameLower.includes('cardio') || types.includes('cardiologist')) derivedSpecialty = 'Cardiologist';
            else if (nameLower.includes('derma') || types.includes('dermatologist')) derivedSpecialty = 'Dermatologist';
            else if (nameLower.includes('pediatric') || nameLower.includes('children')) derivedSpecialty = 'Pediatrician';
            else if (nameLower.includes('neuro')) derivedSpecialty = 'Neurologist';
            else if (nameLower.includes('ortho')) derivedSpecialty = 'Orthopedic Specialist';
            else if (nameLower.includes('dental') || nameLower.includes('dentist')) derivedSpecialty = 'Dental Surgeon';
            else if (types.includes('hospital') || nameLower.includes('hospital')) derivedSpecialty = 'Hospital & Medical Center';
            else derivedSpecialty = 'General Physician & Clinic';

            return {
              id: place.place_id || `gplace-${idx}`,
              uuid: place.place_id || `gplace-${idx}`,
              name: place.name || 'Medical Clinic',
              clinic: place.name || 'Healthcare Facility',
              specialty: derivedSpecialty,
              address: place.vicinity || place.formatted_address || 'Nearby address',
              lat: pLat,
              lng: pLng,
              distance_km: distance,
              rating: place.rating ? parseFloat(place.rating.toFixed(1)) : 4.6,
              reviews_count: place.user_ratings_total || 24,
              open_now: place.opening_hours?.open_now ?? true,
              availability: place.opening_hours?.open_now ? 'Open now • Accepting Patients' : 'Consultation by appointment',
              icon: place.icon,
              google_place_id: place.place_id,
              is_medsync_verified: false,
              source: 'google_places',
            };
          });

          // Filter by radius strictly and sort nearest first
          const withinRadius = formatted.filter((item) => item.distance_km <= radiusKm);
          withinRadius.sort((a, b) => a.distance_km - b.distance_km);
          resolve(withinRadius);
        } else {
          console.warn('[MedSync Google Places] Status response:', status);
          resolve([]);
        }
      });
    } catch (err) {
      console.error('[MedSync Google Places Search Error]:', err);
      reject(err);
    }
  });
}

/**
 * Uses Google Maps Geocoder with OpenStreetMap Nominatim fallback to convert lat/lng into a friendly address
 */
export function reverseGeocodeCoords(lat, lng) {
  return new Promise(async (resolve) => {
    // 1. Try Google Maps Geocoder if loaded and available
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            return resolve(results[0].formatted_address);
          }
        });
      } catch (err) {
        // continue to free fallback
      }
    }

    // 2. Free OpenStreetMap Nominatim reverse geocode fallback
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { Accept: 'application/json' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.address) {
          const addr = data.address;
          const parts = [
            addr.road || addr.suburb || addr.neighbourhood || addr.residential,
            addr.suburb && addr.suburb !== addr.road ? addr.suburb : null,
            addr.city || addr.town || addr.county || 'Bengaluru',
            addr.state || ''
          ].filter(Boolean);
          if (parts.length > 0) {
            return resolve(parts.slice(0, 3).join(', '));
          }
          if (data.display_name) {
            return resolve(data.display_name.split(',').slice(0, 3).join(', '));
          }
        }
      }
    } catch {
      // ignore network errors and fallback to coordinate string
    }

    resolve(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
  });
}

/**
 * Uses Google Maps Geocoder with OpenStreetMap Nominatim fallback to convert an address query into coordinates
 */
export function forwardGeocodeAddress(addressQuery) {
  return new Promise(async (resolve, reject) => {
    // 1. Google Maps Geocoder if loaded
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: addressQuery }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            return resolve({
              lat: loc.lat(),
              lng: loc.lng(),
              formatted_address: results[0].formatted_address,
            });
          } else {
            fallbackNominatim(addressQuery, resolve, reject);
          }
        });
        return;
      } catch (err) {
        // continue to fallback
      }
    }

    // 2. OpenStreetMap Nominatim forward search fallback
    fallbackNominatim(addressQuery, resolve, reject);
  });
}

async function fallbackNominatim(addressQuery, resolve, reject) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`;
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        return resolve({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formatted_address: data[0].display_name,
        });
      }
    }
    reject(new Error(`Unable to locate "${addressQuery}". Please check the spelling or try another landmark.`));
  } catch {
    reject(new Error(`Unable to locate "${addressQuery}". Check connection and try again.`));
  }
}
