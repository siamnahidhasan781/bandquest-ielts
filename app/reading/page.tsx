"use client";
import { SkillPage } from "@/components/SkillPage";
import { Markdown } from "@/components/Markdown";

export default function Reading() {
  return (
    <SkillPage
      kind="reading"
      title="Reading Academy"
      titleBn="রিডিং একাডেমি"
      icon="📖"
      extra={(ep, x) =>
        x.passage ? (
          <div className="mt-4 rounded-2xl border border-navy-200 bg-navy-50/50 p-6 dark:border-navy-700 dark:bg-navy-800/30">
            <h3 className="mb-3 font-semibold">📄 Reading passage</h3>
            <Markdown text={x.passage} />
          </div>
        ) : null
      }
    />
  );
}
