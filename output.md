```tsx file="app/layout.tsx"
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
          <Toaster />
        </main>
      </body>
    </html>
  );
}
```

```tsx file="app/page.tsx"
import { DictionaryProvider } from "@/components/dictionary-provider";
import { DictionaryApp } from "@/components/dictionary-app";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <DictionaryProvider>
        <DictionaryApp />
      </DictionaryProvider>
    </main>
  );
}
```

```tsx file="components/dictionary-app.tsx"
"use client";

import { useDictionary } from "./dictionary-provider";
import { DictionaryHeader } from "./dictionary-header";
import { WordList } from "./word-list";
import { WordDetail } from "./word-detail";
import { QuizMode } from "./quiz-mode";
import { WordFormModal } from "./word-form-modal";
import { WordOfTheDay } from "./word-of-the-day";

export function DictionaryApp() {
  const {
    activeView,
    selectedWordId,
    isWordFormModalOpen,
    setIsWordFormModalOpen,
    wordToEdit,
  } = useDictionary();

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
      <DictionaryHeader />

      <div className="mt-6">
        {activeView === "list" && (
          <>
            {selectedWordId ? (
              <WordDetail />
            ) : (
              <div className="space-y-8">
                <WordOfTheDay />
                <WordList />
              </div>
            )}
          </>
        )}
        {activeView === "quiz" && <QuizMode />}
      </div>

      <WordFormModal
        open={isWordFormModalOpen}
        onOpenChange={setIsWordFormModalOpen}
        wordToEdit={wordToEdit}
      />
    </div>
  );
}
```

```tsx file="components/dictionary-header.tsx"
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
```

```tsx file="components/dictionary-provider.tsx"
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { mockDictionaryData } from "@/data/mock-data";

export type UsageExample = {
  id: string;
  text: string;
};

export type Word = {
  id: string;
  term: string;
  definition: string;
  region: string[];
  usageExamples: UsageExample[];
  contributor?: string;
  dateAdded: string;
};

type DictionaryContextType = {
  words: Word[];
  filteredWords: Word[];
  addWord: (word: Omit<Word, "id" | "dateAdded">) => Word;
  updateWord: (word: Word) => Word;
  deleteWord: (id: string) => Word | undefined;
  undoDelete: (word: Word) => void;
  activeView: "list" | "quiz";
  setActiveView: (view: "list" | "quiz") => void;
  selectedWordId: string | null;
  setSelectedWordId: (id: string | null) => void;
  wordToEdit: Word | null;
  setWordToEdit: (word: Word | null) => void;
  isWordFormModalOpen: boolean;
  setIsWordFormModalOpen: (isOpen: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
  allRegions: string[];
};

const DictionaryContext = createContext<DictionaryContextType | undefined>(
  undefined
);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [activeView, setActiveView] = useState<"list" | "quiz">("list");
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [wordToEdit, setWordToEdit] = useState<Word | null>(null);
  const [isWordFormModalOpen, setIsWordFormModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [lastDeletedWord, setLastDeletedWord] = useState<Word | null>(null);

  useEffect(() => {
    // Load mock data on initial render
    setWords(mockDictionaryData);
  }, []);

  // Clear selected word when switching to quiz mode
  const handleSetActiveView = (view: "list" | "quiz") => {
    if (view === "quiz") {
      setSelectedWordId(null);
    }
    setActiveView(view);
  };

  // Extract all unique regions
  const allRegions = Array.from(
    new Set(words.flatMap((word) => word.region))
  ).sort();

  // Filter words based on search term and selected regions
  const filteredWords = words.filter((word) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.region.some((r) =>
        r.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filter by selected regions
    const matchesRegion =
      selectedRegions.length === 0 ||
      word.region.some((r) => selectedRegions.includes(r));

    return matchesSearch && matchesRegion;
  });

  const addWord = (wordData: Omit<Word, "id" | "dateAdded">) => {
    const newWord: Word = {
      ...wordData,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    };
    setWords((prev) => [...prev, newWord]);
    return newWord;
  };

  const updateWord = (updatedWord: Word) => {
    setWords((prev) =>
      prev.map((word) => (word.id === updatedWord.id ? updatedWord : word))
    );
    return updatedWord;
  };

  const deleteWord = (id: string) => {
    const wordToDelete = words.find((word) => word.id === id);
    if (wordToDelete) {
      setWords((prev) => prev.filter((word) => word.id !== id));
    }
    return wordToDelete;
  };

  const undoDelete = (word: Word) => {
    setWords((prev) =>
      [...prev, word].sort(
        (wordA, wordB) =>
          new Date(wordA.dateAdded).getTime() -
          new Date(wordB.dateAdded).getTime()
      )
    );
    setLastDeletedWord(null);
  };

  return (
    <DictionaryContext.Provider
      value={{
        words,
        filteredWords,
        addWord,
        updateWord,
        deleteWord,
        undoDelete,
        activeView,
        setActiveView: handleSetActiveView,
        selectedWordId,
        setSelectedWordId,
        wordToEdit,
        setWordToEdit,
        isWordFormModalOpen,
        setIsWordFormModalOpen,
        searchTerm,
        setSearchTerm,
        selectedRegions,
        setSelectedRegions,
        allRegions,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}
```

