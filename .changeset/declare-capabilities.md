---
"@quartz-community/description": patch
---

The manifest declares what the plugin provides and uses (`quartz.capabilities`): it provides page descriptions and text, and optionally uses parsed frontmatter (for `description` / `socialDescription`). Quartz 5.1+ uses this to report missing providers at build time; older versions ignore the field.
