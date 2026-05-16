# Onboarding Guide: [Project Name]

## Overview

[2–3 sentences: what this project does and who it serves]

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Language | [detected] | [detected] |
| Framework | [detected] | [detected] |
| Database | [detected or N/A] | [detected or N/A] |
| Testing | [detected] | [detected] |

## Architecture

[Diagram or prose description of how the main pieces connect.
Trace the top-level data flow: entry point → business logic → persistence.]

## Key Entry Points

- **[Entry point 1]**: `[path]` — [one-line purpose]
- **[Entry point 2]**: `[path]` — [one-line purpose]
- **[Entry point 3]**: `[path]` — [one-line purpose]

## Directory Map

```
[dir1]/   → [purpose]
[dir2]/   → [purpose]
[dir3]/   → [purpose]
```

## Request Lifecycle

[Trace one representative request from entry to response:
1. Where does it enter?
2. How is it validated?
3. Where does business logic live?
4. How does it reach persistence / external services?
5. What shape does the response take?]

## Conventions

- **File naming**: [detected pattern]
- **Error handling**: [detected pattern]
- **Testing**: [detected pattern]
- **Git commits**: [detected pattern or "could not detect"]

## Common Tasks

| Task | Command |
|------|---------|
| Start dev server | `[detected]` |
| Run tests | `[detected]` |
| Run linter | `[detected]` |
| Production build | `[detected]` |

## Where to Look

| I want to… | Look at… |
|------------|----------|
| [common task 1] | `[path]` |
| [common task 2] | `[path]` |
| [common task 3] | `[path]` |
| Add a test | `[test dir]` matching the source path |
