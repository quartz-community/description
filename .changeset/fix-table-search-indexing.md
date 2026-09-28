---
"@quartz-community/description": patch
---

Fix table cell content being mashed together in the search index. Text from
adjacent table cells (and other neighbouring block elements) was concatenated
with no separator, producing single tokens like `tablequeryFind` that
FlexSearch could not match.
