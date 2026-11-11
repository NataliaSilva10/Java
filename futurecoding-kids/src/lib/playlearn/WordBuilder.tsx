import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { Lightbulb, RotateCcw, Shuffle, Volume2 } from "lucide-react";
import { languageFlags } from "../storyContent";
import { LANGUAGES } from "../storyEngine";
import { sfx } from "./sfx";
import { ENCOURAGE, PASTELS, PASTEL_INK, PRAISE, pick, type ActivityProps } from "./shared";
import { categoryNames, pickFresh, shuffle, wordsForAge, type Concept } from "./words";

type Tile = { id: string; letter: string; color: number };
type Slot = { tileId: string | null; locked: boolean; wrong: boolean };

/** Drag (or tap) scrambled letters into the right order to build the word. */
export default function WordBuilder({ language, age, speak, onWin, onTryAgain }: ActivityProps) {
  const used = useRef<string[]>([]);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [solved, setSolved] = useState(false);
  const [dragTile, setDragTile] = useState<string | null>(null);

  const word = concept ? concept.word[language].toLocaleUpperCase() : "";
  const letters = [...word];

  const start = useCallback(
    (next?: Concept) => {
      const pool = wordsForAge(language, age);
      const chosen = next ?? pickFresh(pool, used.current);
      const chars = [...chosen.word[language].toLocaleUpperCase()];
      let order = shuffle(chars.map((letter, i) => ({ id: `${chosen.id}-${i}`, letter, color: i % PASTELS.length })));
      // Never start already solved.
      if (order.map((t) => t.letter).join("") === chars.join("") && chars.length > 1) order = [...order.slice(1), order[0]];
      setConcept(chosen);
      used.current = [...used.current.slice(-20), chosen.id];
      setTiles(order);
      setSlots(chars.map(() => ({ tileId: null, locked: false, wrong: false })));
      setSolved(false);
    },
    [language, age]
  );

  useEffect(() => start(), [start]);

  const tileById = (id: string | null) => tiles.find((t) => t.id === id);
  const placedIds = new Set(slots.map((s) => s.tileId).filter(Boolean) as string[]);

  const check = (next: Slot[]) => {
    if (next.some((s) => !s.tileId)) return;
    const built = next.map((s) => tileById(s.tileId)?.letter ?? "").join("");
    if (built === letters.join("")) {
      setSolved(true);
      sfx.success();
      speak(concept ? concept.word[language] : "", language, 0.8);
      onWin("builder", age === "5-6" ? 2 : 3, `${pick(PRAISE)} You built “${concept?.word[language]}”!`);
      return;
    }
    sfx.soft();
    onTryAgain(`${pick(ENCOURAGE)} The wiggly letters go somewhere else.`);
    const marked = next.map((s, i) => ({ ...s, wrong: !s.locked && tileById(s.tileId)?.letter !== letters[i] }));
    setSlots(marked);
    // Gently send the wrong letters back after the wiggle.
    window.setTimeout(() => setSlots((cur) => cur.map((s) => (s.wrong ? { ...s, tileId: null, wrong: false } : s))), 900);
  };

  const place = (tileId: string, slotIndex?: number) => {
    if (solved || placedIds.has(tileId)) return;
    const index = slotIndex ?? slots.findIndex((s) => !s.tileId);
    if (index === -1 || slots[index].locked) return;
    sfx.tap();
    const letter = tileById(tileId)?.letter ?? "";
    speak(letter.toLocaleLowerCase(), language, 0.9);
    const next = slots.map((s, i) => (i === index ? { ...s, tileId, wrong: false } : s));
    setSlots(next);
    check(next);
  };

  const unplace = (index: number) => {
    if (solved || slots[index].locked) return;
    setSlots((cur) => cur.map((s, i) => (i === index ? { ...s, tileId: null, wrong: false } : s)));
  };

  /** Hint: put the next correct letter in place and lock it. */
  const hint = () => {
    const index = slots.findIndex((s, i) => tileById(s.tileId)?.letter !== letters[i]);
    if (index === -1) return;
    // Prefer a free tile; otherwise borrow the right letter from a wrong spot (never from a locked one).
    const lockedIds = new Set(slots.filter((s) => s.locked).map((s) => s.tileId));
    const freeTile =
      tiles.find((t) => t.letter === letters[index] && !placedIds.has(t.id)) ??
      tiles.find((t) => t.letter === letters[index] && !lockedIds.has(t.id));
    if (!freeTile) return;
    const next = slots.map((s, i) => {
      if (s.tileId === freeTile.id) return { ...s, tileId: null };
      if (i === index) return { tileId: freeTile.id, locked: true, wrong: false };
      return s;
    });
    setSlots(next);
    check(next);
  };

  const onDropSlot = (event: DragEvent, index: number) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || dragTile;
    if (id) place(id, slots[index].tileId ? undefined : index);
    setDragTile(null);
  };

  if (!concept) return null;

  return (
    <div className="plg-builder">
      <div className="plg-builder-picture">
        <span className="plg-builder-emoji" aria-hidden="true">{concept.emoji}</span>
        <div>
          <span className="plg-chip">{categoryNames[concept.category].en}</span>
          {concept.hint && <p className="plg-muted">💡 {concept.hint}</p>}
          <button type="button" className="plg-btn" onClick={() => speak(concept.word[language], language, 0.75)}>
            <Volume2 size={18} /> Hear the word
          </button>
        </div>
      </div>

      <div className="plg-slots" aria-label="Build the word here">
        {slots.map((slot, i) => {
          const tile = tileById(slot.tileId);
          return (
            <button
              type="button"
              key={i}
              className={`plg-slot${tile ? " filled" : ""}${slot.wrong ? " wrong" : ""}${slot.locked ? " locked" : ""}${solved ? " solved" : ""}`}
              style={tile ? { ["--c" as string]: PASTELS[tile.color], ["--ink" as string]: PASTEL_INK[tile.color], ["--i" as string]: i } : { ["--i" as string]: i }}
              onClick={() => unplace(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropSlot(e, i)}
              aria-label={tile ? `Letter ${tile.letter}, tap to remove` : `Empty spot ${i + 1}`}
            >
              {tile ? tile.letter : age === "5-6" ? <span className="plg-ghost">{letters[i]}</span> : ""}
            </button>
          );
        })}
      </div>

      {solved ? (
        <div className="plg-solved">
          <p className="plg-solved-word">
            {concept.emoji} {concept.word[language]}
          </p>
          <div className="plg-translations">
            {LANGUAGES.filter((l) => l !== language).map((l) => (
              <button type="button" key={l} lang={l} onClick={() => speak(concept.word[l], l, 0.8)}>
                <span aria-hidden="true">{languageFlags[l]}</span> {concept.word[l]} <Volume2 size={14} />
              </button>
            ))}
          </div>
          <button type="button" className="plg-btn plg-btn-primary plg-btn-big" onClick={() => start()}>
            Next word →
          </button>
        </div>
      ) : (
        <>
          <div className="plg-tiles" aria-label="Letters">
            {tiles.map((tile) => {
              const placed = placedIds.has(tile.id);
              return (
                <button
                  type="button"
                  key={tile.id}
                  draggable={!placed}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", tile.id);
                    setDragTile(tile.id);
                  }}
                  className={`plg-tile${placed ? " placed" : ""}`}
                  style={{ ["--c" as string]: PASTELS[tile.color], ["--ink" as string]: PASTEL_INK[tile.color] }}
                  onClick={() => place(tile.id)}
                  disabled={placed}
                  aria-label={`Letter ${tile.letter}`}
                >
                  {tile.letter}
                </button>
              );
            })}
          </div>
          <div className="plg-row">
            <button type="button" className="plg-btn" onClick={hint}>
              <Lightbulb size={18} /> Show me a letter
            </button>
            <button type="button" className="plg-btn" onClick={() => setSlots((s) => s.map((x) => (x.locked ? x : { ...x, tileId: null, wrong: false })))}>
              <RotateCcw size={18} /> Start again
            </button>
            <button type="button" className="plg-btn" onClick={() => setTiles((t) => shuffle(t))}>
              <Shuffle size={18} /> Mix letters
            </button>
            <button type="button" className="plg-btn" onClick={() => start()}>
              Skip →
            </button>
          </div>
          <p className="plg-muted plg-center">Drag the letters into the boxes — or just tap them!</p>
        </>
      )}
    </div>
  );
}
