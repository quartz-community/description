import { toString } from 'hast-util-to-string';
import { escapeHTML } from '@quartz-community/utils';

// src/transformer.ts
var defaultOptions = {
  descriptionLength: 150,
  maxDescriptionLength: 300,
  replaceExternalLinks: true
};
var urlRegex = new RegExp(
  /(https?:\/\/)?(?<domain>([\da-z.-]+)\.([a-z.]{2,6})(:\d+)?)(?<path>[/\w.-]*)(\?[/\w.=&;-]*)?/,
  "g"
);
var Description = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "Description",
    htmlPlugins() {
      return [
        () => {
          return async (tree, file) => {
            let frontMatterDescription = file.data.frontmatter?.description;
            let text = escapeHTML(toString(tree));
            if (opts.replaceExternalLinks) {
              frontMatterDescription = frontMatterDescription?.replace(
                urlRegex,
                "$<domain>$<path>"
              );
              text = text.replace(urlRegex, "$<domain>$<path>");
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
            file.data.description = finalDesc.length > opts.maxDescriptionLength ? finalDesc.slice(0, opts.maxDescriptionLength) + "..." : finalDesc;
            file.data.text = text;
          };
        }
      ];
    }
  };
};

export { Description };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map