import { FormEvent, useMemo, useRef, useState } from "react";
import { Headphones, MessageCircle, Mic, Send, Sparkles, Volume2 } from "lucide-react";
// @ts-expect-error CSS is handled by the bundler; TypeScript has no CSS module declaration.
import "./speak-practice.css";

type Language = "Spanish" | "Portuguese" | "English";
type ChatMessage = { id: number; from: "buddy" | "you"; text: string };
type Phrase = { label: string; phrase: string; meaning: string };

const phraseLibrary: Record<Language, Phrase[]> = {
  Spanish: [
    { label: "Say hello", phrase: "¡Hola! ¿Cómo estás?", meaning: "Hello! How are you?" },
    { label: "Introduce yourself", phrase: "Me llamo Alex.", meaning: "My name is Alex." },
    { label: "Say thank you", phrase: "¡Muchas gracias!", meaning: "Thank you very much!" },
  ],
  Portuguese: [
    { label: "Say hello", phrase: "Olá! Como você está?", meaning: "Hello! How are you?" },
    { label: "Introduce yourself", phrase: "Meu nome é Alex.", meaning: "My name is Alex." },
    { label: "Say thank you", phrase: "Muito obrigado!", meaning: "Thank you very much!" },
  ],
  English: [
    { label: "Say hello", phrase: "Hello! How are you?", meaning: "A friendly greeting" },
    { label: "Introduce yourself", phrase: "My name is Alex.", meaning: "Tell someone your name" },
    { label: "Say thank you", phrase: "Thank you so much!", meaning: "Show appreciation" },
  ],
};

const languageVoice: Record<Language, string> = {
  Spanish: "es-ES",
  Portuguese: "pt-BR",
  English: "en-US",
};

function getBuddyReply(message: string, language: Language): string {
  const clean = message.toLowerCase();
  if (clean.includes("hello") || clean.includes("hola") || clean.includes("olá") || clean.includes("ola")) {
    if (language === "Spanish") return "¡Hola! 🌟 You did it! Try saying: “Me llamo Alex” to introduce yourself.";
    if (language === "Portuguese") return "Olá! 🌟 Muito bem! Try saying: “Meu nome é Alex” to introduce yourself.";
    return "Hello there! 🌟 Great greeting! Try saying: “My name is Alex” to introduce yourself.";
  }
  if (clean.includes("word") || clean.includes("teach") || clean.includes("new")) {
    if (language === "Spanish") return "Today's word is “amigo” — it means “friend.” Can you say amigo? 🧑‍🤝‍🧑";
    if (language === "Portuguese") return "Today's word is “amigo” — it means “friend.” Can you say amigo? 🧑‍🤝‍🧑";
    return "Today's word is “curious” — it means wanting to learn or discover something. Can you say curious? 🔎";
  }
  if (clean.includes("thank") || clean.includes("gracias") || clean.includes("obrigado")) {
    if (language === "Spanish") return "¡De nada! That means “You're welcome!” You're doing a great job. 💛";
    if (language === "Portuguese") return "De nada! That means “You're welcome!” Você está indo muito bem! 💛";
    return "You're welcome! You're practicing kindly and confidently. Keep going! 💛";
  }
  if (language === "Spanish") return "¡Muy bien! Thanks for practicing with me. Try one of the phrase cards, or ask me to teach you a new word. 🚀";
  if (language === "Portuguese") return "Muito bem! Thanks for practicing with me. Try one of the phrase cards, or ask me to teach you a new word. 🚀";
  return "Great effort! Try one of the phrase cards, or ask me to teach you a new word. 🚀";
}

