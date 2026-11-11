// Play & Learn word data, written per language (not word-for-word).
// One "concept" = one picture with its word in English, Portuguese and Spanish.

import type { Language, Translated } from "../storyEngine";

export type AgeGroup = "5-6" | "7-9" | "10-12";
export const AGE_GROUPS: AgeGroup[] = ["5-6", "7-9", "10-12"];

export type Category = "characters" | "animals" | "food" | "colors" | "family" | "school" | "nature" | "things" | "transport";

export type Concept = {
  id: string;
  emoji: string;
  category: Category;
  word: Translated;
  /** Optional English hint (the dashboard is in English). */
  hint?: string;
};

const C = (id: string, emoji: string, category: Category, en: string, pt: string, es: string, hint?: string): Concept => ({
  id,
  emoji,
  category,
  word: { en, pt, es },
  hint,
});

export const concepts: Concept[] = [
  // story characters
  C("girl", "👧", "characters", "Girl", "Menina", "Niña", "A young girl."),
  C("boy", "🧒", "characters", "Boy", "Menino", "Niño", "A young boy."),
  C("robot", "🤖", "characters", "Robot", "Robô", "Robot", "A friendly machine like Timmy."),
  C("dragon", "🐉", "characters", "Dragon", "Dragão", "Dragón", "A magical creature with wings."),
  C("wizard", "🧙", "characters", "Wizard", "Mago", "Mago", "Someone who does magic."),
  C("fairy", "🧚", "characters", "Fairy", "Fada", "Hada", "A tiny magical friend with wings."),
  C("unicorn", "🦄", "characters", "Unicorn", "Unicórnio", "Unicornio", "A horse with a magic horn."),
  C("astronaut", "🧑‍🚀", "characters", "Astronaut", "Astronauta", "Astronauta", "Someone who travels to space."),
  C("princess", "👸", "characters", "Princess", "Princesa", "Princesa", "A girl who lives in a castle."),
  C("castle", "🏰", "characters", "Castle", "Castelo", "Castillo", "A big house for kings and queens."),
  C("treasure", "💎", "characters", "Diamond", "Diamante", "Diamante", "A shiny treasure."),
  // animals
  C("cat", "🐱", "animals", "Cat", "Gato", "Gato", "A pet that says meow."),
  C("dog", "🐶", "animals", "Dog", "Cachorro", "Perro", "A pet that loves to bark."),
  C("bee", "🐝", "animals", "Bee", "Abelha", "Abeja", "It makes honey."),
  C("cow", "🐮", "animals", "Cow", "Vaca", "Vaca", "It gives us milk."),
  C("pig", "🐷", "animals", "Pig", "Porco", "Cerdo", "A pink farm animal."),
  C("duck", "🦆", "animals", "Duck", "Pato", "Pato", "It says quack."),
  C("mouse", "🐭", "animals", "Mouse", "Rato", "Ratón", "Small and loves cheese."),
  C("frog", "🐸", "animals", "Frog", "Sapo", "Rana", "A green jumper."),
  C("owl", "🦉", "animals", "Owl", "Coruja", "Búho", "A bird awake at night."),
  C("bear", "🐻", "animals", "Bear", "Urso", "Oso", "Big, furry and loves honey."),
  C("lion", "🦁", "animals", "Lion", "Leão", "León", "The king of the jungle."),
  C("tiger", "🐯", "animals", "Tiger", "Tigre", "Tigre", "A big cat with stripes."),
  C("zebra", "🦓", "animals", "Zebra", "Zebra", "Cebra", "A horse with stripes."),
  C("horse", "🐴", "animals", "Horse", "Cavalo", "Caballo", "You can ride it."),
  C("bird", "🐦", "animals", "Bird", "Pássaro", "Pájaro", "It has wings and sings."),
  C("fish", "🐟", "animals", "Fish", "Peixe", "Pez", "It swims in water."),
  C("seal", "🦭", "animals", "Seal", "Foca", "Foca", "It claps and swims."),
  C("whale", "🐳", "animals", "Whale", "Baleia", "Ballena", "The biggest sea animal."),
  C("rabbit", "🐰", "animals", "Rabbit", "Coelho", "Conejo", "An animal with long ears."),
  C("monkey", "🐵", "animals", "Monkey", "Macaco", "Mono", "It loves bananas."),
  C("turtle", "🐢", "animals", "Turtle", "Tartaruga", "Tortuga", "Slow, with a shell."),
  C("koala", "🐨", "animals", "Koala", "Coala", "Koala", "It hugs trees."),
  C("snail", "🐌", "animals", "Snail", "Caracol", "Caracol", "Very slow, with a shell."),
  C("spider", "🕷️", "animals", "Spider", "Aranha", "Araña", "It has eight legs."),
  C("giraffe", "🦒", "animals", "Giraffe", "Girafa", "Jirafa", "A very long neck."),
  C("penguin", "🐧", "animals", "Penguin", "Pinguim", "Pingüino", "A bird that can't fly."),
  C("dolphin", "🐬", "animals", "Dolphin", "Golfinho", "Delfín", "A smart sea friend."),
  C("octopus", "🐙", "animals", "Octopus", "Polvo", "Pulpo", "Eight arms in the sea."),
  C("elephant", "🐘", "animals", "Elephant", "Elefante", "Elefante", "Big ears and a trunk."),
  C("butterfly", "🦋", "animals", "Butterfly", "Borboleta", "Mariposa", "Colorful wings."),
  C("hippo", "🦛", "animals", "Hippo", "Hipopótamo", "Hipopótamo", "A big animal in rivers."),
  C("alligator", "🐊", "animals", "Alligator", "Jacaré", "Caimán", "Big teeth, lives in rivers."),
  C("dinosaur", "🦕", "animals", "Dinosaur", "Dinossauro", "Dinosaurio", "It lived long, long ago."),
  C("rhea", "🐦", "animals", "Rhea", "Ema", "Ñandú", "A big bird that runs fast."),
  // food
  C("apple", "🍎", "food", "Apple", "Maçã", "Manzana", "A crunchy red fruit."),
  C("grapes", "🍇", "food", "Grapes", "Uva", "Uvas", "Small purple fruits."),
  C("egg", "🥚", "food", "Egg", "Ovo", "Huevo", "A hen lays it."),
  C("milk", "🥛", "food", "Milk", "Leite", "Leche", "A white drink."),
  C("bread", "🍞", "food", "Bread", "Pão", "Pan", "Great for sandwiches."),
  C("cheese", "🧀", "food", "Cheese", "Queijo", "Queso", "A food made from milk."),
  C("juice", "🧃", "food", "Juice", "Suco", "Jugo", "A fruity drink."),
  C("water", "💧", "food", "Water", "Água", "Agua", "We drink it every day."),
  C("pizza", "🍕", "food", "Pizza", "Pizza", "Pizza", "Round, cheesy and yummy."),
  C("banana", "🍌", "food", "Banana", "Banana", "Plátano", "A long, yellow fruit."),
  C("orange", "🍊", "food", "Orange", "Laranja", "Naranja", "A round, juicy fruit."),
  C("cookie", "🍪", "food", "Cookie", "Biscoito", "Galleta", "A sweet, crunchy treat."),
  C("sugar", "🍬", "food", "Sugar", "Açúcar", "Azúcar", "A sweet ingredient."),
  C("carrot", "🥕", "food", "Carrot", "Cenoura", "Zanahoria", "Rabbits love it."),
  C("tomato", "🍅", "food", "Tomato", "Tomate", "Tomate", "Red and juicy."),
  C("strawberry", "🍓", "food", "Strawberry", "Morango", "Fresa", "A small red berry."),
  C("watermelon", "🍉", "food", "Watermelon", "Melancia", "Sandía", "Green outside, red inside."),
  C("pineapple", "🍍", "food", "Pineapple", "Abacaxi", "Piña", "Spiky and sweet."),
  C("icecream", "🍦", "food", "Ice cream", "Sorvete", "Helado", "A cold, sweet treat."),
  C("chocolate", "🍫", "food", "Chocolate", "Chocolate", "Chocolate", "A sweet brown treat."),
  C("kiwi", "🥝", "food", "Kiwi", "Kiwi", "Kiwi", "Brown outside, green inside."),
  C("waffle", "🧇", "food", "Waffle", "Waffle", "Gofre", "A breakfast with little squares."),
  // colors
  C("red", "🔴", "colors", "Red", "Vermelho", "Rojo", "The color of strawberries."),
  C("blue", "🔵", "colors", "Blue", "Azul", "Azul", "The color of the sky."),
  C("green", "💚", "colors", "Green", "Verde", "Verde", "The color of grass."),
  C("yellow", "💛", "colors", "Yellow", "Amarelo", "Amarillo", "The color of the sun."),
  C("purple", "🟣", "colors", "Purple", "Roxo", "Morado", "A color made from red and blue."),
  // family
  C("mother", "👩", "family", "Mother", "Mãe", "Madre", "A child's female parent."),
  C("brother", "👦", "family", "Brother", "Irmão", "Hermano", "A boy in your family."),
  C("family", "👨‍👩‍👧", "family", "Family", "Família", "Familia", "The people who care for you."),
  C("queen", "👑", "family", "Queen", "Rainha", "Reina", "She wears a crown."),
  // school
  C("book", "📚", "school", "Book", "Livro", "Libro", "You read it."),
  C("pencil", "✏️", "school", "Pencil", "Lápis", "Lápiz", "You write with it."),
  C("school", "🏫", "school", "School", "Escola", "Escuela", "A place where children learn."),
  C("teacher", "👩‍🏫", "school", "Teacher", "Professora", "Maestra", "Someone who helps you learn."),
  C("notebook", "📓", "school", "Notebook", "Caderno", "Cuaderno", "You write notes in it."),
  C("backpack", "🎒", "school", "Backpack", "Mochila", "Mochila", "You carry books in it."),
  // nature
  C("sun", "☀️", "nature", "Sun", "Sol", "Sol", "It shines in the day."),
  C("moon", "🌙", "nature", "Moon", "Lua", "Luna", "It shines at night."),
  C("star", "⭐", "nature", "Star", "Estrela", "Estrella", "It twinkles in the sky."),
  C("sea", "🌊", "nature", "Sea", "Mar", "Mar", "Big, blue and salty."),
  C("tree", "🌳", "nature", "Tree", "Árvore", "Árbol", "It has leaves and branches."),
  C("flower", "🌸", "nature", "Flower", "Flor", "Flor", "Bees love it."),
  C("cloud", "☁️", "nature", "Cloud", "Nuvem", "Nube", "White and fluffy in the sky."),
  C("rainbow", "🌈", "nature", "Rainbow", "Arco-íris", "Arcoíris", "Colors after the rain."),
  C("island", "🏝️", "nature", "Island", "Ilha", "Isla", "Land with water all around."),
  C("nest", "🪺", "nature", "Nest", "Ninho", "Nido", "A bird's home."),
  // things
  C("house", "🏠", "things", "House", "Casa", "Casa", "Where you live."),
  C("ball", "⚽", "things", "Ball", "Bola", "Pelota", "You kick it."),
  C("hat", "🎩", "things", "Hat", "Chapéu", "Sombrero", "You wear it on your head."),
  C("cup", "☕", "things", "Cup", "Xícara", "Taza", "You drink from it."),
  C("dice", "🎲", "things", "Dice", "Dado", "Dado", "Roll it in games."),
  C("kite", "🪁", "things", "Kite", "Pipa", "Cometa", "It flies in the wind."),
  C("umbrella", "☂️", "things", "Umbrella", "Guarda-chuva", "Paraguas", "Keeps you dry in the rain."),
  C("violin", "🎻", "things", "Violin", "Violino", "Violín", "An instrument with strings."),
  C("guitar", "🎸", "things", "Guitar", "Violão", "Guitarra", "Strum it to play music."),
  C("xylophone", "🎶", "things", "Xylophone", "Xilofone", "Xilófono", "Hit the bars to make music."),
  C("yoyo", "🪀", "things", "Yo-yo", "Ioiô", "Yoyó", "It goes up and down."),
  C("yoga", "🧘", "things", "Yoga", "Yoga", "Yoga", "Stretch and breathe."),
  C("wifi", "📶", "things", "Wi-Fi", "Wi-Fi", "Wifi", "It connects to the internet."),
  C("heart", "❤️", "things", "Heart", "Coração", "Corazón", "It beats in your chest."),
  // transport
  C("car", "🚗", "transport", "Car", "Carro", "Coche", "It has four wheels."),
  C("bus", "🚌", "transport", "Bus", "Ônibus", "Autobús", "It carries many people."),
  C("ship", "🚢", "transport", "Ship", "Navio", "Barco", "It sails on the sea."),
  C("bicycle", "🚲", "transport", "Bicycle", "Bicicleta", "Bicicleta", "Two wheels and pedals."),
  C("airplane", "✈️", "transport", "Airplane", "Avião", "Avión", "It flies in the sky."),
  C("rocket", "🚀", "transport", "Rocket", "Foguete", "Cohete", "It goes to space."),
];

