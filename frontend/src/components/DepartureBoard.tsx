import { useEffect, useState } from "react";
import { Bus, AlertCircle, TramFront } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Departure {
  expectedDepartureTime: string;
  aimedDepartureTime: string;
  realtime: boolean;
  destinationDisplay: {
    frontText: string;
  };
  serviceJourney: {
    line: {
      name: string;
      id: string;
      transportMode: string;
    };
  };
}

interface DepartureBoardProps {
  stopId: string;
  stopName: string;
}

export const DepartureBoard = ({ stopId, stopName }: DepartureBoardProps) => {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract line number from line ID (e.g., "SKY:Line:19" -> "19")
  const getLineNumber = (lineId: string): string => {
    const parts = lineId.split(':');
    return parts[parts.length - 1] || lineId;
  };

  // Get transport mode colors and icons based on Entur style
  const getTransportStyle = (transportMode: string) => {
    const mode = transportMode?.toLowerCase();
    
    if (mode === 'tram') {
      return {
        bgColor: 'bg-[#b482fb]', // Entur tram purple
        icon: <TramFront className="h-4 w-4" />,
        label: 'Bybane'
      };
    }
    
    // Default to bus (pink)
    return {
      bgColor: 'bg-[#ff6392]', // Entur bus pink
      icon: <Bus className="h-4 w-4" />,
      label: 'Buss'
    };
  };

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        setLoading(true);
        console.log("Fetching departures for:", stopId);
        
        const response = await fetch(
          `http://localhost:5049/api/bus-departures?stopId=${encodeURIComponent(stopId)}&numberOfDepartures=20`
        );
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("API Response:", result);
        
        // The response structure is: { data: { estimatedCalls: [...] } }
        const estimatedCalls = result.data?.estimatedCalls || [];
        console.log("Estimated calls:", estimatedCalls);
        
        setDepartures(estimatedCalls);
      } catch (error) {
        console.error("Error fetching departures:", error);
        setDepartures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartures();
    const interval = setInterval(fetchDepartures, 30000);
    return () => clearInterval(interval);
  }, [stopId]);

  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) return "Nå";
    if (diffMins === 0) return "Nå";
    if (diffMins < 60) return `${diffMins} min`;
    
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getTimeClass = (expectedTime: string, aimedTime: string) => {
    const expected = new Date(expectedTime);
    const aimed = new Date(aimedTime);
    const now = new Date();
    const diffMs = expected.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const delayMs = expected.getTime() - aimed.getTime();
    const delayMins = Math.round(delayMs / 60000);

    if (delayMins > 2) return "text-transit-delay font-semibold";
    if (diffMins <= 5) return "text-transit-delay font-semibold";
    return "text-foreground";
  };

  if (loading) {
    return (
      <Card className="p-8 bg-board-bg border-border">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-20 bg-muted rounded"></div>
                <div className="flex-1 h-12 bg-muted rounded"></div>
                <div className="h-12 w-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-board-bg border-border overflow-hidden">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-1">{stopName}</h2>
        <p className="text-sm text-muted-foreground">Sanntid oppdateres automatisk</p>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[100px_1fr_120px] gap-4 pb-3 border-b border-border">
          <div className="text-sm font-semibold text-muted-foreground">Linje</div>
          <div className="text-sm font-semibold text-muted-foreground">Destinasjon</div>
          <div className="text-sm font-semibold text-muted-foreground text-right">Forventet</div>
        </div>

        {/* Departures */}
        {departures.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Bus className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Ingen avganger funnet</p>
          </div>
        ) : (
          departures.map((dep, idx) => {
            const transportStyle = getTransportStyle(dep.serviceJourney.line.transportMode);
            
            return (
              <div
                key={idx}
                className="grid grid-cols-[100px_1fr_120px] gap-4 py-3 border-b border-border/50 items-center hover:bg-muted/30 transition-colors"
              >
                {/* Line Number Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${transportStyle.bgColor} text-white font-bold px-3 py-2 text-base hover:${transportStyle.bgColor} flex items-center gap-2 min-w-[70px] justify-center`}
                  >
                    {transportStyle.icon}
                    {getLineNumber(dep.serviceJourney.line.id)}
                  </Badge>
                </div>

                {/* Destination */}
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium text-lg truncate">
                    {dep.destinationDisplay.frontText}
                  </span>
                  {!dep.realtime && (
                    <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>

                {/* Time */}
                <div className="text-right">
                  <span
                    className={`text-xl font-bold ${getTimeClass(
                      dep.expectedDepartureTime,
                      dep.aimedDepartureTime
                    )}`}
                  >
                    {formatTime(dep.expectedDepartureTime)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
