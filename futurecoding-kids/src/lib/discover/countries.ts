import type { Language } from "../storyEngine";

export type CultureCard = { emoji: string; title: string; text: string };
export type LocalWord = { word: string; meaning: string };
export type QuizQuestion = { question: string; options: string[]; answer: string };

export type Country = {
  code: string; // matches COUNTRY_SHAPES
  name: string;
  flag: string;
  language: Language;
  capital: string;
  greeting: string;
  /** Small nudge so pins for close neighbours (Spain/Portugal) don't overlap. */
  pinOffset?: [number, number];
  tradition: CultureCard;
  food: CultureCard;
  music: CultureCard;
  fact: CultureCard;
  words: LocalWord[];
  quiz: QuizQuestion;
};

export const COUNTRIES: Country[] = [
  {
    code: "US", name: "United States", flag: "🇺🇸", language: "en", capital: "Washington, D.C.", greeting: "Hello! / Howdy!",
    tradition: { emoji: "🦃", title: "Thanksgiving", text: "In November, families share a big meal and say what they are thankful for." },
    food: { emoji: "🥞", title: "Pancakes", text: "Fluffy pancakes with maple syrup are a favourite breakfast." },
    music: { emoji: "🎷", title: "Jazz", text: "Jazz music was born in New Orleans, with trumpets, saxophones and drums." },
    fact: { emoji: "🏞️", title: "First national park", text: "Yellowstone, opened in 1872, was the world's first national park." },
    words: [
      { word: "Howdy!", meaning: "Hello! (a friendly greeting in Texas)" },
      { word: "Awesome!", meaning: "Great! / Super!" },
      { word: "Y'all", meaning: "You all (used in the South)" },
    ],
    quiz: { question: "Which music was born in New Orleans?", options: ["Jazz", "Samba", "Flamenco"], answer: "Jazz" },
  },
  {
    code: "GB", name: "United Kingdom", flag: "🇬🇧", language: "en", capital: "London", greeting: "Hello! / Hiya!",
    tradition: { emoji: "🎆", title: "Bonfire Night", text: "On 5 November, people watch fireworks and sit around bonfires." },
    food: { emoji: "🐟", title: "Fish and chips", text: "Crispy fried fish with chunky chips, often eaten by the seaside." },
    music: { emoji: "🎸", title: "The Beatles", text: "The Beatles, one of the most famous bands ever, came from Liverpool." },
    fact: { emoji: "🔔", title: "Big Ben", text: "Big Ben is the name of the huge bell inside London's famous clock tower." },
    words: [
      { word: "Cheers!", meaning: "Thanks! (or goodbye)" },
      { word: "Mate", meaning: "Friend" },
      { word: "Brilliant!", meaning: "Great!" },
    ],
    quiz: { question: "What is Big Ben?", options: ["A bell", "A bridge", "A king"], answer: "A bell" },
  },
  {
    code: "AU", name: "Australia", flag: "🇦🇺", language: "en", capital: "Canberra", greeting: "G'day!",
    tradition: { emoji: "🏖️", title: "Christmas at the beach", text: "Christmas comes in summer here, so many families celebrate at the beach!" },
    food: { emoji: "🍞", title: "Vegemite toast", text: "A salty, dark spread on toast — Australians love it." },
    music: { emoji: "🎶", title: "Didgeridoo", text: "A long wooden wind instrument played by Aboriginal Australians for thousands of years." },
    fact: { emoji: "🦘", title: "Amazing animals", text: "Kangaroos and koalas live here, and the Great Barrier Reef is the biggest coral reef in the world." },
    words: [
      { word: "G'day!", meaning: "Hello! / Good day!" },
      { word: "Arvo", meaning: "Afternoon" },
      { word: "Mate", meaning: "Friend" },
    ],
    quiz: { question: "When is Christmas in Australia?", options: ["In summer", "In winter", "In spring"], answer: "In summer" },
  },
  {
    code: "ES", name: "Spain", flag: "🇪🇸", language: "es", capital: "Madrid", greeting: "¡Hola!", pinOffset: [10, 2],
    tradition: { emoji: "🍇", title: "Twelve grapes", text: "On New Year's Eve, people eat 12 grapes at midnight — one for each bell!" },
    food: { emoji: "🥘", title: "Paella", text: "A big pan of rice with vegetables, seafood or chicken, from Valencia." },
    music: { emoji: "💃", title: "Flamenco", text: "Flamenco has guitar, clapping, singing and fast, stamping dance steps." },
    fact: { emoji: "🍅", title: "La Tomatina", text: "In the town of Buñol, people have a giant tomato fight every August!" },
    words: [
      { word: "¡Hola!", meaning: "Hello!" },
      { word: "Vale", meaning: "OK" },
      { word: "Tapas", meaning: "Small plates of food to share" },
    ],
    quiz: { question: "How many grapes do people eat at midnight on New Year's Eve?", options: ["12", "3", "100"], answer: "12" },
  },
  {
    code: "MX", name: "Mexico", flag: "🇲🇽", language: "es", capital: "Mexico City", greeting: "¡Hola! ¿Qué onda?",
    tradition: { emoji: "💀", title: "Día de Muertos", text: "On 1–2 November, families make colourful altars with flowers to remember loved ones." },
    food: { emoji: "🌮", title: "Tacos", text: "Soft corn tortillas filled with meat, beans, cheese and salsa." },
    music: { emoji: "🎺", title: "Mariachi", text: "Mariachi bands wear big hats and play violins, trumpets and guitars." },
    fact: { emoji: "🍫", title: "Chocolate", text: "People in ancient Mexico made drinks from cacao beans long before chocolate bars existed." },
    words: [
      { word: "¿Qué onda?", meaning: "What's up?" },
      { word: "Chido", meaning: "Cool" },
      { word: "Antojitos", meaning: "Little snacks" },
    ],
    quiz: { question: "What is a mariachi?", options: ["A music band", "A dessert", "A mountain"], answer: "A music band" },
  },
  {
    code: "AR", name: "Argentina", flag: "🇦🇷", language: "es", capital: "Buenos Aires", greeting: "¡Hola, che!",
    tradition: { emoji: "🧉", title: "Sharing mate", text: "Friends pass around a cup of mate, a warm herbal drink, as a sign of friendship." },
    food: { emoji: "🥟", title: "Empanadas", text: "Baked pastries filled with meat, cheese or vegetables." },
    music: { emoji: "🪗", title: "Tango", text: "Tango music and dance were born in Buenos Aires." },
    fact: { emoji: "🏔️", title: "Aconcagua", text: "Aconcagua is the highest mountain in all of the Americas." },
    words: [
      { word: "Che", meaning: "Hey! / Friend" },
      { word: "Mate", meaning: "A warm herbal drink" },
      { word: "Bárbaro", meaning: "Great!" },
    ],
    quiz: { question: "Which dance was born in Buenos Aires?", options: ["Tango", "Samba", "Hula"], answer: "Tango" },
  },
  {
    code: "CO", name: "Colombia", flag: "🇨🇴", language: "es", capital: "Bogotá", greeting: "¡Hola, parce!",
    tradition: { emoji: "🎭", title: "Barranquilla Carnival", text: "A huge carnival with costumes, masks, music and dancing in the streets." },
    food: { emoji: "🫓", title: "Arepas", text: "Round corn cakes, often filled with cheese — yummy for breakfast!" },
    music: { emoji: "🥁", title: "Cumbia", text: "Cumbia mixes drums, flutes and dancing, and is loved all over Latin America." },
    fact: { emoji: "🦜", title: "Birds everywhere", text: "Colombia has more kinds of birds than almost any other country on Earth." },
    words: [
      { word: "Parce", meaning: "Friend" },
      { word: "Chévere", meaning: "Cool!" },
      { word: "Arepa", meaning: "Corn cake" },
    ],
    quiz: { question: "What is an arepa?", options: ["A corn cake", "A bird", "A drum"], answer: "A corn cake" },
  },
  {
    code: "BR", name: "Brazil", flag: "🇧🇷", language: "pt", capital: "Brasília", greeting: "Oi! Tudo bem?",
    tradition: { emoji: "🎉", title: "Carnaval", text: "Brazil's Carnaval has giant parades with samba dancers and colourful costumes." },
    food: { emoji: "🍫", title: "Brigadeiro", text: "Little chocolate sweets rolled in sprinkles — a party favourite!" },
    music: { emoji: "🥁", title: "Samba", text: "Samba has fast drums and happy dancing." },
    fact: { emoji: "🌳", title: "Amazon rainforest", text: "Most of the Amazon, the largest rainforest in the world, is in Brazil." },
    words: [
      { word: "Oi!", meaning: "Hi!" },
      { word: "Legal!", meaning: "Cool!" },
      { word: "Saudade", meaning: "Missing someone or something you love" },
    ],
    quiz: { question: "Which rainforest is mostly in Brazil?", options: ["The Amazon", "The Sahara", "The Alps"], answer: "The Amazon" },
  },
  {
    code: "PT", name: "Portugal", flag: "🇵🇹", language: "pt", capital: "Lisbon", greeting: "Olá!", pinOffset: [-12, 4],
    tradition: { emoji: "🎈", title: "Santo António festival", text: "Every June, Lisbon fills with music, street parties and grilled sardines." },
    food: { emoji: "🥧", title: "Pastel de nata", text: "A small custard tart with crispy pastry, sprinkled with cinnamon." },
    music: { emoji: "🎸", title: "Fado", text: "Fado is a soulful song, often played with a Portuguese guitar." },
    fact: { emoji: "⛵", title: "Great explorers", text: "About 500 years ago, Portuguese sailors explored oceans all around the world." },
    words: [
      { word: "Olá!", meaning: "Hello!" },
      { word: "Fixe!", meaning: "Cool!" },
      { word: "Pastelaria", meaning: "Bakery" },
    ],
    quiz: { question: "What is a pastel de nata?", options: ["A custard tart", "A boat", "A song"], answer: "A custard tart" },
  },
  {
    code: "AO", name: "Angola", flag: "🇦🇴", language: "pt", capital: "Luanda", greeting: "Olá! Tudo bem?",
    tradition: { emoji: "🎭", title: "Luanda Carnival", text: "A colourful carnival with dance groups parading by the sea." },
    food: { emoji: "🍲", title: "Muamba de galinha", text: "A warm chicken stew, often eaten with funge, a soft cassava dish." },
    music: { emoji: "💃", title: "Kizomba & Semba", text: "Angola gave the world kizomba and semba, smooth and happy dances." },
    fact: { emoji: "💦", title: "Kalandula Falls", text: "Kalandula Falls is one of the biggest waterfalls in Africa." },
    words: [
      { word: "Kamba", meaning: "Friend" },
      { word: "Bué", meaning: "A lot / very" },
      { word: "Olá!", meaning: "Hello!" },
    ],
    quiz: { question: "Which dance comes from Angola?", options: ["Kizomba", "Tango", "Flamenco"], answer: "Kizomba" },
  },
];

