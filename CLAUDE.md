# CLAUDE.md

A Claude Code **skills marketplace**. The `claude-md` plugin provides `/claude-md` (CLAUDE.md generator) and `/learn` (self-learning rules). Hook-free; scripts are plain Node ESM with no dependencies.

## Project
- **Layout:** `plugins/claude-md/{skills,scripts}` · manifests in `.claude-plugin/marketplace.json` and `plugins/claude-md/.claude-plugin/plugin.json`.
- **Verify:** `node --check plugins/claude-md/scripts/*.mjs` + validate the JSON manifests. No build, no deps (recent Node on PATH).
- **Key invariant:** `/claude-md` only ever rewrites its own managed `CC-RULES` block; never touch a user's content outside it, and preserve `/learn` rules across regeneration.

<!-- CC-RULES:START -->
<!-- Managed by /claude-md. Edits inside this block are overwritten on regen; put custom rules outside it. -->

## Working Discipline
- **Think before coding.** State assumptions; if uncertain, ask. Surface tradeoffs and competing interpretations instead of silently picking one.
- **Simplicity first.** Write the minimum code that solves the stated problem. No speculative features, abstractions, or configuration for single-use code.
- **Surgical changes.** Touch only what the task requires. Don't refactor or reformat adjacent code; match the existing style. Remove only what your change made unused.
- **Goal-driven.** Define a concrete success check (test / build / command / screenshot) before coding, then loop until it passes.

## Verification
- Always give yourself a way to verify — a test, a bash command, a curl, a screenshot. A working feedback loop is the single biggest quality lever.
- Report honestly: if a check fails, say so with the output; mark unverified work "unverified". Never present incomplete work as done.

## Parallel Git Workflow
- Never work on or commit to the default branch (`main`/`master`). **One task = one ISSUE = one branch.**
- **Create the branch/worktree BEFORE you start editing — not at commit time.** Isolate each task in its own **git worktree** (`git worktree add ../<task> -b <branch>`), or use your agent's native worktree support — **Claude Code provides worktrees** — so parallel sessions never share a checkout and never collide on `main`.
- Open small, surgical PRs that reference the issue (e.g. "Fixes #42"); keep one concern per PR.
- If cc-handoff is installed: **one branch = one handoff** (`docs/handoff/<branch>.md`).

## Self-Learning Rules
<!-- Append one concise rule per correction. `/learn` writes here automatically; newest first. -->
<!-- LEARN:ANCHOR -->
- (2026-06-09) Write the managed rules block to the canonical agent file — AGENTS.md when the repo is multi-tool (CLAUDE.md imports @AGENTS.md or symlinks it) so Codex also reads it; never split or duplicate the block across files.
- (2026-06-08) When a tool detects its own managed-block markers, match them as standalone lines so prose that merely mentions the marker text isn't mistaken for the block.
<!-- CC-RULES:END -->
