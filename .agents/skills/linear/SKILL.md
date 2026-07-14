---
name: linear-ticket-creator
description: "Use this skill to create a new Linear ticket (issue) in the workspace automatically via API."
---

# Linear Integration Skill

This skill allows the agent to create Linear tickets natively.

## How to use

When the user asks to create a Linear ticket, use the `run_command` tool to execute the Node.js script located in `scripts/create_ticket.js`.

### Command
```bash
node .agents/skills/linear/scripts/create_ticket.js <TeamKey> "<Title>" "<Description>"
```

- `<TeamKey>`: The Linear team identifier (e.g. `AES`). The user specified that the team key for this project is **AES**.
- `<Title>`: The title of the ticket.
- `<Description>`: The Markdown description of the ticket. Ensure you escape quotes appropriately or pass it as a file/stdin if it's too complex for bash arguments. (For long descriptions, it's safer to generate a temporary file and modify the script to read from it, but for simple creation, inline string works).

*Note: The script automatically fetches the `LINEAR_API_KEY` from the project's `.env` file.*
