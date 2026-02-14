# @quartz-community/description

Generates page descriptions from content for use in meta tags and RSS feeds.

## Installation

```bash
npx quartz plugin add github:quartz-community/description
```

## Usage

```ts
// quartz.config.ts
import * as ExternalPlugin from "./.quartz/plugins"

const config: QuartzConfig = {
  plugins: {
    transformers: [
      ExternalPlugin.Description(),
    ],
  },
}
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| descriptionLength | `number` | `150` | The length of the description to generate. |
| maxDescriptionLength | `number` | `300` | The maximum length of the description. |
| replaceExternalLinks | `boolean` | `true` | Whether to replace external links in the description. |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/) for more information.

## License

MIT
