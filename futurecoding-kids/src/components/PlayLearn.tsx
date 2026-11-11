import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, RotateCcw, Sparkles, Star, Trophy, Zap } from "lucide-react";
import "./play-learn.css";

type Language = "Spanish" | "Portuguese" | "English";
type Game = "menu" | "quiz" | "match" | "builder";
type Word = { english: string; emoji: string; Spanish: string; Portuguese: string };

const words: Word[] = [
  { english: "Hello", emoji: "👋", Spanish: "Hola", Portuguese: "Olá" },
  { english: "Friend", emoji: "🧑‍🤝‍🧑", Spanish: "Amigo", Portuguese: "Amigo" },
  { english: "Thank you", emoji: "💛", Spanish: "Gracias", Portuguese: "Obrigado/a" },
  { english: "Please", emoji: "🙏", Spanish: "Por favor", Portuguese: "Por favor" },
  { english: "Cat", emoji: "🐱", Spanish: "Gato", Portuguese: "Gato" },
  { english: "Sun", emoji: "☀️", Spanish: "Sol", Portuguese: "Sol" },
  { english: "Book", emoji: "📚", Spanish: "Libro", Portuguese: "Livro" },
  { english: "Water", emoji: "💧", Spanish: "Agua", Portuguese: "Água" },
];

const builderLessons: Record<"Spanish" | "Portuguese", { english: string; target: string; hint: string }> = {
  Spanish: { english: "I am happy", target: "Estoy feliz", hint: "Put the words in the right order." },
  Portuguese: { english: "I am happy", target: "Estou feliz", hint: "Organize the words to make a sentence." },
};

function shuffle<T,>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Props = {
  language: string;
  onEarnStars?: (amount: number) => void;
  onLearnWord?: () => void;
};

