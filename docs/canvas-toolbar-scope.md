# Canvas Toolbar Scope (GIE-77 and follow-up tickets)

## GIE-77 (this PR): Layout only

GIE-77 delivers the **three-slot toolbar layout** for the Canvas frame:

- **Left slot** – align start, grows to fill space
- **Center slot** – centered actions
- **Right slot** – align end

`CanvasToolbar` accepts optional `left`, `center`, and `right` ReactNode props. Slot content and behavior are out of scope for GIE-77.

## Full toolbar implementation (preserved)

The full toolbar implementation (toggle, artifact switcher, editable title, undo/redo, time controls, overflow menu, close, etc.) is preserved for use by the follow-up tickets.

- **Branch:** `GIE-77-full-toolbar-wip`
- **Use it as:** Reference or base when implementing slot content. Branch from it or copy the relevant sections into the tickets below.

## Scope moved to next sprint

| Ticket   | Scope (from full toolbar)        | Where to start |
|----------|-----------------------------------|----------------|
| GIE-78   | Left slot: toggle, artifact switcher, title | Branch `GIE-77-full-toolbar-wip` → `CanvasToolbar.tsx` left-slot JSX, `ArtifactOption`, `onArtifactSelect`, `onTitleChange`, `onArtifactRename` |
| GIE-340  | Per ticket description/AC         | Same branch, relevant section |
| GIE-342  | Per ticket description/AC         | Same branch, relevant section |
| GIE-344  | Per ticket description/AC         | Same branch, relevant section |
| GIE-346  | Backend integration for actions   | Same branch + backend specs |

Ticket descriptions and acceptance criteria are in Jira for GIE-78, GIE-340, GIE-342, GIE-344, GIE-346.
