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
      <div className="bg-gradient-to-br from-purple-600 to-pink-700 text-white rounded-[var(--radius-md)] p-8 text-center">
        <Brain size={48} className="mx-auto mb-4 opacity-80" aria-hidden="true" />
        <h3 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-2">
          Cât știi despre PMB?
        </h3>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          <span className="tabular-nums">{QUIZ.length}</span> întrebări despre cum funcționează Primăria București. Testează-ți cunoștințele!
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-xs)] bg-white text-purple-700 font-semibold hover:bg-purple-50 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
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
      <div
        role="region"
        aria-label="Rezultat quiz"
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-8 text-center"
      >
        <div className="text-6xl mb-4" aria-hidden="true">{medal}</div>
        <h3 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-1">{label}</h3>
        <p className="text-3xl font-bold text-[var(--color-primary)] mb-2 tabular-nums">
          <span aria-label={`${correctCount} corecte din ${QUIZ.length}, scor ${percentage} la sută`}>
            {correctCount}/{QUIZ.length} corecte ({percentage}%)
          </span>
        </p>
        <div className="mt-6 space-y-2 text-left max-w-lg mx-auto">
          {QUIZ.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return (
              <div
                key={q.id}
                className={cn(
                  "p-3 rounded-[var(--radius-xs)] text-xs",
                  isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"
                )}
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" aria-label="Corect" />
                  ) : (
                    <XCircle size={14} className="text-red-600 mt-0.5 shrink-0" aria-label="Greșit" />
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
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Refă quiz-ul
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
          Întrebarea {current + 1} din {QUIZ.length}
        </span>
        <div
          className="w-32 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={1}
          aria-valuemax={QUIZ.length}
          aria-label={`Progres quiz: întrebarea ${current + 1} din ${QUIZ.length}`}
        >
          <div
            className="h-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${((current + 1) / QUIZ.length) * 100}%` }}
          />
        </div>
      </div>
      <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold mb-5">{question.question}</h3>
      <div className="space-y-2 mb-5" role="radiogroup" aria-label="Variante de răspuns">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = i === question.correct;
          const showResult = selectedAnswer !== null;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(i)}
              disabled={selectedAnswer !== null}
              className={cn(
                "w-full text-left p-3 rounded-[var(--radius-xs)] border-2 transition-all text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
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
        <div role="region" aria-live="polite" className="p-3 rounded-[var(--radius-xs)] bg-blue-50 dark:bg-blue-950/30 text-sm mb-4">
          <p className="font-medium mb-1 flex items-center gap-1">
            <Award size={14} className="text-blue-600" aria-hidden="true" />
            Explicație
          </p>
          <p className="text-[var(--color-text-muted)]">{question.explanation}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleNext}
        disabled={selectedAnswer === null}
        className="w-full h-11 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
      >
        {current + 1 < QUIZ.length ? "Următoarea întrebare" : "Vezi rezultatul"}
        {current + 1 < QUIZ.length && <span aria-hidden="true"> →</span>}
      </button>
    </div>
  );
}
