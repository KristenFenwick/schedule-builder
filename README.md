# schedule-builder
Schedule builder app (WIP, PDF import in progress)
# Schedule Builder

A schedule-building app I’ve been developing in React/TypeScript.

## Status
Current version is functional, but PDF import is still in progress and may be unreliable.

## Current Features
- Manual schedule entry
- Timeline display
- Import/export utilities
- Quick-add form support

## Known Issues
- PDF import/parsing is not fully working yet
- On later versions the PDF library will load correctly but not parse the events distinctly
- Some edge cases may still cause bugs
- On later version the time reverts back to military time if text is pasted and a PDF is added in the same run 

## Versions
- `v0.1` — last working version without PDF import
- `pdf-import-attempt` branch — experimental PDF parsing work
