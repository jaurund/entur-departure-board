import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Lock } from "lucide-react";

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

interface BikeStationDisplayProps {
  stations: BikeStation[];
}

export const BikeStationDisplay = ({ stations }: BikeStationDisplayProps) => {
  const [liveStations, setLiveStations] = useState<BikeStation[]>(stations);

  useEffect(() => {
    setLiveStations(stations);
  }, [stations]);

  useEffect(() => {
    const refreshStations = async () => {
      try {
        const stationIds = stations.map((s) => s.station_id);
        const response = await fetch(`http://localhost:5049/api/bike-data`);
        
        if (!response.ok) return;

        const allData: BikeStation[] = await response.json();
        const updated = allData.filter((station) =>
          stationIds.includes(station.station_id)
        );
        setLiveStations(updated);
      } catch (error) {
        console.error("Failed to refresh bike stations:", error);
      }
    };

    const interval = setInterval(refreshStations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [stations]);

  if (liveStations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-bike-bg border-bike-primary">
      <CardHeader className="bg-bike-primary/10">
        <CardTitle className="flex items-center gap-2 text-bike-primary">
          <Bike className="w-6 h-6" />
          Bergen Bysykkel - Sanntidsinformasjon
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-6">
          {liveStations.map((station) => (
            <div
              key={station.station_id}
              className="bg-card border-2 border-bike-primary/30 rounded-lg p-4 space-y-3"
            >
              <div className="font-semibold text-foreground text-sm line-clamp-2 min-h-[2.5rem]">
                {station.name}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-bike-available">
                    <Bike className="w-5 h-5" />
                    <span className="text-sm font-medium">Tilgjengelig</span>
                  </div>
                  <div className="text-2xl font-bold text-bike-primary">
                    {station.num_bikes_available}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                    <span className="text-sm font-medium">Ledige plasser</span>
                  </div>
                  <div className="text-xl font-semibold text-foreground">
                    {station.num_docks_available}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-bike-primary/20">
                <div className="flex gap-2 text-xs">
                  {station.is_renting && (
                    <span className="px-2 py-1 bg-bike-primary/20 text-bike-primary rounded">
                      Utleie aktiv
                    </span>
                  )}
                  {!station.is_renting && (
                    <span className="px-2 py-1 bg-destructive/20 text-destructive rounded">
                      Ikke utleie
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
