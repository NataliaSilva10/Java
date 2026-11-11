import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, BookOpen, Minus, Plus, PlusCircle, Square, Trash2, Volume2 } from "lucide-react";
import "./storyStudio.css";
import { languageFlags, languageNames } from "../storyContent";
import { LANGUAGES, type Language } from "../storyEngine";
import { useSpeech } from "../useSpeech";
import { AGE_GROUPS, categoryNames, conceptById, concepts, type AgeGroup, type Category } from "../playlearn/words";
import {
  HELPER_WORDS,
  PROMPTS,
  SCENES,
  STARTERS,
  TEXT_LIMIT,
  blankPage,
  newId,
  useStoryLibrary,
  type SavedStory,
  type SceneId,
  type Sticker,
} from "./storyLibrary";

type Props = {
  language: Language;
  age: AgeGroup;
  onAgeChange: (age: AgeGroup) => void;
  /** First time a story is finished. */
  onStorySaved: () => void;
  /** A story was read aloud. */
  onStoryRead: () => void;
};

const PALETTE: Category[] = ["characters", "animals", "nature", "things", "food", "transport"];
const AGE_LABEL: Record<AgeGroup, string> = { "5-6": "🐣 5–6", "7-9": "🚀 7–9", "10-12": "🏆 10–12" };
const MAX_STICKERS = 8;

