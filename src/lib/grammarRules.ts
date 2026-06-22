// Curated English grammar rules + tests. Static, bundled — no backend.
//
// Each rule carries example sentences and a quiz mixing two item types:
//   - "blank" : fill-the-gap multiple choice (prompt uses "___" for the gap)
//   - "judge" : decide whether a sentence is correct against the rule

export type BlankQuiz = { type: "blank"; prompt: string; options: string[]; answer: number; explain: string };
export type JudgeQuiz = { type: "judge"; sentence: string; correct: boolean; explain: string };
export type GrammarQuiz = BlankQuiz | JudgeQuiz;

export type GrammarRule = {
  id: string;
  title: string;
  pattern: string;
  summary: string;
  examples: string[];
  quiz: GrammarQuiz[];
};

export const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "a-an",
    title: "A / An",
    pattern: "a / an + noun",
    summary: "Use “a” before a consonant SOUND and “an” before a vowel SOUND — it's the sound that matters, not the letter.",
    examples: ["a book", "an apple", "an hour", "a university"],
    quiz: [
      { type: "blank", prompt: "I saw ___ owl in the tree.", options: ["a", "an", "the", "—"], answer: 1, explain: "“owl” begins with a vowel sound → an." },
      { type: "blank", prompt: "She is ___ honest person.", options: ["a", "an"], answer: 1, explain: "Silent h in “honest” → vowel sound → an." },
      { type: "blank", prompt: "It takes ___ hour to get there.", options: ["a", "an"], answer: 1, explain: "“hour” has a silent h → an." },
      { type: "judge", sentence: "He bought a umbrella.", correct: false, explain: "“umbrella” starts with a vowel sound → an umbrella." },
      { type: "judge", sentence: "She goes to a university.", correct: true, explain: "“university” starts with a “yoo” sound (consonant) → a." },
    ],
  },
  {
    id: "a-adj-noun",
    title: "A/An + Adjective + Noun",
    pattern: "a / an + adjective + noun",
    summary: "When an adjective comes before the noun, the article matches the SOUND of the adjective, not the noun.",
    examples: ["a big house", "an old car", "an interesting book", "a useful tool"],
    quiz: [
      { type: "blank", prompt: "She lives in ___ old house.", options: ["a", "an"], answer: 1, explain: "The adjective “old” has a vowel sound → an." },
      { type: "blank", prompt: "That was ___ useful tip.", options: ["a", "an"], answer: 0, explain: "“useful” starts with a “yoo” consonant sound → a." },
      { type: "blank", prompt: "It is ___ exciting game.", options: ["a", "an"], answer: 1, explain: "“exciting” starts with a vowel sound → an." },
      { type: "judge", sentence: "It's a expensive phone.", correct: false, explain: "“expensive” has a vowel sound → an expensive phone." },
      { type: "judge", sentence: "He told a funny joke.", correct: true, explain: "“funny” has a consonant sound → a." },
    ],
  },
  {
    id: "be-ving",
    title: "To be + V-ing (Present Continuous)",
    pattern: "am / is / are + verb-ing",
    summary: "Use a form of “be” plus verb-ing for actions happening right now or around now.",
    examples: ["I am working", "She is running", "They are playing", "We are eating"],
    quiz: [
      { type: "blank", prompt: "She ___ running now.", options: ["is", "are", "am", "be"], answer: 0, explain: "she → is." },
      { type: "blank", prompt: "They ___ watching TV.", options: ["is", "are", "am"], answer: 1, explain: "they → are." },
      { type: "blank", prompt: "We ___ studying English.", options: ["am", "is", "are"], answer: 2, explain: "we → are." },
      { type: "judge", sentence: "I am go to school now.", correct: false, explain: "Need verb-ing: I am going to school now." },
      { type: "judge", sentence: "He is reading a book.", correct: true, explain: "he + is + reading — correct." },
    ],
  },
  {
    id: "have-v3",
    title: "Have/Has + V3 (Present Perfect)",
    pattern: "have / has + past participle (V3)",
    summary: "Use have/has plus the past participle for past actions connected to the present.",
    examples: ["I have finished", "She has gone", "They have eaten", "He has seen it"],
    quiz: [
      { type: "blank", prompt: "She ___ finished her work.", options: ["have", "has", "is", "had"], answer: 1, explain: "she → has." },
      { type: "blank", prompt: "They ___ eaten lunch already.", options: ["has", "have"], answer: 1, explain: "they → have." },
      { type: "blank", prompt: "I ___ seen that movie before.", options: ["has", "have"], answer: 1, explain: "I → have." },
      { type: "judge", sentence: "He has went home.", correct: false, explain: "Past participle of go is gone: He has gone home." },
      { type: "judge", sentence: "We have done it.", correct: true, explain: "have + done (V3) — correct." },
    ],
  },
  {
    id: "sv-agreement",
    title: "Subject–Verb Agreement",
    pattern: "he / she / it + verb-s",
    summary: "In the present simple, third-person singular subjects add -s (or -es) to the verb.",
    examples: ["He plays", "She works", "It runs", "They play"],
    quiz: [
      { type: "blank", prompt: "He ___ football every day.", options: ["play", "plays", "playing"], answer: 1, explain: "he → plays." },
      { type: "blank", prompt: "My brother ___ in London.", options: ["live", "lives"], answer: 1, explain: "brother (he) → lives." },
      { type: "judge", sentence: "She go to work by bus.", correct: false, explain: "she → goes to work." },
      { type: "judge", sentence: "They watch TV at night.", correct: true, explain: "they → watch (no -s) — correct." },
    ],
  },
  {
    id: "comparative",
    title: "Comparative + than",
    pattern: "adjective-er + than  /  more + adjective + than",
    summary: "Short adjectives add -er; longer adjectives use “more”. Follow with “than” to compare two things.",
    examples: ["taller than", "bigger than", "more beautiful than", "faster than"],
    quiz: [
      { type: "blank", prompt: "She is ___ than her sister.", options: ["tall", "taller", "tallest"], answer: 1, explain: "Comparing two → taller than." },
      { type: "blank", prompt: "This book is ___ interesting than that one.", options: ["more", "most", "much"], answer: 0, explain: "Long adjective → more interesting than." },
      { type: "judge", sentence: "He is more tall than me.", correct: false, explain: "“tall” is short → taller than me." },
      { type: "judge", sentence: "Today is hotter than yesterday.", correct: true, explain: "hot → hotter than — correct." },
    ],
  },
  {
    id: "much-many",
    title: "Much / Many",
    pattern: "much + uncountable  ·  many + countable",
    summary: "Use “many” with countable plural nouns and “much” with uncountable nouns.",
    examples: ["many books", "much water", "many people", "much time"],
    quiz: [
      { type: "blank", prompt: "How ___ money do you have?", options: ["many", "much"], answer: 1, explain: "money is uncountable → much." },
      { type: "blank", prompt: "There aren't ___ chairs.", options: ["much", "many"], answer: 1, explain: "chairs are countable → many." },
      { type: "judge", sentence: "I don't have much friends.", correct: false, explain: "friends are countable → many friends." },
      { type: "judge", sentence: "She doesn't drink much coffee.", correct: true, explain: "coffee is uncountable → much — correct." },
    ],
  },
  {
    id: "going-to",
    title: "Be going to + V1 (Future)",
    pattern: "am / is / are going to + base verb",
    summary: "Use “be going to” plus the base verb for plans and intentions about the future.",
    examples: ["I am going to travel", "She is going to study", "They are going to win"],
    quiz: [
      { type: "blank", prompt: "I ___ going to call him later.", options: ["am", "is", "are"], answer: 0, explain: "I → am going to." },
      { type: "blank", prompt: "We ___ going to move next month.", options: ["am", "is", "are"], answer: 2, explain: "we → are going to." },
      { type: "judge", sentence: "She is going to studies tonight.", correct: false, explain: "Use the base verb → going to study." },
      { type: "judge", sentence: "They are going to buy a car.", correct: true, explain: "are going to + buy (base) — correct." },
    ],
  },
];
