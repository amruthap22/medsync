import React, { useState, useEffect, useRef } from 'react';
import '../NearbyDoctors.css';
import {
  MapPin,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Navigation,
  ExternalLink,
  Car,
  Footprints,
  Bus,
  ShieldCheck,
  Compass,
} from './Icons';
import {
  loadGoogleMapsScript,
  calculateHaversineDistance,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsNavigationUrl,
  searchNearbyGooglePlaces,
  reverseGeocodeCoords,
  forwardGeocodeAddress,
} from '../services/googleMapsService';

const API = 'http://127.0.0.1:8000';

export default function NearbyDoctorsTab({ onBookDoctorAppointment }) {
  // Geolocation & Address State
  const [patientCoords, setPatientCoords] = useState(null); // { lat, lng }
  const [patientAddress, setPatientAddress] = useState('');
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [isGeocodingManual, setIsGeocodingManual] = useState(false);

  // Filters State
  const [selectedRadius, setSelectedRadius] = useState('3'); // 3km initial default as required
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [travelMode, setTravelMode] = useState('driving'); // driving | walking | transit

  // Medical Providers State
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Google Maps State
  const [isMapReady, setIsMapReady] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [mapAuthError, setMapAuthError] = useState(null);

  // DOM Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const activeInfoWindowRef = useRef(null);

  const radiusOptions = ['3', '5', '10', '20'];
  const specialties = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Orthopedic Specialist',
    'Dental Surgeon',
    'Hospital & Medical Center',
  ];

  // =========================================================================
  // 1. AUTOMATIC GEOLOCATION ON MOUNT
  // =========================================================================
  const detectCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setPermissionDenied(false);

    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      setLocationError('Geolocation is not supported by your browser.');
      fallbackToDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        setPatientCoords(coords);
        setIsLocating(false);

        // Reverse geocode to get friendly street address
        try {
          const addr = await reverseGeocodeCoords(latitude, longitude);
          setPatientAddress(addr);
        } catch {
          setPatientAddress(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (GPS Verified)`);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('[MedSync Geolocation Error]:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setLocationError('Location permission was denied. Please allow location access or search your city/neighborhood below.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('GPS detection timed out. Using approximate network location.');
        } else {
          setLocationError('Unable to retrieve device GPS coordinates. Please search manually below.');
        }
        fallbackToDefaultLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fallbackToDefaultLocation = () => {
    // If not already set, provide Bengaluru medical district coordinates as graceful fallback
    if (!patientCoords) {
      const defaultLoc = { lat: 12.9716, lng: 77.5946 };
      setPatientCoords(defaultLoc);
      setPatientAddress('Bengaluru, Karnataka (Default Viewport)');
    }
  };

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  // Listen for Google Maps auth errors
  useEffect(() => {
    window.__medsync_onGoogleMapsAuthError = (errMsg) => {
      setMapAuthError(errMsg);
    };
    return () => {
      window.__medsync_onGoogleMapsAuthError = null;
    };
  }, []);

  // =========================================================================
  // 2. GOOGLE MAPS PLATFORM INITIALIZATION
  // =========================================================================
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript()
      .then((google) => {
        if (!isMounted) return;
        setIsMapReady(true);
        setApiKeyMissing(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.message === 'MISSING_API_KEY') {
          setApiKeyMissing(true);
        } else {
          console.warn('[MedSync Maps Notice]:', err.message);
          setApiKeyMissing(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Render or Update Google Map instance once coordinates and map API are ready
  useEffect(() => {
    if (!isMapReady || !patientCoords || !mapContainerRef.current || !window.google) return;

    if (!mapInstanceRef.current) {
      const mapOptions = {
        center: patientCoords,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.medical',
            elementType: 'geometry',
            stylers: [{ color: '#f0fdf4' }],
          },
          {
            featureType: 'poi.medical',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#047857' }],
          },
        ],
      };

      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
    } else {
      mapInstanceRef.current.panTo(patientCoords);
    }

    // Update Patient Current Location Marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Custom pulsing SVG marker for Patient
    const userMarkerIcon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 11,
      fillColor: '#0284c7',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3.5,
    };

    userMarkerRef.current = new window.google.maps.Marker({
      position: patientCoords,
      map: mapInstanceRef.current,
      title: 'Your Current Location',
      icon: userMarkerIcon,
      zIndex: 9999,
    });

    const userInfowindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 6px 10px; font-family: sans-serif; font-size: 13px;">
          <div style="color: #0284c7; font-weight: 800; font-size: 14px; margin-bottom: 3px;">
            📍 Your Current Location
          </div>
          <div style="color: #475569; font-size: 12px; line-height: 1.4;">
            ${patientAddress || 'GPS Coordinates Detected'}
          </div>
        </div>
      `,
    });

    userMarkerRef.current.addListener('click', () => {
      userInfowindow.open(mapInstanceRef.current, userMarkerRef.current);
    });
  }, [isMapReady, patientCoords, patientAddress]);

  // =========================================================================
  // 3. FETCH NEARBY PROVIDERS (MEDSYNC DB + GOOGLE PLACES)
  // =========================================================================
  const fetchNearbyProviders = async () => {
    if (!patientCoords) return;

    setLoadingProviders(true);
    const radiusKm = parseFloat(selectedRadius) || 3;

    try {
      // 1. Fetch MedSync Verified Doctors from backend with exact coordinates & Haversine distance
      let medsyncDocs = [];
      try {
        const queryParams = new URLSearchParams({
          lat: patientCoords.lat.toString(),
          lng: patientCoords.lng.toString(),
          radius_km: radiusKm.toString(),
        });
        if (selectedSpecialty !== 'All') {
          queryParams.append('specialty', selectedSpecialty);
        }
        if (searchFilter.trim()) {
          queryParams.append('search', searchFilter.trim());
        }

        const res = await fetch(`${API}/nearby-doctors?${queryParams.toString()}`);
        if (res.ok) {
          medsyncDocs = await res.json();
        }
      } catch (err) {
        console.warn('[MedSync DB Fetch fallback]:', err);
      }

      // 2. Fetch Google Places listings if Google Places is loaded
      let googlePlaces = [];
      if (isMapReady && window.google && mapInstanceRef.current) {
        try {
          googlePlaces = await searchNearbyGooglePlaces(mapInstanceRef.current, {
            lat: patientCoords.lat,
            lng: patientCoords.lng,
            radiusKm: radiusKm,
            specialty: selectedSpecialty,
            keyword: searchFilter,
          });
        } catch (err) {
          console.warn('[Google Places Search warning]:', err);
        }
      }

      // 3. Combine both lists
      // Flag MedSync docs and Google Places docs clearly
      const combined = [
        ...medsyncDocs.map((doc) => ({
          ...doc,
          is_medsync_verified: true,
          source: 'medsync',
        })),
        ...googlePlaces.map((place) => ({
          ...place,
          is_medsync_verified: false,
          source: 'google_places',
        })),
      ];

      // Re-calculate precise Haversine distance from current patient coordinates
      const withDistance = combined.map((d) => ({
        ...d,
        distance_km: calculateHaversineDistance(patientCoords.lat, patientCoords.lng, d.lat, d.lng),
      }));

      // Filter by radius strictly
      const inRadius = withDistance.filter((d) => d.distance_km <= radiusKm);

      // Filter by specialty if selected
      const filteredBySpec = inRadius.filter((d) => {
        if (selectedSpecialty === 'All') return true;
        const s = selectedSpecialty.toLowerCase();
        return (d.specialty || '').toLowerCase().includes(s) || (d.name || '').toLowerCase().includes(s);
      });

      // Filter by keyword search if entered
      const finalFiltered = filteredBySpec.filter((d) => {
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return (
          (d.name || '').toLowerCase().includes(q) ||
          (d.clinic || '').toLowerCase().includes(q) ||
          (d.address || '').toLowerCase().includes(q) ||
          (d.specialty || '').toLowerCase().includes(q)
        );
      });

      // Sort nearest first
      finalFiltered.sort((a, b) => a.distance_km - b.distance_km);

      setDoctorsList(finalFiltered);

      // Automatically select closest doctor
      if (finalFiltered.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(finalFiltered[0].id);
      }
    } catch (err) {
      console.error('[Nearby Providers Error]:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  // Re-fetch whenever patient coordinates, radius, or specialty change
  useEffect(() => {
    if (patientCoords) {
      fetchNearbyProviders();
    }
  }, [patientCoords, selectedRadius, selectedSpecialty, isMapReady]);

  // =========================================================================
  // 4. PLOT DOCTOR MARKERS ON GOOGLE MAP
  // =========================================================================
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    doctorsList.forEach((doc) => {
      const isMedsync = doc.is_medsync_verified;
      const isSelected = selectedDoctorId === doc.id;

      // Color-coded marker: Teal/Emerald for MedSync verified; Sky Blue for Google Places
      const markerPin = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: isMedsync ? '#059669' : '#0284c7',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: isSelected ? 1.8 : 1.4,
        anchor: new window.google.maps.Point(12, 22),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: doc.lat, lng: doc.lng },
        map: mapInstanceRef.current,
        title: `${doc.name} (${doc.distance_km} km)`,
        icon: markerPin,
        zIndex: isSelected ? 100 : 10,
      });

      const directionsUrl = patientCoords
        ? getGoogleMapsDirectionsUrl(patientCoords.lat, patientCoords.lng, doc.lat, doc.lng, travelMode)
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.clinic + ' ' + doc.address)}`;

      const infoContent = `
        <div style="max-width: 260px; font-family: sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background:${isMedsync ? '#dcfce7' : '#e0f2fe'}; color:${isMedsync ? '#15803d' : '#0369a1'}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${isMedsync ? '✓ MedSync Verified' : 'Google Verified Place'}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #f59e0b;">★ ${doc.rating}</span>
          </div>
          <strong style="font-size: 13.5px; color: #0f172a; display: block; margin-bottom: 2px;">${doc.name}</strong>
          <span style="font-size: 11.5px; color: #0284c7; font-weight: 600; display: block; margin-bottom: 2px;">${doc.specialty}</span>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px; line-height: 1.35;">${doc.address}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 8px;">
            <span style="color: #1d4ed8; font-weight: 800;">📍 ${doc.distance_km} km from you</span>
          </div>
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 6px; text-align: center; width: 100%; box-sizing: border-box;">
            Get Google Maps Directions ➔
          </a>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }
        infoWindow.open(mapInstanceRef.current, marker);
        activeInfoWindowRef.current = infoWindow;
        setSelectedDoctorId(doc.id);

        // Smoothly scroll doctor card into view
        const cardElem = document.getElementById(`doc-card-${doc.id}`);
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      markersRef.current.push({ marker, docId: doc.id, infoWindow });
    });
  }, [doctorsList, isMapReady, selectedDoctorId, travelMode, patientCoords]);

  // Handle clicking a doctor card in the list
  const handleSelectDoctorCard = (doc) => {
    setSelectedDoctorId(doc.id);

    if (mapInstanceRef.current && window.google) {
      mapInstanceRef.current.panTo({ lat: doc.lat, lng: doc.lng });
      mapInstanceRef.current.setZoom(15);

      const target = markersRef.current.find((m) => m.docId === doc.id);
      if (target) {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }
        target.infoWindow.open(mapInstanceRef.current, target.marker);
        activeInfoWindowRef.current = target.infoWindow;
      }
    }
  };

  // Handle manual address geocoding when permission is denied or patient wants to change location
  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setIsGeocodingManual(true);
    try {
      const geoResult = await forwardGeocodeAddress(manualQuery.trim());
      setPatientCoords({ lat: geoResult.lat, lng: geoResult.lng });
      setPatientAddress(geoResult.formatted_address);
      setLocationError(null);
      setPermissionDenied(false);
    } catch (err) {
      setLocationError(err.message || `Could not find coordinates for "${manualQuery}".`);
    } finally {
      setIsGeocodingManual(false);
    }
  };

  return (
    <div className="nearby-doctors-tab-container">
      {/* 1. Header & Actions Bar */}
      <div className="nearby-header-row">
        <div className="nearby-header-titles">
          <h2>Find Nearby Doctors &amp; Clinics</h2>
          <p>
            Real-time GPS geolocation, live distance calculations, and turn-by-turn Google Maps routing.
          </p>
        </div>

        <div className="nearby-header-actions">
          <button
            type="button"
            className="btn-refresh-location"
            onClick={detectCurrentLocation}
            disabled={isLocating}
            title="Recalculate your live GPS coordinates"
          >
            <RefreshCw width={16} height={16} className={isLocating ? 'spin-icon' : ''} />
            <span>{isLocating ? 'Detecting GPS...' : 'Refresh My Location'}</span>
          </button>
        </div>
      </div>

      {/* 2. Patient GPS Location Status Bar */}
      {patientCoords && !permissionDenied && (
        <div className="patient-location-status-card">
          <div className="location-detected-info">
            <span className="gps-pulse-beacon" />
            <div className="location-detected-text">
              <strong>Your Current Location (Active GPS Center)</strong>
              <span>{patientAddress || `${patientCoords.lat.toFixed(4)}°, ${patientCoords.lng.toFixed(4)}°`}</span>
            </div>
          </div>

          <div className="location-coords-chip">
            LAT: {patientCoords.lat.toFixed(4)} &bull; LNG: {patientCoords.lng.toFixed(4)}
          </div>
        </div>
      )}

      {/* 3. Location Permission Denied / Error Alert */}
      {permissionDenied && (
        <div className="location-alert-banner">
          <AlertTriangle width={22} height={22} />
          <div className="location-alert-content">
            <h4>Location Access Needed for Automatic GPS</h4>
            <p>
              Your browser blocked location permissions or device GPS is inactive. You can easily set your city or neighborhood below to find medical providers near you.
            </p>
            <div className="location-alert-actions">
              <button
                type="button"
                className="btn-retry-location"
                onClick={detectCurrentLocation}
              >
                Try Allowing Location Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Control & Search Strip */}
      <div className="nearby-control-strip">
        <div className="nearby-search-row">
          {/* Keyword Search */}
          <div className="search-input-box">
            <Search width={18} height={18} />
            <input
              type="text"
              placeholder="Search doctors, clinic name, or specialty..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {/* Manual Location Search */}
          <form className="manual-geocode-box" onSubmit={handleManualSearch}>
            <input
              type="text"
              placeholder="Change location (e.g. Indiranagar, Bengaluru)..."
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn-geocode-submit"
              disabled={isGeocodingManual}
            >
              {isGeocodingManual ? 'Locating...' : 'Set Area'}
            </button>
          </form>
        </div>

        {/* Filter Pills Grid */}
        <div className="nearby-filters-grid">
          {/* Radius Filter Pills */}
          <div className="filter-group-pill">
            <span className="filter-group-label">Search Radius:</span>
            <div className="radius-filter-pills">
              {radiusOptions.map((rad) => (
                <button
                  key={rad}
                  type="button"
                  className={`btn-radius-pill ${selectedRadius === rad ? 'active' : ''}`}
                  onClick={() => setSelectedRadius(rad)}
                >
                  {rad} km
                </button>
              ))}
            </div>
          </div>

          {/* Specialty Dropdown */}
          <div className="filter-group-pill">
            <span className="filter-group-label">Specialty:</span>
            <div className="specialty-select-wrapper">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Travel Mode Pills */}
          <div className="filter-group-pill">
            <span className="filter-group-label">Routing Mode:</span>
            <div className="travel-mode-pills">
              <button
                type="button"
                className={`btn-travel-mode ${travelMode === 'driving' ? 'active' : ''}`}
                onClick={() => setTravelMode('driving')}
                title="Driving directions"
              >
                <Car width={15} height={15} />
                <span>Driving</span>
              </button>
              <button
                type="button"
                className={`btn-travel-mode ${travelMode === 'walking' ? 'active' : ''}`}
                onClick={() => setTravelMode('walking')}
                title="Walking directions"
              >
                <Footprints width={15} height={15} />
                <span>Walking</span>
              </button>
              <button
                type="button"
                className={`btn-travel-mode ${travelMode === 'transit' ? 'active' : ''}`}
                onClick={() => setTravelMode('transit')}
                title="Public transit directions"
              >
                <Bus width={15} height={15} />
                <span>Transit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Two Column Layout: Map & Provider Directory */}
      <div className="nearby-two-column-layout">
        {/* Left Column: Map Card */}
        <div className="google-map-wrapper-card">
          <div className="map-top-bar">
            <div className="map-live-indicator">
              <span className="gps-pulse-beacon" style={{ width: 10, height: 10 }} />
              <span>Google Maps Live Medical Radar</span>
            </div>
            <span className="map-provider-counter">
              {doctorsList.length} Providers Found within {selectedRadius} km
            </span>
          </div>

          {/* Real Google Maps Canvas */}
          {isMapReady && !apiKeyMissing ? (
            <div ref={mapContainerRef} className="google-map-canvas" />
          ) : (
            /* Interactive Radar / GPS Fallback View */
            <div className="fallback-map-canvas">
              <div className="fallback-radar-rings" />
              <div className="fallback-radar-sweep" />

              {/* Patient GPS Center */}
              <div className="fallback-center-pin">
                <div className="fallback-center-dot" />
                <span className="fallback-center-label">
                  📍 You Are Here ({patientCoords ? `${patientCoords.lat.toFixed(2)}, ${patientCoords.lng.toFixed(2)}` : 'Detecting...'})
                </span>
              </div>

              {/* Doctor Markers distributed around center */}
              {doctorsList.map((doc, idx) => {
                const angles = [40, 130, 220, 310, 85, 175, 265, 345];
                const angleRad = (angles[idx % angles.length] * Math.PI) / 180;
                const radiusPx = 60 + Math.min((doc.distance_km / (parseFloat(selectedRadius) || 3)) * 110, 160);
                const x = Math.cos(angleRad) * radiusPx;
                const y = Math.sin(angleRad) * radiusPx;
                const isSelected = selectedDoctorId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={`fallback-doc-marker ${isSelected ? 'active' : ''} ${doc.is_medsync_verified ? 'is-medsync' : ''}`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                    onClick={() => handleSelectDoctorCard(doc)}
                    title={`${doc.name} - ${doc.distance_km} km`}
                  >
                    <div className="fallback-doc-pin-bubble">
                      <span>{doc.is_medsync_verified ? '🩺' : '🏥'}</span>
                      <span>{doc.name} &bull; {doc.distance_km} km</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="map-footer-notice">
            <span>
              Origin: <strong>{patientAddress || 'Detected GPS'}</strong>
            </span>
            <span>
              Real-time Google Routes &bull; Sorted strictly nearest first
            </span>
          </div>
        </div>

        {/* Right Column: Doctor Clinics Directory */}
        <div className="nearby-doctors-list-column">
          {loadingProviders ? (
            <div className="nearby-empty-state-card">
              <RefreshCw width={36} height={36} className="spin-icon" style={{ color: '#0284c7' }} />
              <h4>Scanning Medical Facilities...</h4>
              <p>Searching doctors, clinics, and hospitals within {selectedRadius} km.</p>
            </div>
          ) : doctorsList.length === 0 ? (
            <div className="nearby-empty-state-card">
              <MapPin width={44} height={44} className="nearby-empty-icon" />
              <h4>No Medical Providers Found Nearby</h4>
              <p>
                No clinics found within {selectedRadius} km for specialty "{selectedSpecialty}". Try expanding your search radius to 5 km, 10 km, or 20 km.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn-radius-pill active"
                  onClick={() => setSelectedRadius('10')}
                >
                  Expand to 10 km
                </button>
                <button
                  type="button"
                  className="btn-radius-pill active"
                  onClick={() => setSelectedRadius('20')}
                >
                  Expand to 20 km
                </button>
              </div>
            </div>
          ) : (
            doctorsList.map((doc) => {
              const isSelected = selectedDoctorId === doc.id;
              const directionsUrl = patientCoords
                ? getGoogleMapsDirectionsUrl(
                    patientCoords.lat,
                    patientCoords.lng,
                    doc.lat,
                    doc.lng,
                    travelMode
                  )
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.clinic + ' ' + doc.address)}`;

              const navigationUrl = patientCoords
                ? getGoogleMapsNavigationUrl(patientCoords.lat, patientCoords.lng, doc.lat, doc.lng)
                : directionsUrl;

              return (
                <div
                  key={doc.id}
                  id={`doc-card-${doc.id}`}
                  className={`nearby-clinic-card ${isSelected ? 'is-active-doctor' : ''}`}
                  onClick={() => handleSelectDoctorCard(doc)}
                >
                  <div className="clinic-card-top">
                    <div className="clinic-info-block">
                      <div className="clinic-title-row">
                        <h3 className="clinic-doc-name">{doc.name}</h3>
                        <span className="clinic-rating-badge">★ {doc.rating}</span>
                      </div>

                      <div className="clinic-badges-row">
                        {doc.is_medsync_verified ? (
                          <span className="badge-medsync-verified">
                            <ShieldCheck width={13} height={13} />
                            MedSync Verified Partner
                          </span>
                        ) : (
                          <span className="badge-google-place">
                            <Compass width={13} height={13} />
                            Google Places Verified Clinic
                          </span>
                        )}
                        <span className="clinic-specialty-badge">{doc.specialty}</span>
                      </div>

                      <strong className="clinic-name-title">{doc.clinic}</strong>
                      <p className="clinic-address-text">{doc.address}</p>
                    </div>

                    <div className="clinic-distance-badge">
                      <span className="distance-val">{doc.distance_km} km</span>
                      <span className="distance-sub">from you</span>
                    </div>
                  </div>

                  <div className="clinic-meta-row">
                    <div className="clinic-hours-text">
                      <Clock width={14} height={14} />
                      <span>{doc.availability || 'Open today • 09:00 AM - 06:00 PM'}</span>
                    </div>
                    <span className={`clinic-open-status ${doc.open_now !== false ? 'open' : 'closed'}`}>
                      {doc.open_now !== false ? 'Open Now' : 'Closed'}
                    </span>
                  </div>

                  <div className="clinic-actions-row">
                    {/* Get Directions with Mode */}
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-google-directions"
                      onClick={(e) => e.stopPropagation()}
                      title={`Open Google Maps ${travelMode} directions`}
                    >
                      <MapPin width={15} height={15} />
                      <span>Get Directions ({travelMode})</span>
                    </a>

                    {/* Live Turn-by-Turn Navigation */}
                    <a
                      href={navigationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-navigate-live"
                      onClick={(e) => e.stopPropagation()}
                      title="Launch live Google Maps turn-by-turn navigation"
                    >
                      <Navigation width={15} height={15} />
                      <span>Navigate</span>
                    </a>

                    {/* Book Visit */}
                    <button
                      type="button"
                      className="btn-book-clinic-slot"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onBookDoctorAppointment) {
                          onBookDoctorAppointment(doc);
                        }
                      }}
                    >
                      <Calendar width={15} height={15} />
                      <span>Book Consultation Visit</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
