"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import geoJsonData from "@/app/assets/sq_merged_3978.geojson";
import Legend from "./components/Legend";
import { getColorForDuration } from "./utils/colorUtils";
import Controls from "./components/Controls";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// GeoJSON display component
const GeoJsonLayer = ({
  office1Minutes,
  office2Minutes,
  activeMap,
  intersectionActive,
  onLoadingChange,
}: {
  office1Minutes: number;
  office2Minutes: number;
  activeMap: 1 | 2;
  intersectionActive: boolean;
  onLoadingChange: (loading: boolean) => void;
}) => {
  const map = useMap();
  const [features, setFeatures] = useState<google.maps.Data | null>(null);

  // Memoized styling function to prevent unnecessary recalculations
  const getFeatureStyle = useCallback(
    (feature: google.maps.Data.Feature) => {
      const office1Duration: number = feature.getProperty(
        "duration_minutes_1"
      ) as number;
      const office2Duration: number = feature.getProperty(
        "duration_minutes_2"
      ) as number;

      let isWithinThreshold: boolean;
      const durationMinutes =
        activeMap === 1 ? office1Duration : office2Duration;

      if (intersectionActive) {
        isWithinThreshold =
          office1Duration <= office1Minutes &&
          office2Duration <= office2Minutes;
      } else {
        const thresholdMinutes =
          activeMap === 1 ? office1Minutes : office2Minutes;
        isWithinThreshold = durationMinutes <= thresholdMinutes;
      }

      return {
        fillColor: getColorForDuration(durationMinutes),
        fillOpacity: isWithinThreshold ? 0.2 : 0,
        strokeWeight: 0,
      };
    },
    [office1Minutes, office2Minutes, activeMap, intersectionActive]
  );

  // Initialize features
  useEffect(() => {
    if (!map) return;

    const featuresLayer = new google.maps.Data();
    featuresLayer.addGeoJson(geoJsonData);
    setFeatures(featuresLayer);

    return () => {
      featuresLayer.setMap(null);
      setFeatures(null);
    };
  }, [map]);

  // Handle style updates asynchronously
  useEffect(() => {
    if (!features || !map) return;

    const updateStyles = async () => {
      onLoadingChange(true);

      try {
        // Use requestAnimationFrame to prevent UI blocking
        await new Promise((resolve) => requestAnimationFrame(resolve));

        features.setMap(null); // Temporarily hide while updating

        // Update styles in chunks to prevent UI freezing
        const featureArray: google.maps.Data.Feature[] = [];
        features.forEach((feature) => featureArray.push(feature));

        const chunkSize = 100;
        for (let i = 0; i < featureArray.length; i += chunkSize) {
          const chunk = featureArray.slice(i, i + chunkSize);
          await new Promise((resolve) => {
            requestAnimationFrame(() => {
              chunk.forEach((feature) => {
                features.overrideStyle(feature, getFeatureStyle(feature));
              });
              resolve(null);
            });
          });
        }

        features.setMap(map); // Show updated features
      } finally {
        onLoadingChange(false);
      }
    };

    updateStyles();
  }, [map, features, getFeatureStyle, onLoadingChange]);

  return null;
};

const LoadingOverlay = () => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
    <Alert className="bg-white border-blue-500">
      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      <AlertDescription className="ml-2">Updating map...</AlertDescription>
    </Alert>
  </div>
);

// Main Map Component
export default function Home() {
  const [office1Minutes, setOffice1Minutes] = useState(30);
  const [office2Minutes, setOffice2Minutes] = useState(30);
  const [activeMap, setActiveMap] = useState<1 | 2>(1);
  const [isIntersectActive, setIsIntersectActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced state updates
  const handleOffice1Change = useCallback((value: number) => {
    setIsLoading(true);
    setTimeout(() => setOffice1Minutes(value), 0);
  }, []);

  const handleOffice2Change = useCallback((value: number) => {
    setIsLoading(true);
    setTimeout(() => setOffice2Minutes(value), 0);
  }, []);

  const handleMapToggle = useCallback((value: 1 | 2) => {
    setIsLoading(true);
    setTimeout(() => setActiveMap(value), 0);
  }, []);

  const handleIntersectChange = useCallback((value: boolean) => {
    setIsLoading(true);
    setTimeout(() => setIsIntersectActive(value), 0);
  }, []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <div className="relative w-screen h-screen">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={{ lat: 37.785404596156646, lng: -122.41908291811968 }}
          defaultZoom={14}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          mapId={"b1b1b1b1b1b1b1b1"}
        >
          {/* Databricks Office Marker */}
          <AdvancedMarker
            position={{ lat: 37.79122360055304, lng: -122.39364494609279 }}
          >
            <div className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full font-bold shadow-lg text-xs">
              1
            </div>
          </AdvancedMarker>

          {/* Letterman Location Marker */}
          <AdvancedMarker
            position={{ lat: 37.79887630295745, lng: -122.44933665907878 }}
          >
            <div className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full font-bold shadow-lg text-xs">
              2
            </div>
          </AdvancedMarker>

          <GeoJsonLayer
            office1Minutes={office1Minutes}
            office2Minutes={office2Minutes}
            activeMap={activeMap}
            intersectionActive={isIntersectActive}
            onLoadingChange={setIsLoading}
          />
          <Legend />
          <Controls
            onOffice1Change={handleOffice1Change}
            onOffice2Change={handleOffice2Change}
            onMapToggle={handleMapToggle}
            onIntersectChange={handleIntersectChange}
            disabled={isLoading}
          />
        </Map>
        {isLoading && <LoadingOverlay />}
      </div>
    </APIProvider>
  );
}
