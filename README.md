# Roblox Studio MCP Server

**Connect AI assistants like Claude and Gemini to Roblox Studio**

[![NPM Version](https://img.shields.io/npm/v/robloxstudio-mcp)](https://www.npmjs.com/package/robloxstudio-mcp)

---

## What is This?

An MCP server that lets AI explore your game structure, read/edit scripts, and perform bulk changes all locally and safely.

## Setup

1. Install the [Studio plugin](https://github.com/boshyxd/robloxstudio-mcp/releases) to your Plugins folder
2. Enable **Allow HTTP Requests** in Experience Settings > Security
3. Connect your AI:

**Claude Code:**
```bash
claude mcp add robloxstudio -- npx -y robloxstudio-mcp@latest
```

**Codex CLI:**
```bash
codex mcp add robloxstudio -- npx -y robloxstudio-mcp@latest
```

**Gemini CLI:**
```bash
gemini mcp add robloxstudio npx --trust -- -y robloxstudio-mcp@latest
```

Plugin shows "Connected" when ready.

<details>
<summary>Other MCP clients (Claude Desktop, Cursor, etc.)</summary>

```json
{
  "mcpServers": {
    "robloxstudio-mcp": {
      "command": "npx",
      "args": ["-y", "robloxstudio-mcp@latest"]
    }
  }
}
```

**Windows users:** If you encounter issues, use `cmd`:
```json
{
  "mcpServers": {
    "robloxstudio-mcp": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "robloxstudio-mcp@latest"]
    }
  }
}
```
</details>

## Building from Source (Complete Guide)

Everything you need to build and run your own private copy — both the **MCP server** (Node.js) and the **Roblox Studio plugin**.

### Project Structure

```
robloxstudio-mcp/
├── packages/
│   ├── core/                  # Shared library (bridge, HTTP server, tools)
│   ├── robloxstudio-mcp/      # Full MCP server (39 tools, read+write)
│   └── robloxstudio-mcp-inspector/  # Read-only MCP server (21 tools)
├── studio-plugin/             # Roblox Studio plugin (TypeScript → Luau)
│   ├── src/                   # Plugin source code
│   └── MCPPlugin.rbxmx       # Pre-built plugin file
└── scripts/                   # Build & publish helpers
```

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Git](https://git-scm.com/)
- [Roblox Studio](https://www.roblox.com/create) (to use the plugin)

### Part 1: Build the MCP Server

#### 1. Clone and install

```bash
git clone https://github.com/leifiyoo/robloxstudio-mcp.git
cd robloxstudio-mcp
npm install
```

#### 2. Build

```bash
npm run build
```

This builds all three packages in order: `core` → `robloxstudio-mcp` → `robloxstudio-mcp-inspector`.

#### 3. Verify it works

```bash
npm start
```

You should see output like `HTTP server listening on 0.0.0.0:58741` — press Ctrl+C to stop.

#### 4. Connect your AI client

Point your AI client at the locally-built server:

**Claude Code:**
```bash
claude mcp add robloxstudio -- node /absolute/path/to/robloxstudio-mcp/packages/robloxstudio-mcp/dist/index.js
```

**Codex CLI:**
```bash
codex mcp add robloxstudio -- node /absolute/path/to/robloxstudio-mcp/packages/robloxstudio-mcp/dist/index.js
```

**Gemini CLI:**
```bash
gemini mcp add robloxstudio node --trust -- /absolute/path/to/robloxstudio-mcp/packages/robloxstudio-mcp/dist/index.js
```

**Claude Desktop / Cursor / other JSON-config clients:**
```json
{
  "mcpServers": {
    "robloxstudio-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/robloxstudio-mcp/packages/robloxstudio-mcp/dist/index.js"]
    }
  }
}
```

> Replace `/absolute/path/to/robloxstudio-mcp` with the actual path where you cloned the repo.
>
> **Windows:** `"args": ["C:\\Users\\you\\robloxstudio-mcp\\packages\\robloxstudio-mcp\\dist\\index.js"]`

#### 5. Development mode

For active development, this rebuilds `core` and runs the server with auto-reload:

```bash
npm run dev
```

### Part 2: Build the Roblox Studio Plugin

The repo includes a pre-built `studio-plugin/MCPPlugin.rbxmx` that you can use directly. If you want to rebuild it from source (e.g. after modifying plugin code):

#### 1. Install plugin dependencies

```bash
cd studio-plugin
npm install
```

This installs `roblox-ts` (the TypeScript-to-Luau compiler) and the Roblox type definitions.

#### 2. Compile TypeScript → Luau

```bash
npm run build
```

This runs `rbxtsc` which compiles the TypeScript source in `src/` to Luau files in `out/`.

#### 3. Package into .rbxmx

```bash
cd ..
npm run build:plugin
```

This runs `scripts/build-plugin.mjs` which bundles all the compiled Luau modules into a single `studio-plugin/MCPPlugin.rbxmx` file.

#### 4. Install the plugin in Roblox Studio

Copy `studio-plugin/MCPPlugin.rbxmx` to your Roblox Studio Plugins folder:

- **Windows:** `%LOCALAPPDATA%\Roblox\Plugins\`
- **macOS:** `~/Documents/Roblox/Plugins/`

Or open Studio → Plugins tab → **Plugins Folder** → drop the file there.

Restart Roblox Studio. The plugin appears in the Plugins toolbar as **"MCP Server"**.

#### 5. Enable HTTP Requests

In Roblox Studio: **Game Settings** → **Security** → enable **Allow HTTP Requests**.

Click the **"MCP Server"** button in the toolbar to activate the plugin. It shows "Connected" (green) once the MCP server is running.

### Quick Reference: All Build Commands

| Command | What it does |
|---|---|
| `npm install` | Install all dependencies |
| `npm run build` | Build MCP server (all packages) |
| `npm start` | Run the full MCP server |
| `npm run dev` | Run in dev mode (auto-rebuild) |
| `npm run build:all` | Build MCP server + Studio plugin |
| `npm run build:plugin` | Package Studio plugin into .rbxmx |
| `npm test` | Run tests |
| `npm run lint` | Lint TypeScript code |
| `npm run typecheck` | Type-check without emitting |

---

## What Can You Do?

Ask things like: *"What's the structure of this game?"*, *"Find scripts with deprecated APIs"*, *"Create 50 test NPCs in a grid"*, *"Optimize this movement code"*

<details>
<summary><strong>Inspector Edition (Read-Only)</strong></summary>

### robloxstudio-mcp-inspector

[![NPM Version](https://img.shields.io/npm/v/robloxstudio-mcp-inspector)](https://www.npmjs.com/package/robloxstudio-mcp-inspector)

A lighter, **read-only** version that only exposes inspection tools. No writes, no script edits, no object creation/deletion. Ideal for safely browsing game structure, reviewing scripts, and debugging without risk of accidental changes.

**21 read-only tools:** `get_file_tree`, `search_files`, `get_place_info`, `get_services`, `search_objects`, `get_instance_properties`, `get_instance_children`, `search_by_property`, `get_class_info`, `get_project_structure`, `mass_get_property`, `get_script_source`, `grep_scripts`, `get_attribute`, `get_attributes`, `get_tags`, `get_tagged`, `get_selection`, `start_playtest`, `stop_playtest`, `get_playtest_output`

**Setup** - same plugin, just swap the package name:

**Claude:**
```bash
claude mcp add robloxstudio-inspector -- npx -y robloxstudio-mcp-inspector@latest
```

**Codex:**
```bash
codex mcp add robloxstudio-inspector -- npx -y robloxstudio-mcp-inspector@latest
```

**Gemini:**
```bash
gemini mcp add robloxstudio-inspector npx --trust -- -y robloxstudio-mcp-inspector@latest
```

<details>
<summary>Other MCP clients (Claude Desktop, Cursor, etc.)</summary>

```json
{
  "mcpServers": {
    "robloxstudio-mcp-inspector": {
      "command": "npx",
      "args": ["-y", "robloxstudio-mcp-inspector@latest"]
    }
  }
}
```

**Windows users:** If you encounter issues, use `cmd`:
```json
{
  "mcpServers": {
    "robloxstudio-mcp-inspector": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "robloxstudio-mcp-inspector@latest"]
    }
  }
}
```
</details>

</details>

---

<!-- VERSION_LINE -->**v2.4.0** - 39 tools, inspector edition, monorepo architecture

[Report Issues](https://github.com/boshyxd/robloxstudio-mcp/issues) | [DevForum](https://devforum.roblox.com/t/v180-roblox-studio-mcp-speed-up-your-workflow-by-letting-ai-read-paths-and-properties/3707071) | MIT Licensed
