import React from 'react';
import { TrafficMap } from './TrafficMap'; 
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { ShieldAlert } from 'lucide-react';

const containerStyle = { width: '100%', height: '100%' };
const center = { lat: 26.9124, lng: 75.7873 }; // Jaipur

export function GoogleTrafficMap(props) {
  // If VITE_GOOGLE_MAPS_KEY is not defined, we load the failsafe Leaflet-OSRM map!
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full relative">
        <TrafficMap {...props} />
      </div>
    );
  }

  // Production Implementation (Runs if API key is provided)
  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap 
         mapContainerStyle={containerStyle} 
         center={center} 
         zoom={13}
         options={{ styles: [ { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] } ] }}
      >
        {/* We would render props.nodes into Markers and props.routeInfo into Google Polylines here */}
        {/* Because this relies on premium billing API Keys, the actual working demo relies on the Failsafe mechanism */}
      </GoogleMap>
    </LoadScript>
  );
}
