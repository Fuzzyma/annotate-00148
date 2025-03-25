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
