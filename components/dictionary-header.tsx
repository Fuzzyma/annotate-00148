"use client"

import { useState } from "react"
import { useDictionary } from "./dictionary-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DictionaryHeader() {
  const {
    activeView,
    setActiveView,
    setSearchTerm,
    searchTerm,
    selectedRegions,
    setSelectedRegions,
    setIsWordFormModalOpen,
    setWordToEdit,
    allRegions,
    selectedWordId,
  } = useDictionary()
  const [regionsPopoverOpen, setRegionsPopoverOpen] = useState(false)

  // Determine if we should show search and filter
  const showSearchAndFilter = activeView === "list" && !selectedWordId

  const handleRegionSelect = (region: string) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
  }

  const handleRemoveRegion = (region: string) => {
    setSelectedRegions((prev) => prev.filter((r) => r !== region))
  }

  const handleAddWord = () => {
    setWordToEdit(null) // Ensure we're in "add" mode
    setIsWordFormModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center sm:text-left">Regional Dialect Dictionary</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as "list" | "quiz")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Dictionary</TabsTrigger>
              <TabsTrigger value="quiz">Quiz Mode</TabsTrigger>
            </TabsList>
          </Tabs>

          {activeView === "list" && (
            <Button onClick={handleAddWord} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Word
            </Button>
          )}
        </div>
      </div>

      {showSearchAndFilter && (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search terms, definitions, or regions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedRegions.map((region) => (
                <Badge key={region} variant="secondary" className="flex items-center gap-1">
                  {region}
                  <button
                    type="button"
                    onClick={() => handleRemoveRegion(region)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    aria-label={`Remove ${region} filter`}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {region}</span>
                  </button>
                </Badge>
              ))}
            </div>

            <Popover open={regionsPopoverOpen} onOpenChange={setRegionsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {selectedRegions.length > 0
                    ? `${selectedRegions.length} region${selectedRegions.length > 1 ? "s" : ""} selected`
                    : "Filter by region"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" side="bottom" className="w-[300px]">
                <Command>
                  <CommandInput placeholder="Search regions..." />
                  <CommandList>
                    <CommandEmpty>No regions found.</CommandEmpty>
                    <CommandGroup>
                      {allRegions.map((region) => (
                        <CommandItem
                          key={region}
                          onSelect={() => handleRegionSelect(region)}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              selectedRegions.includes(region)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
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
        </>
      )}
    </div>
  )
}

