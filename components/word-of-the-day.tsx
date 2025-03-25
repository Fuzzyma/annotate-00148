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