```tsx file="components/quiz-mode.tsx"
"use client";

import { useState, useEffect, useRef } from "react";
import { useDictionary, type Word } from "./dictionary-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export function QuizMode() {
  const { words } = useDictionary();
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const quizRef = useRef<HTMLDivElement>(null);

  // Initialize quiz with random words
  useEffect(() => {
    if (words.length < 4) {
      // Not enough words for a quiz
      return;
    }

    // Shuffle and select exactly 10 words (or fewer if not enough)
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(10, words.length));
    setQuizWords(selected);
    setCurrentWordIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setIsAnswerRevealed(false);
    setSelectedAnswer(null);
  }, [words]);

  // Focus the quiz container when it mounts for better keyboard navigation
  useEffect(() => {
    if (quizRef.current) {
      quizRef.current.focus();
    }
  }, []);

  // Generate multiple choice options for current word
  useEffect(() => {
    if (quizWords.length === 0) return;

    const currentWord = quizWords[currentWordIndex];
    const correctAnswer = currentWord.definition;

    // Get 3 random incorrect definitions
    const incorrectOptions = words
      .filter((word) => word.id !== currentWord.id)
      .map((word) => word.definition)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Combine and shuffle all options
    const allOptions = [correctAnswer, ...incorrectOptions].sort(
      () => 0.5 - Math.random()
    );
    setOptions(allOptions);
  }, [currentWordIndex, quizWords, words]);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;

    const currentWord = quizWords[currentWordIndex];
    const isCorrect = selectedAnswer === currentWord.definition;

    if (isCorrect) {
      setScore(score + 1);
    }

    setIsAnswerRevealed(true);
  };

  const handleNextQuestion = () => {
    if (currentWordIndex < quizWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    // Shuffle and select new words
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(10, words.length));
    setQuizWords(selected);
    setCurrentWordIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setIsAnswerRevealed(false);
    setSelectedAnswer(null);
  };

  if (words.length < 4) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Mode</CardTitle>
          <CardDescription>
            Test your knowledge of regional dialect terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6">
            You need at least 4 words in your dictionary to start a quiz.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-muted-foreground">
            Add more words to enable Quiz Mode
          </p>
        </CardFooter>
      </Card>
    );
  }

  if (quizCompleted) {
    return (
      <div ref={quizRef} tabIndex={-1} aria-label="Quiz results">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Completed!</CardTitle>
            <CardDescription>Your final score</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6 space-y-4">
            <div className="text-4xl font-bold" aria-live="polite">
              {score} / {quizWords.length}
            </div>
            <Progress
              value={(score / quizWords.length) * 100}
              className="w-full"
              aria-label={`Score: ${score} out of ${quizWords.length}`}
            />
            <p className="text-muted-foreground mt-4">
              {score === quizWords.length
                ? "Perfect score! You're a dialect expert!"
                : score >= quizWords.length * 0.7
                ? "Great job! You know your regional dialects well."
                : "Keep learning! Regional dialects can be tricky."}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={restartQuiz}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizWords.length === 0 || !quizWords[currentWordIndex]) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Mode</CardTitle>
          <CardDescription>Loading quiz...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6">Preparing your quiz...</p>
        </CardContent>
      </Card>
    );
  }

  const currentWord = quizWords[currentWordIndex];

  return (
    <div
      className="space-y-4"
      ref={quizRef}
      tabIndex={-1}
      aria-label="Quiz question"
    >
      <div className="flex justify-end">
        <div className="text-sm text-muted-foreground">
          Question {currentWordIndex + 1} of 10
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">
                What does "{currentWord.term}" mean?
              </CardTitle>
              <CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentWord.region.map((region) => (
                    <Badge key={region} variant="outline">
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardDescription>
            </div>
            <div className="text-xl sm:text-2xl font-bold" aria-live="polite">
              {score} / {currentWordIndex}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={setSelectedAnswer}
            className="space-y-3"
            disabled={isAnswerRevealed}
            aria-label="Answer options"
          >
            {options.map((option, index) => {
              const optionId = `option-${index}`;
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 rounded-md border p-4 ${
                    isAnswerRevealed && option === currentWord.definition
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : isAnswerRevealed && option === selectedAnswer
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : ""
                  }`}
                  onClick={() => {
                    if (!isAnswerRevealed) {
                      setSelectedAnswer(option);
                    }
                  }}
                >
                  <div className="flex items-center w-full cursor-pointer">
                    <RadioGroupItem
                      value={option}
                      id={optionId}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={optionId}
                      className="flex items-center w-full cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div className="flex-shrink-0 mr-2 border rounded-full w-4 h-4 flex items-center justify-center peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                        {selectedAnswer === option && (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </Label>
                  </div>
                  {isAnswerRevealed && option === currentWord.definition && (
                    <Check
                      className="h-5 w-5 text-green-500 flex-shrink-0"
                      aria-label="Correct answer"
                    />
                  )}
                  {isAnswerRevealed &&
                    option === selectedAnswer &&
                    option !== currentWord.definition && (
                      <X
                        className="h-5 w-5 text-red-500 flex-shrink-0"
                        aria-label="Incorrect answer"
                      />
                    )}
                </div>
              );
            })}
          </RadioGroup>

          {isAnswerRevealed && (
            <div className="mt-6 space-y-4" aria-live="polite">
              <h3 className="font-semibold">Usage Examples:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {currentWord.usageExamples.map((example) => (
                  <li key={example.id}>{example.text}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {!isAnswerRevealed ? (
            <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentWordIndex < quizWords.length - 1
                ? "Next Question"
                : "See Results"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
```

```tsx file="components/region-selector.tsx"
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
```

```ts file="components/ui/use-toast.ts"
"use client";

// Adapted from https://github.com/shadcn-ui/ui/blob/main/apps/www/registry/default/ui/use-toast.ts
import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId));
          toastTimeouts.delete(toastId);
        }
      } else {
        for (const [id, timeout] of toastTimeouts.entries()) {
          clearTimeout(timeout);
          toastTimeouts.delete(id);
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });
  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
```

```tsx file="components/word-detail.tsx"
"use client";

import { useDictionary } from "./dictionary-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, Undo } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function WordDetail() {
  const {
    words,
    selectedWordId,
    setActiveView,
    setSelectedWordId,
    deleteWord,
    undoDelete,
    setWordToEdit,
    setIsWordFormModalOpen,
  } = useDictionary();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const selectedWord = words.find((word) => word.id === selectedWordId);

  if (!selectedWord) {
    return (
      <div className="text-center py-10">
        <p>Word not found. It may have been deleted.</p>
        <Button
          variant="link"
          onClick={() => {
            setActiveView("list");
            setSelectedWordId(null);
          }}
        >
          Return to dictionary
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    setWordToEdit(selectedWord);
    setIsWordFormModalOpen(true);
  };

  const handleDelete = () => {
    const deletedWord = deleteWord(selectedWord.id);
    setIsDeleteDialogOpen(false);
    setActiveView("list");
    setSelectedWordId(null);

    if (deletedWord) {
      toast("Word deleted", {
        description: `"${deletedWord.term}" has been removed from the dictionary.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              undoDelete(deletedWord);
              toast("Deletion undone", {
                description: `"${deletedWord.term}" has been restored to the dictionary.`,
              });
            }}
          >
            <Undo className="mr-2 h-4 w-4" />
            Undo
          </Button>
        ),
      });
    }
  };

  const formattedDate = new Date(selectedWord.dateAdded).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div
      className="space-y-4"
      ref={detailRef}
      tabIndex={-1}
      aria-label={`Details for ${selectedWord.term}`}
    >
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedWordId(null);
          }}
          aria-label="Back to dictionary list"
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">
                {selectedWord.term}
              </CardTitle>
              <CardDescription>
                Added {formattedDate}
                {selectedWord.contributor && ` by ${selectedWord.contributor}`}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Definition</h3>
            <p>{selectedWord.definition}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Usage Examples</h3>
            <ul className="list-disc pl-5 space-y-2">
              {selectedWord.usageExamples.map((example) => (
                <li key={example.id}>{example.text}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Regions</h3>
            <div className="flex flex-wrap gap-2">
              {selectedWord.region.map((region) => (
                <Badge key={region} variant="secondary">
                  {region}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this word?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{selectedWord.term}" from the
              dictionary. You can undo this action after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

```tsx file="components/word-form-modal.tsx"
"use client";

import { useState, useEffect } from "react";
import { useDictionary, type Word } from "./dictionary-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wordSchema, type WordFormValues } from "@/schemas/word-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { toast } from "sonner";
import { RegionSelector } from "./region-selector";

type WordFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wordToEdit?: Word | null;
};

export function WordFormModal({
  open,
  onOpenChange,
  wordToEdit,
}: WordFormModalProps) {
  const { addWord, updateWord, setActiveView, setSelectedWordId, allRegions } =
    useDictionary();
  const [newRegion, setNewRegion] = useState("");
  const [newExample, setNewExample] = useState("");
  const [regionsPopoverOpen, setRegionsPopoverOpen] = useState(false);

  // Determine if we're in edit mode based on whether wordToEdit is provided
  const isEditMode = !!wordToEdit;

  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      term: "",
      definition: "",
      region: [],
      usageExamples: [],
      contributor: "",
    },
  });

  // Reset form when modal opens with different data
  useEffect(() => {
    if (isEditMode && wordToEdit) {
      form.reset({
        term: wordToEdit.term,
        definition: wordToEdit.definition,
        region: [...wordToEdit.region],
        usageExamples: [...wordToEdit.usageExamples],
        contributor: wordToEdit.contributor || "",
      });
    } else if (!isEditMode) {
      form.reset({
        term: "",
        definition: "",
        region: [],
        usageExamples: [],
        contributor: "",
      });
    }
  }, [form, isEditMode, wordToEdit, open]);

  const onSubmit = (values: WordFormValues) => {
    if (!isEditMode) {
      const newWord = addWord({
        term: values.term,
        definition: values.definition,
        region: values.region,
        usageExamples: values.usageExamples,
        contributor: values.contributor || undefined,
      });

      toast("Word added", {
        description: `"${values.term}" has been added to the dictionary.`,
      });

      setActiveView("list");
    } else if (wordToEdit) {
      const updatedWord = updateWord({
        ...wordToEdit,
        term: values.term,
        definition: values.definition,
        region: values.region,
        usageExamples: values.usageExamples,
        contributor: values.contributor || undefined,
      });

      setSelectedWordId(updatedWord.id);
      setActiveView("list");

      toast("Word updated", {
        description: `"${values.term}" has been updated.`,
      });
    }

    onOpenChange(false);
  };

  const addRegion = () => {
    if (
      newRegion.trim() !== "" &&
      !form.getValues().region.includes(newRegion.trim())
    ) {
      const updatedRegions = [...form.getValues().region, newRegion.trim()];
      form.setValue("region", updatedRegions, { shouldValidate: true });
      setNewRegion("");
    }
  };

  const removeRegion = (regionToRemove: string) => {
    const updatedRegions = form
      .getValues()
      .region.filter((region) => region !== regionToRemove);
    form.setValue("region", updatedRegions, { shouldValidate: true });
  };

  const addExample = () => {
    if (newExample.trim() !== "") {
      const updatedExamples = [
        ...form.getValues().usageExamples,
        { id: crypto.randomUUID(), text: newExample.trim() },
      ];
      form.setValue("usageExamples", updatedExamples, { shouldValidate: true });
      setNewExample("");
    }
  };

  const removeExample = (exampleId: string) => {
    const updatedExamples = form
      .getValues()
      .usageExamples.filter((example) => example.id !== exampleId);
    form.setValue("usageExamples", updatedExamples, { shouldValidate: true });
  };

  const handleSelectRegion = (region: string) => {
    const currentRegions = form.getValues().region;
    const updatedRegions = currentRegions.includes(region)
      ? currentRegions.filter((r) => r !== region)
      : [...currentRegions, region];

    form.setValue("region", updatedRegions, { shouldValidate: true });
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Word" : "Add New Word"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details for this word"
              : "Add a new regional dialect term to the dictionary"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the dialect term"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contributor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contributor (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="definition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Definition</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a clear definition of the term"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regions</FormLabel>
                    <RegionSelector
                      allowNew
                      selectedRegions={field.value}
                      availableRegions={allRegions}
                      onRegionsChange={(regions) =>
                        form.setValue("region", regions, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageExamples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Examples</FormLabel>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          value={newExample}
                          onChange={(e) => setNewExample(e.target.value)}
                          placeholder="Add an example of how this term is used"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addExample();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addExample}
                          variant="secondary"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 mt-2">
                        {field.value.map((example) => (
                          <div
                            key={example.id}
                            className="flex items-center gap-2 p-2 rounded-md border"
                          >
                            <p className="flex-1">{example.text}</p>
                            <button
                              type="button"
                              onClick={() => removeExample(example.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove example</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Save Changes" : "Add Word"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx file="components/word-list.tsx"
"use client";

import type React from "react";

import { useDictionary, type Word } from "./dictionary-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef, useEffect } from "react";

export function WordList() {
  const { filteredWords, setSelectedWordId } = useDictionary();
  const listRef = useRef<HTMLDivElement>(null);

  const handleWordClick = (word: Word) => {
    setSelectedWordId(word.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, word: Word) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedWordId(word.id);
    }
  };

  return (
    <div
      className="space-y-6"
      ref={listRef}
      tabIndex={-1}
      aria-label="Dictionary word list"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((word) => (
          <Card
            key={word.id}
            className="cursor-pointer hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none flex flex-col"
            onClick={() => handleWordClick(word)}
            onKeyDown={(e) => handleKeyDown(e, word)}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${word.term}`}
          >
            <CardHeader className="pb-2">
              <CardTitle>{word.term}</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              <CardDescription className="line-clamp-2">
                {word.definition}
              </CardDescription>
            </CardContent>
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
          <p className="text-muted-foreground">
            No words found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
```

```tsx file="components/word-of-the-day.tsx"
"use client";

import { useMemo, useState, useEffect } from "react";
import { useDictionary } from "./dictionary-provider";
import { getWordOfTheDay, formatShareText } from "@/lib/word-of-the-day";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ArrowRight,
  Share2,
  Copy,
  Twitter,
  Facebook,
  MessageCircle,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function WordOfTheDay() {
  const { words, setSelectedWordId } = useDictionary();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Memoize the word of the day so it doesn't change on re-renders
  const wordOfTheDay = useMemo(() => getWordOfTheDay(words), [words]);

  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!wordOfTheDay) {
    return null;
  }

  const handleViewDetails = () => {
    setSelectedWordId(wordOfTheDay.id);
  };

  const handleCopyToClipboard = () => {
    const shareText = formatShareText(wordOfTheDay);
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      toast("Copied to clipboard", {
        description: "You can now paste the word of the day anywhere.",
      });

      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (platform: "twitter" | "facebook" | "whatsapp") => {
    const shareText = encodeURIComponent(formatShareText(wordOfTheDay));
    const shareUrl = encodeURIComponent(window.location.href);

    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${shareText} ${shareUrl}`;
        break;
    }

    window.open(shareLink, "_blank");
  };

  return (
    <Card
      className={cn(
        "border-2 border-primary/20 bg-primary/5 transition-all duration-700 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              Word of the Day
            </CardTitle>
            <CardDescription>
              <div className="flex items-center mt-1">
                <CalendarDays className="h-4 w-4 mr-1" />
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </CardDescription>
          </div>
          <div className="text-3xl font-bold text-primary animate-pulse">
            {wordOfTheDay.term}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Definition
          </h3>
          <p>{wordOfTheDay.definition}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Example
          </h3>
          <p className="italic">
            "{wordOfTheDay.usageExamples[0]?.text || "No example available"}"
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Regions
          </h3>
          <div className="flex flex-wrap gap-2">
            {wordOfTheDay.region.map((region) => (
              <Badge key={region} variant="outline">
                {region}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleCopyToClipboard}>
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy to clipboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("twitter")}>
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("facebook")}>
              <Facebook className="h-4 w-4 mr-2" />
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" onClick={handleViewDetails}>
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
```

```ts file="data/mock-data.ts"
import type { Word } from "@/components/dictionary-provider";

export const mockDictionaryData: Word[] = [
  {
    id: "1",
    term: "Y'all",
    definition: "Contraction of 'you all', used to address a group of people",
    region: ["Southern US", "Texas", "Appalachia"],
    usageExamples: [
      { id: "1a", text: "Y'all coming to the barbecue this weekend?" },
      { id: "1b", text: "I hope y'all had a good time at the party." },
    ],
    contributor: "Sarah Johnson",
    dateAdded: "2023-01-15T12:00:00Z",
  },
  {
    id: "2",
    term: "Wicked",
    definition: "Used as an intensifier, meaning 'very' or 'really'",
    region: ["New England", "Boston", "Massachusetts"],
    usageExamples: [
      { id: "2a", text: "That game was wicked awesome!" },
      { id: "2b", text: "It's wicked cold outside today." },
    ],
    contributor: "Mike Sullivan",
    dateAdded: "2023-01-16T14:30:00Z",
  },
  {
    id: "3",
    term: "Bubbler",
    definition: "A drinking fountain or water fountain",
    region: ["Wisconsin", "Rhode Island", "Massachusetts"],
    usageExamples: [
      { id: "3a", text: "I'm thirsty, where's the nearest bubbler?" },
      { id: "3b", text: "Meet me by the bubbler after class." },
    ],
    contributor: "Tom Peterson",
    dateAdded: "2023-01-17T09:15:00Z",
  },
  {
    id: "4",
    term: "Pop",
    definition: "A carbonated soft drink",
    region: ["Midwest", "Great Lakes", "Pacific Northwest"],
    usageExamples: [
      { id: "4a", text: "Can I get a pop with my sandwich?" },
      { id: "4b", text: "We need to buy more pop for the party." },
    ],
    contributor: "Jennifer Miller",
    dateAdded: "2023-01-18T16:45:00Z",
  },
  {
    id: "5",
    term: "Fixin' to",
    definition: "Preparing to do something, about to do something",
    region: ["Southern US", "Texas", "Oklahoma"],
    usageExamples: [
      { id: "5a", text: "I'm fixin' to head to the store, need anything?" },
      { id: "5b", text: "She's fixin' to graduate next month." },
    ],
    contributor: "Robert Davis",
    dateAdded: "2023-01-19T11:20:00Z",
  },
  {
    id: "6",
    term: "Jawn",
    definition:
      "A noun that can refer to literally anything - person, place, or thing",
    region: ["Philadelphia"],
    usageExamples: [
      { id: "6a", text: "Can you pass me that jawn over there?" },
      { id: "6b", text: "That jawn was crazy last night!" },
    ],
    contributor: "Chris Thompson",
    dateAdded: "2023-01-20T13:10:00Z",
  },
  {
    id: "7",
    term: "Ope",
    definition:
      "An exclamation used when nearly bumping into someone or making a minor mistake",
    region: ["Midwest", "Minnesota", "Wisconsin"],
    usageExamples: [
      {
        id: "7a",
        text: "Ope, sorry, just gonna squeeze past ya and grab the ranch.",
      },
      { id: "7b", text: "Ope! I didn't see you there." },
    ],
    contributor: "Lisa Anderson",
    dateAdded: "2023-01-21T10:05:00Z",
  },
  {
    id: "8",
    term: "Cattywampus",
    definition: "Something that is askew, crooked, or not aligned correctly",
    region: ["Southern US", "Appalachia"],
    usageExamples: [
      { id: "8a", text: "That picture frame is hanging all cattywampus." },
      {
        id: "8b",
        text: "My schedule got all cattywampus after the flight delay.",
      },
    ],
    contributor: "Emily Wilson",
    dateAdded: "2023-01-22T15:30:00Z",
  },
  {
    id: "9",
    term: "The City",
    definition: "Refers to San Francisco specifically, not just any city",
    region: ["Northern California", "Bay Area"],
    usageExamples: [
      { id: "9a", text: "We're heading to The City this weekend for dinner." },
      { id: "9b", text: "She works in The City but lives in Oakland." },
    ],
    contributor: "David Chen",
    dateAdded: "2023-01-23T17:40:00Z",
  },
  {
    id: "10",
    term: "Hella",
    definition: "Very, extremely, a lot",
    region: ["Northern California", "Bay Area"],
    usageExamples: [
      { id: "10a", text: "That movie was hella good!" },
      { id: "10b", text: "There were hella people at the concert." },
    ],
    contributor: "Jessica Wong",
    dateAdded: "2023-01-24T14:15:00Z",
  },
  {
    id: "11",
    term: "Yinz",
    definition: "Second-person plural pronoun, similar to 'y'all' or 'you all'",
    region: ["Pittsburgh", "Western Pennsylvania"],
    usageExamples: [
      { id: "11a", text: "Are yinz going to the Steelers game?" },
      { id: "11b", text: "Yinz want to get some food?" },
    ],
    contributor: "Mark Stevens",
    dateAdded: "2023-01-25T09:50:00Z",
  },
  {
    id: "12",
    term: "Grinder",
    definition: "A submarine sandwich, also known as a sub or hoagie",
    region: ["New England", "Connecticut"],
    usageExamples: [
      { id: "12a", text: "I ordered an Italian grinder for lunch." },
      { id: "12b", text: "That deli makes the best grinders in town." },
    ],
    contributor: "Nicole Adams",
    dateAdded: "2023-01-26T12:25:00Z",
  },
  {
    id: "13",
    term: "Bless your heart",
    definition:
      "A phrase that can express genuine sympathy or be a polite way of expressing disdain",
    region: ["Southern US", "Georgia", "Alabama"],
    usageExamples: [
      {
        id: "13a",
        text: "You failed your test? Bless your heart, you'll do better next time.",
      },
      { id: "13b", text: "He thinks he's so smart. Bless his heart." },
    ],
    contributor: "Amanda Carter",
    dateAdded: "2023-01-27T16:35:00Z",
  },
  {
    id: "14",
    term: "Ayuh",
    definition: "Yes, yeah, or I agree",
    region: ["Maine", "New England"],
    usageExamples: [
      { id: "14a", text: "Are you from around here? Ayuh, born and raised." },
      { id: "14b", text: "Ayuh, that's the way it's always been done." },
    ],
    contributor: "John Winters",
    dateAdded: "2023-01-28T10:40:00Z",
  },
  {
    id: "15",
    term: "Hoosier",
    definition: "A native or resident of Indiana",
    region: ["Indiana", "Midwest"],
    usageExamples: [
      { id: "15a", text: "She's a true Hoosier, born in Indianapolis." },
      { id: "15b", text: "The Hoosiers are playing basketball tonight." },
    ],
    contributor: "Michael Brown",
    dateAdded: "2023-01-29T13:55:00Z",
  },
  {
    id: "16",
    term: "Uff da",
    definition:
      "An exclamation expressing surprise, exhaustion, relief, or dismay",
    region: ["Minnesota", "North Dakota", "Upper Midwest"],
    usageExamples: [
      { id: "16a", text: "Uff da, that was a heavy box!" },
      { id: "16b", text: "Uff da, look at all that snow we got overnight." },
    ],
    contributor: "Karen Olson",
    dateAdded: "2023-01-30T11:05:00Z",
  },
  {
    id: "17",
    term: "Whoopensocker",
    definition: "Something extraordinary or outstanding",
    region: ["Wisconsin"],
    usageExamples: [
      {
        id: "17a",
        text: "That new restaurant downtown is a real whoopensocker!",
      },
      { id: "17b", text: "She made a whoopensocker of a cake for the party." },
    ],
    contributor: "Steve Johnson",
    dateAdded: "2023-01-31T15:20:00Z",
  },
  {
    id: "18",
    term: "Slippy",
    definition: "Slippery",
    region: ["Pittsburgh", "Western Pennsylvania"],
    usageExamples: [
      { id: "18a", text: "Be careful, the roads are slippy after the rain." },
      { id: "18b", text: "Don't run by the pool, it's slippy!" },
    ],
    contributor: "Rachel Morgan",
    dateAdded: "2023-02-01T09:30:00Z",
  },
  {
    id: "19",
    term: "Packie",
    definition: "A liquor store (short for 'package store')",
    region: ["Massachusetts", "New England"],
    usageExamples: [
      { id: "19a", text: "I'm stopping at the packie on my way home." },
      { id: "19b", text: "The packie closes at 11, so we should hurry." },
    ],
    contributor: "Brian Sullivan",
    dateAdded: "2023-02-02T14:45:00Z",
  },
  {
    id: "20",
    term: "Slug",
    definition:
      "A person who waits at a bus stop to get a free ride with a driver who needs passengers to use the HOV lane",
    region: ["Washington DC", "Northern Virginia"],
    usageExamples: [
      { id: "20a", text: "I was a slug for years before I bought my car." },
      { id: "20b", text: "The slug line was really long this morning." },
    ],
    contributor: "Laura Martinez",
    dateAdded: "2023-02-03T16:15:00Z",
  },
  {
    id: "21",
    term: "Kitty-corner",
    definition: "Diagonally opposite or across from",
    region: ["Midwest", "Great Lakes"],
    usageExamples: [
      { id: "21a", text: "The pharmacy is kitty-corner from the bank." },
      {
        id: "21b",
        text: "Meet me at the coffee shop that's kitty-corner to the library.",
      },
    ],
    contributor: "Daniel White",
    dateAdded: "2023-02-04T10:25:00Z",
  },
  {
    id: "22",
    term: "Reckon",
    definition: "To think, believe, or suppose",
    region: ["Southern US", "Appalachia"],
    usageExamples: [
      { id: "22a", text: "I reckon we'll get there around noon." },
      { id: "22b", text: "What do you reckon about that new restaurant?" },
    ],
    contributor: "William Turner",
    dateAdded: "2023-02-05T13:40:00Z",
  },
  {
    id: "23",
    term: "Wicked pissah",
    definition: "Something excellent or outstanding",
    region: ["Boston", "Massachusetts"],
    usageExamples: [
      { id: "23a", text: "That concert last night was wicked pissah!" },
      { id: "23b", text: "She got a wicked pissah deal on her new car." },
    ],
    contributor: "Kevin O'Brien",
    dateAdded: "2023-02-06T15:55:00Z",
  },
  {
    id: "24",
    term: "Youse",
    definition: "Second-person plural pronoun, similar to 'y'all' or 'you all'",
    region: ["Philadelphia", "New York", "New Jersey"],
    usageExamples: [
      { id: "24a", text: "Are youse going to the movies tonight?" },
      { id: "24b", text: "I told youse not to worry about it." },
    ],
    contributor: "Anthony Russo",
    dateAdded: "2023-02-07T11:10:00Z",
  },
  {
    id: "25",
    term: "Hotdish",
    definition:
      "A casserole, typically containing a starch, meat, and vegetables mixed with canned soup",
    region: ["Minnesota", "North Dakota"],
    usageExamples: [
      { id: "25a", text: "I'm bringing a tater tot hotdish to the potluck." },
      {
        id: "25b",
        text: "My grandma's hotdish recipe is famous in our family.",
      },
    ],
    contributor: "Sarah Peterson",
    dateAdded: "2023-02-08T14:20:00Z",
  },
  {
    id: "26",
    term: "Buggy",
    definition: "A shopping cart",
    region: ["Southern US", "Pittsburgh"],
    usageExamples: [
      { id: "26a", text: "Can you grab a buggy before we start shopping?" },
      { id: "26b", text: "My buggy has a squeaky wheel." },
    ],
    contributor: "Elizabeth Scott",
    dateAdded: "2023-02-09T16:30:00Z",
  },
  {
    id: "27",
    term: "Doorwall",
    definition: "A sliding glass door",
    region: ["Michigan", "Detroit"],
    usageExamples: [
      { id: "27a", text: "Let's open the doorwall and get some fresh air." },
      {
        id: "27b",
        text: "The cat is scratching at the doorwall to come inside.",
      },
    ],
    contributor: "James Wilson",
    dateAdded: "2023-02-10T09:45:00Z",
  },
  {
    id: "28",
    term: "Frappe",
    definition: "A milkshake with ice cream",
    region: ["New England", "Massachusetts"],
    usageExamples: [
      { id: "28a", text: "I'd like a chocolate frappe, please." },
      { id: "28b", text: "Their coffee frappes are the best in town." },
    ],
    contributor: "Michelle Thompson",
    dateAdded: "2023-02-11T12:50:00Z",
  },
  {
    id: "29",
    term: "Boondocks",
    definition: "A remote, rural area far from cities",
    region: ["Midwest", "Southern US"],
    usageExamples: [
      { id: "29a", text: "They live way out in the boondocks." },
      {
        id: "29b",
        text: "The cabin is in the boondocks, so bring everything you need.",
      },
    ],
    contributor: "Robert Johnson",
    dateAdded: "2023-02-12T15:05:00Z",
  },
  {
    id: "30",
    term: "Pork roll",
    definition:
      "A processed meat product popular in New Jersey, also known as Taylor ham",
    region: ["New Jersey", "Philadelphia"],
    usageExamples: [
      { id: "30a", text: "I'll have a pork roll, egg, and cheese sandwich." },
      {
        id: "30b",
        text: "No breakfast in New Jersey is complete without pork roll.",
      },
    ],
    contributor: "Thomas Murphy",
    dateAdded: "2023-02-13T10:15:00Z",
  },
  {
    id: "31",
    term: "Jimmies",
    definition: "Chocolate sprinkles for ice cream",
    region: ["Philadelphia", "Boston", "New England"],
    usageExamples: [
      { id: "31a", text: "I'd like vanilla ice cream with jimmies, please." },
      { id: "31b", text: "The sundae comes with whipped cream and jimmies." },
    ],
    contributor: "Jennifer Adams",
    dateAdded: "2023-02-14T13:25:00Z",
  },
  {
    id: "32",
    term: "Crick",
    definition: "A creek or small stream",
    region: ["Appalachia", "Pittsburgh", "Rural Midwest"],
    usageExamples: [
      {
        id: "32a",
        text: "We used to catch crawdads in the crick behind our house.",
      },
      { id: "32b", text: "The crick floods every spring." },
    ],
    contributor: "David Miller",
    dateAdded: "2023-02-15T16:35:00Z",
  },
  {
    id: "33",
    term: "Bubbler",
    definition: "A drinking fountain",
    region: ["Wisconsin", "Rhode Island"],
    usageExamples: [
      { id: "33a", text: "I need to get a drink from the bubbler." },
      { id: "33b", text: "There's a bubbler down the hall by the restrooms." },
    ],
    contributor: "Amy Nelson",
    dateAdded: "2023-02-16T09:40:00Z",
  },
  {
    id: "34",
    term: "Spendy",
    definition: "Expensive or costly",
    region: ["Pacific Northwest", "Minnesota"],
    usageExamples: [
      { id: "34a", text: "That new restaurant is a bit spendy for my budget." },
      { id: "34b", text: "These organic vegetables are spendy but worth it." },
    ],
    contributor: "Eric Thompson",
    dateAdded: "2023-02-17T12:55:00Z",
  },
  {
    id: "35",
    term: "Sweeper",
    definition: "A vacuum cleaner",
    region: ["Ohio", "Midwest"],
    usageExamples: [
      { id: "35a", text: "I need to run the sweeper before guests arrive." },
      { id: "35b", text: "Can you get the sweeper out of the closet?" },
    ],
    contributor: "Karen Williams",
    dateAdded: "2023-02-18T15:10:00Z",
  },
  {
    id: "36",
    term: "Toboggan",
    definition: "A knit cap or winter hat",
    region: ["Southern US", "Appalachia"],
    usageExamples: [
      { id: "36a", text: "Don't forget your toboggan, it's cold outside." },
      { id: "36b", text: "She knitted me a toboggan for Christmas." },
    ],
    contributor: "Richard Davis",
    dateAdded: "2023-02-19T11:20:00Z",
  },
  {
    id: "37",
    term: "Breezeway",
    definition:
      "A covered outdoor passage between two buildings or parts of a building",
    region: ["Midwest", "Great Lakes"],
    usageExamples: [
      { id: "37a", text: "We left our boots in the breezeway." },
      { id: "37b", text: "The breezeway connects the house to the garage." },
    ],
    contributor: "Patricia Brown",
    dateAdded: "2023-02-20T14:30:00Z",
  },
  {
    id: "38",
    term: "Clicker",
    definition: "A remote control for a TV",
    region: ["New England", "Boston"],
    usageExamples: [
      {
        id: "38a",
        text: "Has anyone seen the clicker? I want to change the channel.",
      },
      { id: "38b", text: "The clicker needs new batteries." },
    ],
    contributor: "Steven Roberts",
    dateAdded: "2023-02-21T16:45:00Z",
  },
  {
    id: "39",
    term: "Davenport",
    definition: "A sofa or couch",
    region: ["Midwest", "Great Lakes"],
    usageExamples: [
      {
        id: "39a",
        text: "Grandma fell asleep on the davenport watching her shows.",
      },
      {
        id: "39b",
        text: "We need to get a new davenport, this one is worn out.",
      },
    ],
    contributor: "Nancy Taylor",
    dateAdded: "2023-02-22T09:55:00Z",
  },
  {
    id: "40",
    term: "Mash",
    definition: "To press a button, especially on a remote control or phone",
    region: ["Southern US", "Appalachia"],
    usageExamples: [
      { id: "40a", text: "Mash the red button to record the show." },
      {
        id: "40b",
        text: "Just mash 'send' when you're done typing the message.",
      },
    ],
    contributor: "George Wilson",
    dateAdded: "2023-02-23T13:05:00Z",
  },
  {
    id: "41",
    term: "Tonic",
    definition: "A soft drink or soda",
    region: ["Boston", "Massachusetts"],
    usageExamples: [
      { id: "41a", text: "I'll have a tonic with my sandwich." },
      { id: "41b", text: "We need to pick up some tonic for the party." },
    ],
    contributor: "Catherine Sullivan",
    dateAdded: "2023-02-24T15:15:00Z",
  },
  {
    id: "42",
    term: "Yonder",
    definition: "Over there, at some distance but within sight",
    region: ["Southern US", "Appalachia"],
    usageExamples: [
      { id: "42a", text: "Your keys are over yonder on the table." },
      { id: "42b", text: "We're heading to that restaurant yonder." },
    ],
    contributor: "Daniel Carter",
    dateAdded: "2023-02-25T10:25:00Z",
  },
  {
    id: "43",
    term: "Whatchamacallit",
    definition:
      "A placeholder name for something whose name you can't remember",
    region: ["General US", "Widespread"],
    usageExamples: [
      { id: "43a", text: "Can you hand me that whatchamacallit over there?" },
      { id: "43b", text: "I need to use the whatchamacallit to fix this." },
    ],
    contributor: "Lisa Johnson",
    dateAdded: "2023-02-26T13:35:00Z",
  },
  {
    id: "44",
    term: "Stomping grounds",
    definition:
      "A place where someone spent their formative years or frequents often",
    region: ["Southern US", "Midwest"],
    usageExamples: [
      {
        id: "44a",
        text: "I'm heading back to my old stomping grounds for the reunion.",
      },
      { id: "44b", text: "This bar was my stomping grounds in college." },
    ],
    contributor: "Michael Thompson",
    dateAdded: "2023-02-27T16:50:00Z",
  },
  {
    id: "45",
    term: "Pitch",
    definition: "To throw something away",
    region: ["Midwest", "Great Lakes"],
    usageExamples: [
      {
        id: "45a",
        text: "Just pitch those old newspapers in the recycling bin.",
      },
      { id: "45b", text: "I pitched my notes after the semester ended." },
    ],
    contributor: "Rebecca Anderson",
    dateAdded: "2023-02-28T09:00:00Z",
  },
  {
    id: "46",
    term: "Janky",
    definition: "Of poor quality, unreliable, or suspicious",
    region: ["Urban US", "Widespread"],
    usageExamples: [
      {
        id: "46a",
        text: "My car is so janky, it barely starts in the morning.",
      },
      {
        id: "46b",
        text: "That website looks janky, I wouldn't enter your credit card info.",
      },
    ],
    contributor: "Jason Williams",
    dateAdded: "2023-03-01T12:10:00Z",
  },
  {
    id: "47",
    term: "Parlor",
    definition: "A living room or formal sitting room",
    region: ["New England", "Southern US"],
    usageExamples: [
      { id: "47a", text: "We only use the parlor when we have guests over." },
      { id: "47b", text: "Grandmother's antique piano is in the parlor." },
    ],
    contributor: "Elizabeth Martin",
    dateAdded: "2023-03-02T15:20:00Z",
  },
  {
    id: "48",
    term: "Snap",
    definition: "A cold spell or period of cold weather",
    region: ["Midwest", "Great Lakes"],
    usageExamples: [
      { id: "48a", text: "We're in for a cold snap this weekend." },
      {
        id: "48b",
        text: "The plants died during that snap we had last month.",
      },
    ],
    contributor: "Robert Wilson",
    dateAdded: "2023-03-03T10:30:00Z",
  },
  {
    id: "49",
    term: "Fixin's",
    definition: "Side dishes or accompaniments to a meal",
    region: ["Southern US", "Texas"],
    usageExamples: [
      {
        id: "49a",
        text: "We're having turkey with all the fixin's for Thanksgiving.",
      },
      {
        id: "49b",
        text: "The barbecue place has great fixin's like mac and cheese and coleslaw.",
      },
    ],
    contributor: "Sarah Davis",
    dateAdded: "2023-03-04T13:40:00Z",
  },
  {
    id: "50",
    term: "Cattywampus",
    definition: "Askew, crooked, or not aligned correctly",
    region: ["Southern US", "Appalachia"],
    usageExamples: [
      {
        id: "50a",
        text: "The picture frame is hanging all cattywampus on the wall.",
      },
      {
        id: "50b",
        text: "After the storm, everything in the yard was cattywampus.",
      },
    ],
    contributor: "James Anderson",
    dateAdded: "2023-03-05T11:50:00Z",
  },
];
```

```ts file="lib/word-of-the-day.ts"
import type { Word } from "@/components/dictionary-provider";

export function getWordOfTheDay(words: Word[]): Word | null {
  if (words.length === 0) return null;

  // Get current date components
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Create a deterministic seed based on the date
  // This ensures the same word is chosen on the same day for all users
  const dateSeed = year * 10000 + month * 100 + day;

  // Use the seed to select a word
  const index = dateSeed % words.length;

  return words[index];
}

export function formatShareText(word: Word): string {
  return (
    `📚 Word of the Day: "${word.term}"\n\n` +
    `Definition: ${word.definition}\n\n` +
    `Example: "${word.usageExamples[0]?.text || "No example available"}"\n\n` +
    `Regions: ${word.region.join(", ")}\n\n` +
    `From the Regional Dialect Dictionary`
  );
}
```

```ts file="schemas/word-schema.ts"
import * as z from "zod";

export const wordSchema = z.object({
  term: z.string().min(1, "Term is required"),
  definition: z.string().min(1, "Definition is required"),
  region: z.array(z.string()).min(1, "At least one region is required"),
  usageExamples: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .min(1, "At least one usage example is required"),
  contributor: z.string().optional(),
});

export type WordFormValues = z.infer<typeof wordSchema>;
```