export default function PlayLearn({ language, onEarnStars, onLearnWord }: Props) {
  const targetLanguage: "Spanish" | "Portuguese" = language === "Portuguese" ? "Portuguese" : "Spanish";
  const languageLabel = language === "English" ? "Spanish" : language;
  const [game, setGame] = useState<Game>("menu");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [matchWords, setMatchWords] = useState<Word[]>(() => shuffle(words.slice(0, 4)));
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [matchFeedback, setMatchFeedback] = useState("");
  const [builderPicked, setBuilderPicked] = useState<string[]>([]);
  const [builderChecked, setBuilderChecked] = useState(false);
  const [builderFeedback, setBuilderFeedback] = useState("");

  const quizWords = useMemo(() => words.slice(0, 5), []);
  const matchRightWords = useMemo(() => shuffle(matchWords), [matchWords]);
  const current = quizWords[Math.min(quizIndex, quizWords.length - 1)];
  const correctQuizAnswer = current[targetLanguage];
  const quizChoices = useMemo(() => {
    const other = shuffle(words.map((w) => w[targetLanguage]).filter((w) => w !== correctQuizAnswer)).slice(0, 2);
    return shuffle([correctQuizAnswer, ...other]);
  }, [quizIndex, correctQuizAnswer, targetLanguage]);

  const builder = builderLessons[targetLanguage];
  const builderTokens = useMemo(() => shuffle(builder.target.split(" ")), [builder.target, game, builderChecked]);
  const availableTokens = builderTokens.filter((token, i) => {
    const usedCount = builderPicked.filter((picked) => picked === token).length;
    const priorCount = builderTokens.slice(0, i + 1).filter((item) => item === token).length;
    return priorCount > usedCount;
  });

  function chooseQuizAnswer(answer: string) {
    if (quizAnswer !== null) return;
    setQuizAnswer(answer);
    if (answer === correctQuizAnswer) {
      setQuizScore((score) => score + 1);
      onEarnStars?.(5);
      onLearnWord?.();
    }
  }

  function nextQuestion() {
    if (quizIndex >= quizWords.length - 1) setQuizDone(true);
    else { setQuizIndex((i) => i + 1); setQuizAnswer(null); }
  }

  function resetQuiz() {
    setQuizIndex(0); setQuizAnswer(null); setQuizScore(0); setQuizDone(false);
  }

  function resetMatch() {
    setMatchWords(shuffle(words.slice(0, 4)));
    setMatchLeft(null); setMatched([]); setMatchFeedback("");
  }

  function chooseMatchTranslation(english: string) {
    if (matched.includes(english)) return;
    if (!matchLeft) { setMatchLeft(english); setMatchFeedback("Now choose its translation!"); return; }
    if (matchLeft === english) { setMatchLeft(null); return; }
    const leftWord = matchWords.find((word) => word.english === matchLeft);
    const chosenWord = matchWords.find((word) => word.english === english);
    if (leftWord && chosenWord && leftWord[targetLanguage] === chosenWord[targetLanguage]) {
      setMatched((old) => [...old, matchLeft]);
      setMatchFeedback(`Great match! ${leftWord.english} = ${leftWord[targetLanguage]}`);
      onEarnStars?.(5); onLearnWord?.();
    } else {
      setMatchFeedback("Not a pair yet—try matching the same meaning.");
    }
    setMatchLeft(null);
  }

  function chooseBuilderToken(token: string) {
    if (builderChecked) return;
    setBuilderPicked((old) => [...old, token]);
  }

  function checkBuilder() {
    const answer = builderPicked.join(" ");
    setBuilderChecked(true);
    if (answer.toLocaleLowerCase() === builder.target.toLocaleLowerCase()) {
      setBuilderFeedback("Perfect sentence! You earned 5 stars! ⭐");
      onEarnStars?.(5); onLearnWord?.();
    } else {
      setBuilderFeedback(`Good try! The sentence is “${builder.target}”.`);
    }
  }

  return (
    <div className="pl-wrap">
      {game !== "menu" && <button className="pl-back" onClick={() => setGame("menu")}><ArrowLeft size={16} /> All mini games</button>}
      {game === "menu" && <>
        <div className="pl-welcome"><div><span className="pl-kicker"><Sparkles size={14} /> MINI GAME ARCADE</span><h2>Choose your adventure!</h2><p>Play with words, match meanings, and build your first sentences.</p></div><div className="pl-mascot">🧩</div></div>
        <div className="pl-game-grid">
          <button className="pl-game-card pl-card-peach" onClick={() => { resetQuiz(); setGame("quiz"); }}><span className="pl-game-emoji">🚀</span><span className="pl-game-tag">5 QUESTIONS</span><strong>Word Quest</strong><p>Pick the right translation and collect stars.</p><span className="pl-play-link">Play now <ChevronRight size={16} /></span></button>
          <button className="pl-game-card pl-card-mint" onClick={() => { resetMatch(); setGame("match"); }}><span className="pl-game-emoji">🧠</span><span className="pl-game-tag">PAIR THEM UP</span><strong>Memory Match</strong><p>Find words with the same meaning.</p><span className="pl-play-link">Play now <ChevronRight size={16} /></span></button>
          <button className="pl-game-card pl-card-lilac" onClick={() => { setBuilderPicked([]); setBuilderChecked(false); setBuilderFeedback(""); setGame("builder"); }}><span className="pl-game-emoji">🪄</span><span className="pl-game-tag">WORD PUZZLE</span><strong>Sentence Builder</strong><p>Put words in order to make a sentence.</p><span className="pl-play-link">Play now <ChevronRight size={16} /></span></button>
        </div>
        <div className="pl-tip"><span>💡</span><div><strong>Little steps, big learning!</strong><p>Every correct answer earns 5 stars. Mistakes are part of the adventure.</p></div></div>
      </>}

      {game === "quiz" && <section className="pl-game-panel">
        {!quizDone ? <>
          <div className="pl-panel-top"><span className="pl-pill">WORD QUEST</span><span>Question {quizIndex + 1} / {quizWords.length}</span></div>
          <div className="pl-progress"><span style={{ width: `${(quizIndex / quizWords.length) * 100}%` }} /></div>
          <div className="pl-question-emoji">{current.emoji}</div>
          <h2>How do you say “{current.english}” in {languageLabel}?</h2><p className="pl-muted">{current.english === "Hello" ? "A friendly greeting" : current.english === "Thank you" ? "Say this when someone helps you" : "Choose the best translation."}</p>
          <div className="pl-options">{quizChoices.map((choice) => <button key={choice} className={`pl-option ${quizAnswer !== null && choice === correctQuizAnswer ? "is-correct" : ""} ${quizAnswer === choice && choice !== correctQuizAnswer ? "is-wrong" : ""}`} disabled={quizAnswer !== null} onClick={() => chooseQuizAnswer(choice)}>{choice}{quizAnswer !== null && choice === correctQuizAnswer && <Check size={17} />}</button>)}</div>
          {quizAnswer !== null && <div className={`pl-feedback ${quizAnswer === correctQuizAnswer ? "good" : "try-again"}`}>{quizAnswer === correctQuizAnswer ? "Amazing! You earned 5 stars! ⭐" : `Good try! The answer is “${correctQuizAnswer}”.`}</div>}
          <div className="pl-panel-bottom"><span><Star size={16} /> {quizScore * 5} stars earned this round</span><button className="pl-primary" onClick={nextQuestion}>{quizIndex === quizWords.length - 1 ? "See results" : "Next question"} <ChevronRight size={17} /></button></div>
        </> : <div className="pl-results"><div className="pl-question-emoji">{quizScore === quizWords.length ? "🏆" : "🎉"}</div><span className="pl-pill">LESSON COMPLETE</span><h2>{quizScore === quizWords.length ? "Perfect score, superstar!" : "Great work, explorer!"}</h2><p>You got <strong>{quizScore} out of {quizWords.length}</strong> answers correct.</p><div className="pl-result-stats"><div><Star size={20} /><strong>{quizScore * 5}</strong><span>Stars earned</span></div><div><Trophy size={20} /><strong>{Math.round(quizScore / quizWords.length * 100)}%</strong><span>Correct answers</span></div></div><button className="pl-primary" onClick={resetQuiz}><RotateCcw size={16} /> Play again</button></div>}
      </section>}

      {game === "match" && <section className="pl-game-panel">
        <div className="pl-panel-top"><span className="pl-pill">MEMORY MATCH</span><span>{matched.length} / {matchWords.length} pairs</span></div>
        <div className="pl-progress"><span style={{ width: `${matched.length / matchWords.length * 100}%` }} /></div>
        <h2>Match the words!</h2><p className="pl-muted">Choose a word on the left, then its translation on the right.</p>
        <div className="pl-match-grid"><div className="pl-match-column"><span>ENGLISH</span>{matchWords.map((word) => <button key={word.english} disabled={matched.includes(word.english)} className={`pl-match-item ${matchLeft === word.english ? "chosen" : ""} ${matched.includes(word.english) ? "matched" : ""}`} onClick={() => setMatchLeft(word.english)}>{word.emoji} {word.english}{matched.includes(word.english) && <Check size={16} />}</button>)}</div><div className="pl-match-column"><span>{languageLabel.toUpperCase()}</span>{matchRightWords.map((word) => <button key={word.english} disabled={matched.includes(word.english)} className={`pl-match-item ${matched.includes(word.english) ? "matched" : ""}`} onClick={() => { if (!matchLeft) { setMatchFeedback("Choose an English word first."); return; } const selected = matchWords.find((item) => item.english === matchLeft); if (selected?.english === word.english) { setMatched((old) => [...old, word.english]); setMatchFeedback(`Correct! ${word.english} = ${word[targetLanguage]}`); onEarnStars?.(5); onLearnWord?.(); } else { setMatchFeedback("Almost! Try another translation."); } setMatchLeft(null); }}>{word[targetLanguage]}{matched.includes(word.english) && <Check size={16} />}</button>)}</div></div>
        {matchFeedback && <div className={`pl-feedback ${matched.length > 0 ? "good" : "try-again"}`}>{matchFeedback}</div>}
        {matched.length === matchWords.length && <div className="pl-finished"><Trophy size={20} /> Amazing! You matched every pair and earned {matched.length * 5} stars.</div>}
        <div className="pl-panel-bottom"><span><Star size={16} /> {matched.length * 5} stars earned this round</span><button className="pl-secondary" onClick={resetMatch}><RotateCcw size={16} /> Restart game</button></div>
      </section>}

      {game === "builder" && <section className="pl-game-panel">
        <div className="pl-panel-top"><span className="pl-pill">SENTENCE BUILDER</span><span>+5 stars for a correct sentence</span></div>
        <div className="pl-question-emoji">🪄</div><h2>Build this sentence in {languageLabel}</h2><p className="pl-muted">Translate: “{builder.english}”</p>
        <div className="pl-answer-tray">{builderPicked.length ? builderPicked.map((token, i) => <button key={`${token}-${i}`} disabled={builderChecked} onClick={() => setBuilderPicked((old) => old.filter((_, index) => index !== i))}>{token}</button>) : <span>Your sentence will appear here…</span>}</div>
        <p className="pl-muted">{builder.hint}</p><div className="pl-token-row">{availableTokens.map((token, i) => <button key={`${token}-${i}`} disabled={builderChecked} onClick={() => chooseBuilderToken(token)}>{token}</button>)}</div>
        {builderFeedback && <div className={`pl-feedback ${builderFeedback.startsWith("Perfect") ? "good" : "try-again"}`}>{builderFeedback}</div>}
        <div className="pl-panel-bottom"><button className="pl-secondary" onClick={() => { setBuilderPicked([]); setBuilderChecked(false); setBuilderFeedback(""); }}><RotateCcw size={16} /> Reset words</button><button className="pl-primary" disabled={builderPicked.length === 0 || builderChecked} onClick={checkBuilder}>Check sentence <Check size={16} /></button></div>
      </section>}
    </div>
  );
}
