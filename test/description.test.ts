import { describe, expect, it } from "vitest";
import type { Root } from "hast";
import { VFile } from "vfile";
import type { BuildCtx } from "@quartz-community/types";
import { Description } from "../src/index";
import type { DescriptionOptions } from "../src/index";

const tree = (...paragraphs: string[]): Root => ({
  type: "root",
  children: paragraphs.map((value) => ({
    type: "element",
    tagName: "p",
    properties: {},
    children: [{ type: "text", value }],
  })),
});

async function describePage(
  root: Root,
  frontmatter: Record<string, unknown> = {},
  opts?: Partial<DescriptionOptions>,
) {
  const file = new VFile("");
  file.data.frontmatter = frontmatter as never;
  const [attacher] = Description(opts).htmlPlugins!({} as BuildCtx) as (() => (
    t: Root,
    f: VFile,
  ) => Promise<void>)[];
  await attacher!()(root, file);
  return file.data as { description?: string; text?: string };
}

/** a sentence of exactly 40 characters, full stop included */
const sentence = (n: number) => `Sentence ${n} ${"x".repeat(28 - String(n).length + 1)}.`;

describe("Description", () => {
  it("builds the description from whole sentences up to descriptionLength (150)", async () => {
    // 40 characters each: three fit in 150 with their spaces, a fourth doesn't
    const body = [1, 2, 3, 4, 5].map((n) => sentence(n)).join(" ");
    const { description, text } = await describePage(tree(body));
    expect(description).toBe([1, 2, 3].map((n) => sentence(n)).join(" "));
    expect(text).toBe(body);
  });

  it("honours descriptionLength, counting the space between sentences", async () => {
    const body = [1, 2, 3].map((n) => sentence(n)).join(" ");
    expect(sentence(1)).toHaveLength(40);
    // two sentences and a space: 81
    expect((await describePage(tree(body), {}, { descriptionLength: 81 })).description).toBe(
      `${sentence(1)} ${sentence(2)}`,
    );
    expect((await describePage(tree(body), {}, { descriptionLength: 80 })).description).toBe(
      sentence(1),
    );
  });

  it("always keeps the first sentence, truncated at maxDescriptionLength with ...", async () => {
    const long = `${"word ".repeat(80).trim()}.`; // 400 characters, one sentence
    expect((await describePage(tree(long))).description).toBe(`${long.slice(0, 300)}...`);
    expect((await describePage(tree(long), {}, { maxDescriptionLength: 50 })).description).toBe(
      `${long.slice(0, 50)}...`,
    );
  });

  it("uses the frontmatter description as is, but still records the page text", async () => {
    const data = await describePage(tree("Body text. More."), { description: "Hand written" });
    expect(data.description).toBe("Hand written");
    expect(data.text).toBe("Body text. More.");
  });

  it("replaces external links with their domain and path, in text and frontmatter", async () => {
    const data = await describePage(tree("See https://example.com/docs/page?x=1 now."), {
      description: "From http://www.example.org/a/b.",
    });
    expect(data.description).toBe("From www.example.org/a/b.");
    expect(data.text).toBe("See example.com/docs/page now.");
  });

  it("keeps links with replaceExternalLinks: false", async () => {
    const data = await describePage(
      tree("See https://example.com/docs now."),
      { description: "At https://example.org/x" },
      { replaceExternalLinks: false },
    );
    expect(data.description).toBe("At https://example.org/x");
    expect(data.text).toBe("See https://example.com/docs now.");
  });

  it("collapses whitespace and HTML-escapes the generated description", async () => {
    const data = await describePage(tree("Tom & Jerry\n\n  <3 cheese"));
    expect(data.description).toBe("Tom &amp; Jerry &lt;3 cheese.");
    expect(data.text).toBe("Tom &amp; Jerry\n\n  &lt;3 cheese");
  });

  it("gives an empty description for an empty page", async () => {
    expect((await describePage(tree())).description).toBe("");
  });

  // bug: a frontmatter description that YAML parses as a non-string (`description: 2024`,
  // `description: [a, b]`) is passed to String.prototype.replace and throws, failing the page.
  it.fails("doesn't fail on a numeric frontmatter description", async () => {
    const data = await describePage(tree("Body."), { description: 2024 });
    expect(data.description).toBe("2024");
  });
});
