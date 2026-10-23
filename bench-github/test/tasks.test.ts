import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { buildGradingPrompt } from "../src/grader.js";

const tasksPath = join(import.meta.dirname, "..", "config", "tasks.yaml");
const doc = parseYaml(readFileSync(tasksPath, "utf-8")) as {
  tasks: Record<string, { prompt: string; grading: { grading_hint?: string } }>;
};

describe("list_labels grading hint", () => {
  const task = doc.tasks.list_labels;
  const hint = task?.grading.grading_hint ?? "";

  it("carries the complete-listing requirement into the final judge prompt", () => {
    const prompt = buildGradingPrompt(task.prompt, "(trajectory)", hint);

    expect(prompt).toMatch(/complete listing/);
    expect(prompt).toMatch(/pagination/);
    expect(prompt).toMatch(/command itself reported the total/);
    expect(prompt).toMatch(/page size \(30 or 100\)/);
    expect(prompt).toMatch(
      /without evidence of a complete listing is incorrect/,
    );
  });

  it("does not impose a numeric floor on an otherwise complete total", () => {
    expect(hint).not.toMatch(/at least \d+/);
  });
});
