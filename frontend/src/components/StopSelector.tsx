import { useEffect, useState } from "react";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Stop {
  stopId: string;
  stopName: string;
  parentStation?: string;
}

interface UniqueStop {
  stopPlaceId: string;
  stopName: string;
}

interface StopSelectorProps {
  onStopSelect: (stopId: string, stopName: string) => void;
}

export const StopSelector = ({ onStopSelect }: StopSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [stops, setStops] = useState<Stop[]>([]);
  const [uniqueStops, setUniqueStops] = useState<UniqueStop[]>([]);
  const [filteredStops, setFilteredStops] = useState<UniqueStop[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStop, setSelectedStop] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:5049/api/stops/all")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched stops:", data.totalStops); // Debug log
        const allStops = data.stops || [];
        setStops(allStops);

        // Group by parent station to remove duplicates
        const stopMap = new Map<string, UniqueStop>();
        allStops.forEach((stop: Stop) => {
          const stopPlaceId = stop.parentStation || stop.stopId;
          if (!stopMap.has(stopPlaceId)) {
            stopMap.set(stopPlaceId, {
              stopPlaceId,
              stopName: stop.stopName,
            });
          }
        });

        const unique = Array.from(stopMap.values()).sort((a, b) =>
          a.stopName.localeCompare(b.stopName, "no")
        );

        console.log("Unique stops:", unique.length); // Debug log
        setUniqueStops(unique);
        setFilteredStops(unique);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch stops:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = uniqueStops.filter((stop) =>
        stop.stopName.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredStops(filtered);
    } else {
      setFilteredStops(uniqueStops);
    }
  }, [searchValue, uniqueStops]);

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Velg stoppested
      </h3>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background border-border"
          >
            <span className="text-muted-foreground">
              {selectedStop || "Søk etter stoppested..."}
            </span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] p-0 bg-popover border-border"
          align="start"
        >
          <Command className="bg-popover" shouldFilter={false}>
            <CommandInput
              placeholder="Søk stoppested..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0"
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>Laster...</CommandEmpty>
              ) : filteredStops.length === 0 ? (
                <CommandEmpty>Ingen stoppesteder funnet</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredStops.slice(0, 200).map((stop) => (
                    <CommandItem
                      key={stop.stopPlaceId}
                      value={stop.stopName}
                      onSelect={() => {
                        console.log("Selected stop:", stop.stopPlaceId, stop.stopName); // Debug log
                        setSelectedStop(stop.stopName);
                        onStopSelect(stop.stopPlaceId, stop.stopName);
                        setOpen(false);
                        setSearchValue("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check className={`mr-2 h-4 w-4 ${selectedStop === stop.stopName ? "opacity-100" : "opacity-0"}`} />
                      {stop.stopName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Card>
  );
};
