import React, { useEffect, useRef, useState } from "react";

type Props = {
  lines: string[];
  typeSpeedMs: number;
  backspaceSpeedMs: number;
  loop: boolean;
  pauseBetweenLoopsMs: number;
  cursor: boolean;
  startDelayMs?: number;
  maxLines?: number;
};

export const TerminalTyper: React.FC<Props> = (props) => {
  const {
    lines,
    typeSpeedMs,
    backspaceSpeedMs: _backspaceSpeedMs,
    loop,
    pauseBetweenLoopsMs,
    cursor,
    startDelayMs = 300,
    maxLines = 400,
  } = props;

  const [output, setOutput] = useState<string[]>([]);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [output]);

  useEffect(() => {
    let mounted = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, isReduced ? 0 : ms));
    const clamp = (arr: string[]) =>
      arr.length > maxLines ? arr.slice(arr.length - maxLines) : arr;

    (async () => {
      setOutput([""]);
      await sleep(startDelayMs);

      do {
        let newOutput: string[] = [""];
        for (const line of lines) {
          if (!mounted) return;

          let cur = "";
          for (let i = 0; i < line.length; i++) {
            if (!mounted) return;
            cur += line[i];
            newOutput[newOutput.length - 1] = cur;
            setOutput(clamp([...newOutput]));
            await sleep(typeSpeedMs);
          }

          newOutput.push("");
          setOutput(clamp([...newOutput]));

          await sleep(200);
        }

        await sleep(pauseBetweenLoopsMs);
        if (loop && mounted) {
          newOutput = [""];
          setOutput(newOutput);
        }
      } while (loop && mounted);
    })();

    return () => {
      mounted = false;
    };
  }, [lines, typeSpeedMs, pauseBetweenLoopsMs, loop, isReduced, startDelayMs, maxLines]);

  return (
    <div className="rounded-xl border border-subtle bg-surface-soft shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-subtle bg-surface-elev">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-muted">root@tri-yatna</span>
      </div>

      <div
        ref={bodyRef}
        className="h-64 md:h-72 lg:h-80 overflow-auto p-4 font-mono text-sm leading-6"
        aria-live="polite"
      >
        {output.map((l, idx) => (
          <div key={idx} className="whitespace-pre-wrap">
            <span className="accent">root@tri-yatna:~#</span> {l}
            {cursor && idx === output.length - 1 && <span className="animate-pulse">▋</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
