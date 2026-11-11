// All activity content and interface text lives here, separate from the code.
// To add an activity: copy one block below, change the id, pick a level and fill in all three languages.
// Write each language naturally — don't translate word-for-word.
// In dev mode, missing translations are reported in the browser console.

import type { Activity, Language, Level, Translated } from "./storyEngine";

export const activities: Activity[] = [
  // ───────────── BEGINNER: words and short phrases ─────────────
  {
    id: "cat",
    level: "beginner",
    image: "/images/cat-sleeping.png",
    emoji: "😴",
    title: { en: "The sleepy cat", pt: "O gato dorminhoco", es: "El gato dormilón" },
    prompt: { en: "What is the cat doing?", pt: "O que o gato está fazendo?", es: "¿Qué está haciendo el gato?" },
    scene: { en: "A cat curled up and sleeping", pt: "Um gato enroladinho dormindo", es: "Un gato acurrucado durmiendo" },
    hint: {
      en: "This is a short one: who + is + what is it doing?",
      pt: "Esta é curtinha: quem + está + o que ele faz?",
      es: "Esta es cortita: quién + está + qué hace.",
    },
    targets: {
      en: { sentence: "The cat is sleeping.", distractors: ["eating"] },
      pt: { sentence: "O gato está dormindo.", distractors: ["comendo"] },
      es: { sentence: "El gato está durmiendo.", distractors: ["comiendo"] },
    },
    vocabulary: [
      { emoji: "🐱", en: "cat", pt: "gato", es: "gato" },
      { emoji: "😴", en: "sleeping", pt: "dormindo", es: "durmiendo" },
      { emoji: "🍽️", en: "eating", pt: "comendo", es: "comiendo" },
    ],
    followUp: { en: "Do you like cats?", pt: "Você gosta de gatos?", es: "¿Te gustan los gatos?" },
    explain: {
      en: "Who: 'The cat'. What it is doing: 'is sleeping'.",
      pt: "Quem: 'O gato'. O que ele está fazendo: 'está dormindo'.",
      es: "Quién: 'El gato'. Qué está haciendo: 'está durmiendo'.",
    },
  },
  {
    id: "apple",
    level: "beginner",
    emoji: "🍎",
    title: { en: "Yummy fruit", pt: "Fruta gostosa", es: "Una fruta rica" },
    prompt: { en: "What is it?", pt: "O que é isto?", es: "¿Qué es esto?" },
    scene: {
      en: "A shiny red apple on a table",
      pt: "Uma maçã vermelha e brilhante na mesa",
      es: "Una manzana roja y brillante en la mesa",
    },
    hint: {
      en: "Say what it is and its color.",
      pt: "Diga o que é e a cor.",
      es: "Di qué es y de qué color es.",
    },
    targets: {
      en: { sentence: "A red apple.", distractors: ["green"] },
      pt: { sentence: "Uma maçã vermelha.", distractors: ["verde"] },
      es: { sentence: "Una manzana roja.", distractors: ["verde"] },
    },
    vocabulary: [
      { emoji: "🍎", en: "apple", pt: "maçã", es: "manzana" },
      { emoji: "🔴", en: "red", pt: "vermelho", es: "rojo" },
      { emoji: "🟢", en: "green", pt: "verde", es: "verde" },
    ],
    followUp: { en: "Do you like apples?", pt: "Você gosta de maçã?", es: "¿Te gustan las manzanas?" },
    explain: {
      en: "In English, the color comes BEFORE the thing: a red apple.",
      pt: "Em português, a cor vem DEPOIS da coisa: uma maçã vermelha.",
      es: "En español, el color va DESPUÉS de la cosa: una manzana roja.",
    },
  },
  {
    id: "dog",
    level: "beginner",
    emoji: "🐶",
    title: { en: "My pet", pt: "Meu bichinho", es: "Mi mascota" },
    prompt: { en: "Who is this?", pt: "Quem é este?", es: "¿Quién es?" },
    scene: {
      en: "A happy puppy wagging its tail",
      pt: "Um cachorrinho feliz abanando o rabo",
      es: "Un perrito feliz moviendo la cola",
    },
    hint: { en: "Is the dog happy or sad?", pt: "O cachorro está feliz ou triste?", es: "¿El perro está feliz o triste?" },
    targets: {
      en: { sentence: "A happy dog.", distractors: ["cat"] },
      pt: { sentence: "Um cachorro feliz.", distractors: ["gato"] },
      es: { sentence: "Un perro feliz.", distractors: ["gato"] },
    },
    vocabulary: [
      { emoji: "🐶", en: "dog", pt: "cachorro", es: "perro" },
      { emoji: "🐱", en: "cat", pt: "gato", es: "gato" },
      { emoji: "😊", en: "happy", pt: "feliz", es: "feliz" },
    ],
    followUp: { en: "Do you have a pet?", pt: "Você tem um bichinho de estimação?", es: "¿Tienes una mascota?" },
    explain: {
      en: "First 'a', then how it feels, then the animal: a happy dog.",
      pt: "Primeiro 'um', depois o animal, depois como ele está: um cachorro feliz.",
      es: "Primero 'un', luego el animal y después cómo está: un perro feliz.",
    },
  },
  {
    id: "balloons",
    level: "beginner",
    emoji: "🎈",
    title: { en: "Party balloons", pt: "Balões da festa", es: "Globos de fiesta" },
    prompt: { en: "How many balloons?", pt: "Quantos balões?", es: "¿Cuántos globos?" },
    scene: {
      en: "Three blue balloons floating at a party",
      pt: "Três balões azuis flutuando numa festa",
      es: "Tres globos azules flotando en una fiesta",
    },
    hint: { en: "Count them! Then say the color.", pt: "Conte! Depois diga a cor.", es: "¡Cuéntalos! Luego di el color." },
    targets: {
      en: { sentence: "Three blue balloons.", distractors: ["two"] },
      pt: { sentence: "Três balões azuis.", distractors: ["dois"] },
      es: { sentence: "Tres globos azules.", distractors: ["dos"] },
    },
    vocabulary: [
      { emoji: "3️⃣", en: "three", pt: "três", es: "tres" },
      { emoji: "🔵", en: "blue", pt: "azul", es: "azul" },
      { emoji: "🎈", en: "balloon", pt: "balão", es: "globo" },
    ],
    followUp: { en: "What is your favorite color?", pt: "Qual é a sua cor favorita?", es: "¿Cuál es tu color favorito?" },
    explain: {
      en: "Number, then color, then the thing: three blue balloons.",
      pt: "Número, depois a coisa, depois a cor: três balões azuis.",
      es: "Número, luego la cosa y después el color: tres globos azules.",
    },
  },

  // ───────────── INTERMEDIATE: complete sentences ─────────────
  {
    id: "reading",
    level: "intermediate",
    image: "/images/girl-reading.png",
    emoji: "📖",
    title: { en: "The reading girl", pt: "A menina leitora", es: "La niña lectora" },
    prompt: { en: "What is the girl doing?", pt: "O que a menina está fazendo?", es: "¿Qué está haciendo la niña?" },
    scene: {
      en: "A girl sitting comfortably and reading a book",
      pt: "Uma menina sentada bem confortável lendo um livro",
      es: "Una niña sentada muy cómoda leyendo un libro",
    },
    hint: {
      en: "Start with who is in the picture. Then say what she is doing.",
      pt: "Comece com quem está na figura. Depois diga o que ela está fazendo.",
      es: "Empieza con quién está en el dibujo. Luego di qué está haciendo.",
    },
    targets: {
      en: { sentence: "The girl is reading a book.", distractors: ["running", "cat"] },
      pt: { sentence: "A menina está lendo um livro.", distractors: ["correndo", "gato"] },
      es: { sentence: "La niña está leyendo un libro.", distractors: ["corriendo", "gato"] },
    },
    vocabulary: [
      { emoji: "👧", en: "girl", pt: "menina", es: "niña" },
      { emoji: "📖", en: "book", pt: "livro", es: "libro" },
      { emoji: "👀", en: "reading", pt: "lendo", es: "leyendo" },
    ],
    followUp: { en: "What is your favorite book?", pt: "Qual é o seu livro favorito?", es: "¿Cuál es tu libro favorito?" },
    explain: {
      en: "Who: 'The girl'. What she is doing: 'is reading'. What: 'a book'.",
      pt: "Quem: 'A menina'. O que ela está fazendo: 'está lendo'. O quê: 'um livro'.",
      es: "Quién: 'La niña'. Qué está haciendo: 'está leyendo'. Qué: 'un libro'.",
    },
  },
  {
    id: "bicycle",
    level: "intermediate",
    image: "/images/boy-bicycle.png",
    emoji: "🚲",
    title: { en: "The bicycle ride", pt: "O passeio de bicicleta", es: "El paseo en bicicleta" },
    prompt: { en: "What is the boy doing?", pt: "O que o menino está fazendo?", es: "¿Qué está haciendo el niño?" },
    scene: {
      en: "A boy riding a bicycle on a sunny day",
      pt: "Um menino andando de bicicleta num dia de sol",
      es: "Un niño montando en bicicleta en un día soleado",
    },
    hint: {
      en: "Who is in the picture? What is he using to move?",
      pt: "Quem está na figura? O que ele usa para se mover?",
      es: "¿Quién está en el dibujo? ¿Qué usa para moverse?",
    },
    targets: {
      en: { sentence: "The boy is riding a bicycle.", distractors: ["sleeping"] },
      // Portuguese says "andar DE bicicleta", Spanish "montar EN bicicleta" – no word-for-word mapping.
      pt: { sentence: "O menino está andando de bicicleta.", distractors: ["dormindo"] },
      es: { sentence: "El niño está montando en bicicleta.", distractors: ["durmiendo"] },
    },
    vocabulary: [
      { emoji: "👦", en: "boy", pt: "menino", es: "niño" },
      { emoji: "🚲", en: "bicycle", pt: "bicicleta", es: "bicicleta" },
      { emoji: "☀️", en: "sunny", pt: "ensolarado", es: "soleado" },
    ],
    followUp: { en: "Can you ride a bike?", pt: "Você sabe andar de bicicleta?", es: "¿Sabes montar en bicicleta?" },
    explain: {
      en: "Who: 'The boy'. What he is doing: 'is riding'. On what: 'a bicycle'.",
      pt: "Quem: 'O menino'. O que ele está fazendo: 'está andando'. Como: 'de bicicleta'.",
      es: "Quién: 'El niño'. Qué está haciendo: 'está montando'. En qué: 'en bicicleta'.",
    },
  },
  {
    id: "garden",
    level: "intermediate",
    emoji: "🌷",
    title: { en: "A day in the garden", pt: "Um dia no jardim", es: "Un día en el jardín" },
    prompt: {
      en: "What is the girl doing?",
      pt: "O que a menina está fazendo?",
      es: "¿Qué está haciendo la niña?",
    },
    scene: {
      en: "A sunny garden with flowers and a little gardener",
      pt: "Um jardim ensolarado com flores e uma pequena jardineira",
      es: "Un jardín soleado con flores y una pequeña jardinera",
    },
    hint: {
      en: "Start with who is in the picture.",
      pt: "Comece com quem está na figura.",
      es: "Empieza con quién está en el dibujo.",
    },
    targets: {
      en: { sentence: "The girl is watering the flowers.", distractors: ["happy"] },
      pt: { sentence: "A menina está regando as flores.", distractors: ["felizes"] },
      es: { sentence: "La niña está regando las flores.", distractors: ["felices"] },
    },
    vocabulary: [
      { emoji: "👧", en: "girl", pt: "menina", es: "niña" },
      { emoji: "🌸", en: "flowers", pt: "flores", es: "flores" },
      { emoji: "💧", en: "watering", pt: "regando", es: "regando" },
    ],
    followUp: { en: "Do you like flowers?", pt: "Você gosta de flores?", es: "¿Te gustan las flores?" },
    explain: {
      en: "First say who: 'The girl'. Then what she is doing: 'is watering the flowers'.",
      pt: "Primeiro diga quem: 'A menina'. Depois o que ela está fazendo: 'está regando as flores'.",
      es: "Primero di quién: 'La niña'. Luego qué está haciendo: 'está regando las flores'.",
    },
  },
  {
    id: "explorer",
    level: "intermediate",
    emoji: "🦋",
    title: { en: "The little explorer", pt: "O pequeno explorador", es: "El pequeño explorador" },
    prompt: { en: "What does the boy see?", pt: "O que o menino vê?", es: "¿Qué ve el niño?" },
    scene: {
      en: "A curious boy discovering a colorful butterfly",
      pt: "Um menino curioso descobrindo uma borboleta colorida",
      es: "Un niño curioso descubriendo una mariposa de colores",
    },
    hint: {
      en: "Who is looking? What can he see?",
      pt: "Quem está olhando? O que ele vê?",
      es: "¿Quién está mirando? ¿Qué ve?",
    },
    targets: {
      en: { sentence: "The boy sees a beautiful butterfly.", distractors: ["flower"] },
      // Both adjective positions are natural in Portuguese and Spanish.
      pt: {
        sentence: "O menino vê uma borboleta linda.",
        alternatives: ["O menino vê uma linda borboleta."],
        distractors: ["flor"],
      },
      es: {
        sentence: "El niño ve una mariposa hermosa.",
        alternatives: ["El niño ve una hermosa mariposa."],
        distractors: ["flor"],
      },
    },
    vocabulary: [
      { emoji: "👦", en: "boy", pt: "menino", es: "niño" },
      { emoji: "🦋", en: "butterfly", pt: "borboleta", es: "mariposa" },
      { emoji: "👀", en: "sees", pt: "vê", es: "ve" },
    ],
    followUp: {
      en: "What is your favorite animal?",
      pt: "Qual é o seu animal favorito?",
      es: "¿Cuál es tu animal favorito?",
    },
    explain: {
      en: "Who: 'The boy'. What he does: 'sees'. What he sees: 'a beautiful butterfly'.",
      pt: "Quem: 'O menino'. O que ele faz: 'vê'. O que ele vê: 'uma borboleta linda'.",
      es: "Quién: 'El niño'. Qué hace: 've'. Qué ve: 'una mariposa hermosa'.",
    },
  },
  {
    id: "stars",
    level: "intermediate",
    emoji: "🌙",
    title: { en: "Under the stars", pt: "Sob as estrelas", es: "Bajo las estrellas" },
    prompt: { en: "Where is the star?", pt: "Onde está a estrela?", es: "¿Dónde está la estrella?" },
    scene: {
      en: "A bright star shining in a deep blue night sky",
      pt: "Uma estrela brilhante no céu azul da noite",
      es: "Una estrella brillante en el cielo azul de la noche",
    },
    hint: {
      en: "Build a sentence about the star and the sky.",
      pt: "Monte uma frase sobre a estrela e o céu.",
      es: "Arma una frase sobre la estrella y el cielo.",
    },
    targets: {
      en: { sentence: "A star shines in the sky.", distractors: ["moon"] },
      // "no" = "em" + "o" (in + the). Built as one word, which is how Portuguese writes it.
      pt: { sentence: "Uma estrela brilha no céu.", distractors: ["lua"] },
      es: { sentence: "Una estrella brilla en el cielo.", distractors: ["luna"] },
    },
    vocabulary: [
      { emoji: "⭐", en: "star", pt: "estrela", es: "estrella" },
      { emoji: "🌌", en: "sky", pt: "céu", es: "cielo" },
      { emoji: "🌙", en: "moon", pt: "lua", es: "luna" },
    ],
    followUp: { en: "What do you see in the sky at night?", pt: "O que você vê no céu à noite?", es: "¿Qué ves en el cielo por la noche?" },
    explain: {
      en: "Who: 'A star'. What it does: 'shines'. Where: 'in the sky'.",
      pt: "Quem: 'Uma estrela'. O que ela faz: 'brilha'. Onde: 'no céu'. ('no' é 'em' + 'o'.)",
      es: "Quién: 'Una estrella'. Qué hace: 'brilla'. Dónde: 'en el cielo'.",
    },
  },

  // ───────────── ADVANCED: longer sentences ─────────────
  {
    id: "school",
    level: "advanced",
    emoji: "🎒",
    title: { en: "Off to school", pt: "Indo para a escola", es: "Rumbo a la escuela" },
    prompt: {
      en: "What does Leo do every morning?",
      pt: "O que o Leo faz toda manhã?",
      es: "¿Qué hace Leo cada mañana?",
    },
    scene: {
      en: "Leo and his big sister walking to school with backpacks",
      pt: "O Leo e a irmã mais velha caminhando para a escola de mochila",
      es: "Leo y su hermana mayor caminando a la escuela con mochilas",
    },
    hint: {
      en: "Start with WHEN it happens.",
      pt: "Comece dizendo QUANDO acontece.",
      es: "Empieza diciendo CUÁNDO pasa.",
    },
    targets: {
      en: {
        sentence: "Every morning Leo walks to school with his sister.",
        alternatives: ["Leo walks to school with his sister every morning."],
        distractors: ["bus"],
      },
      pt: {
        sentence: "Toda manhã o Leo caminha até a escola com a irmã.",
        alternatives: ["O Leo caminha até a escola com a irmã toda manhã."],
        distractors: ["ônibus"],
      },
      es: {
        sentence: "Cada mañana Leo camina a la escuela con su hermana.",
        alternatives: ["Leo camina a la escuela con su hermana cada mañana."],
        distractors: ["autobús"],
      },
    },
    vocabulary: [
      { emoji: "🌅", en: "morning", pt: "manhã", es: "mañana" },
      { emoji: "🏫", en: "school", pt: "escola", es: "escuela" },
      { emoji: "👧", en: "sister", pt: "irmã", es: "hermana" },
    ],
    followUp: { en: "How do you get to school?", pt: "Como você vai para a escola?", es: "¿Cómo vas a la escuela?" },
    explain: {
      en: "When: 'Every morning'. Who: 'Leo'. What: 'walks to school'. With whom: 'with his sister'.",
      pt: "Quando: 'Toda manhã'. Quem: 'o Leo'. O quê: 'caminha até a escola'. Com quem: 'com a irmã'.",
      es: "Cuándo: 'Cada mañana'. Quién: 'Leo'. Qué: 'camina a la escuela'. Con quién: 'con su hermana'.",
    },
  },
  {
    id: "breakfast",
    level: "advanced",
    emoji: "🥛",
    title: { en: "Breakfast time", pt: "Hora do café da manhã", es: "La hora del desayuno" },
    prompt: {
      en: "What does the family have for breakfast?",
      pt: "O que a família come no café da manhã?",
      es: "¿Qué desayuna la familia?",
    },
    scene: {
      en: "A family at the table with bread and glasses of milk",
      pt: "Uma família à mesa com pão e copos de leite",
      es: "Una familia en la mesa con pan y vasos de leche",
    },
    hint: {
      en: "Who eats? What do they eat and drink?",
      pt: "Quem come? O que eles comem e bebem?",
      es: "¿Quién come? ¿Qué comen y beben?",
    },
    targets: {
      en: { sentence: "My family eats bread and drinks milk in the morning.", distractors: ["water"] },
      pt: { sentence: "Minha família come pão e bebe leite de manhã.", distractors: ["água"] },
      es: { sentence: "Mi familia come pan y bebe leche por la mañana.", distractors: ["agua"] },
    },
    vocabulary: [
      { emoji: "🍞", en: "bread", pt: "pão", es: "pan" },
      { emoji: "🥛", en: "milk", pt: "leite", es: "leche" },
      { emoji: "👨‍👩‍👧", en: "family", pt: "família", es: "familia" },
    ],
    followUp: {
      en: "What do you eat for breakfast?",
      pt: "O que você come no café da manhã?",
      es: "¿Qué desayunas tú?",
    },
    explain: {
      en: "Who: 'My family'. Two actions joined with 'and': 'eats bread' and 'drinks milk'. When: 'in the morning'.",
      pt: "Quem: 'Minha família'. Duas ações com 'e': 'come pão' e 'bebe leite'. Quando: 'de manhã'.",
      es: "Quién: 'Mi familia'. Dos acciones con 'y': 'come pan' y 'bebe leche'. Cuándo: 'por la mañana'.",
    },
  },
  {
    id: "park",
    level: "advanced",
    emoji: "⚽",
    title: { en: "Fun at the park", pt: "Diversão no parque", es: "Diversión en el parque" },
    prompt: {
      en: "What do the friends do on Saturday?",
      pt: "O que os amigos fazem no sábado?",
      es: "¿Qué hacen los amigos el sábado?",
    },
    scene: {
      en: "Friends playing soccer on green grass at the park",
      pt: "Amigos jogando futebol na grama verde do parque",
      es: "Amigos jugando al fútbol en el césped del parque",
    },
    hint: {
      en: "Start with the day of the week.",
      pt: "Comece com o dia da semana.",
      es: "Empieza con el día de la semana.",
    },
    targets: {
      en: {
        sentence: "On Saturday my friends and I play soccer in the park.",
        alternatives: ["My friends and I play soccer in the park on Saturday."],
        distractors: ["ball"],
      },
      pt: {
        sentence: "No sábado eu e meus amigos jogamos futebol no parque.",
        alternatives: ["Eu e meus amigos jogamos futebol no parque no sábado."],
        distractors: ["bola"],
      },
      es: {
        sentence: "El sábado mis amigos y yo jugamos al fútbol en el parque.",
        alternatives: ["Mis amigos y yo jugamos al fútbol en el parque el sábado."],
        distractors: ["pelota"],
      },
    },
    vocabulary: [
      { emoji: "🧒", en: "friends", pt: "amigos", es: "amigos" },
      { emoji: "⚽", en: "soccer", pt: "futebol", es: "fútbol" },
      { emoji: "🌳", en: "park", pt: "parque", es: "parque" },
    ],
    followUp: { en: "What do you like to play?", pt: "Do que você gosta de brincar?", es: "¿A qué te gusta jugar?" },
    explain: {
      en: "When: 'On Saturday'. Who: 'my friends and I'. What: 'play soccer'. Where: 'in the park'.",
      pt: "Quando: 'No sábado'. Quem: 'eu e meus amigos'. O quê: 'jogamos futebol'. Onde: 'no parque'.",
      es: "Cuándo: 'El sábado'. Quién: 'mis amigos y yo'. Qué: 'jugamos al fútbol'. Dónde: 'en el parque'.",
    },
  },
];

