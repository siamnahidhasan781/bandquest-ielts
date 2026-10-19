"use client";
import { SkillPage, TtsPlayer } from "@/components/SkillPage";
import { Markdown } from "@/components/Markdown";

export default function Listening() {
  return (
    <SkillPage
      kind="listening"
      title="Listening Academy"
      titleBn="লিসেনিং একাডেমি"
      icon="🎧"
      extra={(ep, x) =>
        x.audio_script ? <TtsPlayer script={x.audio_script} /> : null
      }
    />
  );
}
