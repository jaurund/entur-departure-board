import { useState } from "react";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { StopSelector } from "@/components/StopSelector";
import { DepartureBoard } from "@/components/DepartureBoard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BikeStationSelector } from "@/components/BikeStationSelector";
import { BikeStationDisplay } from "@/components/BikeStationDisplay";

const Index = () => {
  const [selectedStop, setSelectedStop] = useState<{
    stopId: string;
    stopName: string;
  } | null>(null);
  const [selectedBikeStations, setSelectedBikeStations] = useState<any[]>([]);

  const handleStopSelect = (stopId: string, stopName: string) => {
    setSelectedStop({ stopId, stopName });
  };

  const handleBikeStationsSelect = (stations: any[]) => {
    setSelectedBikeStations(stations);
  };

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-2">Bergen Transport</h1>
          <p className="text-xl text-muted-foreground">Sanntidsinformasjon for buss i Bergen</p>
        </div>

        {/* Weather and Stop Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeatherDisplay />
          <StopSelector onStopSelect={handleStopSelect} />
        </div>

        {/* Bike Station Selector */}
        <div className="mb-8">
          <BikeStationSelector onStationsSelect={handleBikeStationsSelect} />
        </div>

        {/* Departure Board */}
        {selectedStop && (
          <div className="mb-8">
            <DepartureBoard
              stopId={selectedStop.stopId}
              stopName={selectedStop.stopName}
            />
          </div>
        )}

        {!selectedStop && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚌</div>
            <p className="text-xl text-muted-foreground">
              Velg et stoppested for å se avganger
            </p>
          </div>
        )}

        {/* Bike Station Display */}
        {selectedBikeStations.length > 0 && (
          <BikeStationDisplay stations={selectedBikeStations} />
        )}
      </div>
    </div>
  );
};

export default Index;
