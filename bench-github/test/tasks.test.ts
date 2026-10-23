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

describe("dynamic-answer grading hints", () => {
  it("require list_releases to be graded on command-reported tags, not a pinned release", () => {
    const task = doc.tasks.list_releases;
    const prompt = buildGradingPrompt(
      task.prompt,
      "(trajectory)",
      task.grading.grading_hint,
    );

    expect(prompt).toMatch(/run a command to list releases/);
    expect(prompt).toMatch(/taken from the command output/);
    expect(prompt).toMatch(
      /without running a command.*(?:is a failure|are a failure)/,
    );
  });

  it("require repo_overview to be graded on command-reported fields, not a pinned star count", () => {
    const task = doc.tasks.repo_overview;
    const prompt = buildGradingPrompt(
      task.prompt,
      "(trajectory)",
      task.grading.grading_hint,
    );

    expect(prompt).toMatch(/run a command to fetch the repository/);
    expect(prompt).toMatch(
      /any specific count from the command output is correct/,
    );
  });
});
