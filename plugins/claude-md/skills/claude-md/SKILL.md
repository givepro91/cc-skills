---
name: claude-md
description: Generate or refresh a project's CLAUDE.md — a tailored preamble plus an idempotent managed block (working discipline, verification, adaptive parallel-git workflow, self-learning rules). Works on new and existing projects; only ever rewrites its own managed block. Use when setting up a repo, standardizing AI working rules, or adopting the parallel-git + self-learning workflow.
when_to_use: When the user runs /claude-md, sets up a new repo, wants consistent Claude working rules, or asks to add the parallel-git / self-learning workflow to a project.
argument-hint: "[--ko] [--solo|--team]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git status*), Bash(git rev-parse*), Bash(git remote*), Bash(git branch*), Bash(gh repo view*), Bash(gh auth status*), Bash(node*), Bash(ls*), Bash(cat*)
---

# /claude-md — generate & maintain CLAUDE.md

Write a high-quality `CLAUDE.md` using a **hybrid** model and an **idempotent managed block**, so it works on new *and* existing projects and is safe to re-run.

## Design (read first)

```
# CLAUDE.md
## Project … (tailored preamble — scan/interview; written once, then user-owned)

<!-- CC-RULES:START -->        ← managed by this skill; regen rewrites ONLY this block
## Working Discipline          (Karpathy)
## Verification                (Anthropic best-practice)
## Parallel Git Workflow       (adaptive: team / solo / none)
## Self-Learning Rules         (grows via /learn; PRESERVED across regen)
<!-- CC-RULES:END -->

… anything below/around the block is the user's free area — never touched
```

- **Idempotent.** The block is upserted between `<!-- CC-RULES:START -->` / `<!-- CC-RULES:END -->`. Re-running replaces only that region; everything else (incl. an OMC `<!-- OMC:START -->` block or hand-written sections) is left byte-identical.
- **Self-learning preserved.** Rules accumulated under `<!-- LEARN:ANCHOR -->` survive regeneration (the helper carries them over).

## Procedure

1. **Locate the file.** Project root = `git rev-parse --show-toplevel` (fallback: cwd). Target = `<root>/CLAUDE.md`.
2. **Detect environment** (drives the adaptive git section):
   - git? `git rev-parse --is-inside-work-tree`
   - remote + GitHub? `git remote -v`, `gh repo view` / `gh auth status` (treat failure as "no gh")
   - **team** if a remote exists and `gh` works; **solo** if git but no usable remote/gh; **none** if not a git repo. `--team` / `--solo` flags override detection.
   - Language = English by default; `--ko` → Korean for the generated block prose.
3. **Tailored preamble (only if CLAUDE.md does NOT already exist):**
   - Scan for stack & commands: `package.json` scripts, `Makefile`, `pyproject.toml`, `Cargo.toml`, `go.mod`, README, lockfiles, test/build config.
   - Optionally ask 1–2 short questions only for facts you cannot infer (e.g. the run command). Don't ask what the repo already tells you.
   - `Write` a minimal preamble: a one-line project description + a `## Project` section with **build / test / run** commands. Keep it short and factual.
   - If CLAUDE.md already exists, **do not** rewrite the preamble — go straight to the block.
4. **Compose the managed block body** from the template below, choosing the matching Parallel Git Workflow variant and translating prose if `--ko`. Keep `<!-- LEARN:ANCHOR -->` exactly as written.
5. **Upsert the block idempotently** — pipe the composed body to the helper:
   ```sh
   node "${CLAUDE_PLUGIN_ROOT}/scripts/apply-block.mjs" <root>/CLAUDE.md <<'BLOCK'
   …composed block body…
   BLOCK
   ```
   The helper creates / replaces / appends the block correctly and preserves learned rules.
6. **AGENTS.md pointer (optional, no duplication):** if `AGENTS.md` exists (or the user uses Codex/Gemini), ensure it has a one-line pointer — `> Working rules: see CLAUDE.md.` — instead of copying the rules.
7. **Verify & report:** show the resulting block, confirm the user's pre-existing content is intact, and note that re-running is safe. Offer to commit (don't commit without approval).

## Managed block body — template

> Render this between the markers. Pick ONE Parallel Git Workflow variant. `--ko` translates the prose; keep headings/markers/anchor verbatim.

```markdown
## Working Discipline
- **Think before coding.** State assumptions; if uncertain, ask. Surface tradeoffs and competing interpretations instead of silently picking one.
- **Simplicity first.** Write the minimum code that solves the stated problem. No speculative features, abstractions, or configuration for single-use code.
- **Surgical changes.** Touch only what the task requires. Don't refactor or reformat adjacent code; match the existing style. Remove only what your change made unused.
- **Goal-driven.** Define a concrete success check (test / build / command / screenshot) before coding, then loop until it passes.

## Verification
- Always give yourself a way to verify — a test, a bash command, a curl, a screenshot. A working feedback loop is the single biggest quality lever.
- Report honestly: if a check fails, say so with the output; mark unverified work "unverified". Never present incomplete work as done.

## Parallel Git Workflow
<!-- variant: TEAM (git + remote + gh) -->
- Never commit directly to the default branch (`main`/`master`). **One task = one ISSUE = one branch.**
- For parallel local sessions, isolate with a **worktree per task**: `git worktree add ../<task> -b <branch>`.
- Open small, surgical PRs that reference the issue (e.g. "Fixes #42"); keep one concern per PR.
- If cc-handoff is installed: **one branch = one handoff** (`docs/handoff/<branch>.md`).

<!-- variant: SOLO (git, no remote/gh) — use instead of TEAM -->
- Don't work on the default branch. **Branch per task** (`git switch -c <task>`); for parallel sessions use a **worktree per task**.
- Commit in small, focused steps with the *why* in the body. (No PR ceremony needed for a solo repo.)

<!-- variant: NONE (not a git repo) — replace section body with this single line -->
- Not a git repo yet — run `git init` to enable branch/worktree isolation for parallel sessions.

## Self-Learning Rules
<!-- Append one concise rule per correction. `/learn` writes here automatically; newest first. -->
<!-- LEARN:ANCHOR -->
```

## Notes

- The block uses distinct markers (`CC-RULES`), so it never collides with an OMC (`OMC:START`) block in the same file.
- Keep the block lean — it's guidance, not documentation. Project-specific detail belongs in the preamble or the user's free area.
- `/learn` is the companion that grows the Self-Learning Rules over time.