/** "Hello" around the world — the voice uses each language when the device has it. */
export const HELLOS: { flag: string; language: string; word: string; say: string; lang: string }[] = [
  { flag: "🇺🇸", language: "English", word: "Hello", say: "Hello", lang: "en-US" },
  { flag: "🇪🇸", language: "Spanish", word: "Hola", say: "Hola", lang: "es-ES" },
  { flag: "🇧🇷", language: "Portuguese", word: "Olá", say: "Olá", lang: "pt-BR" },
  { flag: "🇫🇷", language: "French", word: "Bonjour", say: "Bonjour", lang: "fr-FR" },
  { flag: "🇮🇹", language: "Italian", word: "Ciao", say: "Ciao", lang: "it-IT" },
  { flag: "🇩🇪", language: "German", word: "Hallo", say: "Hallo", lang: "de-DE" },
  { flag: "🇯🇵", language: "Japanese", word: "Konnichiwa", say: "こんにちは", lang: "ja-JP" },
  { flag: "🇨🇳", language: "Chinese", word: "Nǐ hǎo", say: "你好", lang: "zh-CN" },
  { flag: "🇰🇷", language: "Korean", word: "Annyeong", say: "안녕", lang: "ko-KR" },
  { flag: "🇮🇳", language: "Hindi", word: "Namaste", say: "नमस्ते", lang: "hi-IN" },
  { flag: "🇸🇦", language: "Arabic", word: "Marhaba", say: "مرحبا", lang: "ar-SA" },
  { flag: "🇰🇪", language: "Swahili", word: "Jambo", say: "Jambo", lang: "sw-KE" },
];
