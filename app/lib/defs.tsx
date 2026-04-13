'use client';

import { RefObject, useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { openDb } from "../opendb";
import { z } from "zod";
import { getPoints } from "@/app/lib/actions";

interface Props {
   selectedFilters: {
        glass: boolean;
        plastic: boolean;
        metall: boolean;
    }
}

export default function Map({ selectedFilters }: Props) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map>(null);
    const markers = [];

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const initMap = async () => {
            const maplibregl = await import('maplibre-gl');

            map.current = new maplibregl.default.Map({
                container: mapContainer.current!,
                style: 'https://api.maptiler.com/maps/base-v4/style.json?key=Dpdm3D9OQnFUwiBXnU5A',
                center: [0, 0],
                zoom: 1,
                maplibreLogo: true
            });

            const points = await getPoints();
            const filters = [];
            if (selectedFilters.glass == true) {
                filters.push("glass");
            }
            if (selectedFilters.plastic == true) {
                filters.push("plastic");
            }
            if (selectedFilters.metall == true) {
                filters.push("metall");
            }
            const valid_points = [];
            for (let i = 0; i < points.length; i++) {
                for (let j = 0; j < filters.length; j++) {
                    if (points[i]["type"].search(filters[j]) != -1) {
                        valid_points.push(points[i]);
                    }
                }
            }
            if (filters.length == 0) {
                for (let i = 0; i < points.length; i++) {
                    valid_points.push(points[i]);
                }
            }

            for (let i = 0; i < valid_points.length; i++) {
                markers[i] = new maplibregl.Marker().setLngLat([valid_points[i]["x"], valid_points[i]["y"]]).addTo(map.current);
            }
        };

        initMap();

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [selectedFilters]);

    return (<div ref={ mapContainer } style = {{ height: '100%', width: '100%' }}/>);
}