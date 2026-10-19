/**
 * BandQuest IELTS — Curriculum content: Grammar Foundation Episodes 1–5
 * Each episode: objectives, lesson (EN markdown), Bengali explanations,
 * vocabulary, guided practice, and checkpoint questions.
 */

export interface CurriculumQuestion {
  id: string;
  module: string;
  qtype: "mcq" | "fillblank" | "truefalse" | "shortanswer" | "ordering";
  difficulty: 1 | 2 | 3;
  prompt_md: string;
  options_json?: string[];
  answer_json: unknown;
  explanation_md: string;
  explanation_md_bn?: string;
  skill_tags: string[];
}

export interface CurriculumEpisode {
  id: string;
  course_id: string;
  title: string;
  title_bn: string;
  sort_order: number;
  objectives: string[];
  content_md: string;
  content_md_bn: string;
  vocab: Array<{
    word: string;
    pos: string;
    definition: string;
    bn: string;
    example: string;
    collocations?: string[];
  }>;
  questions: CurriculumQuestion[];
}

export const EPISODES_1_5: CurriculumEpisode[] = [
  {
    id: "ep-g01",
    course_id: "course-grammar-foundations",
    title: "Sentence Foundations",
    title_bn: "বাক্যের ভিত্তি",
    sort_order: 1,
    objectives: [
      "Identify parts of speech in a sentence",
      "Build correct Subject–Verb–Object sentences",
      "Use be, have and do correctly",
      "Form positive, negative and question sentences",
      "Apply basic capitalization and punctuation",
    ],
    content_md: `## Sentence Foundations

Every English sentence is built from the same small set of building blocks. Master these and every later grammar topic becomes easier.

### 1. Parts of Speech

| Part of speech | Job | Examples |
|---|---|---|
| Noun | names a person, place, thing, idea | teacher, Dhaka, book, freedom |
| Pronoun | replaces a noun | I, you, he, she, it, they |
| Verb | shows action or state | run, eat, is, have |
| Adjective | describes a noun | tall, red, interesting |
| Adverb | describes a verb/adjective | quickly, very, well |
| Preposition | shows relationship | in, on, at, for, with |
| Conjunction | joins words/clauses | and, but, because |
| Article | specifies nouns | a, an, the |

### 2. The Core Pattern: Subject + Verb + Object

Most English statements follow **SVO** order:

- **She** (S) **reads** (V) **books** (O).
- **They** (S) **play** (V) **football** (O).

> Never put the verb before the subject in a normal statement. "Reads she books" is wrong.

### 3. Be, Have, Do — the three helper verbs

**Be** (am / is / are / was / were) — describes state or identity:
- I **am** a student. / She **is** tired. / They **were** late.

**Have** (have / has / had) — shows possession:
- I **have** two brothers. / He **has** a new phone.

**Do** (do / does / did) — helps make negatives and questions:
- I **do not** like tea. / **Does** she work here? / They **did** their homework.

### 4. Negatives and Questions

**Negatives:** add **not** after the helper verb.
- She is happy → She is **not** happy.
- They play → They do **not** play. (need "do" because there is no helper)

**Yes/No questions:** move the helper verb before the subject.
- She is happy → **Is** she happy?
- They play → **Do** they play?

**WH-questions:** WH-word + helper + subject + verb.
- **Where** does she live? / **Why** are they late? / **What** do you want?

### 5. Capitalization and Punctuation

- Start every sentence with a **capital letter**.
- End statements with a **full stop** (.), questions with **?**.
- Capitalize: the pronoun **I**, names of people/places, days, months.
- Common IELTS mistake: writing "i" instead of "I" loses marks for carelessness.

### Common Mistakes to Avoid

1. ❌ "She go to school." → ✅ "She **goes** to school." (3rd person singular +s)
2. ❌ "I am agree." → ✅ "I **agree**." (agree is already a verb)
3. ❌ "Where you live?" → ✅ "Where **do** you live?" (need helper verb)
4. ❌ "He don't like it." → ✅ "He **doesn't** like it." (he/she/it + does)`,
    content_md_bn: `## বাক্যের ভিত্তি (বাংলা ব্যাখ্যা)

ইংরেজি বাক্যের মূল কাঠামো খুবই নিয়মিত — প্রায় সব বাক্য **Subject + Verb + Object** ক্রমে হয়।

- **Subject** = কে/কী কাজটি করে (She, They, The teacher)
- **Verb** = কাজ বা অবস্থা (reads, is, have)
- **Object** = যার উপর কাজ হয় (books, football)

**Be / Have / Do** — তিনটি সহায়ক ক্রিয়া:
- **Be** (am/is/are): অবস্থা বোঝায় — "I am tired" (আমি ক্লান্ত)
- **Have** (have/has): মালিকানা — "She has a car" (তার একটি গাড়ি আছে)
- **Do** (do/does): না-বোধক ও প্রশ্নে সাহায্য করে — "Do you like tea?" (তুমি কি চা পছন্দ কর?)

**মনে রাখো:**
- He/She/It এর সাথে verb-এ **s** যোগ হয়: "He goes", "She reads"
- প্রশ্নে helper verb আগে আসে: "Does she work?" (not "She does work?")
- সর্বদা বড় হাতের **I** লেখো, ছোট "i" নয়।`,
    vocab: [
      { word: "subject", pos: "noun", definition: "The person or thing doing the action", bn: "উদ্দেশ্য/কর্তা", example: "In 'She reads', *she* is the subject.", collocations: ["sentence subject"] },
      { word: "verb", pos: "noun", definition: "A word showing action or state", bn: "ক্রিয়া", example: "'Run', 'is' and 'have' are verbs.", collocations: ["main verb", "helper verb"] },
      { word: "object", pos: "noun", definition: "The person or thing receiving the action", bn: "কর্ম", example: "In 'She reads books', *books* is the object." },
      { word: "negative", pos: "adjective", definition: "Expressing 'no' or 'not'", bn: "না-বোধক", example: "'She does not like tea' is a negative sentence.", collocations: ["negative sentence"] },
      { word: "punctuation", pos: "noun", definition: "Marks like . ? , used in writing", bn: "যতিচিহ্ন", example: "Correct punctuation makes writing clear." },
    ],
    questions: [
      {
        id: "ep-g01-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Choose the sentence with correct Subject–Verb–Object order.",
        options_json: ["Reads she books every day.", "She reads books every day.", "She every day reads books.", "Books she reads every day."],
        answer_json: 1,
        explanation_md: "English statements follow Subject → Verb → Object: **She (S) reads (V) books (O)**.",
        explanation_md_bn: "ইংরেজিতে ক্রম: Subject → Verb → Object।",
        skill_tags: ["sentence-structure"],
      },
      {
        id: "ep-g01-q02", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Fill the gap: She ___ to school every day.",
        options_json: ["go", "goes", "going", "gone"],
        answer_json: 1,
        explanation_md: "With he/she/it in the present simple, add **-s**: *She goes*.",
        explanation_md_bn: "He/She/It এর সাথে verb-এ -s যোগ হয়।",
        skill_tags: ["subject-verb-agreement"],
      },
      {
        id: "ep-g01-q03", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Choose the correct negative sentence.",
        options_json: ["She don't like coffee.", "She doesn't likes coffee.", "She doesn't like coffee.", "She not like coffee."],
        answer_json: 2,
        explanation_md: "**Doesn't** + base verb: *She doesn't like coffee.* (never *doesn't likes*).",
        explanation_md_bn: "Doesn't-এর পর মূল verb বসে, -s ছাড়া।",
        skill_tags: ["negatives"],
      },
      {
        id: "ep-g01-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Choose the correct question.",
        options_json: ["Where she lives?", "Where does she live?", "Where she does live?", "Where lives she?"],
        answer_json: 1,
        explanation_md: "WH-word + **does** + subject + base verb: *Where does she live?*",
        explanation_md_bn: "WH-word + does + subject + মূল verb।",
        skill_tags: ["questions"],
      },
      {
        id: "ep-g01-q05", module: "grammar", qtype: "truefalse", difficulty: 1,
        prompt_md: "True or false: 'I am agree with you.' is correct.",
        answer_json: false,
        explanation_md: "**Agree** is already a verb — say *I agree with you.* ('I am in agreement' is the formal alternative.)",
        explanation_md_bn: "Agree নিজেই verb — 'I agree' বলো।",
        skill_tags: ["be-have-do"],
      },
      {
        id: "ep-g01-q06", module: "grammar", qtype: "fillblank", difficulty: 2,
        prompt_md: "Complete: ___ you speak English? (use the correct helper verb)",
        answer_json: ["do", "Do"],
        explanation_md: "Yes/no questions need a helper before the subject: **Do** you speak English?",
        explanation_md_bn: "প্রশ্নে subject-এর আগে helper verb বসে।",
        skill_tags: ["questions"],
      },
      {
        id: "ep-g01-q07", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Identify the verb in: 'They were very tired after the long journey.'",
        options_json: ["they", "were", "very", "tired"],
        answer_json: 1,
        explanation_md: "**Were** is the past form of *be* — the main verb of the sentence.",
        explanation_md_bn: "Were হলো be-এর past form — এটাই মূল verb।",
        skill_tags: ["parts-of-speech"],
      },
      {
        id: "ep-g01-q08", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Which sentence uses capitalization correctly?",
        options_json: ["i live in dhaka.", "I live in Dhaka.", "I live in dhaka.", "i live in Dhaka."],
        answer_json: 1,
        explanation_md: "Always capital **I** and capitalise place names: *I live in Dhaka.*",
        explanation_md_bn: "I সর্বদা বড় হাতের, স্থানের নামও বড় হাতের।",
        skill_tags: ["capitalization"],
      },
    ],
  },
  {
    id: "ep-g02",
    course_id: "course-grammar-foundations",
    title: "English Tenses",
    title_bn: "ইংরেজি Tense",
    sort_order: 2,
    objectives: [
      "Use present, past and future forms accurately",
      "Choose between simple and continuous correctly",
      "Use present perfect and past perfect appropriately",
      "Keep tense consistent inside a paragraph",
    ],
    content_md: `## English Tenses

Tenses locate an action in **time**. IELTS examiners watch tense control closely — especially in Writing Task 1 (past for completed data) and Task 2 (present for general truths).

### Present Simple — habits, facts, routines

Form: base verb (+ **s** for he/she/it).
- I **work** in Dhaka. / She **works** in Dhaka.
- Water **boils** at 100°C. (fact)

Signal words: *always, usually, often, every day, never.*

### Present Continuous — happening NOW

Form: **am/is/are + verb-ing**.
- I **am studying** now. / They **are playing** football.

Signal words: *now, at the moment, currently.* Also for temporary situations: "I am living with my parents this month."

### Past Simple — finished past actions

Form: verb + **-ed** (regular) or irregular form.
- I **visited** Cox's Bazar last year. / She **went** home.

Signal words: *yesterday, last week, in 2020, ago.*

### Past Continuous — action in progress at a past moment

Form: **was/were + verb-ing**.
- At 8 pm yesterday, I **was cooking** dinner.
- Often paired: "While I **was walking**, it **started** to rain."

### Future Forms

1. **will** — instant decisions, promises, predictions: "I **will help** you."
2. **going to** — plans already made: "I **am going to** study tonight."
3. **Present continuous** — fixed arrangements: "I **am meeting** him tomorrow."

### Present Perfect — past connected to now

Form: **have/has + past participle**.
- I **have lived** here for five years. (still living here)
- She **has just finished** her homework. (recent, result matters now)

Signal words: *for, since, just, already, yet, ever, never.*

### Past Perfect — the earlier of two past events

Form: **had + past participle**.
- When I arrived, the train **had left**. (leaving happened first)

### Tense Consistency

Stay in one time frame unless there is a reason to shift:
- ❌ "Yesterday I go to the market and bought fish."
- ✅ "Yesterday I **went** to the market and **bought** fish."

### IELTS Traps

- Writing Task 1 with past years → **past simple** for the data.
- General truths in Task 2 → **present simple**.
- "Since 2010" needs **present perfect**, not past simple: "I have worked here **since 2010**."`,
    content_md_bn: `## Tense (বাংলা ব্যাখ্যা)

**Present Simple** — অভ্যাস/সত্য: "She works here." (সে এখানে কাজ করে)
**Present Continuous** — এখন চলছে: "She is working now." (সে এখন কাজ করছে)
**Past Simple** — শেষ হয়ে যাওয়া অতীত: "She worked yesterday." (সে গতকাল কাজ করেছে)
**Present Perfect** — অতীত কিন্তু বর্তমানের সাথে যুক্ত: "She has worked here since 2020." (২০২০ থেকে এখনও করছে)
**Past Perfect** — অতীতেরও আগে: "She had left before I came." (আমি আসার আগেই সে চলে গিয়েছিল)

**মনে রাখো:**
- He/She/It + present simple → verb-এ **s**: "He goes"
- "since/for" থাকলে present perfect: "I have lived here **for** 5 years"
- এক অনুচ্ছেদে একই tense রাখো — অকারণে বদলিয়ো না।`,
    vocab: [
      { word: "habit", pos: "noun", definition: "Something done regularly", bn: "অভ্যাস", example: "Reading daily is a good habit.", collocations: ["good habit", "bad habit"] },
      { word: "temporary", pos: "adjective", definition: "Lasting for a short time", bn: "অস্থায়ী", example: "This is a temporary job.", collocations: ["temporary solution"] },
      { word: "prediction", pos: "noun", definition: "A statement about the future", bn: "ভবিষ্যদ্বাণী", example: "His prediction about the result was correct." },
      { word: "consistent", pos: "adjective", definition: "Staying the same; not changing", bn: "সামঞ্জস্যপূর্ণ", example: "Keep your tenses consistent in a paragraph.", collocations: ["be consistent with"] },
    ],
    questions: [
      {
        id: "ep-g02-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Choose the correct present simple form: Water ___ at 100°C.",
        options_json: ["boil", "boils", "is boiling", "has boiled"],
        answer_json: 1,
        explanation_md: "General truths use present simple; *water* is 3rd-person singular → **boils**.",
        explanation_md_bn: "সাধারণ সত্যে present simple; water third person singular।",
        skill_tags: ["present-simple"],
      },
      {
        id: "ep-g02-q02", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Right now, she ___ for her exam.",
        options_json: ["studies", "is studying", "has studied", "study"],
        answer_json: 1,
        explanation_md: "An action happening **now** needs present continuous: *is studying*.",
        explanation_md_bn: "এখন চলমান কাজে present continuous।",
        skill_tags: ["present-continuous"],
      },
      {
        id: "ep-g02-q03", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "I ___ here since 2019.",
        options_json: ["live", "lived", "have lived", "am living"],
        answer_json: 2,
        explanation_md: "**Since** + starting point → present perfect: *have lived*. The situation continues now.",
        explanation_md_bn: "Since থাকলে present perfect — কাজ এখনও চলছে।",
        skill_tags: ["present-perfect"],
      },
      {
        id: "ep-g02-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "When I arrived, the bus ___.",
        options_json: ["already left", "has already left", "had already left", "already leaves"],
        answer_json: 2,
        explanation_md: "The earlier of two past events → past perfect: **had already left**.",
        explanation_md_bn: "দুটি অতীত ঘটনার আগেরটি past perfect।",
        skill_tags: ["past-perfect"],
      },
      {
        id: "ep-g02-q05", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Choose the tense-consistent sentence.",
        options_json: [
          "Yesterday I go to the market and bought fish.",
          "Yesterday I went to the market and bought fish.",
          "Yesterday I went to the market and buy fish.",
          "Yesterday I go to the market and buy fish.",
        ],
        answer_json: 1,
        explanation_md: "Past-time story → keep **past simple** throughout: *went … bought*.",
        explanation_md_bn: "অতীতের গল্পে সব verb past-এ রাখো।",
        skill_tags: ["tense-consistency"],
      },
      {
        id: "ep-g02-q06", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "At 8 pm last night, I ___ dinner.",
        options_json: ["cooked", "was cooking", "have cooked", "cook"],
        answer_json: 1,
        explanation_md: "An action **in progress at a past moment** → past continuous: *was cooking*.",
        explanation_md_bn: "অতীতের নির্দিষ্ট মুহূর্তে চলমান কাজ — past continuous।",
        skill_tags: ["past-continuous"],
      },
      {
        id: "ep-g02-q07", module: "grammar", qtype: "fillblank", difficulty: 2,
        prompt_md: "She ___ (go) to London last year. (past simple)",
        answer_json: ["went"],
        explanation_md: "Past simple of *go* is the irregular form **went**.",
        explanation_md_bn: "Go-এর past form went।",
        skill_tags: ["past-simple"],
      },
      {
        id: "ep-g02-q08", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "For IELTS Writing Task 1 describing 2000–2020 data, which tense dominates?",
        options_json: ["Present simple", "Past simple", "Present perfect", "Future simple"],
        answer_json: 1,
        explanation_md: "Completed past data → **past simple**: *rose, fell, remained stable*.",
        explanation_md_bn: "অতীতের তথ্য বর্ণনায় past simple।",
        skill_tags: ["ielts-application"],
      },
    ],
  },
  {
    id: "ep-g03",
    course_id: "course-grammar-foundations",
    title: "Nouns, Articles and Determiners",
    title_bn: "Noun, Article ও Determiner",
    sort_order: 3,
    objectives: [
      "Distinguish countable and uncountable nouns",
      "Use a, an, the and zero article correctly",
      "Choose correct pronouns, possessives and quantifiers",
      "Keep subject–verb agreement",
    ],
    content_md: `## Nouns, Articles and Determiners

### Countable vs Uncountable

**Countable** nouns have singular and plural: *book → books, child → children.*
**Uncountable** nouns have no plural: *water, rice, information, advice, furniture, money.*

> ❌ "informations" → ✅ "pieces of information" / "some information"
> ❌ "advices" → ✅ "pieces of advice" / "some advice"

Useful measure words: *a glass of water, a grain of rice, a piece of news.*

### A / An / The / Zero Article

**A / An** — first mention, one of many:
- I saw **a** dog. (**an** before vowel sounds: *an hour, an apple*)

**The** — specific, already mentioned, or unique:
- I saw **a** dog. **The** dog was barking.
- **The** sun rises in the east. (unique)

**Zero article** — plural/general nouns, uncountable in general sense:
- **Dogs** are loyal. (dogs in general)
- **Water** is essential. (not "the water" in general statements)

### Pronouns and Possessives

| Subject | Object | Possessive adj. | Possessive pron. |
|---|---|---|---|
| I | me | my | mine |
| you | you | your | yours |
| he | him | his | his |
| she | her | her | hers |
| it | it | its | — |
| we | us | our | ours |
| they | them | their | theirs |

- This is **my** book. (adjective + noun) / This book is **mine**. (stands alone)

### Quantifiers

- Countable plural: **many, few, a few, several** — *many books, few friends*
- Uncountable: **much, little, a little, a great deal of** — *much water, little time*
- Both: **some, any, a lot of, plenty of, most, all, no**

> **Few** (almost none, negative) vs **a few** (some, positive): "I have **few** friends" (sad) vs "I have **a few** friends" (fine).

### Subject–Verb Agreement

- Singular subject → singular verb: "The **list** of items **is** on the desk."
- **Everyone / somebody / each** → singular: "**Everyone** **has** arrived."
- Uncountable → singular: "The **news** **is** good."`,
    content_md_bn: `## Noun ও Article (বাংলা ব্যাখ্যা)

**Countable** (গণনাযোগ্য): book → books। **Uncountable** (অগণনাযোগ্য): water, information, advice — এদের plural হয় না। "informations" ভুল!

**A/An** — প্রথমবার উল্লেখ, অনির্দিষ্ট: "I saw **a** dog."
**The** — নির্দিষ্ট/আগে উল্লেখিত: "The dog was barking."
**Article ছাড়া** — সাধারণ অর্থে plural/uncountable: "**Dogs** are loyal."

**মনে রাখো:**
- He/She/It/Everyone + singular verb: "Everyone **has** come"
- "The news **is** good" (news uncountable, singular verb)`,
    vocab: [
      { word: "essential", pos: "adjective", definition: "Absolutely necessary", bn: "অপরিহার্য", example: "Water is essential for life.", collocations: ["essential for"] },
      { word: "specific", pos: "adjective", definition: "Clearly defined; particular", bn: "নির্দিষ্ট", example: "Give me a specific example.", collocations: ["specific example"] },
      { word: "quantity", pos: "noun", definition: "Amount of something", bn: "পরিমাণ", example: "Use the correct quantity of salt.", collocations: ["large quantity"] },
    ],
    questions: [
      {
        id: "ep-g03-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Which noun is uncountable?",
        options_json: ["book", "information", "chair", "student"],
        answer_json: 1,
        explanation_md: "**Information** has no plural form — *informations* is always wrong.",
        explanation_md_bn: "Information-এর plural হয় না।",
        skill_tags: ["countable-uncountable"],
      },
      {
        id: "ep-g03-q02", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "I saw ___ dog. ___ dog was barking loudly.",
        options_json: ["a / A", "a / The", "the / A", "the / The"],
        answer_json: 1,
        explanation_md: "First mention → **a**; second (now specific) → **the**.",
        explanation_md_bn: "প্রথমবার a, পরে the।",
        skill_tags: ["articles"],
      },
      {
        id: "ep-g03-q03", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "___ are loyal animals.",
        options_json: ["The dogs", "Dogs", "A dogs", "Dog"],
        answer_json: 1,
        explanation_md: "General statement about all dogs → **zero article**: *Dogs are loyal.*",
        explanation_md_bn: "সাধারণ সত্যে article বসে না।",
        skill_tags: ["articles"],
      },
      {
        id: "ep-g03-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "This book is ___.",
        options_json: ["my", "mine book", "mine", "me"],
        answer_json: 2,
        explanation_md: "Possessive pronoun stands alone: *mine* (not *my*, which needs a noun after it).",
        explanation_md_bn: "Mine একা বসে; my-এর পর noun লাগে।",
        skill_tags: ["possessives"],
      },
      {
        id: "ep-g03-q05", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Choose the correct quantifier: There isn't ___ time left.",
        options_json: ["many", "few", "much", "several"],
        answer_json: 2,
        explanation_md: "*Time* is uncountable → **much**.",
        explanation_md_bn: "Time uncountable — much বসে।",
        skill_tags: ["quantifiers"],
      },
      {
        id: "ep-g03-q06", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Everyone ___ arrived already.",
        options_json: ["have", "has", "are", "were"],
        answer_json: 1,
        explanation_md: "**Everyone** takes a singular verb: *has*.",
        explanation_md_bn: "Everyone-এর সাথে singular verb।",
        skill_tags: ["subject-verb-agreement"],
      },
      {
        id: "ep-g03-q07", module: "grammar", qtype: "fillblank", difficulty: 2,
        prompt_md: "She gave me useful ___. (advice — correct form)",
        answer_json: ["advice"],
        explanation_md: "*Advice* is uncountable — no plural form exists.",
        explanation_md_bn: "Advice-এর plural নেই।",
        skill_tags: ["countable-uncountable"],
      },
      {
        id: "ep-g03-q08", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "The news ___ surprisingly good today.",
        options_json: ["are", "is", "were", "have been"],
        answer_json: 1,
        explanation_md: "*News* looks plural but is uncountable → singular verb **is**.",
        explanation_md_bn: "News দেখতে plural হলেও singular verb নেয়।",
        skill_tags: ["subject-verb-agreement"],
      },
    ],
  },
  {
    id: "ep-g04",
    course_id: "course-grammar-foundations",
    title: "Sentence Types and Clauses",
    title_bn: "বাক্যের ধরন ও Clause",
    sort_order: 4,
    objectives: [
      "Build simple, compound and complex sentences",
      "Use coordinating and subordinating conjunctions",
      "Form relative clauses correctly",
      "Avoid fragments and run-on sentences",
    ],
    content_md: `## Sentence Types and Clauses

IELTS Writing rewards **sentence variety**: a mix of simple, compound and complex sentences. This episode builds that control.

### The Four Sentence Types

1. **Simple** — one independent clause: "She reads books."
2. **Compound** — two independent clauses joined by FANBOYS (for, and, nor, but, or, yet, so): "She reads books, **and** he watches films."
3. **Complex** — independent + dependent clause: "**Although** it was raining, we went out."
4. **Compound-complex** — two independents + one dependent: "**Although** it was raining, we went out, **and** we enjoyed it."

### Subordinating Conjunctions

| Purpose | Words |
|---|---|
| Time | when, while, after, before, until, as soon as |
| Cause | because, since, as |
| Contrast | although, though, even though, whereas, while |
| Condition | if, unless, provided that |
| Purpose | so that, in order to |

### Relative Clauses

Add information about a noun using **who / which / that / whose / where / when**:

- Defining (essential, no commas): "The book **that** you lent me was excellent."
- Non-defining (extra, with commas): "Dhaka, **which** is the capital, is crowded."
- **Who** → people, **which** → things, **whose** → possession, **where** → place.

### Two Deadly Errors

**Fragment** (incomplete sentence):
- ❌ "Because it was raining." → ✅ "**We stayed home** because it was raining."

**Run-on** (two sentences jammed together):
- ❌ "She reads books he watches films."
- ✅ "She reads books, **and** he watches films." / "She reads books. He watches films."`,
    content_md_bn: `## Clause (বাংলা ব্যাখ্যা)

- **Simple sentence**: একটি clause — "She reads."
- **Compound**: দুটি স্বাধীন clause, conjunction দিয়ে যুক্ত — "She reads **and** he writes."
- **Complex**: একটি স্বাধীন + একটি নির্ভরশীল clause — "**Although** it rained, we went out."

**Relative clause**: noun সম্পর্কে তথ্য — who (ব্যক্তি), which (বস্তু), whose (মালিকানা), where (স্থান)।

**ভুল এড়াও:**
- Fragment: "Because it rained." — অসম্পূর্ণ!
- Run-on: "She reads he writes." — মাঝে conjunction বা full stop দাও।`,
    vocab: [
      { word: "although", pos: "conjunction", definition: "Despite the fact that", bn: "যদিও", example: "Although it rained, we went out.", collocations: ["although + clause"] },
      { word: "whereas", pos: "conjunction", definition: "In contrast; while on the contrary", bn: "যেখানে/অথচ", example: "Dhaka is crowded, whereas villages are quiet." },
      { word: "essential", pos: "adjective", definition: "Absolutely necessary", bn: "অপরিহার্য", example: "Defining clauses give essential information." },
    ],
    questions: [
      {
        id: "ep-g04-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Which is a complex sentence?",
        options_json: [
          "She reads books.",
          "She reads books, and he watches films.",
          "Although it was raining, we went out.",
          "She reads books he watches films.",
        ],
        answer_json: 2,
        explanation_md: "Independent clause + dependent clause (*Although it was raining*) = **complex**.",
        explanation_md_bn: "স্বাধীন + নির্ভরশীল clause = complex sentence।",
        skill_tags: ["sentence-types"],
      },
      {
        id: "ep-g04-q02", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Choose the correct relative pronoun: The teacher ___ helped me was kind.",
        options_json: ["which", "who", "whose", "where"],
        answer_json: 1,
        explanation_md: "Refers to a person → **who**.",
        explanation_md_bn: "ব্যক্তির জন্য who।",
        skill_tags: ["relative-clauses"],
      },
      {
        id: "ep-g04-q03", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Identify the error: 'Because it was late.'",
        options_json: ["Spelling error", "Sentence fragment", "Run-on sentence", "No error"],
        answer_json: 1,
        explanation_md: "A dependent clause alone is a **fragment** — it needs a main clause.",
        explanation_md_bn: "একা dependent clause অসম্পূর্ণ বাক্য।",
        skill_tags: ["fragments"],
      },
      {
        id: "ep-g04-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Fix the run-on: 'She reads books he watches films.'",
        options_json: [
          "She reads books, he watches films.",
          "She reads books and he watches films.",
          "She reads books; he watches films.",
          "Both B and C are acceptable.",
        ],
        answer_json: 3,
        explanation_md: "Join with **and** or a **semicolon** (a comma alone creates a comma splice).",
        explanation_md_bn: "And বা semicolon দিয়ে যুক্ত করো।",
        skill_tags: ["run-ons"],
      },
      {
        id: "ep-g04-q05", module: "grammar", qtype: "fillblank", difficulty: 2,
        prompt_md: "Dhaka, ___ is the capital, is very crowded. (relative pronoun)",
        answer_json: ["which"],
        explanation_md: "Non-defining clause about a thing → **which** (with commas).",
        explanation_md_bn: "বস্তুর জন্য which, কমা সহ।",
        skill_tags: ["relative-clauses"],
      },
      {
        id: "ep-g04-q06", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "Which sentence shows the best variety for IELTS Writing?",
        options_json: [
          "He works hard. He is tired. He sleeps early.",
          "He works hard, so he is tired, and he sleeps early.",
          "Because he works hard, he is tired; therefore, he sleeps early.",
          "Working hard makes him tired, so he sleeps early.",
        ],
        answer_json: 2,
        explanation_md: "Mixes complex (*Because…*) and compound structures with a linker (*therefore*) — the variety examiners reward.",
        explanation_md_bn: "Complex + linker-এর মিশ্রণ IELTS-এ ভালো স্কোর দেয়।",
        skill_tags: ["ielts-application"],
      },
    ],
  },
  {
    id: "ep-g05",
    course_id: "course-grammar-foundations",
    title: "Modal Verbs and Conditionals",
    title_bn: "Modal Verb ও Conditional",
    sort_order: 5,
    objectives: [
      "Use can/could/may/might/must/should correctly",
      "Form zero, first, second and third conditionals",
      "Express wishes and hypothetical situations",
    ],
    content_md: `## Modal Verbs and Conditionals

### Modal Verbs — quick guide

| Modal | Use | Example |
|---|---|---|
| can | ability, present | I **can** swim. |
| could | past ability, polite request | I **could** swim as a child. / **Could** you help? |
| may / might | possibility | It **may** rain. (stronger) / It **might** rain. (weaker) |
| must | strong obligation | You **must** wear a seatbelt. |
| have to | external obligation | I **have to** work tomorrow. |
| should / ought to | advice | You **should** rest. |
| would | hypothetical, polite | I **would** help if I could. |

> Modals are followed by the **base verb** — never *to*: "She can **swim**" (not "can to swim").

### Conditionals

**Zero** — general truths: If + present, present.
- "**If** you heat ice, it **melts**."

**First** — real future possibility: If + present, will + base.
- "**If** it rains, we **will stay** home."

**Second** — unreal present/future: If + past, would + base.
- "**If** I **were** rich, I **would travel** the world." (I'm not rich)

**Third** — unreal past (regrets): If + past perfect, would have + participle.
- "**If** I **had studied**, I **would have passed**."

**Mixed** — past condition, present result: If + past perfect, would + base.
- "If I **had taken** that job, I **would be** rich now."

### Wishes

- Present wish: "I **wish** I **were** taller." (past simple)
- Past regret: "I **wish** I **had studied** harder." (past perfect)`,
    content_md_bn: `## Modal ও Conditional (বাংলা ব্যাখ্যা)

**Modal verb**-এর পর সর্বদা মূল verb (to ছাড়া): "She can **swim**."

**Conditional:**
- **Zero**: সাধারণ সত্য — "If you heat ice, it melts."
- **First**: ভবিষ্যতে সম্ভব — "If it rains, we will stay."
- **Second**: অবাস্তব কল্পনা — "If I were rich, I would travel."
- **Third**: অতীতের আফসোস — "If I had studied, I would have passed."

**Wish**: "I wish I **were** rich." (বর্তমান) / "I wish I **had studied**." (অতীত)`,
    vocab: [
      { word: "obligation", pos: "noun", definition: "Something you must do", bn: "বাধ্যবাধকতা", example: "Wearing a helmet is a legal obligation.", collocations: ["moral obligation"] },
      { word: "hypothetical", pos: "adjective", definition: "Imagined, not real", bn: "কাল্পনিক", example: "This is a hypothetical situation.", collocations: ["hypothetical question"] },
      { word: "regret", pos: "noun/verb", definition: "Sadness about a past action", bn: "অনুশোচনা", example: "He regrets not studying harder.", collocations: ["have no regrets"] },
    ],
    questions: [
      {
        id: "ep-g05-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "She ___ swim very well.",
        options_json: ["can to", "can", "cans", "is can"],
        answer_json: 1,
        explanation_md: "Modal + **base verb**, no *to*, no *-s*: *can swim*.",
        explanation_md_bn: "Modal-এর পর মূল verb, to ছাড়া।",
        skill_tags: ["modals"],
      },
      {
        id: "ep-g05-q02", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "If it rains tomorrow, we ___ at home.",
        options_json: ["will stay", "would stay", "stayed", "stay"],
        answer_json: 0,
        explanation_md: "First conditional (real future): If + present → **will** + base.",
        explanation_md_bn: "First conditional: will + মূল verb।",
        skill_tags: ["conditionals"],
      },
      {
        id: "ep-g05-q03", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "If I ___ rich, I would travel the world.",
        options_json: ["am", "were", "will be", "have been"],
        answer_json: 1,
        explanation_md: "Second conditional (unreal): If + **past** → would + base. Use *were* for all persons.",
        explanation_md_bn: "Second conditional-এ were বসে।",
        skill_tags: ["conditionals"],
      },
      {
        id: "ep-g05-q04", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "If I had studied harder, I ___ the exam.",
        options_json: ["would pass", "will pass", "would have passed", "had passed"],
        answer_json: 2,
        explanation_md: "Third conditional (past regret): If + past perfect → **would have** + participle.",
        explanation_md_bn: "Third conditional: would have + past participle।",
        skill_tags: ["conditionals"],
      },
      {
        id: "ep-g05-q05", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "You ___ see a doctor. (advice)",
        options_json: ["must", "should", "can", "might"],
        answer_json: 1,
        explanation_md: "**Should** gives advice; *must* is too strong for a suggestion.",
        explanation_md_bn: "পরামর্শে should ব্যবহার করো।",
        skill_tags: ["modals"],
      },
      {
        id: "ep-g05-q06", module: "grammar", qtype: "fillblank", difficulty: 2,
        prompt_md: "I wish I ___ (be) taller.",
        answer_json: ["were"],
        explanation_md: "Present wish → past simple; use **were** for wishes.",
        explanation_md_bn: "Wish-এ were বসে।",
        skill_tags: ["wishes"],
      },
    ],
  },
];
