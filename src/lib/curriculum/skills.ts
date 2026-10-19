/**
 * BandQuest IELTS — Four skills curriculum content
 * Original practice materials (not official IELTS papers).
 */

export interface SkillLesson {
  id: string;
  skill: "listening" | "reading" | "writing" | "speaking";
  title: string;
  title_bn: string;
  level: 1 | 2 | 3;
  content_md: string;
  content_md_bn: string;
  // For listening: original script for TTS/audio practice
  audio_script?: string;
  // For reading: original passage
  passage?: string;
  questions: Array<{
    id: string;
    qtype: "mcq" | "fillblank" | "truefalse" | "shortanswer";
    prompt_md: string;
    options?: string[];
    answer: unknown;
    explanation: string;
    explanation_bn?: string;
  }>;
}

export const SKILL_LESSONS: SkillLesson[] = [
  // ---------------- LISTENING ----------------
  {
    id: "lis-01",
    skill: "listening",
    title: "Listening Basics: Keywords & Prediction",
    title_bn: "লিসেনিং: কীওয়ার্ড ও অনুমান",
    level: 1,
    content_md: `## Listening Basics: Keywords & Prediction

### The golden rule
**Read the questions BEFORE the audio plays.** You get time — use every second of it.

### Step 1: Underline keywords
Keywords are the words that **won't change** much: names, numbers, dates, nouns.
- Question: "The library opens at ___."
- Keywords: *library, opens, at* → listen for a **time**.

### Step 2: Predict the answer type
| Question stem | Predict |
|---|---|
| "The price is ___." | number + currency |
| "He arrived in ___." | year / month |
| "The meeting is on ___." | day / date |

### Step 3: Watch for paraphrase
The audio **rarely** uses the exact words. It paraphrases:
- Question: "cost" → Audio: "price", "fee", "charge"
- Question: "every week" → Audio: "weekly", "once a week"

### Step 4: Beware distractors
Speakers **correct themselves**: "The meeting is on Tuesday… no wait, Wednesday."
→ The **corrected** answer (Wednesday) is right.

### Spelling & word limits
- "Write **NO MORE THAN TWO WORDS**" — three words = wrong, even if correct meaning.
- Names: listen carefully for spelling ("Smith, S-M-I-T-H").`,
    content_md_bn: `## লিসেনিং কৌশল (বাংলা)

1. **অডিওর আগে প্রশ্ন পড়ো** — প্রতিটি সেকেন্ড কাজে লাগাও।
2. **কীওয়ার্ড** চিহ্নিত করো: নাম, সংখ্যা, তারিখ।
3. **উত্তরের ধরন অনুমান** করো: দাম হলে সংখ্যা, দিন হলে বার।
4. **Paraphrase** ধরো: প্রশ্নে "cost" থাকলে অডিওতে "price" বলতে পারে।
5. **Distractor** থেকে সাবধান: "Tuesday… no, Wednesday" — সংশোধিতটাই সঠিক।
6. **Word limit** মানো: "NO MORE THAN TWO WORDS" হলে তিন শব্দ ভুল।`,
    audio_script: `Good morning, and welcome to the Riverside Library. Before you look around, let me give you some useful information. The library opens at nine o'clock from Monday to Friday, and at ten o'clock on Saturdays. We are closed on Sundays. Membership is free for students — you just need your student card and one photograph. Books can be borrowed for three weeks. If you need a book for longer, you can renew it once by phone. The phone number is 4-7-8, 2-3-9, double-1. Late returns cost fifty cents per day. On the ground floor you'll find fiction and newspapers. Study rooms are on the second floor and must be booked in advance.`,
    questions: [
      {
        id: "lis-01-q1", qtype: "fillblank",
        prompt_md: "The library opens at ___ on Saturdays. (ONE WORD AND/OR A NUMBER)",
        answer: ["10", "ten", "10 o'clock", "ten o'clock"],
        explanation: "The audio says 'at ten o'clock on Saturdays'.",
        explanation_bn: "অডিওতে 'ten o'clock on Saturdays' বলা হয়েছে।",
      },
      {
        id: "lis-01-q2", qtype: "fillblank",
        prompt_md: "Membership is free for ___. (ONE WORD)",
        answer: ["students"],
        explanation: "'Membership is free for students'.",
      },
      {
        id: "lis-01-q3", qtype: "fillblank",
        prompt_md: "Books can be borrowed for ___ weeks. (ONE WORD AND/OR A NUMBER)",
        answer: ["3", "three"],
        explanation: "'Books can be borrowed for three weeks.'",
      },
      {
        id: "lis-01-q4", qtype: "mcq",
        prompt_md: "Where are the study rooms?",
        options: ["Ground floor", "First floor", "Second floor", "Basement"],
        answer: 2,
        explanation: "'Study rooms are on the second floor.'",
      },
    ],
  },
  {
    id: "lis-02",
    skill: "listening",
    title: "Distractors & Paraphrase",
    title_bn: "Distractor ও Paraphrase",
    level: 2,
    content_md: `## Distractors & Paraphrase

### Why students lose marks
Not because they can't hear — because they **choose the first answer they hear**.

### Distractor patterns
1. **Self-correction**: "It's £15… sorry, £50." → £50
2. **Rejected option**: "We could meet Friday, but I'm busy — let's do Thursday." → Thursday
3. **Partial match**: Question asks for *arrival* time; audio gives *departure* time too. Listen for the right one.

### Paraphrase pairs to master
| Question word | Audio may say |
|---|---|
| buy / purchase | get, pick up, pay for |
| expensive | pricey, costs a lot, not cheap |
| begin / start | kick off, commence, get underway |
| every year | annually, per year, yearly |
| help | assist, give a hand, support |

### Strategy drill
1. Read question → underline keywords → predict answer type.
2. Listen for **meaning**, not identical words.
3. If you hear a correction, the **last** version wins.`,
    content_md_bn: `## Distractor (বাংলা)

ভুল হয় শোনার অভাবে নয় — **প্রথম শোনা উত্তর** বেছে নেওয়ার কারণে।
- "£15… sorry, £50" → সঠিক £50 (সংশোধিত)
- "Friday… actually Thursday" → Thursday

**Paraphrase** মনে রাখো: buy→pay for, expensive→pricey, every year→annually।`,
    audio_script: `Man: Hi, I'd like to book a hotel room for next weekend. Woman: Certainly. We have standard rooms at eighty dollars per night, and deluxe rooms at one hundred and twenty. Man: Hmm, the deluxe sounds nice but it's a bit pricey. I'll take the standard. Actually — wait. Is breakfast included in the standard? Woman: Breakfast is included in the deluxe only. The standard room with breakfast is ninety-five dollars. Man: OK, let me think… I'll go for the standard with breakfast. So that's ninety-five per night, for Friday and Saturday — two nights. Woman: That's correct. Ninety-five dollars per night, checking in Friday, out Sunday morning.`,
    questions: [
      {
        id: "lis-02-q1", qtype: "mcq",
        prompt_md: "What does the man finally book?",
        options: ["Standard room without breakfast", "Standard room with breakfast", "Deluxe room", "Deluxe room without breakfast"],
        answer: 1,
        explanation: "He corrects himself: 'I'll go for the standard with breakfast' at $95/night. The deluxe was rejected as 'pricey'.",
        explanation_bn: "শেষে standard with breakfast ($95) বেছে নেয়।",
      },
      {
        id: "lis-02-q2", qtype: "fillblank",
        prompt_md: "The total cost per night is ___ dollars. (NUMBER ONLY)",
        answer: ["95", "ninety-five", "ninety five"],
        explanation: "'Ninety-five dollars per night.'",
      },
    ],
  },
  // ---------------- READING ----------------
  {
    id: "rd-01",
    skill: "reading",
    title: "Skimming, Scanning & True/False/Not Given",
    title_bn: "স্কিমিং, স্ক্যানিং ও T/F/NG",
    level: 1,
    content_md: `## Reading: Skimming, Scanning & T/F/NG

### Skimming (gist in 2 minutes)
Read the **title, first sentence of each paragraph, and last paragraph**. Don't stop for unknown words.

### Scanning (find details fast)
1. Read the question, underline keywords (names, numbers, unusual words).
2. Run your eyes down the text looking for those words or synonyms.
3. Read **only** that sentence carefully.

### True / False / Not Given — the logic
- **TRUE**: the text says the same thing (may be paraphrased).
- **FALSE**: the text **contradicts** the statement.
- **NOT GIVEN**: the text **doesn't mention** it at all.

> Trap: if the statement is *partly* true but adds something the text never mentions → **NOT GIVEN**, not FALSE.

### Time management
60 minutes / 40 questions = **90 seconds per question**. If stuck after 2 minutes, guess, mark, move on.`,
    content_md_bn: `## রিডিং কৌশল (বাংলা)

- **Skimming**: শিরোনাম + প্রতিটি প্যারার প্রথম বাক্য পড়ে মূলভাব নাও।
- **Scanning**: প্রশ্নের কীওয়ার্ড খুঁজে শুধু সেই বাক্যটি মনোযোগে পড়ো।
- **TRUE**: পাঠ্য একই কথা বলে। **FALSE**: বিরোধিতা করে। **NOT GIVEN**: উল্লেখই নেই।
- ৯০ সেকেন্ড/প্রশ্ন — আটকে গেলে অনুমান করে এগিয়ে যাও।`,
    passage: `The Rise of Urban Farming

A. In cities around the world, rooftops and empty lots are being transformed into farms. Urban farming — growing food inside cities — has grown rapidly in the last decade. Supporters say it reduces transport pollution because food travels shorter distances from farm to plate.

B. Critics argue that urban farms cannot match the scale of rural agriculture. A rooftop garden may supply fresh herbs and salad leaves, but it will never produce enough wheat to feed a city. They also point out that artificial lighting and heating in vertical farms consume significant electricity.

C. Despite these concerns, the movement continues to expand. In Singapore, where land is extremely scarce, the government has set a goal of producing 30% of the country's food locally by 2030 — a plan known as "30 by 30". New high-tech farms there grow vegetables in stacked layers under LED lights.

D. Technology may solve the energy problem. Some vertical farms now run entirely on renewable electricity, and researchers are developing crops specifically designed for indoor conditions. Whether urban farming becomes a major food source or remains a supplement, it has already changed how city residents think about where food comes from.`,
    questions: [
      {
        id: "rd-01-q1", qtype: "truefalse",
        prompt_md: "Urban farming has become more popular over the last ten years.",
        answer: true,
        explanation: "Paragraph A: 'has grown rapidly in the last decade' = TRUE (paraphrase).",
        explanation_bn: "A প্যারায় 'grown rapidly in the last decade' — TRUE।",
      },
      {
        id: "rd-01-q2", qtype: "truefalse",
        prompt_md: "Critics believe rooftop gardens can produce enough wheat for a whole city.",
        answer: false,
        explanation: "Paragraph B says a rooftop garden 'will never produce enough wheat' — direct contradiction = FALSE.",
      },
      {
        id: "rd-01-q3", qtype: "truefalse",
        prompt_md: "Singapore's '30 by 30' plan was launched in 2020.",
        answer: "notgiven",
        explanation: "The text names the plan and its goal but never gives a launch year = NOT GIVEN.",
        explanation_bn: "কোন সালে চালু হয়েছে তা বলা নেই — NOT GIVEN।",
      },
      {
        id: "rd-01-q4", qtype: "mcq",
        prompt_md: "What does paragraph D suggest about the future?",
        options: ["Vertical farms will disappear", "Technology may fix the energy issue", "Cities will stop importing food", "Indoor crops are impossible"],
        answer: 1,
        explanation: "'Technology may solve the energy problem' — D is optimistic about tech.",
      },
    ],
  },
  {
    id: "rd-02",
    skill: "reading",
    title: "Matching Headings & Paragraph Strategy",
    title_bn: "হেডিং মেলানো",
    level: 2,
    content_md: `## Matching Headings

### The method
1. Read the **list of headings first**.
2. Skim each paragraph for its **main idea** (usually first 2 sentences).
3. Match. Cross out used headings.
4. There are always **more headings than paragraphs** — some are distractors.

### Distractor headings
- Too **specific** (mentions a detail, not the main idea)
- Too **general** (could fit anywhere)
- Mention something from the paragraph but **not** its main point

### Academic vs General Training
- **Academic**: 3 long texts, more abstract vocabulary, T/F/NG heavy.
- **GT**: shorter everyday texts (ads, notices) + one longer text; more matching and short-answer.`,
    content_md_bn: `## হেডিং মেলানো (বাংলা)

1. আগে হেডিং-এর তালিকা পড়ো। 2. প্রতিটি প্যারার মূলভাব (প্রথম ২ বাক্য) খুঁজো। 3. মিলাও। হেডিং সবসময় প্যারার চেয়ে বেশি থাকে — কিছু distractor।`,
    passage: `How Sleep Shapes Memory

A. During sleep, the brain replays the day's experiences. Researchers at several universities have shown that this replay strengthens neural connections formed while learning. Students who sleep after studying remember significantly more than those who stay awake.

B. Not all sleep is equal. Deep slow-wave sleep, which dominates the first half of the night, is most important for factual memory — names, dates, vocabulary. REM sleep, more common before waking, supports creative connections and emotional memories.

C. The practical advice is straightforward. Study in the evening, then sleep. Avoid all-night revision sessions: tired brains encode weakly, and without sleep the weak traces fade. Short naps of 20 minutes can help, but they do not replace a full night.

D. Caffeine complicates the picture. It masks tiredness but does not restore the brain's ability to form memories. Students who rely on energy drinks often feel alert while learning almost nothing.`,
    questions: [
      {
        id: "rd-02-q1", qtype: "mcq",
        prompt_md: "Choose the best heading for paragraph A.",
        options: ["Why students fail exams", "Sleep replays and strengthens learning", "The history of sleep research", "Dreams and creativity"],
        answer: 1,
        explanation: "A's main idea: sleep replay strengthens learning connections.",
      },
      {
        id: "rd-02-q2", qtype: "mcq",
        prompt_md: "Choose the best heading for paragraph C.",
        options: ["Practical study-and-sleep advice", "The dangers of napping", "Evening vs morning study", "How caffeine works"],
        answer: 0,
        explanation: "C gives direct advice: study evening, then sleep; avoid all-nighters.",
      },
    ],
  },
  // ---------------- WRITING ----------------
  {
    id: "wr-01",
    skill: "writing",
    title: "Task 2: Opinion Essays That Score",
    title_bn: "Task 2: Opinion Essay",
    level: 2,
    content_md: `## IELTS Writing Task 2 — Opinion Essays

### The 4-paragraph structure
1. **Introduction**: paraphrase the question + state your opinion (thesis).
2. **Body 1**: one main idea + explanation + example.
3. **Body 2**: second main idea + explanation + example.
4. **Conclusion**: restate opinion in new words. No new ideas.

### The 4 scoring criteria (each 25%)
| Criterion | What it means |
|---|---|
| Task Response | Answer ALL parts; clear position throughout |
| Coherence & Cohesion | Logical paragraphs; linking devices |
| Lexical Resource | Precise vocabulary; collocations; some less common words |
| Grammatical Range | Mix of simple + complex sentences; mostly accurate |

### Paraphrasing the question (never copy!)
- Q: "Some people think governments should ban cars from city centres."
- Intro: "There is a view that authorities **ought to prohibit** private vehicles **in downtown areas**. I **completely agree**…"

### Useful frames
- Opinion: "In my view…", "I am convinced that…"
- Body: "Firstly… For example…", "Furthermore…"
- Conclusion: "In conclusion…"

### Word count & timing
- **250+ words**, 40 minutes. Under 250 = penalty.
- Plan 5 min → write 30 min → check 5 min.`,
    content_md_bn: `## Task 2 Essay (বাংলা)

**গঠন**: ভূমিকা (প্রশ্ন paraphrase + মতামত) → Body 1 (যুক্তি + উদাহরণ) → Body 2 → উপসংহার।

**৪টি মানদণ্ড**: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range — প্রতিটি ২৫%।

**মনে রাখো**: ২৫০+ শব্দ, ৪০ মিনিট। প্রশ্ন হুবহু নকল কোরো না — paraphrase করো।`,
    questions: [],
  },
  {
    id: "wr-02",
    skill: "writing",
    title: "Task 1 Academic: Describing Charts",
    title_bn: "Task 1: চার্ট বর্ণনা",
    level: 2,
    content_md: `## IELTS Writing Task 1 (Academic)

### Structure (150+ words, 20 minutes)
1. **Introduction**: paraphrase the question (1–2 sentences).
2. **Overview**: 2–3 key trends, NO data yet (2 sentences). This decides your Task Achievement score.
3. **Details 1**: first grouping with data.
4. **Details 2**: second grouping with data.

### Language of change
- Rise: increase, rise, grow, climb, soar, surge
- Fall: decrease, decline, drop, fall, plummet, plunge
- Stable: remain stable, level off, plateau
- Adverbs: sharply, dramatically, slightly, gradually, steadily

### Comparing
- "X was **significantly higher than** Y."
- "While A rose, B fell."
- "In contrast…", "Similarly…"

### Never do this
- ❌ Give opinions ("I think this is bad")
- ❌ Write under 150 words
- ❌ Copy the question word-for-word
- ❌ Describe every single data point — **select** key features`,
    content_md_bn: `## Task 1 (বাংলা)

**গঠন**: ভূমিকা → Overview (মূল প্রবণতা, তথ্য ছাড়া) → বিস্তারিত ২ প্যারা।

**ভাষা**: rise/increase/soar (বাড়া), fall/decline/plummet (কমা), remain stable। তুলনায়: "significantly higher than", "while", "in contrast"।

**নিষেধ**: মতামত দিও না, ১৫০-এর কম শব্দ লিখো না, প্রতিটি তথ্য বর্ণনা কোরো না।`,
    questions: [],
  },
  // ---------------- SPEAKING ----------------
  {
    id: "sp-01",
    skill: "speaking",
    title: "Speaking Part 1: Natural Short Answers",
    title_bn: "স্পিকিং Part 1",
    level: 1,
    content_md: `## IELTS Speaking Part 1

### Format
- 4–5 minutes, familiar topics (home, work, hobbies, food).
- **Short answers**: 2–4 sentences each. Not one word, not a speech.

### The 3-step answer
1. **Direct answer** 2. **Extend** (reason/detail) 3. **Example** (optional)
- Q: "Do you like reading?"
- A: "Yes, I love it. (1) I usually read before bed because it helps me relax. (2) Last month I finished a novel about Dhaka's history. (3)"

### The 4 criteria
| Criterion | Tip |
|---|---|
| Fluency & Coherence | Keep going; link ideas (and, because, so) |
| Lexical Resource | Topic vocabulary; paraphrase the question |
| Grammatical Range | Mix tenses; some complex sentences |
| Pronunciation | Clear stress & rhythm; intelligibility > accent |

### Never memorise
Examiners spot memorised answers instantly — it **lowers** your score. Learn *ideas and phrases*, not scripts.`,
    content_md_bn: `## Speaking Part 1 (বাংলা)

পরিচিত বিষয়ে ছোট উত্তর (২–৪ বাক্য)। **পদ্ধতি**: সরাসরি উত্তর → বাড়াও (কারণ/বিস্তারিত) → উদাহরণ।

**মুখস্থ কোরো না** — পরীক্ষক ধরে ফেলেন, স্কোর কমে।`,
    questions: [],
  },
  {
    id: "sp-02",
    skill: "speaking",
    title: "Speaking Part 2: The Cue Card",
    title_bn: "স্পিকিং Part 2: Cue Card",
    level: 2,
    content_md: `## IELTS Speaking Part 2 — The Long Turn

### Format
- You get a **cue card** + 1 minute preparation + 1–2 minutes speaking.
- Use the prep minute: **notes, not sentences**.

### The 4-bullet structure
Most cue cards ask: **what / when / who / explain why**.
- "Describe a book you enjoyed."
- What: a novel called… / When: last year / Who: recommended by… / Why: the story taught me…

### Fill 2 minutes
- Past → present → future: "I first read it… Now I… I'd love to…"
- Add senses & feelings: "The ending was surprising; I felt…"
- If stuck: describe, compare, give an example — **keep talking**.

### Sample cue card
> Describe a skill you would like to learn.
> - What the skill is
> - Why you want to learn it
> - How you would learn it
> - And explain how it would help you.`,
    content_md_bn: `## Part 2 (বাংলা)

Cue card + ১ মিনিট প্রস্তুতি + ১–২ মিনিট বলা। প্রস্তুতিতে **নোট** লেখো, বাক্য নয়। what/when/who/why অনুযায়ী বলো। আটকে গেলে বর্ণনা দাও, তুলনা করো — **থেমো না**।`,
    questions: [],
  },
];
