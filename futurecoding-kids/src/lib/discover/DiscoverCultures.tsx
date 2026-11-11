import { useState, type KeyboardEvent } from "react";
import { Check, MapPin, Stamp, Volume2 } from "lucide-react";
import "./discover.css";
import { languageFlags, languageNames } from "../storyContent";
import type { Language } from "../storyEngine";
import { COUNTRIES, HELLOS, type Country } from "./countries";
import { COUNTRY_SHAPES, LAND_PATH, MAP_HEIGHT, MAP_WIDTH } from "./worldMap";

type Props = {
  explored: string[];
  /** Child stamped a country's passport page (first time only). */
  onExplore: (code: string) => void;
  onQuizRight: () => void;
  onTry: () => void;
};

type Filter = "all" | Language;

/** Regional voices so Mexico sounds Mexican, Portugal sounds European, etc. (falls back automatically). */
const VOICE: Record<string, string> = { US: "en-US", GB: "en-GB", AU: "en-AU", ES: "es-ES", MX: "es-MX", AR: "es-AR", CO: "es-CO", BR: "pt-BR", PT: "pt-PT", AO: "pt-PT" };

function speakTag(text: string, tag: string) {
  if (!("speechSynthesis" in window)) return;
  const clean = text.replace(/\p{Extended_Pictographic}/gu, "");
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = tag;
  const voices = window.speechSynthesis.getVoices();
  const base = tag.slice(0, 2);
  u.voice = voices.find((v) => v.lang.replace("_", "-") === tag) ?? voices.find((v) => v.lang.startsWith(base)) ?? null;
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

const SECTIONS = ["tradition", "food", "music", "fact"] as const;
const SECTION_LABEL: Record<(typeof SECTIONS)[number], string> = { tradition: "Tradition", food: "Food", music: "Music", fact: "Fun fact" };

/** Discover Cultures: interactive world map, country explorer, passport and "hello" around the world. */
export default function DiscoverCultures({ explored, onExplore, onQuizRight, onTry }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Country>(COUNTRIES.find((c) => c.code === "BR") ?? COUNTRIES[0]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const choose = (country: Country) => {
    setSelected(country);
    setAnswer(null);
    speakTag(`${country.name}! ${country.greeting.split("/")[0]}`, VOICE[country.code]);
  };

  const onKey = (event: KeyboardEvent, country: Country) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(country);
    }
  };

  const pickAnswer = (option: string) => {
    if (answer === selected.quiz.answer) return;
    setAnswer(option);
    if (option === selected.quiz.answer) onQuizRight();
    else onTry();
  };

  const isExplored = explored.includes(selected.code);
  const visible = (c: Country) => filter === "all" || c.language === filter;

  return (
    <div className="dc">
      {/* ── Map ── */}
      <section className="dc-map-card">
        <div className="dc-map-head">
          <div>
            <h2>
              <MapPin size={22} /> Where do people speak…
            </h2>
            <p>Tap a country on the map to visit it!</p>
          </div>
          <div className="dc-filters" role="group" aria-label="Filter by language">
            {(["all", "en", "es", "pt"] as Filter[]).map((f) => (
              <button type="button" key={f} className={`dc-filter dc-filter--${f}${filter === f ? " active" : ""}`} onClick={() => setFilter(f)} aria-pressed={filter === f}>
                {f === "all" ? "🌍 All" : `${languageFlags[f]} ${languageNames[f]}`}
              </button>
            ))}
          </div>
        </div>
        <div className="dc-map-wrap">
          <svg className="dc-map" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="group" aria-label="World map">
            <path d={LAND_PATH} className="dc-land" />
            {COUNTRIES.map((c) => {
              const shape = COUNTRY_SHAPES[c.code];
              if (!shape) return null;
              return (
                <path
                  key={c.code}
                  d={shape.d}
                  className={`dc-country dc-lang-${c.language}${selected.code === c.code ? " selected" : ""}${visible(c) ? "" : " dim"}`}
                  onClick={() => choose(c)}
                  onMouseEnter={() => setHover(c.code)}
                  onMouseLeave={() => setHover(null)}
                >
                  <title>{c.name}</title>
                </path>
              );
            })}
            {COUNTRIES.filter(visible).map((c) => {
              const shape = COUNTRY_SHAPES[c.code];
              if (!shape) return null;
              const [ox, oy] = c.pinOffset ?? [0, 0];
              const x = shape.x + ox;
              const y = shape.y + oy;
              const active = selected.code === c.code || hover === c.code;
              return (
                <g
                  key={c.code}
                  className={`dc-pin${active ? " active" : ""}${explored.includes(c.code) ? " stamped" : ""}`}
                  transform={`translate(${x} ${y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.name}${explored.includes(c.code) ? ", explored" : ""}`}
                  onClick={() => choose(c)}
                  onKeyDown={(e) => onKey(e, c)}
                  onMouseEnter={() => setHover(c.code)}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle r="15" />
                  <text textAnchor="middle" dominantBaseline="central" fontSize="17">
                    {c.flag}
                  </text>
                  {active && (
                    <text className="dc-pin-label" y="-24" textAnchor="middle">
                      {c.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="dc-legend">
          <span className="dc-key dc-lang-en">English</span>
          <span className="dc-key dc-lang-es">Spanish</span>
          <span className="dc-key dc-lang-pt">Portuguese</span>
        </div>
      </section>

      <div className="dc-columns">
        {/* ── Country ── */}
        <section className="dc-country-card" key={selected.code} aria-live="polite">
          <div className="dc-country-head">
            <span className="dc-flag" aria-hidden="true">{selected.flag}</span>
            <div>
              <h2>{selected.name}</h2>
              <p>
                {languageFlags[selected.language]} {languageNames[selected.language]} · 🏛️ {selected.capital}
              </p>
            </div>
          </div>
          <button type="button" className="dc-greeting" onClick={() => speakTag(selected.greeting.split("/")[0], VOICE[selected.code])}>
            <Volume2 size={20} /> Say hello: <strong>{selected.greeting}</strong>
          </button>

          <div className="dc-cards">
            {SECTIONS.map((key, i) => {
              const card = selected[key];
              return (
                <article key={key} className={`dc-card dc-card--${key}`} style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="dc-card-emoji">{card.emoji}</span>
                  <small>{SECTION_LABEL[key]}</small>
                  <strong>{card.title}</strong>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>

          <div className="dc-words">
            <h3>🗣️ Words people say here</h3>
            <div>
              {selected.words.map((w) => (
                <button type="button" key={w.word} onClick={() => speakTag(w.word, VOICE[selected.code])}>
                  <strong>{w.word}</strong>
                  <span>{w.meaning}</span>
                  <Volume2 size={15} />
                </button>
              ))}
            </div>
          </div>

          <div className="dc-quiz">
            <h3>❓ Quick quiz</h3>
            <p>{selected.quiz.question}</p>
            <div className="dc-quiz-options">
              {selected.quiz.options.map((o) => (
                <button
                  type="button"
                  key={o}
                  className={answer === o ? (o === selected.quiz.answer ? "right" : "wrong") : ""}
                  onClick={() => pickAnswer(o)}
                  disabled={answer === selected.quiz.answer}
                >
                  {o}
                </button>
              ))}
            </div>
            {answer && (
              <p className="dc-quiz-feedback">{answer === selected.quiz.answer ? "🎉 Amazing! +2 ⭐" : "🤔 Good guess! Read the cards above and try again."}</p>
            )}
          </div>

          <button type="button" className={`dc-stamp-btn${isExplored ? " done" : ""}`} onClick={() => !isExplored && onExplore(selected.code)} disabled={isExplored}>
            {isExplored ? (
              <>
                <Check size={18} /> Passport stamped!
              </>
            ) : (
              <>
                <Stamp size={18} /> Stamp my passport · +10 ⭐
              </>
            )}
          </button>
        </section>

        <aside className="dc-side">
          {/* ── Passport ── */}
          <section className="dc-passport">
            <h3>🛂 My passport</h3>
            <p>
              {explored.length} / {COUNTRIES.length} countries
            </p>
            <div className="dc-stamps">
              {COUNTRIES.map((c) => (
                <button type="button" key={c.code} className={explored.includes(c.code) ? "dc-stamp got" : "dc-stamp"} onClick={() => choose(c)} title={c.name} aria-label={`${c.name}${explored.includes(c.code) ? " (stamped)" : ""}`}>
                  {explored.includes(c.code) ? c.flag : "?"}
                </button>
              ))}
            </div>
          </section>

          {/* ── Hello around the world ── */}
          <section className="dc-hellos">
            <h3>👋 Hello around the world</h3>
            <p>There are about 7,000 languages on Earth! Tap to hear some.</p>
            <div>
              {HELLOS.map((h) => (
                <button type="button" key={h.language} onClick={() => speakTag(h.say, h.lang)} title={h.language}>
                  <span aria-hidden="true">{h.flag}</span>
                  <strong>{h.word}</strong>
                  <small>{h.language}</small>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
