import { useEffect, useState } from "react";
import CreateStories from "../CreateStories";
import { useAgeGroup } from "../learner/useAgeGroup";
import type { Language } from "../storyEngine";
import StoryStudio from "./StoryStudio";

type Tab = "studio" | "sentences";

type Props = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onStarEarned: () => void;
  onStorySaved: () => void;
  onStoryRead: () => void;
};

/** Create Stories = Story Studio (make your own) + Sentence Adventures (the sentence builder). */
export default function CreateStoriesPage({ language, onLanguageChange, onStarEarned, onStorySaved, onStoryRead }: Props) {
  const [age, setAge] = useAgeGroup();
  const [tab, setTab] = useState<Tab>(() => {
    try {
      return window.localStorage.getItem("futurekids-stories-tab") === "sentences" ? "sentences" : "studio";
    } catch {
      return "studio";
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("futurekids-stories-tab", tab);
    } catch {
      /* not saved */
    }
  }, [tab]);

  return (
    <div className="stories-page">
      <div className="stories-tabs" role="tablist" aria-label="Create Stories">
        <button type="button" role="tab" aria-selected={tab === "studio"} className={tab === "studio" ? "active" : ""} onClick={() => setTab("studio")}>
          <span aria-hidden="true">📖</span> Story Studio
          <small>Make your own picture story</small>
        </button>
        <button type="button" role="tab" aria-selected={tab === "sentences"} className={tab === "sentences" ? "active" : ""} onClick={() => setTab("sentences")}>
          <span aria-hidden="true">✏️</span> Sentence Adventures
          <small>Build sentences with Timmy</small>
        </button>
      </div>
      {tab === "studio" ? (
        <StoryStudio language={language} age={age} onAgeChange={setAge} onStorySaved={onStorySaved} onStoryRead={onStoryRead} />
      ) : (
        <CreateStories language={language} onLanguageChange={onLanguageChange} onStarEarned={onStarEarned} />
      )}
    </div>
  );
}
