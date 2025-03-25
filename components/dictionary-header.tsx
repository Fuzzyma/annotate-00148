"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { useDictionary } from "./dictionary-provider";
import { RegionSelector } from "./region-selector";

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
  } = useDictionary();

  // Determine if we should show search and filter
  const showSearchAndFilter = activeView === "list" && !selectedWordId;

  const handleAddWord = () => {
    setWordToEdit(null);
    setIsWordFormModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center sm:text-left">
          Regional Dialect Dictionary
        </h1>
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
          <RegionSelector
            selectedRegions={selectedRegions}
            availableRegions={allRegions}
            onRegionsChange={setSelectedRegions}
          />

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
        </>
      )}
    </div>
  );
}
