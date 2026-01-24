import { describe, it } from "vitest";
import { cleanMarkdown } from "./cleaner";

describe("Manual Debug", () => {
  it("debug logs", async () => {
    console.log("--- List ---");
    const inputList = "List:\n- Item 1\n- Item 2\n\nEnd";
    console.log("Input:", JSON.stringify(inputList));
    console.log(
      "Output list:",
      JSON.stringify(await cleanMarkdown(inputList, { removeList: true })),
    );
  });
});
