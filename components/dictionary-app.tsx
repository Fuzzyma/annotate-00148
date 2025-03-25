"use client";

import { useDictionary } from "./dictionary-provider";
import { DictionaryHeader } from "./dictionary-header";
import { WordList } from "./word-list";
import { WordDetail } from "./word-detail";
import { QuizMode } from "./quiz-mode";
import { WordFormModal } from "./word-form-modal";

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
          <>{selectedWordId ? <WordDetail /> : <WordList />}</>
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