export const conceptById = (id: string): Concept => {
  const found = concepts.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown concept: ${id}`);
  return found;
};

export const categoryNames: Record<Category, Translated> = {
  characters: { en: "Characters", pt: "Personagens", es: "Personajes" },
  animals: { en: "Animals", pt: "Animais", es: "Animales" },
  food: { en: "Food", pt: "Comida", es: "Comida" },
  colors: { en: "Colors", pt: "Cores", es: "Colores" },
  family: { en: "Family", pt: "Família", es: "Familia" },
  school: { en: "School", pt: "Escola", es: "Escuela" },
  nature: { en: "Nature", pt: "Natureza", es: "Naturaleza" },
  things: { en: "Things", pt: "Coisas", es: "Cosas" },
  transport: { en: "Transport", pt: "Transporte", es: "Transporte" },
};

// ───────── Alphabets ─────────
// Each language has its own alphabet and its own example words
// (e.g. B is "Butterfly" in English but "Ballena" in Spanish).

export type AlphabetEntry = { letter: string; conceptId: string };

const pairs = (list: string): AlphabetEntry[] =>
  list.split(" ").map((pair) => {
    const [letter, conceptId] = pair.split(":");
    return { letter, conceptId };
  });

export const alphabets: Record<Language, AlphabetEntry[]> = {
  en: pairs(
    "A:apple B:butterfly C:cat D:dog E:elephant F:fish G:giraffe H:house I:icecream J:juice K:kite L:lion M:moon N:nest O:orange P:pizza Q:queen R:rainbow S:sun T:tiger U:umbrella V:violin W:whale X:xylophone Y:yoyo Z:zebra"
  ),
  pt: pairs(
    "A:bee B:butterfly C:house D:dice E:elephant F:seal G:cat H:hippo I:island J:alligator K:kiwi L:lion M:apple N:ship O:egg P:duck Q:cheese R:mouse S:sun T:turtle U:grapes V:cow W:waffle X:cup Y:yoga Z:zebra"
  ),
  es: pairs(
    "A:bee B:whale C:house D:dinosaur E:elephant F:strawberry G:cat H:icecream I:island J:giraffe K:koala L:lion M:butterfly N:cloud Ñ:rhea O:bear P:duck Q:cheese R:mouse S:sun T:turtle U:grapes V:cow W:wifi X:xylophone Y:yoyo Z:carrot"
  ),
};

/** Letters for the Hangman keyboard. Portuguese adds Ç, Spanish adds Ñ. */
export const keyboards: Record<Language, string[]> = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  es: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
  pt: "ABCÇDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};

// ───────── Helpers ─────────

/** Accent-insensitive for ordinary accents; Ñ and Ç stay their own letters. */
export function normalizeLetter(value: string): string {
  const upper = value.toLocaleUpperCase();
  if (upper === "Ñ" || upper === "Ç") return upper;
  return upper.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export const isSingleWord = (word: string) => /^[\p{L}]+$/u.test(word);

const LENGTHS: Record<AgeGroup, [number, number]> = { "5-6": [3, 4], "7-9": [5, 6], "10-12": [7, 20] };

/** Single words for spelling games, sized for the age group (falls back to nearby lengths). */
export function wordsForAge(language: Language, age: AgeGroup): Concept[] {
  const single = concepts.filter((c) => isSingleWord(c.word[language]));
  const [min, max] = LENGTHS[age];
  const exact = single.filter((c) => c.word[language].length >= min && c.word[language].length <= max);
  if (exact.length >= 6) return exact;
  return single.filter((c) => c.word[language].length >= min - 1 && c.word[language].length <= max + 1);
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Picks the next item that hasn't been used yet; starts a new cycle when all were used. */
export function pickFresh<T extends { id: string }>(pool: T[], used: string[]): T {
  const fresh = pool.filter((item) => !used.includes(item.id));
  const source = fresh.length ? fresh : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/** Gentle, believable misspellings for Sound & Spelling. */
export function misspellings(word: string, count: number, language: Language): string[] {
  const lower = word.toLocaleLowerCase();
  const vowels = "aeiou";
  const out = new Set<string>();
  const add = (candidate: string) => {
    if (candidate && candidate !== lower && candidate.length > 1) out.add(candidate);
  };
  const plain = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (let i = 0; i < lower.length - 1; i++) add(lower.slice(0, i) + lower[i + 1] + lower[i] + lower.slice(i + 2));
  for (let i = 1; i < lower.length; i++) add(lower.slice(0, i) + lower.slice(i + 1));
  for (let i = 0; i < lower.length; i++) {
    const v = vowels.indexOf(lower[i]);
    if (v !== -1) add(lower.slice(0, i) + vowels[(v + 1) % 5] + lower.slice(i + 1));
  }
  for (let i = 1; i < lower.length; i++) if ("bcdfglmnprst".includes(lower[i])) add(lower.slice(0, i) + lower[i] + lower.slice(i));
  if (language === "es" && /v|ll/.test(lower)) add(lower.replace(/v/g, "b").replace(/ll/g, "y"));
  out.delete(plain);
  // Forgetting the accent is the most common real mistake (maçã → maca), so it always comes first.
  const list = [...(plain !== lower ? [plain] : []), ...shuffle([...out])];
  return list.slice(0, count).map((w) => (word[0] === word[0].toLocaleUpperCase() ? w.charAt(0).toLocaleUpperCase() + w.slice(1) : w));
}
