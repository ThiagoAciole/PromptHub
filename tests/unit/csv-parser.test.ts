import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { parseCsv } from "../../src/modules/imports/csv-parser.js";

describe("parseCsv", () => {
  it("parses quoted multiline CSV fields as a stream", async () => {
    const rows = [];
    for await (const item of parseCsv(Readable.from(['act,prompt\nTítulo,"linha 1\nlinha 2"\n']))) rows.push(item);
    expect(rows).toEqual([{ rowNumber: 2, row: { act: "Título", prompt: "linha 1\nlinha 2" } }]);
  });
});
