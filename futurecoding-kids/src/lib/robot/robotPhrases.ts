// Timmy's personality: friendly, curious, patient, playful, encouraging.
// Each phrase is written naturally in each language (not word-for-word).
// Several variants per key so Timmy doesn't sound repetitive.

import type { Language, Translated } from "../storyEngine";

const P = (en: string, pt: string, es: string): Translated => ({ en, pt, es });

export const phrases = {
  praise: [
    P("Fantastic! You did it! ⭐ Let's try another one.", "Fantástico! Você conseguiu! ⭐ Vamos tentar outra.", "¡Fantástico! ¡Lo lograste! ⭐ Probemos otra."),
    P("Woohoo! Perfect sentence! ⭐", "Uhuu! Frase perfeita! ⭐", "¡Yupi! ¡Frase perfecta! ⭐"),
    P("You're a super storyteller! ⭐", "Você é um super contador de histórias! ⭐", "¡Eres un súper cuentacuentos! ⭐"),
  ],
  praiseName: [
    P("Fantastic, {name}! You did it! ⭐", "Fantástico, {name}! Você conseguiu! ⭐", "¡Fantástico, {name}! ¡Lo lograste! ⭐"),
    P("Amazing work, {name}! ⭐", "Muito bem, {name}! ⭐", "¡Qué buen trabajo, {name}! ⭐"),
  ],
  tryAgain: [
    P("Great try! Let's look at the sentence together.", "Boa tentativa! Vamos olhar a frase juntos.", "¡Buen intento! Miremos la frase juntos."),
    P("Almost there! The green words are already right.", "Quase lá! As palavras verdes já estão certas.", "¡Casi! Las palabras verdes ya están bien."),
  ],
  explain: [P("Let's read it together: “{sentence}” {explain}", "Vamos ler juntos: “{sentence}” {explain}", "Leamos juntos: “{sentence}” {explain}")],
  interest: [
    P("That's interesting! Tell me a little more.", "Que interessante! Me conta um pouco mais.", "¡Qué interesante! Cuéntame un poco más."),
    P("Cool! I love learning about you.", "Que legal! Adoro saber mais sobre você.", "¡Qué bien! Me encanta conocerte."),
    P("Wow, really? That's great!", "Nossa, é mesmo? Que demais!", "¡Guau! ¿De verdad? ¡Qué genial!"),
  ],
  niceToMeet: [P("Nice to meet you, {name}! 😊", "Prazer em te conhecer, {name}! 😊", "¡Mucho gusto, {name}! 😊")],
  askNameAgain: [
    P("Oops, I didn't catch your name. Can you say “My name is …”?", "Opa, não entendi seu nome. Você pode dizer “Meu nome é …”?", "Uy, no entendí tu nombre. ¿Puedes decir “Me llamo …”?"),
  ],
  greetTopicName: [P("Hi {name}! Let's talk about {topic}. {emoji}", "Oi, {name}! Vamos conversar sobre {topic}. {emoji}", "¡Hola, {name}! Hablemos de {topic}. {emoji}")],
  greetTopic: [P("Hi! Let's talk about {topic}. {emoji}", "Oi! Vamos conversar sobre {topic}. {emoji}", "¡Hola! Hablemos de {topic}. {emoji}")],
  hello: [
    P("Hello! I'm Timmy, your robot friend. What is your name?", "Olá! Eu sou o Timmy, seu amigo robô. Qual é o seu nome?", "¡Hola! Soy Timmy, tu amigo robot. ¿Cómo te llamas?"),
  ],
  helloName: [P("Hi again, {name}! 👋", "Oi de novo, {name}! 👋", "¡Hola otra vez, {name}! 👋")],
  fullSentence: [
    P("Good! Can you say it in a full sentence? Try: “{example}”", "Muito bem! Você consegue falar a frase inteira? Tente: “{example}”", "¡Muy bien! ¿Puedes decirlo en una frase completa? Prueba: “{example}”"),
  ],
  recast: [
    P("Great try! We say: “{fixed}”", "Boa! A gente fala assim: “{fixed}”", "¡Muy bien! Se dice así: “{fixed}”"),
    P("Nice! A little tip: “{fixed}”", "Legal! Uma dica: “{fixed}”", "¡Bien! Un consejito: “{fixed}”"),
  ],
  feelingHappy: [P("Wonderful! 😊", "Que maravilha! 😊", "¡Qué bien! 😊")],
  feelingSad: [P("Oh no. Timmy sends you a big hug! 🤗", "Ah, não. O Timmy te manda um abraço bem grande! 🤗", "Oh, no. ¡Timmy te manda un abrazo muy grande! 🤗")],
  feelingTired: [P("Feeling sleepy? Let's take it easy. 😴", "Está com sono? Vamos com calma. 😴", "¿Tienes sueño? Vamos con calma. 😴")],
  topicDone: [
    P("You did great! Pick another topic, or let's build a sentence! 🎉", "Você foi demais! Escolha outro assunto ou vamos montar uma frase! 🎉", "¡Lo hiciste genial! Elige otro tema o armemos una frase. 🎉"),
  ],
  topicDoneName: [
    P("You did great, {name}! Pick another topic, or let's build a sentence! 🎉", "Você foi demais, {name}! Escolha outro assunto ou vamos montar uma frase! 🎉", "¡Lo hiciste genial, {name}! Elige otro tema o armemos una frase. 🎉"),
  ],
  freeChat: [
    P("I like talking with you! Pick a topic and press “Start Conversation” so we can chat more.", "Adoro conversar com você! Escolha um assunto e aperte “Começar conversa” para a gente conversar mais.", "¡Me encanta hablar contigo! Elige un tema y pulsa “Empezar conversación” para charlar más."),
  ],
  followUpThanks: [
    P("Thanks for telling me! Now, let's build the next sentence. ✏️", "Obrigado por me contar! Agora vamos montar a próxima frase. ✏️", "¡Gracias por contarme! Ahora armemos la siguiente frase. ✏️"),
  ],
  teachWord: [
    P("Today's word is “{word}”. {emoji} Can you say “{word}”?", "A palavra de hoje é “{word}”. {emoji} Você consegue dizer “{word}”?", "La palabra de hoy es “{word}”. {emoji} ¿Puedes decir “{word}”?"),
  ],
  wordGood: [P("Yes! You said “{word}” perfectly! 🎉", "Isso! Você disse “{word}” direitinho! 🎉", "¡Sí! ¡Dijiste “{word}” muy bien! 🎉")],
  wordAlmost: [
    P("I heard “{heard}”. Listen and try again: “{word}”.", "Eu ouvi “{heard}”. Escute e tente de novo: “{word}”.", "Escuché “{heard}”. Escucha e inténtalo otra vez: “{word}”."),
  ],
  talkPrompt: [
    P("I'm all ears! Type or tap the microphone to talk to me. 🎤", "Sou todo ouvidos! Escreva ou toque no microfone para falar comigo. 🎤", "¡Soy todo oídos! Escribe o toca el micrófono para hablar conmigo. 🎤"),
  ],
  noMic: [
    P("I can't use the microphone on this device, but you can type to me! ⌨️", "Não consigo usar o microfone neste aparelho, mas você pode escrever para mim! ⌨️", "No puedo usar el micrófono en este dispositivo, ¡pero puedes escribirme! ⌨️"),
  ],
  micDenied: [
    P("I need permission to use the microphone. A grown-up can allow it in the browser — or you can type!", "Preciso de permissão para usar o microfone. Um adulto pode liberar no navegador — ou você pode escrever!", "Necesito permiso para usar el micrófono. Un adulto puede permitirlo en el navegador, ¡o puedes escribir!"),
  ],
  notHeard: [
    P("Hmm, I didn't hear anything. Tap the microphone and try again!", "Hmm, não ouvi nada. Toque no microfone e tente de novo!", "Mmm, no escuché nada. ¡Toca el micrófono e inténtalo otra vez!"),
  ],
  noMicFound: [
    P("I can't find a microphone. A grown-up can plug one in — or you can type to me! ⌨️", "Não encontrei um microfone. Um adulto pode conectar um — ou você pode escrever para mim! ⌨️", "No encuentro un micrófono. Un adulto puede conectar uno, ¡o puedes escribirme! ⌨️"),
  ],
  micOffline: [
    P("My ears need the internet to understand you. Check the connection — or type to me!", "Meus ouvidos precisam de internet para entender você. Confira a conexão — ou escreva para mim!", "Mis oídos necesitan internet para entenderte. Revisa la conexión, ¡o escríbeme!"),
  ],
  micInsecure: [
    P("I can only listen when the app is opened on localhost or https. A grown-up can fix this — or you can type!", "Só consigo ouvir quando o app está aberto em localhost ou https. Um adulto pode resolver — ou você pode escrever!", "Solo puedo escuchar si la app está abierta en localhost o https. Un adulto puede arreglarlo, ¡o puedes escribir!"),
  ],
  micError: [
    P("My ears had a little problem. Let's try again, or you can type!", "Meus ouvidos tiveram um probleminha. Vamos tentar de novo, ou você pode escrever!", "Mis oídos tuvieron un problemita. Intentémoslo otra vez, ¡o puedes escribir!"),
  ],
  helpNextWord: [
    P("Here's a clue: the next word is “{word}”.", "Uma dica: a próxima palavra é “{word}”.", "Una pista: la siguiente palabra es “{word}”."),
  ],
  helpAnswer: [P("You can answer like this: “{example}”", "Você pode responder assim: “{example}”", "Puedes responder así: “{example}”")],
  helpGeneral: [
    P("Let's play! Build the sentence below, or pick a topic and press “Start Conversation”.", "Vamos brincar! Monte a frase aqui embaixo ou escolha um assunto e aperte “Começar conversa”.", "¡A jugar! Arma la frase de abajo o elige un tema y pulsa “Empezar conversación”."),
  ],
  helpWord: [P("Listen slowly: “{word}”. You can do it!", "Escute devagar: “{word}”. Você consegue!", "Escucha despacio: “{word}”. ¡Tú puedes!")],
  switchLanguage: [P("Now let's speak English! 🇺🇸", "Agora vamos falar português! 🇧🇷", "¡Ahora hablemos español! 🇪🇸")],
  nothingToRepeat: [P("I haven't said anything yet! Tap “Start Conversation”.", "Ainda não falei nada! Toque em “Começar conversa”.", "¡Todavía no he dicho nada! Toca “Empezar conversación”.")],
} satisfies Record<string, Translated[]>;

export type PhraseKey = keyof typeof phrases;

/** A placeholder value: plain text, or a Translated record to use each language's own word. */
export type PhraseVar = string | number | Translated;
export type PhraseVars = Record<string, PhraseVar>;

const isTranslated = (value: PhraseVar): value is Translated => typeof value === "object";

export function fill(template: string, vars: PhraseVars = {}, language: Language = "en"): string {
  return template
    .replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = vars[key];
      if (value === undefined) return "";
      return isTranslated(value) ? value[language] : String(value);
    })
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Fills placeholders in a translated line, language by language. */
export function fillTranslated(line: Translated, vars: PhraseVars = {}): Translated {
  return { en: fill(line.en, vars, "en"), pt: fill(line.pt, vars, "pt"), es: fill(line.es, vars, "es") };
}

/** Picks one variant (same variant for every language, so subtitles match) and fills placeholders. */
export function phrase(key: PhraseKey, vars: PhraseVars = {}, random: () => number = Math.random): Translated {
  const variants: Translated[] = phrases[key];
  const chosen = variants[Math.floor(random() * variants.length)] ?? variants[0];
  return fillTranslated(chosen, vars);
}
