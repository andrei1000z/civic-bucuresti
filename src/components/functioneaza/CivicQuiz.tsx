"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Award, RefreshCw, Brain } from "lucide-react";
import { QUIZ } from "@/data/quiz-civic";
import { cn } from "@/lib/utils";

export function CivicQuiz() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  // QUIZ is a hardcoded non-empty array; guarded with `!` so the rest of
  // the component can treat `question` as definitely present.
  const question = QUIZ[current]!;

  const handleSelect = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);
    if (current + 1 >= QUIZ.length) {
      setDone(true);
    } else {
      setCurrent(current + 1);
    }
  };

  const reset = () => {
    setStarted(false);
    setCurrent(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setDone(false);
  };

  const correctCount = answers.filter((a, i) => a === QUIZ[i]?.correct).length;
  const percentage = Math.round((correctCount / QUIZ.length) * 100);

  if (!started) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-pink-700 text-white rounded-[12px] p-8 text-center">
        <Brain size={48} className="mx-auto mb-4 opacity-80" />
        <h3 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-2">
          Cât știi despre PMB?
        </h3>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          10 întrebări despre cum funcționează Primăria București. Testează-ți cunoștințele!
        </p>
        <button
          onClick={() => setStarted(true)}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
        >
          Începe quiz-ul
        </button>
      </div>
    );
  }

  if (done) {
    const medal = percentage >= 90 ? "🥇" : percentage >= 70 ? "🥈" : percentage >= 50 ? "🥉" : "📚";
    const label = percentage >= 90 ? "Expert PMB" : percentage >= 70 ? "Cetățean activ" : percentage >= 50 ? "Pe drumul bun" : "Mai citește";
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-8 text-center">
        <div className="text-6xl mb-4">{medal}</div>
        <h3 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-1">{label}</h3>
        <p className="text-3xl font-bold text-[var(--color-primary)] mb-2">
          {correctCount}/{QUIZ.length} corecte ({percentage}%)
        </p>
        <div className="mt-6 space-y-2 text-left max-w-lg mx-auto">
          {QUIZ.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return (
              <div
                key={q.id}
                className={cn(
                  "p-3 rounded-[8px] text-xs",
                  isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"
                )}
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium mb-0.5">{q.question}</p>
                    {!isCorrect && (
                      <p className="text-[var(--color-text-muted)]">
                        Corect: <strong>{q.options[q.correct]}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)]"
        >
          <RefreshCw size={14} />
          Refă quiz-ul
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[var(--color-text-muted)]">
          Întrebarea {current + 1} din {QUIZ.length}
        </span>
        <div className="w-32 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${((current + 1) / QUIZ.length) * 100}%` }}
          />
        </div>
      </div>
      <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold mb-5">{question.question}</h3>
      <div className="space-y-2 mb-5">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = i === question.correct;
          const showResult = selectedAnswer !== null;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selectedAnswer !== null}
              className={cn(
                "w-full text-left p-3 rounded-[8px] border-2 transition-all text-sm",
                !showResult && "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]",
                showResult && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30",
                showResult && !isSelected && !isCorrect && "border-[var(--color-border)] opacity-60"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    !showResult && "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]",
                    showResult && isCorrect && "bg-emerald-500 text-white",
                    showResult && isSelected && !isCorrect && "bg-red-500 text-white",
                    showResult && !isSelected && !isCorrect && "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                  )}
                >
                  {showResult && isCorrect ? "✓" : showResult && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
      {selectedAnswer !== null && (
        <div className="p-3 rounded-[8px] bg-blue-50 dark:bg-blue-950/30 text-sm mb-4">
          <p className="font-medium mb-1 flex items-center gap-1">
            <Award size={14} className="text-blue-600" />
            Explicație
          </p>
          <p className="text-[var(--color-text-muted)]">{question.explanation}</p>
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={selectedAnswer === null}
        className="w-full h-11 rounded-[8px] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {current + 1 < QUIZ.length ? "Următoarea întrebare →" : "Vezi rezultatul"}
      </button>
    </div>
  );
}
