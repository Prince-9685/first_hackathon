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
        <div className="absolute top-4 right-4 z-[2000] bg-warning/10 border border-warning/50 text-warning text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 font-medium tracking-wide shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <ShieldAlert size={12} /> Google Maps API Key Missing. Active Failsafe: OSRM/Leaflet Overrides
        </div>
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
