import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const tasksPath = join(import.meta.dirname, "..", "config", "tasks.yaml");
const doc = parseYaml(readFileSync(tasksPath, "utf-8")) as {
  tasks: Record<string, { grading: { grading_hint?: string } }>;
};

describe("list_labels grading hint", () => {
  const hint = doc.tasks.list_labels?.grading.grading_hint ?? "";

  it("requires the total to come from a complete listing", () => {
    expect(hint).toMatch(/complete listing/);
    expect(hint).toMatch(/pagination/);
    expect(hint).toMatch(/command itself reported the total/);
  });

  it("rejects a count equal to a single page size without evidence", () => {
    expect(hint).toMatch(/page size \(30 or 100\)/);
    expect(hint).toMatch(/without evidence of a complete listing is incorrect/);
  });
});
