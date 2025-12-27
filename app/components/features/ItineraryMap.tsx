"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ItineraryStop } from "@/app/lib/types";
import type { MapLayerMouseEvent } from "mapbox-gl";

type Props = {
    stops: ItineraryStop[];
    selectedStopIndex: number | null;
    onMarkerClick: (index: number) => void;
};

// Default center (Pune)
const INITIAL_VIEW_STATE = {
    latitude: 18.5204,
    longitude: 73.8567,
    zoom: 12
};

export function ItineraryMap({ stops, selectedStopIndex, onMarkerClick }: Props) {
    const mapRef = useRef<MapRef>(null);
    const hasInitiallyLoaded = useRef(false);
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

    // Zoom to selected stop
    useEffect(() => {
        if (selectedStopIndex !== null && stops[selectedStopIndex]) {
            const stop = stops[selectedStopIndex];
            mapRef.current?.flyTo({
                center: [stop.place.location.lng, stop.place.location.lat],
                zoom: 15,
                duration: 2000
            });
        }
    }, [selectedStopIndex, stops]);

    // Zoom to fit all stops on load
    useEffect(() => {
        if (stops.length > 0 && mapRef.current && !hasInitiallyLoaded.current) {
            const firstStop = stops[0];
            // Use jumpTo to instantly center without animation on initial load
            mapRef.current.jumpTo({
                center: [firstStop.place.location.lng, firstStop.place.location.lat],
                zoom: 13
            });
            hasInitiallyLoaded.current = true;
        }

        // Reset if stops are cleared (e.g. new generation)
        if (stops.length === 0) {
            hasInitiallyLoaded.current = false;
        }
    }, [stops]);

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden border border-border shadow-2xl relative">
            <Map
                ref={mapRef}
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            >
                {stops.map((stop, index) => (
                    <Marker
                        key={stop.place.id || index}
                        latitude={stop.place.location.lat}
                        longitude={stop.place.location.lng}
                        onClick={(e: any) => {
                            e.originalEvent.stopPropagation();
                            onMarkerClick(index);
                        }}
                    >
                        <div className={`
                            group cursor-pointer relative
                            ${selectedStopIndex === index ? "z-50 scale-125" : "z-10 scale-100 hover:scale-110"}
                            transition-transform duration-300
                        `}>
                            {/* Pin Head */}
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg
                                ${selectedStopIndex === index
                                    ? "bg-peshwa border-white text-white"
                                    : "bg-background border-peshwa text-peshwa"}
                            `}>
                                <span className="text-xs font-bold">{index + 1}</span>
                            </div>

                            {/* Pin Leg */}
                            <div className={`w-0.5 h-3 mx-auto ${selectedStopIndex === index ? "bg-peshwa" : "bg-peshwa/50"}`}></div>

                            {/* Label on Hover/Selected */}
                            {(selectedStopIndex === index || true) && (
                                <div className={`
                                    absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap px-2 py-1 bg-black/80 text-white text-[10px] rounded-md backdrop-blur-sm
                                    ${selectedStopIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                                    transition-opacity
                                `}>
                                    {stop.place.name}
                                </div>
                            )}
                        </div>
                    </Marker>
                ))}
            </Map>

            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-border shadow-sm">
                Mapbox Enabled 🗺️
            </div>
        </div>
    );
}
