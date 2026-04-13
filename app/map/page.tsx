'use client'

import dynamic from 'next/dynamic';
import { handleFilter } from "@/app/lib/actions";
import { useActionState, useState, useEffect } from "react"
import { getPoints } from "@/app/lib/actions";
import { openDb } from "../opendb"

const Map = dynamic(() => import("@/app/lib/defs"), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0'
        }}>
        Loading
        </div>
    )
});

const initialState = {
    success: "",
    errors: {
        glass: "",
        plastic: "",
        metall: "",
    }
};

export default function Home() {
    const [selectedFilters, setSelectedFilters] = useState({ glass: false, plastic: false, metall: false });
    return (
        <div style={{ height: "100%", width: "100%" }}>

            <input type="checkbox" checked={selectedFilters.glass} onChange={() => setSelectedFilters({ ...selectedFilters, glass: !selectedFilters.glass })}>
            </input><p>Glass</p>
            <input type="checkbox" checked={selectedFilters.plastic} onChange={() => setSelectedFilters({ ...selectedFilters, plastic: !selectedFilters.plastic })}>
            </input><p>Plastic</p>
            <input type="checkbox" checked={selectedFilters.metall} onChange={() => setSelectedFilters({ ...selectedFilters, metall: !selectedFilters.metall })}>
            </input><p>Metall</p>
            <Map selectedFilters={selectedFilters} />
            </div>);
}