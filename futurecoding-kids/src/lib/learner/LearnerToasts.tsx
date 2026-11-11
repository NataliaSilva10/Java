import { useEffect } from "react";
import { DAILY_BONUS, useLearner } from "./learnerStore";
import { Confetti } from "../playlearn/Celebration";
import { sfx } from "../playlearn/sfx";

/** App-wide celebrations: new achievement, daily goals finished. */
export default function LearnerToasts() {
  const { unlocked, dismissUnlocked, dailyJustDone } = useLearner();

  useEffect(() => {
    if (!unlocked) return;
    sfx.fanfare();
    const t = window.setTimeout(dismissUnlocked, 4500);
    return () => window.clearTimeout(t);
  }, [unlocked, dismissUnlocked]);

  useEffect(() => {
    if (dailyJustDone) sfx.fanfare();
  }, [dailyJustDone]);

  if (!unlocked && !dailyJustDone) return null;

  return (
    <div className="learner-toast" role="status" aria-live="polite">
      <Confetti pieces={44} />
      {dailyJustDone ? (
        <>
          <span className="learner-toast-emoji">🏅</span>
          <div>
            <small>DAILY GOALS COMPLETE!</small>
            <strong>+{DAILY_BONUS} bonus stars</strong>
            <p>You did everything today — amazing!</p>
          </div>
        </>
      ) : (
        unlocked && (
          <>
            <span className="learner-toast-emoji">{unlocked.emoji}</span>
            <div>
              <small>NEW ACHIEVEMENT!</small>
              <strong>{unlocked.name}</strong>
              <p>{unlocked.description} — you're a superstar!</p>
            </div>
            <button type="button" className="learner-toast-close" onClick={dismissUnlocked} aria-label="Close">
              ×
            </button>
          </>
        )
      )}
    </div>
  );
}