/** Story Studio: make illustrated stories, learn their words in 3 languages, listen to them and save them. */
export default function StoryStudio({ language, age, onAgeChange, onStorySaved, onStoryRead }: Props) {
  const { stories, upsert, remove, saveError } = useStoryLibrary();
  const speech = useSpeech();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [category, setCategory] = useState<Category>("characters");
  const [selected, setSelected] = useState<string | null>(null);
  const [readingPage, setReadingPage] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const readToken = useRef(0);

  const story = stories.find((s) => s.id === openId) ?? null;
  const page = story?.pages[Math.min(pageIndex, story.pages.length - 1)];

  // Stop reading aloud when leaving Story Studio.
  const stopSpeech = useRef(speech.stop);
  stopSpeech.current = speech.stop;
  useEffect(() => () => stopSpeech.current(), []);

  const update = useCallback((change: (s: SavedStory) => SavedStory) => {
    if (story) upsert(change(story));
  }, [story, upsert]);

  const updatePage = (change: (p: NonNullable<typeof page>) => NonNullable<typeof page>) =>
    update((s) => ({ ...s, pages: s.pages.map((p, i) => (i === pageIndex ? change(p) : p)) }));

  // ───────── library actions ─────────
  const create = () => {
    const fresh: SavedStory = {
      id: newId(),
      title: "",
      language,
      age,
      pages: [blankPage("forest")],
      finished: false,
      updatedAt: Date.now(),
    };
    upsert(fresh);
    setOpenId(fresh.id);
    setPageIndex(0);
  };

  /** Reads pages aloud one after another, highlighting the page being read. */
  const readStory = (s: SavedStory, from = 0, only?: number) => {
    const token = ++readToken.current;
    const pagesToRead = only !== undefined ? [only] : s.pages.map((_, i) => i).slice(from);
    const readNext = (k: number) => {
      if (token !== readToken.current || k >= pagesToRead.length) {
        if (token === readToken.current) setReadingPage(null);
        return;
      }
      const i = pagesToRead[k];
      const p = s.pages[i];
      const words = p.stickers.map((st) => conceptById(st.conceptId).word[s.language]).join(", ");
      const text = p.text.trim() || words || "…";
      setReadingPage(i);
      if (openId === s.id) setPageIndex(i);
      speech.speak(k === 0 && only === undefined && s.title ? `${s.title}. ${text}` : text, s.language, {
        rate: 0.85,
        onEnd: () => window.setTimeout(() => readNext(k + 1), 500),
      });
    };
    readNext(0);
    if (only === undefined) onStoryRead();
  };

  const stopReading = () => {
    readToken.current++;
    speech.stop();
    setReadingPage(null);
  };

  const finish = () => {
    if (!story) return;
    if (!story.finished) {
      onStorySaved();
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 2600);
    }
    update((s) => ({ ...s, finished: true, title: s.title.trim() || "My story" }));
  };

  // ───────── stickers ─────────
  const addSticker = (conceptId: string) => {
    if (!page || page.stickers.length >= MAX_STICKERS) return;
    const n = page.stickers.length;
    const sticker: Sticker = { id: newId(), conceptId, x: 20 + ((n * 17) % 60), y: 35 + ((n * 23) % 35), size: 2 };
    updatePage((p) => ({ ...p, stickers: [...p.stickers, sticker] }));
    setSelected(sticker.id);
    speech.speak(conceptById(conceptId).word[story?.language ?? language], story?.language ?? language, { rate: 0.85 });
  };

  const moveSticker = (id: string, x: number, y: number) =>
    updatePage((p) => ({
      ...p,
      stickers: p.stickers.map((st) => (st.id === id ? { ...st, x: Math.max(4, Math.min(96, x)), y: Math.max(6, Math.min(94, y)) } : st)),
    }));

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, st: Sticker) => {
    const rect = canvas.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(st.id);
    drag.current = {
      id: st.id,
      dx: ((event.clientX - rect.left) / rect.width) * 100 - st.x,
      dy: ((event.clientY - rect.top) / rect.height) * 100 - st.y,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = canvas.current?.getBoundingClientRect();
    if (!drag.current || !rect) return;
    moveSticker(
      drag.current.id,
      ((event.clientX - rect.left) / rect.width) * 100 - drag.current.dx,
      ((event.clientY - rect.top) / rect.height) * 100 - drag.current.dy
    );
  };

  /** Keyboard: arrows move the selected sticker, Delete removes it. */
  const onStickerKey = (event: KeyboardEvent<HTMLButtonElement>, st: Sticker) => {
    const step = 4;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[event.key]) {
      event.preventDefault();
      moveSticker(st.id, st.x + moves[event.key][0], st.y + moves[event.key][1]);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      updatePage((p) => ({ ...p, stickers: p.stickers.filter((s) => s.id !== st.id) }));
    }
  };

  const resize = (delta: 1 | -1) =>
    updatePage((p) => ({
      ...p,
      stickers: p.stickers.map((st) => (st.id === selected ? { ...st, size: Math.max(1, Math.min(3, st.size + delta)) as Sticker["size"] } : st)),
    }));

  // ───────── text helpers ─────────
  const limit = story ? TEXT_LIMIT[story.age] : 300;
  const insertText = (piece: string) =>
    updatePage((p) => {
      const glue = p.text && !p.text.endsWith(" ") ? " " : "";
      return { ...p, text: `${p.text}${glue}${piece}`.slice(0, limit) };
    });

  // ═════════ LIBRARY VIEW ═════════
  if (!story || !page) {
    return (
      <div className="ss">
        <div className="ss-library-head">
          <div>
            <h2>📚 My stories</h2>
            <p>Make a story with pictures, write it, and listen to it in English, Português or Español.</p>
          </div>
          <button type="button" className="ss-btn ss-btn-primary ss-btn-big" onClick={create}>
            <PlusCircle size={20} /> New story
          </button>
        </div>
        {saveError && <p className="ss-warning">⚠️ This browser couldn't save. Stories will be lost when the page closes.</p>}
        {stories.length === 0 ? (
          <div className="ss-empty">
            <span aria-hidden="true">🤖📖✨</span>
            <p>Timmy can't wait to read your first story!</p>
            <button type="button" className="ss-btn ss-btn-primary" onClick={create}>
              Start my first story
            </button>
          </div>
        ) : (
          <div className="ss-shelf">
            {stories.map((s) => {
              const cover = s.pages[0];
              const scene = SCENES.find((sc) => sc.id === cover.scene) ?? SCENES[0];
              return (
                <article key={s.id} className="ss-book">
                  <button type="button" className="ss-cover" style={{ background: scene.background }} onClick={() => { setOpenId(s.id); setPageIndex(0); }} aria-label={`Open ${s.title || "Untitled story"}`}>
                    {cover.stickers.slice(0, 5).map((st) => (
                      <span key={st.id} style={{ left: `${st.x}%`, top: `${st.y}%` }}>{conceptById(st.conceptId).emoji}</span>
                    ))}
                    {s.finished && <span className="ss-done-badge">⭐</span>}
                  </button>
                  <div className="ss-book-info">
                    <strong>{s.title || "Untitled story"}</strong>
                    <small>
                      {languageFlags[s.language]} {s.pages.length} page{s.pages.length > 1 ? "s" : ""} · {new Date(s.updatedAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="ss-book-actions">
                    <button type="button" className="ss-btn" onClick={() => (readingPage !== null ? stopReading() : readStory(s))}>
                      {readingPage !== null ? <Square size={15} /> : <Volume2 size={15} />} {readingPage !== null ? "Stop" : "Listen"}
                    </button>
                    {confirmDelete === s.id ? (
                      <>
                        <button type="button" className="ss-btn ss-btn-danger" onClick={() => { remove(s.id); setConfirmDelete(null); }}>Delete</button>
                        <button type="button" className="ss-btn" onClick={() => setConfirmDelete(null)}>Keep</button>
                      </>
                    ) : (
                      <button type="button" className="ss-btn ss-btn-icon" onClick={() => setConfirmDelete(s.id)} aria-label={`Delete ${s.title || "story"}`}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ═════════ EDITOR VIEW ═════════
  const scene = SCENES.find((s) => s.id === page.scene) ?? SCENES[0];
  const lang = story.language;
  const pageWords = [...new Set(page.stickers.map((st) => st.conceptId))].map(conceptById);
  const selectedSticker = page.stickers.find((st) => st.id === selected);

  return (
    <div className="ss">
      {celebrate && (
        <div className="ss-celebrate" role="status">
          🎉 Story saved! +3 ⭐ — you're a real author!
        </div>
      )}
      <div className="ss-toolbar">
        <button type="button" className="ss-btn" onClick={() => { stopReading(); setOpenId(null); setSelected(null); }}>
          <ArrowLeft size={17} /> My stories
        </button>
        <input
          className="ss-title"
          value={story.title}
          onChange={(e) => update((s) => ({ ...s, title: e.target.value.slice(0, 60) }))}
          placeholder="Story title…"
          aria-label="Story title"
          lang={lang}
        />
        <div className="ss-seg" role="group" aria-label="Story language">
          {LANGUAGES.map((l) => (
            <button type="button" key={l} className={lang === l ? "active" : ""} onClick={() => update((s) => ({ ...s, language: l }))} aria-pressed={lang === l} title={languageNames[l]}>
              {languageFlags[l]}
            </button>
          ))}
        </div>
        <div className="ss-seg" role="group" aria-label="Age">
          {AGE_GROUPS.map((a) => (
            <button type="button" key={a} className={story.age === a ? "active" : ""} onClick={() => { update((s) => ({ ...s, age: a })); onAgeChange(a); }} aria-pressed={story.age === a}>
              {AGE_LABEL[a]}
            </button>
          ))}
        </div>
        <span className="ss-saved">✓ Saved</span>
      </div>

      <div className="ss-editor">
        {/* ── left: picture + text ── */}
        <div className="ss-main">
          <div
            ref={canvas}
            className={`ss-canvas${readingPage === pageIndex ? " reading" : ""}`}
            style={{ background: scene.background }}
            onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
            aria-label={`Page ${pageIndex + 1} picture`}
          >
            <span className="ss-ground" aria-hidden="true">{scene.ground}</span>
            {page.stickers.length === 0 && <p className="ss-canvas-hint">Tap a sticker on the right to add it to your picture →</p>}
            {page.stickers.map((st) => {
              const c = conceptById(st.conceptId);
              return (
                <button
                  type="button"
                  key={st.id}
                  className={`ss-sticker size-${st.size}${selected === st.id ? " selected" : ""}`}
                  style={{ left: `${st.x}%`, top: `${st.y}%` }}
                  onPointerDown={(e) => onPointerDown(e, st)}
                  onPointerMove={onPointerMove}
                  onPointerUp={() => (drag.current = null)}
                  onKeyDown={(e) => onStickerKey(e, st)}
                  onFocus={() => setSelected(st.id)}
                  aria-label={`${c.word[lang]} sticker. Drag or use arrow keys to move, Delete to remove.`}
                >
                  {c.emoji}
                </button>
              );
            })}
          </div>

          {selectedSticker && (
            <div className="ss-sticker-tools">
              <span lang={lang}>
                {conceptById(selectedSticker.conceptId).emoji} <strong>{conceptById(selectedSticker.conceptId).word[lang]}</strong>
              </span>
              <button type="button" className="ss-btn ss-btn-icon" onClick={() => speech.speak(conceptById(selectedSticker.conceptId).word[lang], lang, { rate: 0.8 })} aria-label="Hear the word">
                <Volume2 size={16} />
              </button>
              <button type="button" className="ss-btn ss-btn-icon" onClick={() => resize(-1)} aria-label="Smaller"><Minus size={16} /></button>
              <button type="button" className="ss-btn ss-btn-icon" onClick={() => resize(1)} aria-label="Bigger"><Plus size={16} /></button>
              <button type="button" className="ss-btn ss-btn-icon" onClick={() => { updatePage((p) => ({ ...p, stickers: p.stickers.filter((s) => s.id !== selected) })); setSelected(null); }} aria-label="Remove sticker">
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* writing area changes with age */}
          <div className="ss-writing">
            {story.age === "10-12" && <p className="ss-prompt">✍️ {PROMPTS[pageIndex % PROMPTS.length]}</p>}
            {story.age !== "10-12" && (
              <div className="ss-chips" lang={lang}>
                {(story.age === "5-6" ? HELPER_WORDS[lang] : STARTERS.map((s) => s[lang])).map((w) => (
                  <button type="button" key={w} className="ss-chip" onClick={() => insertText(w)}>
                    {w}
                  </button>
                ))}
                {pageWords.map((c) => (
                  <button type="button" key={c.id} className="ss-chip ss-chip-word" onClick={() => insertText(story.age === "5-6" ? c.word[lang] : c.word[lang].toLocaleLowerCase())}>
                    {c.emoji} {c.word[lang]}
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={page.text}
              onChange={(e) => updatePage((p) => ({ ...p, text: e.target.value.slice(0, limit) }))}
              placeholder={story.age === "5-6" ? "Tap the words above or type…" : STARTERS[0][lang] + " …"}
              rows={story.age === "10-12" ? 6 : story.age === "7-9" ? 3 : 2}
              lang={lang}
              aria-label={`Text for page ${pageIndex + 1}`}
            />
            <div className="ss-writing-foot">
              <small>{page.text.length} / {limit}</small>
              <button type="button" className="ss-btn" onClick={() => (readingPage === pageIndex ? stopReading() : readStory(story, 0, pageIndex))}>
                {readingPage === pageIndex ? <Square size={16} /> : <Volume2 size={16} />} {readingPage === pageIndex ? "Stop" : "Read this page"}
              </button>
            </div>
          </div>

          {/* pages */}
          <div className="ss-pages" aria-label="Pages">
            {story.pages.map((p, i) => {
              const sc = SCENES.find((s) => s.id === p.scene) ?? SCENES[0];
              return (
                <button type="button" key={p.id} className={`ss-page-thumb${i === pageIndex ? " active" : ""}${readingPage === i ? " reading" : ""}`} style={{ background: sc.background }} onClick={() => { setPageIndex(i); setSelected(null); }} aria-label={`Page ${i + 1}`}>
                  <span>{i + 1}</span>
                </button>
              );
            })}
            <button type="button" className="ss-page-add" onClick={() => { update((s) => ({ ...s, pages: [...s.pages, blankPage(page.scene)] })); setPageIndex(story.pages.length); }} disabled={story.pages.length >= 12} aria-label="Add a page">
              <Plus size={20} />
            </button>
            {story.pages.length > 1 && (
              <button type="button" className="ss-btn ss-btn-icon" onClick={() => { update((s) => ({ ...s, pages: s.pages.filter((_, i) => i !== pageIndex) })); setPageIndex((i) => Math.max(0, i - 1)); }} aria-label="Delete this page">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="ss-finish">
            <button type="button" className="ss-btn ss-btn-big" onClick={() => (readingPage !== null ? stopReading() : readStory(story))}>
              {readingPage !== null ? <Square size={18} /> : <BookOpen size={18} />} {readingPage !== null ? "Stop reading" : "Read my whole story"}
            </button>
            <button type="button" className="ss-btn ss-btn-primary ss-btn-big" onClick={finish}>
              ⭐ {story.finished ? "Saved!" : "I'm done — save my story!"}
            </button>
          </div>
        </div>

        {/* ── right: scenes, stickers, vocabulary ── */}
        <aside className="ss-side">
          <section>
            <h3>🎨 Place</h3>
            <div className="ss-scenes">
              {SCENES.map((s) => (
                <button type="button" key={s.id} className={`ss-scene${page.scene === s.id ? " active" : ""}`} style={{ background: s.background }} onClick={() => updatePage((p) => ({ ...p, scene: s.id as SceneId }))} aria-label={s.name} title={s.name}>
                  {s.emoji}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3>✨ Stickers {page.stickers.length >= MAX_STICKERS && <small>(page is full)</small>}</h3>
            <div className="ss-tabs" role="tablist">
              {PALETTE.map((cat) => (
                <button type="button" key={cat} role="tab" aria-selected={category === cat} className={category === cat ? "active" : ""} onClick={() => setCategory(cat)}>
                  {categoryNames[cat].en}
                </button>
              ))}
            </div>
            <div className="ss-palette">
              {concepts.filter((c) => c.category === category).map((c) => (
                <button type="button" key={c.id} onClick={() => addSticker(c.id)} disabled={page.stickers.length >= MAX_STICKERS} title={c.word[lang]} aria-label={`Add ${c.word[lang]}`}>
                  {c.emoji}
                </button>
              ))}
            </div>
          </section>
          <section className="ss-vocab">
            <h3>📚 Words in this page</h3>
            {pageWords.length === 0 ? (
              <p className="ss-muted">Add stickers to learn their words in 3 languages!</p>
            ) : (
              <ul>
                {pageWords.map((c) => {
                  const used = page.text.toLocaleLowerCase().includes(c.word[lang].toLocaleLowerCase());
                  return (
                    <li key={c.id}>
                      <span className="ss-vocab-emoji">{c.emoji}</span>
                      {LANGUAGES.map((l) => (
                        <button type="button" key={l} lang={l} className={l === lang ? "current" : ""} onClick={() => speech.speak(c.word[l], l, { rate: 0.8 })}>
                          {languageFlags[l]} {c.word[l]}
                        </button>
                      ))}
                      {story.age !== "5-6" && <span className={used ? "ss-used yes" : "ss-used"} title={used ? "You used this word!" : "Try using this word"}>{used ? "✓" : "○"}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
            {story.age === "10-12" && pageWords.length > 0 && <p className="ss-muted">Challenge: use every word in your writing (✓ = used).</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}
