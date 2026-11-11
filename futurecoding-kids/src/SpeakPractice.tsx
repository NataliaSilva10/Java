
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Headphones,
  Lightbulb,
  Mic,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  X,
} from "lucide-react";


type Language = "en" | "es" | "pt";

type Phrase = {
  en: string;
  es: string;
  pt: string;
};

const languageNames: Record<Language, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
};

const flags: Record<Language, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  pt: "🇧🇷",
};

const phrases: Phrase[] = [
  { en: "Hello!", es: "¡Hola!", pt: "Olá!" },
  {
    en: "How are you?",
    es: "¿Cómo estás?",
    pt: "Como você está?",
  },
  {
    en: "Thank you!",
    es: "¡Gracias!",
    pt: "Obrigado!",
  },
  {
    en: "I love animals.",
    es: "Me encantan los animales.",
    pt: "Eu amo os animais.",
  },
  {
    en: "Good morning!",
    es: "¡Buenos días!",
    pt: "Bom dia!",
  },
  {
    en: "My name is Alex.",
    es: "Me llamo Alex.",
    pt: "Meu nome é Alex.",
  },
  {
    en: "I like to learn.",
    es: "Me gusta aprender.",
    pt: "Eu gosto de aprender.",
  },
  {
    en: "Where is the school?",
    es: "¿Dónde está la escuela?",
    pt: "Onde fica a escola?",
  },
  {
    en: "Can you help me?",
    es: "¿Puedes ayudarme?",
    pt: "Você pode me ajudar?",
  },
  {
    en: "Let's play together!",
    es: "¡Vamos a jugar juntos!",
    pt: "Vamos brincar juntos!",
  },
];

const shuffle = <T,>(items: T[]): T[] =>
  [...items].sort(() => Math.random() - 0.5);