export default function SpeakPractice({ language: selectedLanguage }: { language: string }) {
  const language: Language = selectedLanguage === "Portuguese" || selectedLanguage === "English" ? selectedLanguage : "Spanish";
  const phrases = useMemo(() => phraseLibrary[language], [language]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: "buddy", text: `Hi, explorer! 🤖 I'm your ${language} practice buddy. Choose a phrase to listen to, or send me a message.` },
  ]);
  const [listeningMessage, setListeningMessage] = useState<string | null>(null);
  const nextId = useRef(2);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setMessages((current) => [...current, { id: nextId.current++, from: "buddy", text: "Audio playback isn't supported in this browser. You can still read and practice the phrase!" }]);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageVoice[language];
    utterance.rate = 0.82;
    utterance.onstart = () => setListeningMessage(text);
    utterance.onend = () => setListeningMessage(null);
    utterance.onerror = () => setListeningMessage(null);
    window.speechSynthesis.speak(utterance);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = input.trim();
    if (!clean) return;
    const userMessage: ChatMessage = { id: nextId.current++, from: "you", text: clean };
    const buddyMessage: ChatMessage = { id: nextId.current++, from: "buddy", text: getBuddyReply(clean, language) };
    setMessages((current) => [...current, userMessage, buddyMessage]);
    setInput("");
  }

  function usePrompt(prompt: string) {
    setInput(prompt);
  }

  return (
    <div className="activity-card speak-practice-card">
      <div className="activity-intro speak-intro">
        <div className="activity-emoji">🤖</div>
        <div>
          <div className="speak-kicker"><Sparkles size={14} /> YOUR FRIENDLY LANGUAGE BUDDY</div>
          <h2>Let's practice {language}!</h2>
          <p>Listen, read aloud, and try a little conversation. Mistakes are part of learning.</p>
        </div>
      </div>

      <section className="speak-phrase-section" aria-labelledby="phrase-title">
        <div className="speak-section-heading">
          <div>
            <h3 id="phrase-title">Practice phrases</h3>
            <p>Tap the speaker to hear each phrase.</p>
          </div>
          <span className="speak-time"><Headphones size={15} /> 3 min</span>
        </div>
        <div className="speak-phrase-grid">
          {phrases.map((phrase) => (
            <article className="speak-phrase-card" key={phrase.label}>
              <span className="speak-phrase-emoji">{phrase.label === "Say hello" ? "👋" : phrase.label === "Introduce yourself" ? "🌟" : "💛"}</span>
              <span className="speak-phrase-label">{phrase.label}</span>
              <strong>{phrase.phrase}</strong>
              <p>{phrase.meaning}</p>
              <button className="speak-audio-button" type="button" onClick={() => speak(phrase.phrase)} aria-label={`Play pronunciation: ${phrase.phrase}`}>
                <Volume2 size={16} /> {listeningMessage === phrase.phrase ? "Playing…" : "Listen"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="speak-chat-section" aria-labelledby="chat-title">
        <div className="speak-section-heading">
          <div>
            <h3 id="chat-title"><MessageCircle size={18} /> Chat with Buddy</h3>
            <p>Send a message and get a friendly practice prompt.</p>
          </div>
          <span className="speak-online"><span /> Buddy is ready</span>
        </div>
        <div className="speak-chat-window" aria-live="polite" aria-label="Practice conversation">
          {messages.map((message) => (
            <div key={message.id} className={`speak-chat-message ${message.from === "you" ? "speak-chat-you" : "speak-chat-buddy"}`}>
              <span>{message.from === "you" ? "🧑🏻‍🚀 You" : "🤖 Buddy"}</span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <form className="speak-chat-form" onSubmit={sendMessage}>
          <label className="speak-sr-only" htmlFor="speak-message">Write a message to Buddy</label>
          <input id="speak-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Write something in ${language}…`} maxLength={240} />
          <button className="primary-button" type="submit" disabled={!input.trim()}><Send size={16} /> Send</button>
        </form>
        <div className="speak-quick-prompts">
          <span>Need an idea?</span>
          <button type="button" onClick={() => usePrompt("How do I say hello?")}>How do I say hello?</button>
          <button type="button" onClick={() => usePrompt("Teach me a new word")}>Teach me a new word</button>
          <button type="button" onClick={() => usePrompt("How do I say thank you?")}>How do I say thank you?</button>
        </div>
        <p className="speak-demo-note"><Mic size={14} /> Audio is for listening and pronunciation. The chat uses sample replies for now; a live AI tutor can be connected later.</p>
      </section>
    </div>
  );
}
