# claude-mods

Mods for Claude Code.

## context-bar

Draws the current session's context window as a stacked bar above the prompt,
one segment per category that `/context` lists (system prompt, system tools,
MCP tools, memory files, skills, messages, autocompact buffer, free space),
with a legend and the total. It refreshes after every model response and after
compaction. `/context-bar` hides or shows it; the choice is remembered.

The per-category numbers are Claude Code's local estimates (the `summary`
breakdown); the total matches the API count.

### Install

From a shell:

```bash
claude plugin install context-bar --marketplace trabalka/claude-mods
```

At the prompt of a terminal session:

```
/plugin install context-bar --marketplace trabalka/claude-mods
```

In the desktop app: click + next to the prompt box, then Plugins, Add
marketplace with `trabalka/claude-mods`, then Add plugin.

Update later with `claude plugin marketplace update claude-mods` and
`claude plugin update context-bar@claude-mods`, then start a new session.

### Cloud sessions (experimental, unsupported)

Cloud sessions do not install plugins from user or repository settings. A
cloud environment's setup script can try to install it in the VM:

```bash
claude plugin marketplace add trabalka/claude-mods && claude plugin install context-bar@claude-mods || true
```

Whether the cloud session then loads the mod and whether claude.ai draws the
bar is not verified.