export default function SpeakPractice() {
  const [nativeLanguage, setNativeLanguage] =
    useState<Language>("en");

  const [targetLanguage, setTargetLanguage] =
    useState<Language>("es");

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [stars, setStars] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [voiceText, setVoiceText] = useState("");

  const question = phrases[questionIndex];

  const correctAnswer = question[targetLanguage];

  const choices = [
    correctAnswer,
    ...shuffle(
      phrases
        .filter((phrase) => phrase !== question)
        .map((phrase) => phrase[targetLanguage])
        .filter((answer) => answer !== correctAnswer)
    ).slice(0, 2),
  ];

  const answers = shuffle(choices);

  const speak = (text: string, language: Language) => {
    if (!("speechSynthesis" in window)) {
      setFeedback("Audio is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === "en"
        ? "en-US"
        : language === "es"
          ? "es-ES"
          : "pt-BR";

    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const checkAnswer = () => {
    if (!selectedAnswer || checked) return;

    setChecked(true);

    if (selectedAnswer === correctAnswer) {
      setStars((previous) => previous + 10);
      setFeedback("Amazing! You earned 10 stars! ⭐");
    } else {
      setFeedback("Almost! Let's learn it together. 💜");
    }
  };

  const nextQuestion = () => {
    if (questionIndex === phrases.length - 1) {
      setCompleted(true);
      return;
    }

    setQuestionIndex((previous) => previous + 1);
    setSelectedAnswer("");
    setChecked(false);
    setHintVisible(false);
    setFeedback("");
    setVoiceText("");
  };

  const restartLesson = () => {
    setQuestionIndex(0);
    setSelectedAnswer("");
    setChecked(false);
    setStars(0);
    setCompleted(false);
    setHintVisible(false);
    setFeedback("");
    setVoiceText("");
  };

  const startVoicePractice = () => {
    const SpeechRecognitionAPI = (
      window as Window & {
        SpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          onresult: ((event: {
            results: ArrayLike<ArrayLike<{ transcript: string }>>;
          }) => void) | null;
          onerror: (() => void) | null;
          start: () => void;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          onresult: ((event: {
            results: ArrayLike<ArrayLike<{ transcript: string }>>;
          }) => void) | null;
          onerror: (() => void) | null;
          start: () => void;
        };
      }
    ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: new () => {
            lang: string;
            interimResults: boolean;
            onresult: ((event: {
              results: ArrayLike<ArrayLike<{ transcript: string }>>;
            }) => void) | null;
            onerror: (() => void) | null;
            start: () => void;
          };
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setFeedback(
        "Voice recognition is unavailable here. Try Chrome or use the listening button!"
      );
      return;
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.lang =
      targetLanguage === "en"
        ? "en-US"
        : targetLanguage === "es"
          ? "es-ES"
          : "pt-BR";

    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript.trim();

      setVoiceText(transcript);
    };

    recognition.onerror = () => {
      setFeedback("Let's try speaking again!");
    };

    recognition.start();
    setFeedback("I'm listening! Speak clearly. 🎤");
  };

  if (completed) {
    return (
      <section className="timmy-page">
        <div className="timmy-complete">
          <div className="timmy-robot">🤖</div>
          <Sparkles size={34} />
          <h1>Mission accomplished!</h1>
          <p>Timmy is so proud of you!</p>
          <div className="timmy-total-stars">
            ⭐ {stars} stars earned
          </div>
          <p>
            You practiced {phrases.length} phrases in{" "}
            {languageNames[targetLanguage]}.
          </p>
          <button className="timmy-primary" onClick={restartLesson}>
            <RotateCcw size={18} /> Play again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="timmy-page">
      <header className="timmy-header">
        <div>
          <span className="timmy-eyebrow">
            FUTUREKIDS LANGUAGE LAB
          </span>
          <h1>Speak & Practice</h1>
          <p>Small steps, big discoveries!</p>
        </div>

        <div className="timmy-star-counter">
          <Star size={20} fill="currentColor" />
          {stars}
        </div>
      </header>

      <div className="timmy-language-settings">
        <label>
          <span>I speak</span>
          <select
            value={nativeLanguage}
            onChange={(event) =>
              setNativeLanguage(event.target.value as Language)
            }
          >
            {(["en", "es", "pt"] as Language[]).map((language) => (
              <option key={language} value={language}>
                {flags[language]} {languageNames[language]}
              </option>
            ))}
          </select>
        </label>

        <div className="timmy-language-arrow">
          <ArrowRight size={22} />
        </div>

        <label>
          <span>I want to learn</span>
          <select
            value={targetLanguage}
            onChange={(event) => {
              const next = event.target.value as Language;
              setTargetLanguage(next);
              setNativeLanguage(
                next === nativeLanguage
                  ? (["en", "es", "pt"] as Language[]).find(
                      (item) => item !== next
                    )!
                  : nativeLanguage
              );
              setQuestionIndex(0);
              setSelectedAnswer("");
              setChecked(false);
              setCompleted(false);
              setFeedback("");
            }}
          >
            {(["en", "es", "pt"] as Language[]).map((language) => (
              <option
                key={language}
                value={language}
                disabled={language === nativeLanguage}
              >
                {flags[language]} {languageNames[language]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="timmy-progress-row">
        <div className="timmy-progress-track">
          <div
            className="timmy-progress-fill"
            style={{
              width: `${((questionIndex + 1) / phrases.length) * 100}%`,
            }}
          />
        </div>
        <span>
          {questionIndex + 1}/{phrases.length}
        </span>
      </div>

      <div className="timmy-lesson-card">
        <div className="timmy-lesson-top">
          <span className="timmy-pill">
            <Sparkles size={14} /> TRANSLATION QUEST
          </span>
          <span className="timmy-question-number">
            Question {questionIndex + 1}
          </span>
        </div>

        <div className="timmy-buddy-row">
          <div className="timmy-robot" aria-label="Timmy the robot">
            <span>🤖</span>
            <span className="timmy-robot-sparkle">✨</span>
          </div>

          <div className="timmy-speech-bubble">
            <strong>Hey, superstar!</strong>
            <p>
              Can you translate this phrase into{" "}
              {languageNames[targetLanguage]}?
            </p>
          </div>
        </div>

        <div className="timmy-question">
          <span className="timmy-question-label">
            CHOOSE THE CORRECT TRANSLATION
          </span>
          <h2>{question[nativeLanguage]}</h2>

          <button
            className="timmy-audio-button"
            onClick={() => speak(question[nativeLanguage], nativeLanguage)}
            aria-label="Listen to the phrase"
          >
            <Volume2 size={20} />
            Listen to the phrase
          </button>
        </div>

        <div className="timmy-answer-list">
          {answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === correctAnswer;

            let className = "timmy-answer";

            if (isSelected) className += " selected";
            if (checked && isCorrect) className += " correct";
            if (checked && isSelected && !isCorrect) {
              className += " incorrect";
            }

            return (
              <button
                key={`${questionIndex}-${answer}`}
                className={className}
                disabled={checked}
                onClick={() => setSelectedAnswer(answer)}
              >
                <span className="timmy-answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{answer}</span>
                {checked && isCorrect && <Check size={20} />}
                {checked && isSelected && !isCorrect && (
                  <X size={20} />
                )}
              </button>
            );
          })}
        </div>

        {hintVisible && (
          <div className="timmy-hint">
            <Lightbulb size={19} />
            <span>
              Hint: Listen carefully and look for the meaning of each
              word. The correct translation is{" "}
              <strong>{correctAnswer}</strong>.
            </span>
          </div>
        )}

        {feedback && (
          <div
            className={`timmy-feedback ${
              checked
                ? selectedAnswer === correctAnswer
                  ? "success"
                  : "try-again"
                : ""
            }`}
            role="status"
          >
            {feedback}
          </div>
        )}

        {checked && (
          <div className="timmy-correct-phrase">
            <span>Correct phrase</span>
            <strong>{correctAnswer}</strong>
            <button
              className="timmy-audio-button"
              onClick={() => speak(correctAnswer, targetLanguage)}
            >
              <Volume2 size={18} /> Hear the answer
            </button>
          </div>
        )}

        {voiceText && (
          <div className="timmy-voice-result" role="status">
            <strong>You said:</strong> {voiceText}
          </div>
        )}

        <div className="timmy-actions">
          <button
            className="timmy-hint-button"
            onClick={() => setHintVisible((visible) => !visible)}
          >
            <Lightbulb size={18} />
            {hintVisible ? "Hide hint" : "Need a hint?"}
          </button>

          {!checked ? (
            <button
              className="timmy-primary"
              disabled={!selectedAnswer}
              onClick={checkAnswer}
            >
              Check answer <ArrowRight size={18} />
            </button>
          ) : (
            <button className="timmy-primary" onClick={nextQuestion}>
              Continue <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="timmy-speaking-card">
        <div className="timmy-speaking-icon">
          <Mic size={25} />
        </div>
        <div className="timmy-speaking-copy">
          <strong>Speak with Timmy</strong>
          <p>Practice saying a phrase in your new language.</p>
        </div>
        <button
          className="timmy-mic-button"
          onClick={startVoicePractice}
          aria-label="Start speaking practice"
        >
          <Mic size={20} />
        </button>
      </div>

      <div className="timmy-bottom-tip">
        <Headphones size={18} />
        <span>Tip: Listen, repeat, and have fun learning!</span>
      </div>
    </section>
  );
}
