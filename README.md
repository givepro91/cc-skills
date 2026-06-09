# cc-skills

> A small marketplace of [Claude Code](https://docs.claude.com/en/docs/claude-code) skills.

## Plugins

### `claude-md` — generate & maintain CLAUDE.md, and learn from mistakes

Two skills that make a repo's AI working rules consistent and self-improving:

- **`/claude-md`** — generate or refresh `CLAUDE.md` for a new *or* existing project. Hybrid model: a **tailored preamble** (scanned stack + build/test/run commands) plus an **idempotent managed block** holding:
  - **Working Discipline** — think-before-coding, simplicity-first, surgical changes, goal-driven (Karpathy).
  - **Verification** — always give yourself a way to verify; report honestly (the biggest quality lever).
  - **Parallel Git Workflow** — *adaptive*: `team` (issue → branch → worktree → PR), `solo` (branch/worktree per task, no PR ceremony), or `none` (not a git repo). One branch = one handoff if [cc-handoff](https://github.com/givepro91/cc-handoff) is installed.
  - **Self-Learning Rules** — a growing list, fed by `/learn`.

  **Canonical-file aware:** writes the block to the file every agent on the repo reads. Default is `CLAUDE.md`; but if the repo is multi-tool — `CLAUDE.md` is a symlink to `AGENTS.md`, or imports it via `@AGENTS.md` (so Codex reads `AGENTS.md` too) — the block goes into **`AGENTS.md`** instead (with a confirm prompt), and `CLAUDE.md` stays the thin pointer. The block lives in exactly one file, never split or duplicated.

  Re-runnable: it only ever rewrites its own `<!-- CC-RULES:START -->…<!-- CC-RULES:END -->` block — your hand-written content (and any OMC block) is left untouched. Accumulated learned rules survive regeneration.

- **`/learn`** — turn a mistake into a durable rule. After Claude does something wrong and you correct it, run `/learn`; it distills the correction into one concise rule and appends it (deduped) to the Self-Learning Rules. This is the "compounding engineering" loop — every mistake sharpens the rules, and they load every session because they live in `CLAUDE.md`.

## Why

- **Karpathy's discipline** — minimum code, surgical changes, state assumptions, define success and loop until verified.
- **Anthropic best practice** — a team shares one git-checked `CLAUDE.md` and *adds a rule whenever Claude misbehaves*; give Claude a way to verify its work (2–3× quality).
- **Parallel work needs isolation** — running several Claudes at once collides on a single branch; a worktree per task (issue/branch/PR for teams) keeps them apart.

## Install

```sh
/plugin marketplace add givepro91/cc-skills
/plugin install claude-md@cc-skills
```

Or from a local clone:

```sh
/plugin marketplace add /path/to/cc-skills
/plugin install claude-md@cc-skills
```

## Usage

```sh
/claude-md            # generate/refresh CLAUDE.md (auto-detects team/solo/none, English)
/claude-md --ko       # Korean prose in the managed block
/claude-md --solo     # force the solo git-workflow variant
/learn                # distill the latest correction into a rule
/learn "always run the full test suite before claiming done"
```

## What the managed block looks like

```markdown
<!-- CC-RULES:START -->
<!-- Managed by /claude-md. Edits inside this block are overwritten on regen; put custom rules outside it. -->

## Working Discipline
- Think before coding · Simplicity first · Surgical changes · Goal-driven

## Verification
- Always give yourself a way to verify; report honestly.

## Parallel Git Workflow
- One task = one ISSUE = one branch = one worktree; small PRs referencing the issue.

## Self-Learning Rules
<!-- LEARN:ANCHOR -->
- (2026-06-08) Before changing a shared function's signature, grep all call sites.
<!-- CC-RULES:END -->
```

## Project structure

```
cc-skills/
├── .claude-plugin/marketplace.json
└── plugins/claude-md/
    ├── .claude-plugin/plugin.json
    ├── scripts/
    │   ├── apply-block.mjs      # idempotent CC-RULES block upsert (preserves learned rules)
    │   └── append-rule.mjs      # dedup append into Self-Learning Rules
    └── skills/
        ├── claude-md/SKILL.md   # the generator
        └── learn/SKILL.md       # /learn
```

Scripts are plain Node ESM (no dependencies). Requires a recent Node on `PATH`.

## License

MIT © 2026 Jay (Spacewalk)
