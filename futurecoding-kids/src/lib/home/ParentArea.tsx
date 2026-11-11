import { useEffect, useRef, useState } from "react";
import { Check, Mic, ShieldCheck, X } from "lucide-react";
import { ACHIEVEMENTS, levelOf, useLearner } from "../learner/learnerStore";
import { isLiveAiConfigured } from "../robot/robotService";
import { checkMicrophone, type MicCheck } from "../useMicLevel";

type Props = { open: boolean; onClose: () => void };

/** Grown-ups only: progress summary, microphone test, privacy info, reset. */
export default function ParentArea({ open, onClose }: Props) {
  const { state, streak, reset } = useLearner();
  const dialog = useRef<HTMLDialogElement>(null);
  const [checks, setChecks] = useState<MicCheck[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const runCheck = async () => {
    setChecking(true);
    setChecks(await checkMicrophone());
    setChecking(false);
  };

  return (
    <dialog ref={dialog} className="parent-area" onClose={onClose} aria-labelledby="parent-title">
      <div className="parent-head">
        <h2 id="parent-title">
          <ShieldCheck size={22} /> Parent area
        </h2>
        <button type="button" className="parent-close" onClick={onClose} aria-label="Close parent area">
          <X size={20} />
        </button>
      </div>

      <section>
        <h3>Progress</h3>
        <div className="parent-grid">
          <div><strong>{state.stars}</strong><span>stars</span></div>
          <div><strong>Level {levelOf(state.xp)}</strong><span>{state.xp} XP</span></div>
          <div><strong>{streak}</strong><span>day streak</span></div>
          <div><strong>{state.words}</strong><span>words practised</span></div>
          <div><strong>{state.chats}</strong><span>messages to Timmy</span></div>
          <div><strong>{state.storiesSaved}</strong><span>stories saved</span></div>
          <div><strong>{state.countries.length}</strong><span>countries explored</span></div>
          <div><strong>{state.achievements.length}/{ACHIEVEMENTS.length}</strong><span>achievements</span></div>
        </div>
      </section>

      <section>
        <h3>Can Timmy hear? 🎤</h3>
        <p>Run this check on the computer your child uses. The browser may ask for microphone permission.</p>
        <button type="button" className="home-btn home-btn-primary" onClick={() => void runCheck()} disabled={checking}>
          <Mic size={17} /> {checking ? "Checking…" : "Test my microphone"}
        </button>
        {checks && (
          <ul className="parent-checks">
            {checks.map((c) => (
              <li key={c.id} className={c.ok ? "ok" : "bad"}>
                <span>{c.ok ? <Check size={16} /> : <X size={16} />}</span>
                <div>
                  <strong>{c.label}</strong>
                  {!c.ok && c.help && <p>{c.help}</p>}
                </div>
              </li>
            ))}
            {checks.every((c) => c.ok) && <li className="ok summary">🎉 All good — Timmy can hear! Press “Listen to Me” in Speak & Practice.</li>}
          </ul>
        )}
      </section>

      <section>
        <h3>Privacy</h3>
        <ul className="parent-list">
          <li>Progress, stories and the nickname are saved only in this browser. There are no accounts.</li>
          <li>Voice is turned into text by the browser's speech service. FutureKids never records or stores audio.</li>
          <li>Conversations with Timmy disappear when the page is closed.</li>
          <li>
            Live AI: <strong>{isLiveAiConfigured ? "configured (answers come from your AI server)" : "off — Timmy uses ready-made practice answers"}</strong>.
          </li>
        </ul>
      </section>

      <section>
        <h3>Start over</h3>
        {confirmReset ? (
          <div className="parent-row">
            <span>Erase all stars, levels and goals on this browser?</span>
            <button type="button" className="home-btn parent-danger" onClick={() => { reset(); setConfirmReset(false); }}>
              Yes, reset
            </button>
            <button type="button" className="home-btn" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="home-btn" onClick={() => setConfirmReset(true)}>
            Reset progress…
          </button>
        )}
      </section>
    </dialog>
  );
}
