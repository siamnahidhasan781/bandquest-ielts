/**
 * BandQuest IELTS — Curriculum content: Grammar Foundation Episodes 6–10
 */
import { CurriculumEpisode } from "./episodes-1-5";

export const EPISODES_6_10: CurriculumEpisode[] = [
  {
    id: "ep-g06",
    course_id: "course-grammar-foundations",
    title: "Passive Voice and Reported Speech",
    title_bn: "Passive Voice ও Reported Speech",
    sort_order: 6,
    objectives: [
      "Form passive constructions across tenses",
      "Choose active vs passive appropriately",
      "Convert direct speech to reported speech",
      "Use reporting verbs and indirect questions",
    ],
    content_md: `## Passive Voice and Reported Speech

### Passive Voice

Form: **be + past participle**. The object becomes the subject.

| Tense | Active | Passive |
|---|---|---|
| Present simple | They make cars. | Cars **are made**. |
| Past simple | They made cars. | Cars **were made**. |
| Present perfect | They have made cars. | Cars **have been made**. |
| Future | They will make cars. | Cars **will be made**. |
| Modal | They can make cars. | Cars **can be made**. |

**When to use passive:**
- The doer is unknown: "My bike **was stolen**."
- The doer is obvious/unimportant: "The bridge **was built** in 1990."
- IELTS Writing Task 1 processes: "The water **is heated** and then **is poured**."

**When NOT to:** overusing passive makes writing heavy. Prefer active for opinions in Task 2.

### Reported Speech

Shift tenses **one step back**:

| Direct | Reported |
|---|---|
| "I **am** tired." | He said he **was** tired. |
| "I **have finished**." | She said she **had finished**. |
| "I **will come**." | They said they **would come**. |
| "**Can** you help?" | He asked **if** I **could** help. |

**Reporting verbs:** said, told (needs object: *told me*), asked, explained, suggested, admitted, complained.

**Indirect questions:** statement word order, no question mark inversion:
- ❌ "He asked where was she."
- ✅ "He asked **where she was**."

### Causative (have + object + participle)

- "I **had my hair cut** yesterday." (= someone cut it for me)`,
    content_md_bn: `## Passive ও Reported Speech (বাংলা ব্যাখ্যা)

**Passive**: be + past participle — "Cars **are made** here." (কে বানায় জানা নেই/গুরুত্বপূর্ণ নয়)
IELTS Task 1-এর process বর্ণনায় passive খুব কাজে লাগে।

**Reported Speech**: tense এক ধাপ পিছিয়ে যায় —
- "I am tired" → He said he **was** tired.
- "I will come" → She said she **would** come.
- প্রশ্ন: "He asked **where she was**." (where was she নয়!)`,
    vocab: [
      { word: "construct", pos: "verb", definition: "To build or form", bn: "নির্মাণ করা", example: "The bridge was constructed in 1990.", collocations: ["construct a sentence"] },
      { word: "obvious", pos: "adjective", definition: "Easy to see or understand", bn: "স্পষ্ট", example: "The answer was obvious.", collocations: ["it is obvious that"] },
      { word: "complain", pos: "verb", definition: "To say you are unhappy about something", bn: "অভিযোগ করা", example: "Residents complained about the noise.", collocations: ["complain about"] },
    ],
    questions: [
      {
        id: "ep-g06-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "Choose the passive form: They make cars here.",
        options_json: ["Cars are made here.", "Cars made here.", "Cars is made here.", "Cars have make here."],
        answer_json: 0,
        explanation_md: "Present simple passive: **are** + past participle (*made*); plural subject → *are*.",
        explanation_md_bn: "Passive: be + past participle।",
        skill_tags: ["passive"],
      },
      {
        id: "ep-g06-q02", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "The bridge ___ in 1990.",
        options_json: ["was built", "built", "is build", "has build"],
        answer_json: 0,
        explanation_md: "Past passive: **was built**. The doer is unimportant here.",
        explanation_md_bn: "অতীতের passive: was + past participle।",
        skill_tags: ["passive"],
      },
      {
        id: "ep-g06-q03", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "She said she ___ tired.",
        options_json: ["is", "was", "will be", "has been"],
        answer_json: 1,
        explanation_md: "Reported speech shifts one tense back: am → **was**.",
        explanation_md_bn: "Reported speech-এ tense এক ধাপ পিছায়।",
        skill_tags: ["reported-speech"],
      },
      {
        id: "ep-g06-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "He asked me where ___ .",
        options_json: ["was she", "she was", "is she", "she is"],
        answer_json: 1,
        explanation_md: "Indirect questions use **statement** word order: *where she was*.",
        explanation_md_bn: "Indirect প্রশ্নে statement-এর ক্রম।",
        skill_tags: ["reported-speech"],
      },
      {
        id: "ep-g06-q05", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "Which sentence best suits an IELTS Task 1 process description?",
        options_json: [
          "Workers heat the water first.",
          "The water is heated first.",
          "Someone heats the water first.",
          "They are heating the water first.",
        ],
        answer_json: 1,
        explanation_md: "Processes focus on the **material**, not the worker → passive: *is heated*.",
        explanation_md_bn: "Process বর্ণনায় passive ভালো।",
        skill_tags: ["ielts-application"],
      },
      {
        id: "ep-g06-q06", module: "grammar", qtype: "fillblank", difficulty: 2,
        prompt_md: "I had my hair ___ (cut) yesterday.",
        answer_json: ["cut"],
        explanation_md: "Causative: **have + object + past participle** — *had my hair cut*.",
        explanation_md_bn: "Causative: have + object + past participle।",
        skill_tags: ["causative"],
      },
    ],
  },
  {
    id: "ep-g07",
    course_id: "course-grammar-foundations",
    title: "Gerunds, Infinitives and Verb Patterns",
    title_bn: "Gerund, Infinitive ও Verb Pattern",
    sort_order: 7,
    objectives: [
      "Choose between gerund and infinitive after verbs",
      "Use common verb patterns correctly",
      "Use phrasal verbs and dependent prepositions",
    ],
    content_md: `## Gerunds, Infinitives and Verb Patterns

### Gerund (verb-ing as noun) vs Infinitive (to + verb)

Some verbs take **only gerund**: enjoy, avoid, finish, mind, suggest, practise, keep.
- "I **enjoy reading**." (not "enjoy to read")

Some take **only infinitive**: want, decide, plan, agree, promise, hope, learn.
- "She **decided to leave**."

Some take **both with a meaning change**:
- "I **stopped smoking**." (= quit the habit)
- "I **stopped to smoke**." (= paused in order to smoke)
- "I **remember posting** the letter." (= memory of past action)
- "Remember **to post** the letter." (= don't forget future action)

### Common Verb Patterns

- **look forward to + gerund**: "I look forward to **meeting** you." (*to* is a preposition here!)
- **be used to + gerund**: "I am used to **waking** early."
- **used to + base**: "I **used to** play football." (past habit)
- **It's no use + gerund**: "It's no use **crying**."

### Phrasal Verbs (verb + particle, new meaning)

| Phrasal verb | Meaning | Example |
|---|---|---|
| put off | postpone | They **put off** the meeting. |
| give up | quit | Don't **give up**! |
| look after | take care of | She **looks after** her mother. |
| run out of | have none left | We've **run out of** milk. |
| come up with | invent/think of | He **came up with** a plan. |

### Dependent Prepositions

Certain words always pair with a preposition:
- **interested in**, **good at**, **afraid of**, **responsible for**, **depend on**, **apologise for**, **suffer from**, **believe in**.`,
    content_md_bn: `## Gerund ও Infinitive (বাংলা ব্যাখ্যা)

- **Gerund** (verb-ing): "I enjoy **reading**." — enjoy, avoid, finish, mind, suggest-এর পর gerund।
- **Infinitive** (to + verb): "She decided **to leave**." — want, decide, plan, hope-এর পর infinitive।
- অর্থ বদলায়: "stopped **smoking**" (ছেড়ে দিল) vs "stopped **to smoke**" (থেমে সিগারেট খেল)।
- **look forward to + gerund**: "I look forward to **meeting** you."
- **Phrasal verb**: put off (স্থগিত), give up (ছেড়ে দেওয়া), look after (যত্ন নেওয়া)।`,
    vocab: [
      { word: "postpone", pos: "verb", definition: "To delay to a later time", bn: "স্থগিত করা", example: "The match was postponed.", collocations: ["postpone a meeting"] },
      { word: "habit", pos: "noun", definition: "Regular behaviour", bn: "অভ্যাস", example: "Smoking is a bad habit.", collocations: ["break a habit"] },
    ],
    questions: [
      {
        id: "ep-g07-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "I enjoy ___ novels.",
        options_json: ["to read", "reading", "read", "reads"],
        answer_json: 1,
        explanation_md: "**Enjoy** takes a gerund: *enjoy reading*.",
        explanation_md_bn: "Enjoy-এর পর gerund বসে।",
        skill_tags: ["gerund-infinitive"],
      },
      {
        id: "ep-g07-q02", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "She decided ___ abroad.",
        options_json: ["studying", "to study", "study", "studied"],
        answer_json: 1,
        explanation_md: "**Decide** takes an infinitive: *decided to study*.",
        explanation_md_bn: "Decide-এর পর infinitive।",
        skill_tags: ["gerund-infinitive"],
      },
      {
        id: "ep-g07-q03", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "I look forward to ___ you soon.",
        options_json: ["meet", "to meet", "meeting", "met"],
        answer_json: 2,
        explanation_md: "**Look forward to** — *to* is a preposition here, so gerund: *meeting*.",
        explanation_md_bn: "Look forward to-এর পর gerund।",
        skill_tags: ["verb-patterns"],
      },
      {
        id: "ep-g07-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "'Put off' means ___.",
        options_json: ["wear", "postpone", "remove", "extinguish"],
        answer_json: 1,
        explanation_md: "**Put off** = postpone: *They put off the exam.*",
        explanation_md_bn: "Put off = স্থগিত করা।",
        skill_tags: ["phrasal-verbs"],
      },
      {
        id: "ep-g07-q05", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "She is good ___ mathematics.",
        options_json: ["in", "at", "for", "with"],
        answer_json: 1,
        explanation_md: "Fixed pairing: **good at**.",
        explanation_md_bn: "Good-এর সাথে at বসে।",
        skill_tags: ["prepositions"],
      },
      {
        id: "ep-g07-q06", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "Choose the sentence with a meaning change trap: 'I stopped ___ at the shop.' — which fits 'I quit buying there'?",
        options_json: ["to shop", "shopping", "shop", "shopped"],
        answer_json: 1,
        explanation_md: "**Stopped shopping** = quit the habit; *stopped to shop* = paused in order to shop.",
        explanation_md_bn: "Stopped + gerund = অভ্যাস ছাড়া।",
        skill_tags: ["gerund-infinitive"],
      },
    ],
  },
  {
    id: "ep-g08",
    course_id: "course-grammar-foundations",
    title: "Adjectives, Adverbs and Word Formation",
    title_bn: "Adjective, Adverb ও Word Formation",
    sort_order: 8,
    objectives: [
      "Place adjectives and adverbs correctly",
      "Form comparatives and superlatives",
      "Build word families with prefixes/suffixes",
      "Use collocations precisely",
    ],
    content_md: `## Adjectives, Adverbs and Word Formation

### Adjectives vs Adverbs

- **Adjective** describes a noun: "a **careful** driver", "She is **happy**."
- **Adverb** describes a verb/adjective/other adverb: "He drives **carefully**." (usually adjective + **-ly**)

> After **linking verbs** (be, seem, look, feel, sound, taste) use an **adjective**: "She **looks happy**." (not "happily")

### Comparatives and Superlatives

| Rule | Comparative | Superlative |
|---|---|---|
| Short adjective | tall**er** | the tall**est** |
| -y ending | happ**ier** | the happ**iest** |
| Long adjective | **more** interesting | the **most** interesting |
| Irregular | better, worse, farther | the best, the worst, the farthest |

- "Dhaka is **bigger than** Khulna." / "This is **the biggest** city."
- Never double: ❌ "more better" → ✅ "**better**".

### Word Formation

**Prefixes** (before): un-, in-, dis-, mis-, re-, over-, under-
- happy → **un**happy; correct → **in**correct; like → **dis**like

**Suffixes** (after) change word class:
- Noun → adjective: care → care**ful**, use → use**less**
- Verb → noun: develop → develop**ment**, inform → inform**ation**
- Adjective → adverb: quick → quick**ly**

**Word families** (IELTS loves these):
- **decide** (v) → **decision** (n) → **decisive** (adj) → **decisively** (adv)

### Collocations

Words that naturally go together:
- **make** a decision (not "do a decision")
- **heavy** rain (not "strong rain")
- **fast** food (not "quick food")
- **take** an exam (not "give an exam" — in Bangladeshi English this is a common error!)`,
    content_md_bn: `## Adjective ও Adverb (বাংলা ব্যাখ্যা)

- **Adjective** noun-কে বর্ণনা করে: "a **careful** driver"
- **Adverb** verb-কে: "He drives **carefully**" (সাধারণত -ly যোগে)
- Linking verb (be/seem/look/feel)-এর পর **adjective**: "She looks **happy**."

**Comparative**: taller / more interesting। **Superlative**: the tallest / the most interesting। "More better" ভুল!

**Collocation** মনে রাখো: "make a decision", "take an exam" (give an exam নয়!)।`,
    vocab: [
      { word: "precise", pos: "adjective", definition: "Exact and accurate", bn: "সুনির্দিষ্ট", example: "Give a precise answer.", collocations: ["precise meaning"] },
      { word: "transform", pos: "verb", definition: "To change form", bn: "রূপান্তর করা", example: "Suffixes transform adjectives into adverbs.", collocations: ["transform into"] },
    ],
    questions: [
      {
        id: "ep-g08-q01", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "He drives very ___.",
        options_json: ["careful", "carefully", "carefulness", "care"],
        answer_json: 1,
        explanation_md: "Describes the **verb** *drives* → adverb **carefully**.",
        explanation_md_bn: "Verb-কে বর্ণনা করে adverb।",
        skill_tags: ["adjectives-adverbs"],
      },
      {
        id: "ep-g08-q02", module: "grammar", qtype: "mcq", difficulty: 1,
        prompt_md: "She looks ___.",
        options_json: ["happily", "happy", "happiness", "happier than"],
        answer_json: 1,
        explanation_md: "After linking verb *looks* → **adjective**: *happy*.",
        explanation_md_bn: "Linking verb-এর পর adjective।",
        skill_tags: ["adjectives-adverbs"],
      },
      {
        id: "ep-g08-q03", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "This is ___ building in the city.",
        options_json: ["the taller", "the tallest", "more tall", "tallest"],
        answer_json: 1,
        explanation_md: "Superlative needs **the**: *the tallest*.",
        explanation_md_bn: "Superlative-এর আগে the বসে।",
        skill_tags: ["comparatives"],
      },
      {
        id: "ep-g08-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Choose the correct collocation.",
        options_json: ["do a decision", "make a decision", "take a decision", "give a decision"],
        answer_json: 1,
        explanation_md: "Fixed collocation: **make a decision**.",
        explanation_md_bn: "Make a decision — নির্দিষ্ট জোড়া।",
        skill_tags: ["collocations"],
      },
      {
        id: "ep-g08-q05", module: "grammar", qtype: "fillblank", difficulty: 2,
        prompt_md: "The noun form of 'decide' is ___.",
        answer_json: ["decision"],
        explanation_md: "decide (v) → **decision** (n) via the -sion suffix.",
        explanation_md_bn: "Decide-এর noun decision।",
        skill_tags: ["word-formation"],
      },
      {
        id: "ep-g08-q06", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "Identify the error: 'She did not performed well.'",
        options_json: ["No error", "did not performed → did not perform", "well → good", "She → Her"],
        answer_json: 1,
        explanation_md: "After *did*, use the **base verb**: *did not perform*.",
        explanation_md_bn: "Did-এর পর মূল verb।",
        skill_tags: ["error-correction"],
      },
    ],
  },
  {
    id: "ep-g09",
    course_id: "course-grammar-foundations",
    title: "Complex Grammar and Cohesion",
    title_bn: "জটিল ব্যাকরণ ও Cohesion",
    sort_order: 9,
    objectives: [
      "Use discourse markers for contrast, cause and effect",
      "Build participle and reduced relative clauses",
      "Keep parallel structure",
      "Create cohesion with reference and substitution",
    ],
    content_md: `## Complex Grammar and Cohesion

IELTS Band 7+ needs **complex sentences used accurately** and ideas that **flow**. This episode gives you the connectors and structures.

### Discourse Markers

| Function | Markers |
|---|---|
| Contrast | however, nevertheless, on the other hand, in contrast, despite, in spite of |
| Cause | because, since, as, due to, owing to |
| Effect | therefore, consequently, as a result, thus, hence |
| Addition | moreover, furthermore, in addition, besides |
| Example | for example, for instance, such as |
| Concession | although, even though, despite the fact that |
| Sequence | firstly, secondly, finally, subsequently |

> **However** needs proper punctuation: "It rained. **However,** we went out." (not "It rained however we went out.")

### Participle Clauses (reduced relatives)

- "The man **wearing** a red shirt is my uncle." (= who is wearing)
- "**Having finished** his work, he went home." (= After he had finished)
- "**Built** in 1990, the bridge is still strong." (= which was built)

### Parallel Structure

Keep the same grammatical form in lists and comparisons:
- ❌ "She likes **reading**, **to swim**, and **jogging**."
- ✅ "She likes **reading**, **swimming**, and **jogging**."
- ❌ "The course was **interesting** but **bored** me."
- ✅ "The course was **interesting** but **boring**." (both adjectives describing the course)

### Cohesion: Reference and Substitution

Avoid repeating nouns — use pronouns and synonyms:
- "Dhaka is crowded. **This city** needs better transport. **It** has grown fast."
- Substitution: "I need a pen. Do you have **one**?"`,
    content_md_bn: `## Cohesion (বাংলা ব্যাখ্যা)

**Discourse marker** দিয়ে বাক্য যুক্ত করো:
- বৈপরীত্য: however, on the other hand, despite
- কারণ: because, due to | ফল: therefore, as a result
- সংযোজন: moreover, furthermore

**মনে রাখো:** "However,"-এর পর কমা দাও। Parallel structure রাখো: "reading, swimming, jogging" (to swim নয়)।`,
    vocab: [
      { word: "consequently", pos: "adverb", definition: "As a result", bn: "ফলস্বরূপ", example: "It rained; consequently, the match was cancelled.", collocations: ["consequently + clause"] },
      { word: "nevertheless", pos: "adverb", definition: "Despite that; however", bn: "তবুও", example: "It was late; nevertheless, we continued.", collocations: ["nevertheless + clause"] },
      { word: "subsequently", pos: "adverb", definition: "Afterwards; later", bn: "পরবর্তীতে", example: "He graduated and subsequently found a job." },
    ],
    questions: [
      {
        id: "ep-g09-q01", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "It was raining. ___, we went out.",
        options_json: ["However", "Because", "Therefore", "Moreover"],
        answer_json: 0,
        explanation_md: "Contrast between rain and going out → **However**.",
        explanation_md_bn: "বৈপরীত্য বোঝাতে however।",
        skill_tags: ["discourse-markers"],
      },
      {
        id: "ep-g09-q02", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "Choose the parallel sentence.",
        options_json: [
          "She likes reading, to swim, and jogging.",
          "She likes reading, swimming, and jogging.",
          "She likes to read, swimming, and jogging.",
          "She likes reading, swim, and jogging.",
        ],
        answer_json: 1,
        explanation_md: "All three in the same **-ing** form → parallel.",
        explanation_md_bn: "তিনটিই একই form-এ — parallel।",
        skill_tags: ["parallel-structure"],
      },
      {
        id: "ep-g09-q03", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "The man ___ a red shirt is my uncle.",
        options_json: ["who wearing", "wearing", "is wearing", "wears"],
        answer_json: 1,
        explanation_md: "Reduced relative clause: *who is wearing* → **wearing**.",
        explanation_md_bn: "Reduced clause: wearing।",
        skill_tags: ["participle-clauses"],
      },
      {
        id: "ep-g09-q04", module: "grammar", qtype: "mcq", difficulty: 2,
        prompt_md: "___ the rain, the match continued.",
        options_json: ["Although", "Despite", "However", "Because"],
        answer_json: 1,
        explanation_md: "**Despite** + noun (*the rain*). *Although* would need a clause (*although it rained*).",
        explanation_md_bn: "Despite + noun; although + clause।",
        skill_tags: ["discourse-markers"],
      },
      {
        id: "ep-g09-q05", module: "grammar", qtype: "fillblank", difficulty: 3,
        prompt_md: "It rained heavily. ___, the match was cancelled. (effect marker)",
        answer_json: ["Consequently", "consequently", "Therefore", "therefore", "As a result", "as a result"],
        explanation_md: "Effect markers: **consequently / therefore / as a result**.",
        explanation_md_bn: "ফল বোঝাতে consequently/therefore।",
        skill_tags: ["discourse-markers"],
      },
    ],
  },
  {
    id: "ep-g10",
    course_id: "course-grammar-foundations",
    title: "Comprehensive Grammar Mastery",
    title_bn: "সামগ্রিক ব্যাকরণ দক্ষতা",
    sort_order: 10,
    objectives: [
      "Correct mixed grammar errors under review conditions",
      "Transform sentences accurately",
      "Apply grammar in IELTS essays, data descriptions and speech",
      "Demonstrate cumulative mastery across all foundation topics",
    ],
    content_md: `## Comprehensive Grammar Mastery

This final foundation episode pulls everything together. You will review, correct, transform and **apply** grammar the way IELTS demands.

### Cumulative Review Map

| Episode | Core skill | IELTS use |
|---|---|---|
| 1 | SVO, be/have/do | Every sentence you write |
| 2 | Tenses | Task 1 data (past), Task 2 truths (present) |
| 3 | Articles, agreement | Accuracy in all writing |
| 4 | Clauses, sentence variety | Band 7+ grammatical range |
| 5 | Modals, conditionals | Opinions, hypotheticals in Task 2 |
| 6 | Passive, reported speech | Task 1 processes, academic tone |
| 7 | Gerunds, phrasal verbs | Natural, precise expression |
| 8 | Adjectives, word formation | Lexical precision |
| 9 | Cohesion, markers | Coherence & cohesion score |

### Error Correction Drill

1. ❌ "She don't like coffee." → ✅ "She **doesn't** like coffee."
2. ❌ "I have been to London last year." → ✅ "I **went** to London last year." (*been* needs present perfect without finished time)
3. ❌ "The informations are useful." → ✅ "The **information is** useful."
4. ❌ "Although it was raining, but we went out." → ✅ "Although it was raining, we went out." (never *although + but*)
5. ❌ "He asked where was she." → ✅ "He asked **where she was**."

### Sentence Transformation Practice

- "She is too tired to walk." → "She is **so tired that** she cannot walk."
- "He started working here in 2020." → "He **has worked** here **since** 2020."
- "They cancelled the match because of rain." → "The match **was cancelled** because of rain."

### Grammar in IELTS Contexts

**Task 1 (data):** past simple + passive + comparatives.
- "Sales **rose** sharply, while profits **remained** stable. The chart **was divided** into three sections."

**Task 2 (essay):** present simple + conditionals + modals + complex sentences.
- "**If** governments **invest** in transport, cities **will become** cleaner. **Although** cars are convenient, they **cause** pollution."

**Speaking:** natural tenses + discourse markers, not memorised complexity.
- "I **have lived** here **for** ten years. **However**, I **would like to** move abroad one day."

> You have now covered the **essential** grammar for IELTS. Grammar is a living system — keep the mistake notebook active and revisit weak concepts through revision. New supplemental lessons unlock whenever diagnostics show a gap.`,
    content_md_bn: `## সামগ্রিক পর্যালোচনা (বাংলা)

দশটি episode-এর মূল পয়েন্ট একসাথে:

1. **SVO ক্রম** ঠিক রাখো; he/she/it + verb-s
2. **Tense সামঞ্জস্য**: Task 1-এ past, Task 2-এ present
3. **Article**: a/an (প্রথম), the (নির্দিষ্ট), zero (সাধারণ)
4. **Complex sentence** + however/moreover/therefore
5. **Conditional**: If + past → would (second); If + past perfect → would have (third)
6. **Passive**: Task 1 process-এ
7. **Gerund/Infinitive**: enjoy + gerund; decide + infinitive
8. **Collocation**: make a decision, take an exam
9. **Parallel**: reading, swimming, jogging

**সবচেয়ে common ভুল:** "Although..., but..." — although-এর সাথে but বসে না!`,
    vocab: [
      { word: "cumulative", pos: "adjective", definition: "Building up over time", bn: "ক্রমবর্ধমান", example: "Cumulative revision strengthens memory.", collocations: ["cumulative effect"] },
      { word: "accurate", pos: "adjective", definition: "Correct in every detail", bn: "সঠিক", example: "Accurate grammar raises your band.", collocations: ["accurate data"] },
    ],
    questions: [
      {
        id: "ep-g10-q01", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "Correct the error: 'Although it was raining, but we went out.'",
        options_json: [
          "Although it was raining, but we went out. (correct)",
          "Although it was raining, we went out.",
          "But although it was raining, we went out.",
          "Although it was raining, however we went out.",
        ],
        answer_json: 1,
        explanation_md: "Never combine **although** with **but/however** — one contrast marker is enough.",
        explanation_md_bn: "Although-এর সাথে but বসে না।",
        skill_tags: ["error-correction"],
      },
      {
        id: "ep-g10-q02", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "'He started working here in 2020.' → transform with present perfect:",
        options_json: [
          "He has worked here since 2020.",
          "He has been working here for 2020.",
          "He worked here since 2020.",
          "He had worked here since 2020.",
        ],
        answer_json: 0,
        explanation_md: "**Since** + point in time → present perfect: *has worked … since 2020*.",
        explanation_md_bn: "Since + সময় → present perfect।",
        skill_tags: ["transformation"],
      },
      {
        id: "ep-g10-q03", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "Which Task 1 sentence is grammatically strongest?",
        options_json: [
          "Sales rose sharply, while profits remained stable.",
          "Sales rises sharply, while profits remained stable.",
          "Sales rose sharply, while profits remains stable.",
          "Sales have rose sharply, while profits remained stable.",
        ],
        answer_json: 0,
        explanation_md: "Past data → consistent **past simple**: *rose … remained*.",
        explanation_md_bn: "Task 1-এ past simple সামঞ্জস্য রাখো।",
        skill_tags: ["ielts-application"],
      },
      {
        id: "ep-g10-q04", module: "grammar", qtype: "fillblank", difficulty: 3,
        prompt_md: "I have been to London ___ year. (correct the time expression for present perfect)",
        answer_json: ["this"],
        explanation_md: "Present perfect cannot pair with **finished** time (*last year* → use past simple *went*). With present perfect, use unfinished time: *this year*.",
        explanation_md_bn: "Present perfect-এ unfinished time: this year।",
        skill_tags: ["present-perfect"],
      },
      {
        id: "ep-g10-q05", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "Transform to passive: 'They cancelled the match because of rain.'",
        options_json: [
          "The match was cancelled because of rain.",
          "The match cancelled because of rain.",
          "The match is cancelled because of rain.",
          "The match has cancelled because of rain.",
        ],
        answer_json: 0,
        explanation_md: "Past passive: **was cancelled**. The focus moves to the match.",
        explanation_md_bn: "Past passive: was + past participle।",
        skill_tags: ["transformation"],
      },
      {
        id: "ep-g10-q06", module: "grammar", qtype: "mcq", difficulty: 3,
        prompt_md: "For a Task 2 opinion essay, the strongest sentence is:",
        options_json: [
          "I think cars are bad. They cause pollution. We should use buses.",
          "Although cars are convenient, they cause pollution; therefore, governments should invest in buses.",
          "Cars are bad because they cause pollution so we should use buses.",
          "In my opinion cars are bad, they cause pollution, we should use buses.",
        ],
        answer_json: 1,
        explanation_md: "Complex sentence + concession (*although*) + effect marker (*therefore*) + modal (*should*) — the range Band 7+ needs.",
        explanation_md_bn: "Complex + although + therefore + should — Band 7+ এর জন্য।",
        skill_tags: ["ielts-application"],
      },
    ],
  },
];
