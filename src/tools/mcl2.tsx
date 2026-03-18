import ArrowLeft from "lucide-solid/icons/arrow-left";
import ArrowRight from "lucide-solid/icons/arrow-right";
import { For, Show, createMemo, createSignal } from "solid-js";

const data = [
  { color: "bg-red-500", value: 7 },
  { color: "bg-orange-500", value: 3 },
  { color: "bg-yellow-400", value: 6 },
  { color: "bg-green-500", value: 2 },
  { color: "bg-blue-500", value: 5 },
  { color: "bg-indigo-700", value: 4 },
  { color: "bg-violet-500", value: 1 },
] as const;

const lines = [0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7] as const;
const sum = 28;
const offset = 0.7 / 14;

export function ParticlesVertical() {
  return (
    <div class="flex flex-col gap-3">
      <For each={data}>
        {(item) => (
          <div class="flex gap-3">
            <div
              class={`h-7 rounded-full pt-0.5 text-center opacity-75 ${item.color}`}
              style={{ width: `${item.value * 10}%` }}
            />
            weight: {item.value}
          </div>
        )}
      </For>
    </div>
  );
}

export function ParticlesPercent() {
  return (
    <div class="flex">
      <For each={data}>
        {(item) => (
          <div
            class="flex flex-col gap-3 text-center"
            style={{ width: `${(100 * item.value) / sum}%` }}
          >
            <div
              class={`h-7 rounded-lg pt-0.5 text-center opacity-75 ${item.color}`}
            />
            {`${((100 * item.value) / sum).toFixed(0)}%`}
          </div>
        )}
      </For>
    </div>
  );
}

export function ParticlesLines() {
  return (
    <div class="flex flex-col">
      <div class="relative mb-5 flex w-full">
        <For each={lines}>
          {(line) => (
            <div
              class="absolute translate-x-1/4"
              style={{ left: `${100 * line}%` }}
            >
              ↓
            </div>
          )}
        </For>
      </div>
      <ParticlesPercent />
    </div>
  );
}

export function ParticlesLines2() {
  return (
    <div class="flex flex-col">
      <div class="relative mb-5 flex w-full">
        <div
          class="absolute h-3 translate-y-1/2 border-r border-l border-foreground/60"
          style={{ width: `${100 * offset}%` }}
        >
          <div class="mt-[0.3125rem] h-0.5 w-full bg-foreground/60" />
        </div>
        <For each={lines}>
          {(line) => (
            <div class="absolute" style={{ left: `${100 * (line + offset)}%` }}>
              ↓
            </div>
          )}
        </For>
      </div>
      <ParticlesPercent />
    </div>
  );
}

const colorFor = (line: number) => {
  let total = 0;
  for (const item of data) {
    total += item.value / sum;
    if (total > line) {
      return item.color;
    }
  }
  return "";
};

export function ParticlesLines3() {
  return (
    <div class="flex flex-col">
      <div class="relative mb-5 flex w-full">
        <For each={lines}>
          {(line) => (
            <div
              class={`absolute aspect-square h-4 rounded-full ${colorFor(line)}`}
              style={{ left: `${100 * (line + offset)}%` }}
            />
          )}
        </For>
      </div>
      <ParticlesPercent />
    </div>
  );
}

const sumFor = (count: number) =>
  data.slice(0, count).reduce((acc, item) => acc + (item.value / sum) * 100, 0);

