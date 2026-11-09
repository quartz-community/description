# @quartz-community/description

Generates page descriptions for use in meta tags, the RSS feed and folder/tag listings.

A frontmatter `description` is used as-is. Otherwise the description is built from the first sentences of the content: whole sentences are added while the description stays within `descriptionLength` (the sentence that would exceed it is left out, but the first sentence is always kept), and the result is truncated with an ellipsis at `maxDescriptionLength`.

## Installation

```bash
npx quartz plugin add @quartz-community/description
```

It is already included (and enabled) in the default `quartz.config.yaml`.

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: "@quartz-community/description"
    enabled: true
    options:
      descriptionLength: 150
      maxDescriptionLength: 300
      replaceExternalLinks: true
    order: 70
```

For advanced use cases, you can override in TypeScript:

```ts title="quartz.ts (override)"
import * as ExternalPlugin from "./.quartz/plugins";

ExternalPlugin.Description({
  descriptionLength: 150,
});
```

## Configuration

| Option                 | Type      | Default | Description                                                                                    |
| ---------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------- |
| `descriptionLength`    | `number`  | `150`   | Target length; whole sentences are added up to this length.                                    |
| `maxDescriptionLength` | `number`  | `300`   | Hard maximum; longer generated descriptions are truncated with `...`.                          |
| `replaceExternalLinks` | `boolean` | `true`  | Replace external links (in generated and frontmatter descriptions) with their domain and path. |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/plugins/Description) for more information.

## License

MIT