export const languageNames: Record<Language, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

export const languageFlags: Record<Language, string> = { en: "🇺🇸", pt: "🇧🇷", es: "🇪🇸" };

export const levelNames: Record<Level, Translated> = {
  beginner: { en: "🌱 Beginner", pt: "🌱 Iniciante", es: "🌱 Principiante" },
  intermediate: { en: "🚀 Intermediate", pt: "🚀 Intermediário", es: "🚀 Intermedio" },
  advanced: { en: "🏆 Advanced", pt: "🏆 Avançado", es: "🏆 Avanzado" },
};

/** Interface text. Use {name} placeholders; fill them with `t()` in the components. */
export const ui = {
  eyebrow: { en: "FUTUREKIDS · PLAY & LEARN", pt: "FUTUREKIDS · BRINCAR E APRENDER", es: "FUTUREKIDS · JUGAR Y APRENDER" },
  heading: { en: "Create Stories", pt: "Criar Histórias", es: "Crear Historias" },
  tagline: {
    en: "Little words, big imagination. Let's build a story together!",
    pt: "Palavras pequenas, imaginação grande. Vamos criar uma história juntos!",
    es: "Palabras pequeñas, imaginación grande. ¡Vamos a crear una historia juntos!",
  },
  stars: { en: "stars", pt: "estrelas", es: "estrellas" },
  starsEarned: { en: "{n} stars earned", pt: "{n} estrelas ganhas", es: "{n} estrellas ganadas" },
  learnLabel: { en: "I'm learning", pt: "Estou aprendendo", es: "Estoy aprendiendo" },
  helpLabel: { en: "Instructions in", pt: "Instruções em", es: "Instrucciones en" },
  levelLabel: { en: "Level", pt: "Nível", es: "Nivel" },
  activityOf: { en: "ACTIVITY {n} OF {total}", pt: "ATIVIDADE {n} DE {total}", es: "ACTIVIDAD {n} DE {total}" },
  step1: { en: "STEP 1", pt: "PASSO 1", es: "PASO 1" },
  buildTitle: { en: "Build your sentence", pt: "Monte sua frase", es: "Arma tu frase" },
  buildHelp: {
    en: "Tap the word blocks to add them. You'll hear each word!",
    pt: "Toque nos blocos para adicionar as palavras. Você vai ouvir cada uma!",
    es: "Toca los bloques para añadir las palabras. ¡Escucharás cada una!",
  },
  wordBank: { en: "Word bank", pt: "Banco de palavras", es: "Banco de palabras" },
  mySentence: { en: "MY SENTENCE", pt: "MINHA FRASE", es: "MI FRASE" },
  wordsCount: { en: "{n} words", pt: "{n} palavras", es: "{n} palabras" },
  placeholder: {
    en: "Your sentence will appear here…",
    pt: "Sua frase vai aparecer aqui…",
    es: "Tu frase aparecerá aquí…",
  },
  removeWord: { en: "Tap to remove this word", pt: "Toque para tirar esta palavra", es: "Toca para quitar esta palabra" },
  undo: { en: "⌫ Undo", pt: "⌫ Desfazer", es: "⌫ Deshacer" },
  shuffle: { en: "🔀 Shuffle", pt: "🔀 Embaralhar", es: "🔀 Mezclar" },
  needHint: { en: "💡 Need a hint?", pt: "💡 Quer uma dica?", es: "💡 ¿Quieres una pista?" },
  hideHint: { en: "💡 Hide hint", pt: "💡 Esconder dica", es: "💡 Ocultar pista" },
  showAnswer: { en: "👀 Show me the answer", pt: "👀 Mostrar a resposta", es: "👀 Muéstrame la respuesta" },
  sayIn3: { en: "SAY IT IN 3 LANGUAGES", pt: "DIGA EM 3 LÍNGUAS", es: "DILO EN 3 IDIOMAS" },
  done: { en: "✅ DONE", pt: "✅ FEITO", es: "✅ HECHO" },
  chooseActivity: { en: "Choose activity", pt: "Escolher atividade", es: "Elegir actividad" },
  resetProgress: { en: "Reset my progress", pt: "Zerar meu progresso", es: "Reiniciar mi progreso" },
  back: { en: "← Back", pt: "← Voltar", es: "← Atrás" },
  allDone: {
    en: "🏆 You finished every adventure. Amazing!",
    pt: "🏆 Você terminou todas as aventuras. Incrível!",
    es: "🏆 Terminaste todas las aventuras. ¡Increíble!",
  },
  wordsOf: { en: "{n} / {total} words", pt: "{n} / {total} palavras", es: "{n} / {total} palabras" },
  startAgain: { en: "↺ Start again", pt: "↺ Recomeçar", es: "↺ Empezar de nuevo" },
  listen: { en: "🔊 Listen", pt: "🔊 Ouvir", es: "🔊 Escuchar" },
  listeningChallenge: { en: "🎧 Listening challenge", pt: "🎧 Desafio de escuta", es: "🎧 Reto de escucha" },
  check: { en: "Check my sentence ✨", pt: "Conferir minha frase ✨", es: "Revisar mi frase ✨" },
  successTitle: { en: "Wonderful work!", pt: "Muito bem!", es: "¡Excelente trabajo!" },
  successStar: {
    en: "You built the sentence correctly. You earned a star!",
    pt: "Você montou a frase certinho. Ganhou uma estrela!",
    es: "Armaste la frase correctamente. ¡Ganaste una estrella!",
  },
  successAgain: {
    en: "Correct again! You already have this star.",
    pt: "Certo de novo! Você já tem esta estrela.",
    es: "¡Correcto otra vez! Ya tienes esta estrella.",
  },
  sameInOther: {
    en: "The same sentence in other languages:",
    pt: "A mesma frase em outras línguas:",
    es: "La misma frase en otros idiomas:",
  },
  nextIn: { en: "Next picture in {n}…", pt: "Próxima figura em {n}…", es: "Siguiente dibujo en {n}…" },
  stayHere: { en: "Stay here", pt: "Ficar aqui", es: "Quedarme aquí" },
  nextPicture: { en: "Next picture →", pt: "Próxima figura →", es: "Siguiente dibujo →" },
  tryAgain: { en: "Great try! Let's look at it together.", pt: "Boa tentativa! Vamos ver juntos.", es: "¡Buen intento! Mirémoslo juntos." },
  legendRight: { en: "right place", pt: "lugar certo", es: "lugar correcto" },
  legendMisplaced: { en: "wrong place", pt: "lugar errado", es: "lugar equivocado" },
  legendExtra: { en: "not in this sentence", pt: "não é desta frase", es: "no es de esta frase" },
  missingWords: {
    en: "{n} word(s) still missing.",
    pt: "Ainda falta(m) {n} palavra(s).",
    es: "Todavía falta(n) {n} palabra(s).",
  },
  showMe: { en: "🤖 Explain the sentence", pt: "🤖 Explicar a frase", es: "🤖 Explicar la frase" },
  newWords: { en: "NEW WORDS", pt: "PALAVRAS NOVAS", es: "PALABRAS NUEVAS" },
  threeLanguages: { en: "In three languages", pt: "Em três línguas", es: "En tres idiomas" },
  journey: { en: "YOUR JOURNEY", pt: "SUA JORNADA", es: "TU VIAJE" },
  explorer: { en: "Story explorer", pt: "Explorador de histórias", es: "Explorador de historias" },
  progress: {
    en: "{n} of {total} sentences completed",
    pt: "{n} de {total} frases completas",
    es: "{n} de {total} frases completadas",
  },
  milestones: {
    en: "🌱 Beginner|🚀 Explorer|🏆 Storyteller",
    pt: "🌱 Iniciante|🚀 Explorador|🏆 Contador de histórias",
    es: "🌱 Principiante|🚀 Explorador|🏆 Cuentacuentos",
  },
  imagination: { en: "YOUR IMAGINATION", pt: "SUA IMAGINAÇÃO", es: "TU IMAGINACIÓN" },
  writeOwn: { en: "Write your own story", pt: "Escreva sua história", es: "Escribe tu historia" },
  onceUpon: { en: "Once upon a time…", pt: "Era uma vez…", es: "Había una vez…" },
  readStory: { en: "🔊 Read my story", pt: "🔊 Ler minha história", es: "🔊 Leer mi historia" },
  footer: {
    en: "🌈 Every word is an adventure!",
    pt: "🌈 Cada palavra é uma aventura!",
    es: "🌈 ¡Cada palabra es una aventura!",
  },
  next: { en: "Next adventure →", pt: "Próxima aventura →", es: "Siguiente aventura →" },
  noVoice: {
    en: "This device has no {lang} voice installed, so the sound may use a different accent.",
    pt: "Este aparelho não tem voz em {lang}, então o som pode ter outro sotaque.",
    es: "Este dispositivo no tiene voz en {lang}, así que el sonido puede tener otro acento.",
  },

  // ── Robot companion ──
  robotEyebrow: { en: "YOUR AI FRIEND", pt: "SEU AMIGO DE IA", es: "TU AMIGO DE IA" },
  robotTitle: { en: "Chat with Timmy", pt: "Converse com o Timmy", es: "Habla con Timmy" },
  talk: { en: "Talk to Robot", pt: "Falar com o robô", es: "Hablar con el robot" },
  listenToMe: { en: "Listen to Me", pt: "Me escute", es: "Escúchame" },
  repeat: { en: "Repeat", pt: "Repetir", es: "Repetir" },
  helpMe: { en: "Help Me", pt: "Me ajude", es: "Ayúdame" },
  teachWord: { en: "Teach Me a Word", pt: "Me ensine uma palavra", es: "Enséñame una palabra" },
  startConversation: { en: "Start Conversation", pt: "Começar conversa", es: "Empezar conversación" },
  topicLabel: { en: "Let's talk about", pt: "Vamos falar sobre", es: "Hablemos de" },
  typeHere: { en: "Type your answer…", pt: "Escreva sua resposta…", es: "Escribe tu respuesta…" },
  send: { en: "Send", pt: "Enviar", es: "Enviar" },
  mic: { en: "Microphone", pt: "Microfone", es: "Micrófono" },
  stopMic: { en: "Stop listening", pt: "Parar de ouvir", es: "Dejar de escuchar" },
  hearing: { en: "I hear:", pt: "Estou ouvindo:", es: "Escucho:" },
  youCanSay: { en: "You can say:", pt: "Você pode dizer:", es: "Puedes decir:" },
  voiceOn: { en: "🔊 Voice on", pt: "🔊 Voz ligada", es: "🔊 Voz activada" },
  voiceOff: { en: "🔇 Voice off", pt: "🔇 Voz desligada", es: "🔇 Voz apagada" },
  hearAgain: { en: "Hear again", pt: "Ouvir de novo", es: "Escuchar otra vez" },
  stateIdle: { en: "Ready to play", pt: "Pronto para brincar", es: "Listo para jugar" },
  stateSpeaking: { en: "Talking…", pt: "Falando…", es: "Hablando…" },
  stateListening: { en: "Listening…", pt: "Ouvindo…", es: "Escuchando…" },
  stateThinking: { en: "Thinking…", pt: "Pensando…", es: "Pensando…" },
  stateHappy: { en: "So happy!", pt: "Muito feliz!", es: "¡Muy feliz!" },
  stateEncouraging: { en: "You can do it!", pt: "Você consegue!", es: "¡Tú puedes!" },
  modeLive: { en: "Live AI", pt: "IA ao vivo", es: "IA en vivo" },
  modeLocal: { en: "Practice mode (offline robot)", pt: "Modo treino (robô offline)", es: "Modo práctica (robot sin conexión)" },
  modeChecking: { en: "Connecting to AI…", pt: "Conectando à IA…", es: "Conectando con la IA…" },
  modeUnavailable: {
    en: "AI not reachable · practice mode",
    pt: "IA indisponível · modo treino",
    es: "IA no disponible · modo práctica",
  },
  modeLocalInfo: {
    en: "Timmy uses ready-made answers here. A grown-up can connect live AI (see README).",
    pt: "Aqui o Timmy usa respostas prontas. Um adulto pode conectar a IA ao vivo (veja o README).",
    es: "Aquí Timmy usa respuestas preparadas. Un adulto puede conectar la IA en vivo (ver README).",
  },
  modeLiveInfo: {
    en: "Timmy's answers come from an AI service. Chats are not saved after you close this page.",
    pt: "As respostas do Timmy vêm de um serviço de IA. As conversas não são salvas depois que você fecha a página.",
    es: "Las respuestas de Timmy vienen de un servicio de IA. Las conversaciones no se guardan al cerrar la página.",
  },
  aiError: {
    en: "Timmy couldn't reach the AI.",
    pt: "O Timmy não conseguiu falar com a IA.",
    es: "Timmy no pudo conectarse con la IA.",
  },
  retry: { en: "Try again", pt: "Tentar de novo", es: "Intentar otra vez" },
  usePractice: { en: "Use practice mode", pt: "Usar modo treino", es: "Usar modo práctica" },
  tryLive: { en: "Try live AI", pt: "Tentar IA ao vivo", es: "Probar IA en vivo" },
  chatLog: { en: "Conversation with Timmy", pt: "Conversa com o Timmy", es: "Conversación con Timmy" },
  you: { en: "You", pt: "Você", es: "Tú" },
  noMicBrowser: {
    en: "This browser can't listen. Use Chrome or Edge to talk with your voice — typing works everywhere!",
    pt: "Este navegador não consegue ouvir. Use o Chrome ou o Edge para falar — escrever funciona sempre!",
    es: "Este navegador no puede escuchar. Usa Chrome o Edge para hablar con tu voz. ¡Escribir funciona siempre!",
  },
  emptyChat: {
    en: "👋 Pick a topic and tap “Start Conversation” – Timmy is ready to chat!",
    pt: "👋 Escolha um assunto e toque em “Começar conversa” – o Timmy está pronto para conversar!",
    es: "👋 Elige un tema y toca “Empezar conversación”. ¡Timmy está listo para charlar!",
  },
} satisfies Record<string, Translated>;

export type UiKey = keyof typeof ui;
