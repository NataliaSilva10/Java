import { useState } from "react";
import SpeakWithTimmy from "./lib/robot/SpeakWithTimmy";
import PlayLearn from "./lib/playlearn/PlayLearn";
import CreateStoriesPage from "./lib/stories/CreateStoriesPage";
import DiscoverCultures from "./lib/discover/DiscoverCultures";
import HomeDashboard from "./lib/home/HomeDashboard";
import ParentArea from "./lib/home/ParentArea";
import LearnerToasts from "./lib/learner/LearnerToasts";
import { useLearner, type SectionId } from "./lib/learner/learnerStore";
import type { Language as LangCode } from "./lib/storyEngine";
import "./style.css";
import {
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Flame,
  Globe2,
  Home,
  Languages,
  Menu,
  MessageCircle,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
// Place the image in public/hero.jpg.
const roboticsImage = "/hero.jpg";

type Section =
  | "Home"
  | "Speak & Practice"
  | "Play & Learn"
  | "Create Stories"
  | "Discover Cultures";

type Language = "Spanish" | "Portuguese" | "English";
// Speech recognition types are declared exactly once.
type SpeechRecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const languageCodes: Record<Language, string> = {
  English: "en-US",
  Portuguese: "pt-BR",
  Spanish: "es-ES",
};

// The dashboard uses language names; Timmy and Create Stories use short codes.
const codeOf: Record<Language, LangCode> = { English: "en", Spanish: "es", Portuguese: "pt" };
const nameOf: Record<LangCode, Language> = { en: "English", es: "Spanish", pt: "Portuguese" };

const sections: {
  name: Section;
  icon: typeof Home;
  color: string;
}[] = [
  { name: "Home", icon: Home, color: "blue" },
  { name: "Speak & Practice", icon: MessageCircle, color: "mint" },
  { name: "Play & Learn", icon: Brain, color: "peach" },
  { name: "Create Stories", icon: BookOpen, color: "purple" },
  { name: "Discover Cultures", icon: Globe2, color: "yellow" },
];

const vocabulary: {
  word: string;
  translation: Record<Language, string>;
  emoji: string;
  hint: string;
}[] = [
  {
    word: "Hello!",
    translation: { Spanish: "¡Hola!", Portuguese: "Olá!", English: "Hello!" },
    emoji: "👋",
    hint: "A friendly greeting",
  },
  {
    word: "Thank you",
    translation: {
      Spanish: "Gracias",
      Portuguese: "Obrigado/a",
      English: "Thank you",
    },
    emoji: "💛",
    hint: "Show appreciation",
  },
  {
    word: "Friend",
    translation: {
      Spanish: "Amigo/a",
      Portuguese: "Amigo/a",
      English: "Friend",
    },
    emoji: "🧑‍🤝‍🧑",
    hint: "Someone you like",
  },
];

const SECTION_ID: Record<Section, SectionId> = {
  Home: "home",
  "Speak & Practice": "speak",
  "Play & Learn": "play",
  "Create Stories": "stories",
  "Discover Cultures": "cultures",
};
const SECTION_NAME: Record<SectionId, Section> = {
  home: "Home",
  speak: "Speak & Practice",
  play: "Play & Learn",
  stories: "Create Stories",
  cultures: "Discover Cultures",
};

export default function App() {
  const [active, setActive] = useState<Section>("Home");
  const [language, setLanguage] = useState<Language>("Spanish");
  const [mobileNav, setMobileNav] = useState(false);

  const [parentOpen, setParentOpen] = useState(false);
  // Shared progress (stars, XP, streak, goals) — replaces the old fixed demo numbers.
  const learner = useLearner();
  const { record, visit } = learner;
  const stars = learner.state.stars;
  const nickname = learner.state.nickname || "Explorer";

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState(
    "Tap the microphone and say something!",
  );
  const [voiceError, setVoiceError] = useState("");

  const practiceWord = vocabulary[0];
  function selectLanguage(nextLanguage: Language) {
    if (nextLanguage === language) return;

    setLanguage(nextLanguage);
    setVoiceError("");
  }

  function changeLanguage() {
    const nextLanguage: Language =
      language === "Spanish"
        ? "Portuguese"
        : language === "Portuguese"
          ? "English"
          : "Spanish";

    selectLanguage(nextLanguage);
  }

  function navigate(section: Section) {
    setActive(section);
    setMobileNav(false);
    visit(SECTION_ID[section]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Voice functions
  function speakText(text: string) {
    if (!("speechSynthesis" in window)) {
      setVoiceError("Speech playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCodes[language];
    utterance.rate = 0.8;
    utterance.pitch = 1.1;

    window.speechSynthesis.speak(utterance);
  }

  function handleVoiceCommand(transcript: string) {
    const command = transcript.toLocaleLowerCase(languageCodes[language]);

    const commands: Record<
      Language,
      { next: string[]; repeat: string[]; game: string[]; home: string[] }
    > = {
      English: {
        next: ["next word", "next question", "next"],
        repeat: ["repeat", "say it again", "speak again"],
        game: ["play a game", "let's play", "start game"],
        home: ["go home", "home"],
      },
      Portuguese: {
        next: ["próxima palavra", "próxima pergunta", "próximo"],
        repeat: ["repita", "fale de novo", "repete"],
        game: ["vamos jogar", "jogar", "começar jogo"],
        home: ["ir para o início", "início", "voltar para casa"],
      },
      Spanish: {
        next: ["siguiente palabra", "siguiente pregunta", "siguiente"],
        repeat: ["repite", "dilo otra vez", "otra vez"],
        game: ["vamos a jugar", "jugar", "iniciar juego"],
        home: ["ir al inicio", "inicio", "volver a casa"],
      },
    };

    const selectedCommands = commands[language];
    const heard = (phrases: string[]) =>
      phrases.some((phrase) => command.includes(phrase));

    if (heard(selectedCommands.next)) {
      speakText(practiceWord.translation[language]);
      setVoiceFeedback("Great! Let's try the next word.");
      return;
    }

    if (heard(selectedCommands.repeat)) {
      speakText(practiceWord.translation[language]);
      setVoiceFeedback("Listen carefully and repeat!");
      return;
    }

    if (heard(selectedCommands.game)) {
      navigate("Play & Learn");
      setVoiceFeedback("Let's play a language game!");
      return;
    }

    if (heard(selectedCommands.home)) {
      navigate("Home");
      setVoiceFeedback("Welcome back to your learning space!");
      return;
    }

    setVoiceFeedback("Let's practice that phrase together!");
    speakText(practiceWord.translation[language]);
  }

  function startVoiceRecognition() {
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceError(
        "Voice recognition is unavailable in this browser. Try Chrome or Edge.",
      );
      return;
    }

    setVoiceError("");
    setSpokenText("");
    setVoiceFeedback("Listening... say a command!");

    const recognition = new Recognition();
    recognition.lang = languageCodes[language];
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setSpokenText(transcript);
      handleVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "not-allowed"
          ? "Please allow microphone access in your browser."
          : event.error === "audio-capture"
            ? "No microphone was found. Plug one in, or check your computer's microphone settings."
            : event.error === "network"
              ? "Listening needs an internet connection. Check your connection and try again."
              : event.error === "no-speech"
                ? "I didn't hear anything. Tap the microphone and try again!"
                : "Something went wrong with the microphone. Please try again.",
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    try {
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError("Could not start the microphone. Please try again.");
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img className="brand-logo" src="/brand/futurekids-logo-small.png" alt="FutureKids – Born to create the future" />
          <button
            className="icon-button close-nav"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="profile-mini">
          <div className="avatar">🧑🏻‍🚀</div>
          <div className="profile-text">
            <strong>Hey, {nickname}!</strong>
            <span>Little Explorer · Level {learner.level}</span>
          </div>
          <span className="online-dot" />
        </div>

        <img
          src={roboticsImage}
          alt="Kids exploring robotics and technology"
          className="hero-image sidebar-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <p className="nav-label">YOUR LEARNING SPACE</p>
        <nav aria-label="Main navigation">
          {sections.map(({ name, icon: Icon, color }) => (
            <button
              key={name}
              className={`nav-item ${active === name ? "active" : ""}`}
              onClick={() => navigate(name)}
              aria-current={active === name ? "page" : undefined}
            >
              <span className={`nav-icon ${color}`}>
                <Icon size={18} />
              </span>
              <span>{name}</span>
              {active === name && (
                <ChevronRight size={16} className="nav-chevron" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-icon">
              <Flame size={20} />
            </div>
            <div>
              <strong>
                {learner.streak > 0 ? `${learner.streak}-day streak!` : "Start a streak today!"}
              </strong>
              <span>Learn a little every day!</span>
            </div>
          </div>
          <button
            className="parent-link"
            onClick={() => setParentOpen(true)}
          >
            <span>⚙️</span> Parent area <ChevronRight size={15} />
          </button>
          <div className="sidebar-footer">
            Made for curious minds <span>✦</span>
          </div>
        </div>
      </aside>

      {mobileNav && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            My learning space <ChevronRight size={14} />{" "}
            <strong>{active}</strong>
          </div>
          <div className="top-actions">
            <div className="star-pill">
              <Star size={17} fill="currentColor" /> {stars}
            </div>
            <button
              className="language-select"
              onClick={changeLanguage}
              aria-label={`Change language. Current language: ${language}`}
            >
              <Languages size={17} /> {language} <span>⌄</span>
            </button>
            <div className="top-avatar">🧑🏻‍🚀</div>
          </div>
        </header>

        {active === "Home" && (
          <div className="page-content">
            <HomeDashboard
              language={codeOf[language]}
              onNavigate={(id) => navigate(SECTION_NAME[id])}
            />
          </div>
        )}

        {active !== "Home" && (
          <section className="page-content subpage">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <Sparkles size={14} /> YOUR NEXT ADVENTURE
                </div>
                <h1>{active}</h1>
                <p>Learn a little, try something new, and earn stars.</p>
              </div>
              <button className="text-button" onClick={() => navigate("Home")}>
                <Home size={16} /> Back to Home
              </button>
            </div>

            {active === "Speak & Practice" && (
              <div className="activity-card">
                <SpeakWithTimmy
                  language={codeOf[language]}
                  onLanguageChange={(code) => selectLanguage(nameOf[code])}
                />

                <h3 className="voice-commands-title">🎙️ Voice commands</h3>
                <p className="voice-commands-help">
                  Say “next”, “repeat”, “let's play” or “go home” in {language}.
                </p>
                <div className="voice-panel" aria-live="polite">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                  >
                    🎤 {isListening ? "Listening..." : "Tap to speak"}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      speakText(practiceWord.translation[language])
                    }
                  >
                    🔊 Hear it
                  </button>
                  <p>{voiceFeedback}</p>
                  {spokenText && <p>You said: “{spokenText}”</p>}
                  {voiceError && <p role="alert">{voiceError}</p>}
                </div>
              </div>
            )}

            {active === "Play & Learn" && (
              <PlayLearn
                language={codeOf[language]}
                onLanguageChange={(code) => selectLanguage(nameOf[code])}
                onStarsEarned={(amount) => record({ type: "star", amount, section: "play" })}
                onWordLearned={() => record({ type: "word" })}
                onLetter={() => record({ type: "letter" })}
                onEffort={() => record({ type: "effort", section: "play" })}
              />
            )}

            {active === "Create Stories" && (
              <CreateStoriesPage
                language={codeOf[language]}
                onLanguageChange={(code) => selectLanguage(nameOf[code])}
                onStarEarned={() => record({ type: "star", amount: 5, section: "stories" })}
                onStorySaved={() => record({ type: "story-saved" })}
                onStoryRead={() => record({ type: "story-read" })}
              />
            )}

            {active === "Discover Cultures" && (
              <DiscoverCultures
                explored={learner.state.countries}
                onExplore={(code) => {
                  record({ type: "country", id: code });
                  record({ type: "star", amount: 10, section: "cultures" });
                }}
                onQuizRight={() => record({ type: "star", amount: 2, section: "cultures" })}
                onTry={() => record({ type: "effort", section: "cultures" })}
              />
            )}
          </section>
        )
      }

        <ParentArea open={parentOpen} onClose={() => setParentOpen(false)} />
        <LearnerToasts />

        <footer className="app-footer">
          <span>@olatech</span>
          <span className="footer-dot">·</span>
          <p>Learn languages. Explore the world. Build the future.</p>
        </footer>
      </main>
    </div>
  );
}
