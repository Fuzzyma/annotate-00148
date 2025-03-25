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
