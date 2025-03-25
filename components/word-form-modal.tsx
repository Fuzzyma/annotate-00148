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
