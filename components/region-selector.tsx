"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";

type RegionSelectorProps = {
  selectedRegions: string[];
  availableRegions: string[];
  onRegionsChange: (regions: string[]) => void;
  className?: string;
  allowNew?: boolean;
};

export function RegionSelector({
  selectedRegions,
  availableRegions,
  onRegionsChange,
  className,
  allowNew = false,
}: RegionSelectorProps) {
  const [newRegion, setNewRegion] = useState("");
  const [regionsPopoverOpen, setRegionsPopoverOpen] = useState(false);

  const addRegion = () => {
    if (
      newRegion.trim() !== "" &&
      !selectedRegions.includes(newRegion.trim())
    ) {
      onRegionsChange([...selectedRegions, newRegion.trim()]);
      setNewRegion("");
    }
  };

  const removeRegion = (regionToRemove: string) => {
    onRegionsChange(
      selectedRegions.filter((region) => region !== regionToRemove)
    );
  };

  const handleSelectRegion = (region: string) => {
    onRegionsChange(
      selectedRegions.includes(region)
        ? selectedRegions.filter((r) => r !== region)
        : [...selectedRegions, region]
    );
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {selectedRegions.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedRegions.map((region) => (
            <Badge
              key={region}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {region}
              <button
                type="button"
                onClick={() => removeRegion(region)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {region}</span>
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Popover
          open={regionsPopoverOpen}
          onOpenChange={setRegionsPopoverOpen}
          modal
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="w-full justify-between"
            >
              <span>Select regions</span>
              <span className="sr-only">Open regions</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px]" align="start">
            <Command>
              <CommandInput placeholder="Search regions..." />
              <CommandList className="max-h-[200px] overflow-y-auto">
                <CommandEmpty>No regions found.</CommandEmpty>
                <CommandGroup>
                  {availableRegions.map((region) => (
                    <CommandItem
                      key={region}
                      onSelect={() => handleSelectRegion(region)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedRegions.includes(region)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{region}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {allowNew && (
        <div className="flex gap-2">
          <Input
            value={newRegion}
            onChange={(e) => setNewRegion(e.target.value)}
            placeholder="Add a new region"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRegion();
              }
            }}
          />
          <Button type="button" onClick={addRegion} variant="secondary">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
