# FutureKids AI — Born to create the future

Five sections, all in **English, Español and Português**, with Timmy the robot as guide:

| Section | What's inside |
|---|---|
| 🏠 **Home** | Timmy's welcome (by name), today's 3 goals (+10 ⭐ bonus), stars, level & XP, streak, achievements, "Timmy recommends" |
| 💬 **Speak & Practice** | Talk with Timmy by voice or text: 7 everyday topics + 3 role-plays (café, toy shop, directions), gentle grammar tips, pronunciation, optional live AI |
| 🧩 **Play & Learn** | Letter Pop, Word Builder, Matching, Hangman, Sound & Spelling, Sentence Builder |
| 📖 **Create Stories** | **Story Studio** (make, illustrate, save and listen to your own stories) + Sentence Adventures |
| 🌍 **Discover Cultures** | Clickable world map, 10 countries (traditions, food, music, facts, local words, quiz), passport stamps, "Hello" in 12 languages |

Every section feeds one shared progress system (stars, XP & levels, daily goals, streak, achievements).
Trying earns XP too — effort is rewarded, not only correct answers.

## Can Timmy hear? 🎤
Timmy listens with the browser's speech recognition:
- Use **Chrome or Edge** (Firefox can't). Typing always works as a backup.
- Open the app at **http://localhost:5173** (from `npm run dev`) or an https address.
- Chrome/Edge need **internet** to turn speech into text.
- Allow the microphone when the browser asks (🔒 icon in the address bar).
- Grown-ups: **Parent area → Test my microphone** checks all of this step by step.
While Timmy listens, green sound bars show that he can hear you.

---
# Timmy & the Play & Learn playground

Timmy the robot now talks, listens, teaches words, helps build sentences and chats in
**English, Spanish and Portuguese**, on the **Speak & Practice** and **Create Stories** pages.

## Play & Learn playground

Six games, each in English, Português and Español, with an age switch (5–6, 7–9, 10–12) that changes the difficulty:

| Game | What children do |
|---|---|
| 🔤 **Letter Pop** | Tap or drag big floating letters (upper + lowercase) to hear them, see a picture word and its translations; "Find the letter" listening game; say the word into the mic |
| 🧱 **Word Builder** | Drag (or tap) letters into the right order; picture + sound hints; ghost letters for ages 5–6 |
| 🧩 **Matching** | Letter ↔ picture, word ↔ picture, or word ↔ translation |
| 🤖 **Word Challenge** | The Hangman game (Timmy's robot, keyboard support) with picture hints |
| 🐝 **Sound & Spelling** | Hear a word, pick the right spelling; wrong letters wiggle in red |
| 📝 **Sentence Builder** | Put words in order (uses the Create Stories sentences) |

Stars, levels, 10 unlockable badges, confetti and Timmy's reactions reward progress; mistakes only get gentle "try again" messages.
Play & Learn progress is saved in the browser (no personal data).

## Run it

```bash
npm install
npm run dev          # opens the app (Vite)
npm run typecheck    # optional: check for TypeScript errors
```

Timmy works right away in **practice mode**: offline, with ready-made, natural replies.
The badge next to Timmy always says which mode is active, so practice mode is never presented as live AI.

## Turn on live AI (optional, needs a grown-up)

The API key stays on a small server on your computer. It is **never** put in the browser code.

1. Start the server (Node 18+), in a second terminal:
   - macOS/Linux: `ANTHROPIC_API_KEY=your-key npm run server`
   - Windows PowerShell: `$env:ANTHROPIC_API_KEY="your-key"; npm run server`
2. Copy `.env.example` to `.env.local` (it only contains the server URL, no key).
3. Restart `npm run dev`. The badge changes to **Live AI**.

If the AI can't be reached, Timmy shows a message with **Try again** and **Use practice mode**.
Optional server settings: `ROBOT_MODEL` (default `claude-haiku-5-5`), `PORT` (8787),
`ALLOWED_ORIGIN` (default `http://localhost:5173`).

## Privacy (app for children)

- The child's name and conversations are kept in memory only and disappear when the page closes.
- Only stars and settings are saved in the browser (localStorage).
- Voice is processed by the browser's speech recognition. The app does not record or store audio.
- The server does not log messages, limits message size and rate, and tells the AI never to ask
  for personal information. Before using live AI with children, make sure a parent or guardian
  agrees, and check the AI provider's terms for use with minors.

## Where things are

| File | What it does |
|---|---|
| `src/lib/CreateStories.tsx / .css` | Sentence-building activities, now with levels, Timmy, mistake highlighting |
| `src/lib/storyContent.ts` | **All activities + interface text in 3 languages** (add activities here) |
| `src/lib/storyEngine.ts` | Sentence checking, word-bank shuffle, word-by-word feedback |
| `src/lib/robot/Robot.tsx` | Timmy's animated character (idle, speaking, listening, thinking, happy, encouraging) |
| `src/lib/robot/RobotCompanion.tsx` | Timmy's panel: speech bubbles, chat, mic, 6 buttons, topics |
| `src/lib/robot/useRobotCompanion.ts` | Timmy's behaviour (conversation, voice, AI, reactions) |
| `src/lib/robot/localConversation.ts` | Practice mode replies, gentle grammar corrections |
| `src/lib/robot/topics.ts` / `robotPhrases.ts` | Conversation topics and Timmy's phrases, per language |
| `src/lib/robot/robotService.ts` | API service layer (health check, chat, timeouts, errors) |
| `src/lib/robot/SpeakWithTimmy.tsx` | Speak & Practice page content |
| `src/lib/useSpeech.ts` / `useSpeechRecognition.ts` | Robot voice and microphone |
| `server/robot-server.mjs` | Live AI backend (keeps the API key secret) |
| `src/lib/playlearn/PlayLearn.tsx / .css` | Play & Learn page (hero, age & language pickers, games, badges) |
| `src/lib/playlearn/words.ts` | **Alphabets + picture words in 3 languages** (add words here) |
| `src/lib/playlearn/LetterPop.tsx`, `WordBuilder.tsx`, `MatchingGame.tsx`, `HangmanGame.tsx`, `SoundSpelling.tsx`, `SentenceBuilder.tsx` | The six games |
| `src/lib/playlearn/progress.ts` / `sfx.ts` | Stars, levels, badges · little sound effects (Web Audio, no files) |
| `src/lib/learner/learnerStore.tsx` | Shared progress: stars, XP, levels, streak, daily goals, achievements, recommendations |
| `src/lib/home/HomeDashboard.tsx`, `ParentArea.tsx` | Home page · Parent area (progress, mic test, privacy, reset) |
| `src/lib/stories/StoryStudio.tsx`, `storyLibrary.ts` | Story Studio and saved stories |
| `src/lib/discover/DiscoverCultures.tsx`, `countries.ts`, `worldMap.ts` | Discover Cultures, country content, world map (Natural Earth, public domain) |
| `src/lib/useMicLevel.ts` | Live mic meter + microphone check |
| `public/brand/` | FutureKids logo and app icon |

### Add a sentence activity
Copy an activity in `src/lib/storyContent.ts`, give it a new `id`, choose a `level`, and write the
sentence naturally in each language (not word-for-word). Use `alternatives` for other correct
word orders. Pictures go in `public/images/` (e.g. `image: "/images/cat-sleeping.png"`); without a
picture, the emoji scene is shown. In dev mode, missing translations are listed in the browser console.
