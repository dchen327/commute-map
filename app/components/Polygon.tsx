import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { useMapsLibrary, useMap } from "@vis.gl/react-google-maps";

type PolygonEventProps = {
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onDrag?: (e: google.maps.MapMouseEvent) => void;
  onDragStart?: (e: google.maps.MapMouseEvent) => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  onMouseOver?: (e: google.maps.MapMouseEvent) => void;
  onMouseOut?: (e: google.maps.MapMouseEvent) => void;
};

type PolygonCustomProps = {
  encodedPaths?: string[];
};

export type PolygonProps = google.maps.PolygonOptions &
  PolygonEventProps &
  PolygonCustomProps;

// Changed PolygonRef to be just google.maps.Polygon without null
export type PolygonRef = google.maps.Polygon;

function usePolygon(props: PolygonProps): google.maps.Polygon | null {
  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    encodedPaths,
    ...polygonOptions
  } = props;

  const callbacks = useRef<Record<string, (e: unknown) => void>>({});
  Object.assign(callbacks.current, {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
  });

  const geometryLibrary = useMapsLibrary("geometry");
  const map = useMap();

  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map || !window.google) return;

    if (!polygonRef.current) {
      polygonRef.current = new google.maps.Polygon();
    }

    const polygon = polygonRef.current;
    polygon.setMap(map);

    return () => {
      if (polygon) {
        polygon.setMap(null);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!polygonRef.current) return;
    polygonRef.current.setOptions(polygonOptions);
  }, [polygonOptions]);

  useEffect(() => {
    if (!encodedPaths || !geometryLibrary || !polygonRef.current) return;
    const paths = encodedPaths.map((path) =>
      geometryLibrary.encoding.decodePath(path)
    );
    polygonRef.current.setPaths(paths);
  }, [encodedPaths, geometryLibrary]);

  useEffect(() => {
    if (!polygonRef.current) return;

    const polygon = polygonRef.current;
    const gme = google.maps.event;

    const listeners = [
      ["click", "onClick"],
      ["drag", "onDrag"],
      ["dragstart", "onDragStart"],
      ["dragend", "onDragEnd"],
      ["mouseover", "onMouseOver"],
      ["mouseout", "onMouseOut"],
    ].map(([eventName, eventCallback]) =>
      gme.addListener(polygon, eventName, (e: google.maps.MapMouseEvent) => {
        const callback = callbacks.current[eventCallback];
        if (callback) callback(e);
      })
    );

    return () => {
      listeners.forEach((listener) => listener.remove());
    };
  }, []);

  return polygonRef.current;
}

export const Polygon = forwardRef<PolygonRef, PolygonProps>((props, ref) => {
  const polygon = usePolygon(props);

  // Only imperatively update the ref when we have a polygon instance
  useImperativeHandle(
    ref,
    () => {
      if (!polygon) {
        throw new Error("Polygon instance not yet initialized");
      }
      return polygon;
    },
    [polygon]
  );

  return null;
});

Polygon.displayName = "Polygon";
