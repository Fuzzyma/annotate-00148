"use client"

import { useState, useEffect, useRef } from "react"
import { useDictionary, type Word } from "./dictionary-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export function QuizMode() {
  const { words } = useDictionary()
  const [quizWords, setQuizWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const quizRef = useRef<HTMLDivElement>(null)

  // Initialize quiz with random words
  useEffect(() => {
    if (words.length < 4) {
      // Not enough words for a quiz
      return
    }

    // Shuffle and select exactly 10 words (or fewer if not enough)
    const shuffled = [...words].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(10, words.length))
    setQuizWords(selected)
    setCurrentWordIndex(0)
    setScore(0)
    setQuizCompleted(false)
    setIsAnswerRevealed(false)
    setSelectedAnswer(null)
  }, [words])

  // Focus the quiz container when it mounts for better keyboard navigation
  useEffect(() => {
    if (quizRef.current) {
      quizRef.current.focus()
    }
  }, [])

  // Generate multiple choice options for current word
  useEffect(() => {
    if (quizWords.length === 0) return

    const currentWord = quizWords[currentWordIndex]
    const correctAnswer = currentWord.definition

    // Get 3 random incorrect definitions
    const incorrectOptions = words
      .filter((word) => word.id !== currentWord.id)
      .map((word) => word.definition)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)

    // Combine and shuffle all options
    const allOptions = [correctAnswer, ...incorrectOptions].sort(() => 0.5 - Math.random())
    setOptions(allOptions)
  }, [currentWordIndex, quizWords, words])

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return

    const currentWord = quizWords[currentWordIndex]
    const isCorrect = selectedAnswer === currentWord.definition

    if (isCorrect) {
      setScore(score + 1)
    }

    setIsAnswerRevealed(true)
  }

  const handleNextQuestion = () => {
    if (currentWordIndex < quizWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setSelectedAnswer(null)
      setIsAnswerRevealed(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const restartQuiz = () => {
    // Shuffle and select new words
    const shuffled = [...words].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(10, words.length))
    setQuizWords(selected)
    setCurrentWordIndex(0)
    setScore(0)
    setQuizCompleted(false)
    setIsAnswerRevealed(false)
    setSelectedAnswer(null)
  }

  if (words.length < 4) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Mode</CardTitle>
          <CardDescription>Test your knowledge of regional dialect terms</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6">You need at least 4 words in your dictionary to start a quiz.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-muted-foreground">Add more words to enable Quiz Mode</p>
        </CardFooter>
      </Card>
    )
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
    )
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
    )
  }

  const currentWord = quizWords[currentWordIndex]

  return (
    <div className="space-y-4" ref={quizRef} tabIndex={-1} aria-label="Quiz question">
      <div className="flex justify-end">
        <div className="text-sm text-muted-foreground">Question {currentWordIndex + 1} of 10</div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">What does "{currentWord.term}" mean?</CardTitle>
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
              const optionId = `option-${index}`
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
                      setSelectedAnswer(option)
                    }
                  }}
                >
                  <div className="flex items-center w-full cursor-pointer">
                    <RadioGroupItem value={option} id={optionId} className="peer sr-only" />
                    <Label
                      htmlFor={optionId}
                      className="flex items-center w-full cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div className="flex-shrink-0 mr-2 border rounded-full w-4 h-4 flex items-center justify-center peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                        {selectedAnswer === option && <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <span className="flex-1">{option}</span>
                    </Label>
                  </div>
                  {isAnswerRevealed && option === currentWord.definition && (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" aria-label="Correct answer" />
                  )}
                  {isAnswerRevealed && option === selectedAnswer && option !== currentWord.definition && (
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" aria-label="Incorrect answer" />
                  )}
                </div>
              )
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
              {currentWordIndex < quizWords.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

