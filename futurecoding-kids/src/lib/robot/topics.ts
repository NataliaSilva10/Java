// Everyday conversation topics. Each language is written the way kids actually talk,
// not translated word-for-word.

import type { Translated } from "../storyEngine";
import type { ConversationTopic } from "./types";

const P = (en: string, pt: string, es: string): Translated => ({ en, pt, es });

export const topics: ConversationTopic[] = [
  {
    id: "intro",
    emoji: "👋",
    name: P("introducing yourself", "apresentação pessoal", "presentarse"),
    steps: [
      {
        expects: "name",
        ask: P("Hello! I'm Timmy, your robot friend. What is your name?", "Olá! Eu sou o Timmy, seu amigo robô. Qual é o seu nome?", "¡Hola! Soy Timmy, tu amigo robot. ¿Cómo te llamas?"),
        example: P("My name is Alex.", "Meu nome é Alex.", "Me llamo Alex."),
      },
      {
        expects: "feeling",
        ask: P("How are you today?", "Como você está hoje?", "¿Cómo estás hoy?"),
        example: P("I am happy.", "Eu estou feliz.", "Estoy feliz."),
        choices: [P("I am tired.", "Eu estou com sono.", "Tengo sueño."), P("I am sad.", "Eu estou triste.", "Estoy triste.")],
      },
      {
        ask: P("Can you tell me why?", "Você pode me contar por quê?", "¿Me cuentas por qué?"),
        example: P("Because I played with my friends.", "Porque eu brinquei com meus amigos.", "Porque jugué con mis amigos."),
      },
      {
        ask: P("What do you like to do?", "O que você gosta de fazer?", "¿Qué te gusta hacer?"),
        example: P("I like to draw.", "Eu gosto de desenhar.", "Me gusta dibujar."),
        choices: [P("I like to dance.", "Eu gosto de dançar.", "Me gusta bailar.")],
      },
    ],
  },
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    name: P("family and friends", "família e amigos", "familia y amigos"),
    steps: [
      {
        ask: P("Who is in your family?", "Quem faz parte da sua família?", "¿Quién está en tu familia?"),
        example: P("I have a mom, a dad and a brother.", "Eu tenho mãe, pai e um irmão.", "Tengo mamá, papá y un hermano."),
      },
      {
        ask: P("What do you like to play with your friends?", "Do que você gosta de brincar com seus amigos?", "¿A qué te gusta jugar con tus amigos?"),
        example: P("I like to play ball.", "Eu gosto de jogar bola.", "Me gusta jugar a la pelota."),
      },
      {
        ask: P("What do you do with your family on the weekend?", "O que você faz com a sua família no fim de semana?", "¿Qué haces con tu familia el fin de semana?"),
        example: P("We go to the park.", "A gente vai ao parque.", "Vamos al parque."),
      },
    ],
  },
  {
    id: "food",
    emoji: "🍕",
    name: P("food and drinks", "comidas e bebidas", "comida y bebidas"),
    steps: [
      {
        ask: P("What is your favorite food?", "Qual é a sua comida favorita?", "¿Cuál es tu comida favorita?"),
        example: P("My favorite food is pizza.", "Minha comida favorita é pizza.", "Mi comida favorita es la pizza."),
      },
      {
        ask: P("What do you like to drink?", "O que você gosta de beber?", "¿Qué te gusta beber?"),
        example: P("I like to drink water.", "Eu gosto de beber água.", "Me gusta beber agua."),
        choices: [P("I like to drink juice.", "Eu gosto de beber suco.", "Me gusta beber jugo.")],
      },
      {
        ask: P("Do you like fruit?", "Você gosta de frutas?", "¿Te gustan las frutas?"),
        example: P("Yes, I like strawberries.", "Sim, eu gosto de morango.", "Sí, me gustan las fresas."),
      },
    ],
  },
  {
    id: "animals",
    emoji: "🦁",
    name: P("animals", "animais", "animales"),
    steps: [
      {
        ask: P("What is your favorite animal?", "Qual é o seu animal favorito?", "¿Cuál es tu animal favorito?"),
        example: P("My favorite animal is the lion.", "Meu animal favorito é o leão.", "Mi animal favorito es el león."),
      },
      {
        ask: P("What sound does it make?", "Que barulho ele faz?", "¿Qué sonido hace?"),
        example: P("It roars: grrr!", "Ele ruge: grrr!", "Ruge: ¡grrr!"),
      },
      {
        ask: P("Where does it live?", "Onde ele vive?", "¿Dónde vive?"),
        example: P("It lives in the savanna.", "Ele vive na savana.", "Vive en la sabana."),
      },
    ],
  },
  {
    id: "school",
    emoji: "🏫",
    name: P("school", "escola", "la escuela"),
    steps: [
      {
        ask: P("What do you have in your backpack?", "O que tem na sua mochila?", "¿Qué tienes en tu mochila?"),
        example: P("I have a pencil and a book.", "Tem um lápis e um livro.", "Tengo un lápiz y un libro."),
      },
      {
        ask: P("What color is your backpack?", "De que cor é a sua mochila?", "¿De qué color es tu mochila?"),
        example: P("My backpack is blue.", "Minha mochila é azul.", "Mi mochila es azul."),
      },
      {
        ask: P("What do you like to do at school?", "O que você gosta de fazer na escola?", "¿Qué te gusta hacer en la escuela?"),
        example: P("I like to paint.", "Eu gosto de pintar.", "Me gusta pintar."),
      },
    ],
  },
  {
    id: "colors",
    emoji: "🌈",
    name: P("colors and numbers", "cores e números", "colores y números"),
    steps: [
      {
        ask: P("What is your favorite color?", "Qual é a sua cor favorita?", "¿Cuál es tu color favorito?"),
        example: P("My favorite color is green.", "Minha cor favorita é verde.", "Mi color favorito es el verde."),
      },
      {
        ask: P("Can you count to five?", "Você sabe contar até cinco?", "¿Puedes contar hasta cinco?"),
        example: P("One, two, three, four, five!", "Um, dois, três, quatro, cinco!", "¡Uno, dos, tres, cuatro, cinco!"),
      },
      {
        ask: P("How many fingers do you have?", "Quantos dedos você tem?", "¿Cuántos dedos tienes?"),
        example: P("I have ten fingers.", "Eu tenho dez dedos.", "Tengo diez dedos."),
      },
    ],
  },
  {
    id: "routine",
    emoji: "⏰",
    name: P("daily routines", "rotina diária", "rutinas diarias"),
    steps: [
      {
        ask: P("What do you do in the morning?", "O que você faz de manhã?", "¿Qué haces por la mañana?"),
        example: P("I brush my teeth and eat breakfast.", "Eu escovo os dentes e tomo café da manhã.", "Me lavo los dientes y desayuno."),
      },
      {
        ask: P("What do you do after school?", "O que você faz depois da escola?", "¿Qué haces después de la escuela?"),
        example: P("I play and do my homework.", "Eu brinco e faço a lição de casa.", "Juego y hago la tarea."),
      },
      {
        ask: P("When do you go to sleep?", "Que horas você vai dormir?", "¿A qué hora te vas a dormir?"),
        example: P("I go to sleep at eight o'clock.", "Eu vou dormir às oito horas.", "Me voy a dormir a las ocho."),
      },
    ],
  },
];

