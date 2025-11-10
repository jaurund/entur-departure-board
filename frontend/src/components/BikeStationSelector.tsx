import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bike, MapPin } from "lucide-react";

interface BikeStation {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  num_bikes_available: number;
  num_docks_available: number;
  is_renting: boolean;
  is_returning: boolean;
}

interface BikeStationSelectorProps {
  onStationsSelect: (stations: BikeStation[]) => void;
}

export const BikeStationSelector = ({ onStationsSelect }: BikeStationSelectorProps) => {
  const [stations, setStations] = useState<BikeStation[]>([]);
  const [selectedStations, setSelectedStations] = useState<BikeStation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lat, setLat] = useState("60.3913");
  const [lon, setLon] = useState("5.3221");
  const [radius, setRadius] = useState("2");

  const fetchStations = async () => {
    try {
      const response = await fetch(
        `http://localhost:5049/api/bike-data?Lat=${lat}&Lon=${lon}&RadiusKm=${radius}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch bike stations");
      }

      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error("Failed to fetch bike stations:", error);
    }
  };

  useEffect(() => {
    fetchStations();
    const interval = setInterval(fetchStations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [lat, lon, radius]);

  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStation = (station: BikeStation) => {
    const isSelected = selectedStations.some((s) => s.station_id === station.station_id);
    
    if (isSelected) {
      const updated = selectedStations.filter((s) => s.station_id !== station.station_id);
      setSelectedStations(updated);
      onStationsSelect(updated);
    } else if (selectedStations.length < 5) {
      const updated = [...selectedStations, station];
      setSelectedStations(updated);
      onStationsSelect(updated);
    }
  };

  return (
    <Card className="bg-card border-bike-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-bike-primary">
          <Bike className="w-6 h-6" />
          Bergen Bysykkel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            step="0.0001"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="text-sm"
          />
          <Input
            type="number"
            step="0.0001"
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="text-sm"
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Radius (km)"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="text-sm"
          />
        </div>

        <Input
          type="text"
          placeholder="Søk etter stasjon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <div className="text-sm text-muted-foreground">
          Valgt {selectedStations.length} av 5 stasjoner
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredStations.map((station) => {
            const isSelected = selectedStations.some((s) => s.station_id === station.station_id);
            return (
              <Button
                key={station.station_id}
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-between text-left h-auto py-3 ${
                  isSelected ? "bg-bike-bg text-bike-text hover:bg-bike-bg/90" : ""
                }`}
                onClick={() => toggleStation(station)}
                disabled={!isSelected && selectedStations.length >= 5}
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{station.name}</div>
                  <div className="text-xs opacity-80 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {station.num_bikes_available} sykler tilgjengelig
                  </div>
                </div>
                <div className="text-xl font-bold">{station.num_bikes_available}</div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
