import {
  Chart,
  PolarAngleAxis,
  PolarAngleLabel,
  PolarGrid,
  PolarLayout,
  PolarRadiusAxis,
  Radar,
} from "peculiar-charts";
import { createSignal } from "solid-js";

const scoresA = [
  { skill: "Speed", score: 84 },
  { skill: "Focus", score: 62 },
  { skill: "Craft", score: 91 },
  { skill: "Reach", score: 57 },
  { skill: "Trust", score: 78 },
];

const scoresB = [
  { skill: "Speed", score: 52 },
  { skill: "Focus", score: 88 },
  { skill: "Craft", score: 68 },
  { skill: "Reach", score: 84 },
  { skill: "Trust", score: 64 },
];

export default function AnimatedRadarDemo() {
  const [scores, setScores] = createSignal(scoresA);
  return (
    <div class="flex h-full flex-col gap-3">
      <button
        type="button"
        onClick={() => setScores((current) => (current === scoresA ? scoresB : scoresA))}
        class="w-fit rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
      >
        Toggle scores
      </button>
      <Chart data={scores()} inset={24} class="min-h-0 grow">
        <PolarLayout outerRadius="75%">
          <PolarAngleAxis dataKey="skill">
            <PolarAngleLabel class="fill-zinc-600 text-[10px]" />
          </PolarAngleAxis>
          <PolarRadiusAxis axisRange={[0, 100]} tickCount={4}>
            <PolarGrid class="stroke-zinc-300" />
          </PolarRadiusAxis>
          <Radar
            dataKey="score"
            class="text-violet-500"
            stroke-width={2}
            fillOpacity={0.25}
            animation={{ duration: 500 }}
          />
        </PolarLayout>
      </Chart>
    </div>
  );
}
