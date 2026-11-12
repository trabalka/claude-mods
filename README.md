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

### Where the bar shows

The bar appears in the terminal and in the Code tab of the desktop app. In the
VS Code extension's chat panel, under `claude -p` and in cloud sessions the mod
can run, but nothing it draws is shown, so there is no bar there.
