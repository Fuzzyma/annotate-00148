"use client"

import type React from "react"

import { useDictionary, type Word } from "./dictionary-provider"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRef, useEffect } from "react"

export function WordList() {
  const { filteredWords, setSelectedWordId } = useDictionary()
  const listRef = useRef<HTMLDivElement>(null)

  // Focus the list container when it mounts for better keyboard navigation
  useEffect(() => {
    if (listRef.current) {
      listRef.current.focus()
    }
  }, [])

  const handleWordClick = (word: Word) => {
    setSelectedWordId(word.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent, word: Word) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setSelectedWordId(word.id)
    }
  }

  return (
    <div className="space-y-6" ref={listRef} tabIndex={-1} aria-label="Dictionary word list">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((word) => (
          <Card
            key={word.id}
            className="cursor-pointer hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => handleWordClick(word)}
            onKeyDown={(e) => handleKeyDown(e, word)}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${word.term}`}
          >
            <CardHeader className="pb-2">
              <CardTitle>{word.term}</CardTitle>
              <CardDescription>
                {word.definition.length > 100 ? `${word.definition.substring(0, 100)}...` : word.definition}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-2 pt-2">
              {word.region.map((region) => (
                <Badge key={region} variant="secondary">
                  {region}
                </Badge>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No words found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