const steps = [
  {
    sum: 0,
    line: 0,
    lineForList: 0,
    particle: null,
    message: "Basic setup of particles, lines, and current line",
  },
  {
    sum: 0,
    line: 0,
    lineForList: 0,
    particle: 0,
    message:
      "Start iterating through particles, starting with the first (red).",
  },
  {
    sum: sumFor(1),
    line: 0,
    lineForList: 0,
    particle: 0,
    message: "Add particle weight to sum",
  },
  {
    sum: sumFor(1),
    line: 0,
    lineForList: 1,
    particle: 0,
    message:
      "Since the current line's value is less than the running sum, we copy the current particle to our new list and move to the next line.",
  },
  {
    sum: sumFor(1),
    line: 1,
    lineForList: 2,
    particle: 0,
    message:
      "The second line's value is still less than the running sum, so we repeat.",
  },
  {
    sum: sumFor(1),
    line: 2,
    lineForList: 2,
    particle: 0,
    message:
      "The third line's value is more than the running sum, so we move on to the next particle.",
  },
  {
    sum: sumFor(2),
    line: 2,
    lineForList: 2,
    particle: 1,
    message: "Update our running sum for the second particle.",
  },
  {
    sum: sumFor(2),
    line: 2,
    lineForList: 3,
    particle: 1,
    message:
      "Now the third line's value is less than the running sum, so we copy the current particle to our new list and move on to the next line.",
  },
  {
    sum: sumFor(2),
    line: 3,
    lineForList: 3,
    particle: 1,
    message:
      "The fourth line's value is more than the running sum, so we move on to the next particle.",
  },
  {
    sum: sumFor(3),
    line: 3,
    lineForList: 3,
    particle: 2,
    message: "Update our running sum for the third particle.",
  },
  {
    sum: sumFor(3),
    line: 3,
    lineForList: 4,
    particle: 2,
    message:
      "Now the fourth line's value is less than the running sum, so we copy the current particle to our new list and move on to the next line.",
  },
  {
    sum: sumFor(3),
    line: 4,
    lineForList: 4,
    particle: 2,
    message:
      "The fifth line's value is more than the running sum, so we move on to the next particle.",
  },
  {
    sum: sumFor(3),
    line: 4,
    lineForList: 4,
    particle: 3,
    message: "Update our running sum for the fourth particle.",
  },
  {
    sum: sumFor(4),
    line: 4,
    lineForList: 5,
    particle: 3,
    message:
      "Now the fifth line's value is less than the running sum, so we copy the current particle to our new list and move on to the next line.",
  },
  {
    sum: sumFor(4),
    line: 5,
    lineForList: 5,
    particle: 3,
    message:
      "The sixth line's value is more than the running sum, so we move on to the next particle.",
  },
  {
    sum: sumFor(4),
    line: 5,
    lineForList: 5,
    particle: 4,
    message: "Update our running sum for the fifth particle.",
  },
  {
    sum: sumFor(5),
    line: 5,
    lineForList: 6,
    particle: 4,
    message:
      "Now the sixth line's value is less than the running sum, so we copy the current particle to our new list and move on to the next line.",
  },
  {
    sum: sumFor(5),
    line: 6,
    lineForList: 6,
    particle: 4,
    message:
      "The seventh line's value is more than the running sum, so we move on to the next particle.",
  },
  {
    sum: sumFor(6),
    line: 6,
    lineForList: 6,
    particle: 5,
    message: "Update our running sum for the sixth particle.",
  },
  {
    sum: sumFor(6),
    line: 6,
    lineForList: 7,
    particle: 5,
    message:
      "Now the seventh line's value is less than the running sum, so we copy the current particle to our new list and move on to the next line.",
  },
  {
    sum: sumFor(7),
    line: null,
    lineForList: 7,
    particle: null,
    message:
      "But wait, there is no next line! Voila - we've now successfully associated each line to its respective particle, and thus determined our list of new particles.",
  },
] as const;

export function StepThrough() {
  const [step, setStep] = createSignal(0);
  const state = createMemo(() => steps[step()]);

  return (
    <div class="flex flex-col">
      <div class="flex">
        <div class="flex w-full flex-col">
          <div class="relative mb-8">
            <For each={lines}>
              {(line, index) => (
                <div
                  class="absolute flex -translate-x-1/2 -translate-y-6 flex-col text-center transition-all"
                  style={{ left: `${100 * (line + offset)}%` }}
                >
                  <span class="text-foreground/50">
                    {`${(100 * (line + offset)).toFixed()}%`}
                  </span>
                  <span
                    class={
                      index() === state().line
                        ? "rounded-full bg-foreground/20 px-2 py-0"
                        : ""
                    }
                  >
                    ↓
                  </span>
                </div>
              )}
            </For>
          </div>
          <div class="flex gap-1">
            <For each={data}>
              {(item, index) => (
                <div
                  class="flex flex-col gap-1 text-center text-sm"
                  style={{ width: `${(100 * item.value) / sum}%` }}
                >
                  <div
                    class={`h-7 rounded-lg pt-0.5 text-center transition-all ${index() === state().particle ? "opacity-100 ring-[2.5px]" : "opacity-75"} ${item.color}`}
                  />
                  {`${((100 * item.value) / sum).toFixed()}%`}
                </div>
              )}
            </For>
          </div>
        </div>
        <p class="my-auto w-40 pl-5 font-mono text-lg transition-all">
          sum = {state().sum.toFixed()}%
        </p>
      </div>
      <p class="mx-auto flex w-full text-lg text-foreground/70">
        <button
          class="rounded-md border border-border p-2 transition-colors hover:bg-muted disabled:opacity-50"
          disabled={step() === 0}
          onClick={() => setStep((current) => current - 1)}
        >
          <ArrowLeft />
        </button>
        <span class="my-auto mx-auto text-center font-bold">{state().message}</span>
        <button
          class="rounded-md border border-border p-2 transition-colors hover:bg-muted disabled:opacity-50"
          disabled={step() === steps.length - 1}
          onClick={() => setStep((current) => current + 1)}
        >
          <ArrowRight />
        </button>
      </p>
      <div class="mx-auto flex gap-2 transition-all">
        <span class="my-auto">new particle list:</span>
        <Show when={state().lineForList} fallback="[empty]">
          <For each={lines.slice(0, state().lineForList)}>
            {(line) => (
              <div
                class={`my-auto h-4 w-4 rounded-full opacity-90 transition-all ${colorFor(line)}`}
              />
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}
