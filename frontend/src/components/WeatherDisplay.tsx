import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WeatherData {
  properties?: {
    timeseries?: Array<{
      time: string;
      data: {
        instant: {
          details: {
            air_temperature: number;
            wind_speed: number;
          };
        };
        next_1_hours?: {
          summary: {
            symbol_code: string;
          };
        };
      };
    }>;
  };
}

export const WeatherDisplay = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5049/api/bergen-temp")
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch weather:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-16 w-16 bg-muted rounded-full"></div>
          <div className="flex-1">
            <div className="h-8 bg-muted rounded w-32 mb-2"></div>
            <div className="h-4 bg-muted rounded w-48"></div>
          </div>
        </div>
      </Card>
    );
  }

  const current = weather?.properties?.timeseries?.[0];
  const temp = current?.data?.instant?.details?.air_temperature;
  const windSpeed = current?.data?.instant?.details?.wind_speed;
  const symbol = current?.data?.next_1_hours?.summary?.symbol_code || "clearsky";

  const getWeatherIcon = () => {
    if (symbol.includes("rain")) return <CloudRain className="h-16 w-16" />;
    if (symbol.includes("cloud")) return <Cloud className="h-16 w-16" />;
    return <Sun className="h-16 w-16" />;
  };

  return (
    <Card className="p-8 bg-card border-border">
      <div className="flex items-center gap-6">
        <div className="text-accent">{getWeatherIcon()}</div>
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-1">
            {temp ? `${Math.round(temp)}°C` : "N/A"}
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Wind className="h-4 w-4" />
            Bergen - {windSpeed ? `${windSpeed} m/s` : "N/A"}
          </p>
        </div>
      </div>
    </Card>
  );
};
