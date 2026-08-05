import type { Nodes, Root as HTMLRoot } from "hast";
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

// Like hast-util-to-string's toString, but joins siblings with a space so that
// text in adjacent block elements (e.g. table cells) does not get mashed into a
// single token. The search index tokenizes on whitespace, so without this, words
// from neighbouring cells become unsearchable.
const toPlainText = (node: Nodes): string =>
  node.type === "text"
    ? node.value
    : "children" in node
      ? node.children.map(toPlainText).join(" ")
      : "";

export const Description: QuartzTransformerPlugin<Partial<DescriptionOptions>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "Description",
    htmlPlugins() {
      return [
        () => {
          return async (tree: HTMLRoot, file: VFile) => {
            let frontMatterDescription = (
              file.data.frontmatter as Record<string, unknown> | undefined
            )?.description as string | undefined;
            let text = escapeHTML(toPlainText(tree));

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