// Role-play scenarios: everyday situations kids can practise.
topics.push(
  {
    id: "cafe",
    emoji: "🧁",
    name: P("at the café", "na lanchonete", "en la cafetería"),
    steps: [
      {
        ask: P("Welcome to the café! What would you like to eat?", "Bem-vindo à lanchonete! O que você quer comer?", "¡Bienvenido a la cafetería! ¿Qué quieres comer?"),
        example: P("I would like a sandwich, please.", "Eu quero um sanduíche, por favor.", "Quiero un sándwich, por favor."),
        choices: [P("I would like a cookie, please.", "Eu quero um biscoito, por favor.", "Quiero una galleta, por favor.")],
      },
      {
        ask: P("And what would you like to drink?", "E o que você quer beber?", "¿Y qué quieres beber?"),
        example: P("Orange juice, please.", "Suco de laranja, por favor.", "Jugo de naranja, por favor."),
      },
      {
        ask: P("Here you are! That's three dollars. Anything else?", "Aqui está! São três reais. Mais alguma coisa?", "¡Aquí tienes! Son tres euros. ¿Algo más?"),
        example: P("No, thank you!", "Não, obrigado!", "¡No, gracias!"),
      },
    ],
  },
  {
    id: "shop",
    emoji: "🛍️",
    name: P("at the toy shop", "na loja de brinquedos", "en la juguetería"),
    steps: [
      {
        ask: P("Hello! Can I help you? What are you looking for?", "Olá! Posso ajudar? O que você está procurando?", "¡Hola! ¿Te ayudo? ¿Qué estás buscando?"),
        example: P("I'm looking for a ball.", "Estou procurando uma bola.", "Estoy buscando una pelota."),
      },
      {
        ask: P("What color do you want?", "De que cor você quer?", "¿De qué color la quieres?"),
        example: P("I want a red one, please.", "Eu quero uma vermelha, por favor.", "Quiero una roja, por favor."),
      },
      {
        ask: P("Great choice! Is it a present for someone?", "Ótima escolha! É um presente para alguém?", "¡Buena elección! ¿Es un regalo para alguien?"),
        example: P("Yes, it's for my friend.", "Sim, é para o meu amigo.", "Sí, es para mi amigo."),
      },
    ],
  },
  {
    id: "directions",
    emoji: "🗺️",
    name: P("finding your way", "pedindo informações", "pedir direcciones"),
    steps: [
      {
        ask: P("You're lost in a new town! What can you ask me?", "Você está perdido numa cidade nova! O que você pode me perguntar?", "¡Estás perdido en una ciudad nueva! ¿Qué me puedes preguntar?"),
        example: P("Excuse me, where is the park?", "Com licença, onde fica o parque?", "Perdón, ¿dónde está el parque?"),
      },
      {
        ask: P("Go straight and turn left. Can you repeat that?", "Siga em frente e vire à esquerda. Você pode repetir?", "Sigue recto y gira a la izquierda. ¿Puedes repetirlo?"),
        example: P("Go straight and turn left.", "Siga em frente e vire à esquerda.", "Sigue recto y gira a la izquierda."),
      },
      {
        ask: P("Perfect! What do you say to say thank you?", "Perfeito! Como você agradece?", "¡Perfecto! ¿Cómo das las gracias?"),
        example: P("Thank you very much!", "Muito obrigado!", "¡Muchas gracias!"),
      },
    ],
  }
);

export const topicById = (id: string | null) => topics.find((topic) => topic.id === id) ?? null;
