import Link from "next/link";

const FEATURES = [
  { title: "Gamified IELTS Journey", desc: "From zero English to IELTS-ready across Beginner, Intermediate and Pro levels — with mastery checkpoints that truly unlock.", href: "/journey", icon: "🗺️" },
  { title: "Listening Academy", desc: "Accents, keywords, paraphrases and every IELTS question type with original audio practice.", href: "/listening", icon: "🎧" },
  { title: "Reading Academy", desc: "Skimming, scanning and Academic/General Training strategies with original passages.", href: "/reading", icon: "📖" },
  { title: "Writing Academy", desc: "Task 1 & 2 with rubric-based AI feedback, model answers and rewrite guidance.", href: "/writing", icon: "✍️" },
  { title: "Speaking Academy", desc: "Parts 1–3 with an AI examiner, recording, transcription and criterion feedback.", href: "/speaking", icon: "🎙️" },
  { title: "Grammar Academy", desc: "10 foundation episodes plus standalone mastery tracking — Bengali explanations included.", href: "/grammar", icon: "📐" },
  { title: "Vocabulary Academy", desc: "Topic-based IELTS vocabulary with spaced repetition and collocations.", href: "/vocabulary", icon: "📚" },
  { title: "Mock Test Centre", desc: "Realistic timed Academic & General Training mocks with estimated band reports.", href: "/mock", icon: "⏱️" },
  { title: "Mistake Notebook", desc: "Every error is logged, categorised and scheduled for revision.", href: "/revision", icon: "📝" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="rounded-3xl bg-navy-900 px-6 py-14 text-center text-white sm:px-12 dark:bg-navy-800">
        <p className="mb-4 inline-block rounded-full bg-accent-500/20 px-4 py-1 text-sm font-medium text-accent-200">
          100% free for learners · No paywalls
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          From Zero to <span className="text-accent-400">IELTS-Ready</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-100">
          A complete AI-powered IELTS ecosystem: gamified journey, four-skill academies,
          grammar & vocabulary with Bengali explanations, realistic mock tests and an AI examiner.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="rounded-xl bg-accent-500 px-6 py-3 font-semibold text-navy-950 hover:bg-accent-400">
            Start learning free
          </Link>
          <Link href="/journey" className="rounded-xl border border-navy-600 px-6 py-3 font-semibold hover:bg-navy-800">
            Explore the journey
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-navy-200">
          <span>🎯 Target bands 6.0–9.0</span>
          <span>🌐 EN + বাংলা</span>
          <span>🤖 Gemini AI feedback</span>
          <span>📱 Web · PWA · Mobile</span>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">How BandQuest teaches</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Teach before testing", "Every episode teaches first — with Bengali explanations where they help."],
            ["Explain mistakes", "Never just a score: every wrong answer gets a clear explanation."],
            ["Mastery unlocks", "Next lesson unlocks at 70%+ — no click-through progress."],
            ["Spaced revision", "Weak words, grammar and mistakes resurface until truly learned."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-navy-100 p-5 dark:border-navy-800">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">Everything in one place</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className="group rounded-2xl border border-navy-100 p-5 transition hover:border-accent-400 hover:shadow-lg dark:border-navy-800">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-2 font-semibold group-hover:text-accent-600">{f.title}</h3>
              <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Honesty note */}
      <section className="mt-12 rounded-2xl bg-amber-50 p-6 text-sm dark:bg-amber-900/20">
        <h2 className="font-bold text-amber-900 dark:text-amber-200">An honest note</h2>
        <p className="mt-2 text-amber-800 dark:text-amber-100">
          BandQuest gives you structure, teaching and honest feedback — but no platform can guarantee a band score.
          Your result depends on your starting level, practice quality and consistency. AI band estimates are
          educational guidance, never official scores. Our practice materials are original; for official sample
          papers, see <a className="underline" href="https://ielts.org/take-a-test/test-format">ielts.org</a>.
        </p>
      </section>
    </div>
  );
}
