import { useEffect, useState } from "react";
import { AGE_GROUPS, type AgeGroup } from "../playlearn/words";

const KEY = "futurekids-playlearn-age";

/** The child's age group, shared by Play & Learn and Story Studio (saved in this browser). */
export function useAgeGroup(fallback: AgeGroup = "7-9") {
  const [age, setAge] = useState<AgeGroup>(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      return AGE_GROUPS.includes(saved as AgeGroup) ? (saved as AgeGroup) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, age);
    } catch {
      /* not saved */
    }
  }, [age]);
  return [age, setAge] as const;
}
