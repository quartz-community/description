import type { Root as HTMLRoot } from "hast";
import { toString } from "hast-util-to-string";
import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { escapeHTML } from "@quartz-community/utils";
import type { VFile } from "vfile";

export interface DescriptionOptions {
  descriptionLength: number;
  maxDescriptionLength: number;
  replaceExternalLinks: boolean;
}

const defaultOptions: DescriptionOptions = {
  descriptionLength: 150,
  maxDescriptionLength: 300,
  replaceExternalLinks: true,
};

const urlRegex = new RegExp(
  /(https?:\/\/)?(?<domain>([\da-z.-]+)\.([a-z.]{2,6})(:\d+)?)(?<path>[/\w.-]*)(\?[/\w.=&;-]*)?/,
  "g",
);

/**
 * The frontmatter description as text. YAML reads `description: 2024` as a number and
 * `description: [a, b]` as a list; those become "2024" and "a, b". Anything else (an object, an
 * empty value) counts as no description, and the page text is used instead.
 */
function frontmatterDescriptionText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) {
    const items = value
      .map(frontmatterDescriptionText)
      .filter((item): item is string => item !== undefined && item !== "");
    return items.length > 0 ? items.join(", ") : undefined;
  }
  return undefined;
}

export const Description: QuartzTransformerPlugin<Partial<DescriptionOptions>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "Description",
    htmlPlugins() {
      return [
        () => {
          return async (tree: HTMLRoot, file: VFile) => {
            let frontMatterDescription = frontmatterDescriptionText(
              (file.data.frontmatter as Record<string, unknown> | undefined)?.description,
            );
            let text = escapeHTML(toString(tree));

            if (opts.replaceExternalLinks) {
              frontMatterDescription = frontMatterDescription?.replace(
                urlRegex,
                "$<domain>" + "$<path>",
              );
              text = text.replace(urlRegex, "$<domain>" + "$<path>");
            }

            if (frontMatterDescription) {
              file.data.description = frontMatterDescription;
              file.data.text = text;
              return;
            }

            const desc = text;
            const sentences = desc.replace(/\s+/g, " ").split(/\.\s/);
            let finalDesc = "";
            let sentenceIdx = 0;

            while (sentenceIdx < sentences.length) {
              const sentence = sentences[sentenceIdx];
              if (!sentence) break;

              const currentSentence = sentence.endsWith(".") ? sentence : sentence + ".";
              const nextLength = finalDesc.length + currentSentence.length + (finalDesc ? 1 : 0);

              if (nextLength <= opts.descriptionLength || sentenceIdx === 0) {
                finalDesc += (finalDesc ? " " : "") + currentSentence;
                sentenceIdx++;
              } else {
                break;
              }
            }

            file.data.description =
              finalDesc.length > opts.maxDescriptionLength
                ? finalDesc.slice(0, opts.maxDescriptionLength) + "..."
                : finalDesc;
            file.data.text = text;
          };
        },
      ];
    },
  };
};
