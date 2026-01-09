# Backend Setup for Local Development

This directory contains the backend configuration needed to run Genie Web Client locally.

## Prerequisites

- **Python 3.11+** - For running Lightspeed services
- **Node.js 20+** - Already required for frontend
- **Go 1.21+** - For running obs-mcp server
- **OpenAI API Key** - Or compatible LLM provider

## Architecture

The Genie Web Client backend consists of:

```
┌─────────────────────────────────────────────┐
│  Lightspeed Stack (Port 8080)               │
│  ├── Lightspeed Core Service (LCS)          │
│  └── Llama Stack (LLM provider)             │
└─────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌─────────────┐      ┌─────────────┐
│  MCP Servers│      │ Your UI     │
│  (Optional) │      │ (Port 9001) │
└─────────────┘      └─────────────┘
```

## Quick Start

### 1. Start the OBS-MCP Server

The obs-mcp server provides observability tools (metrics, queries) to the AI.

**Prerequisites:**
- Go 1.21+ installed
- Logged into your OpenShift cluster (`oc login`)

**Clone and start obs-mcp server (Terminal 1)**
```bash
# Clone the obs-mcp repo (one time only, skip if you already have it)
cd ~/Documents/GHRepos  # or wherever you keep repos
git clone https://github.com/rhobs/obs-mcp.git
cd obs-mcp

# Start the server (auto-discovers Prometheus in the cluster)
go run cmd/obs-mcp/main.go --listen 127.0.0.1:9100 --auth-mode kubeconfig --insecure --guardrails none

# Runs on port 9100 - keep this terminal running
```

**Note:** The `--guardrails none` flag allows broader queries for local development. In production, you may want to use the default guardrails.

### 2. Clone and Setup Lightspeed Stack

```bash
# Clone the upstream lightspeed-stack repo (one time only, skip if you already have it)
cd ~/Documents/GHRepos  # or wherever you keep repos
git clone https://github.com/lightspeed-core/lightspeed-stack.git
cd lightspeed-stack

# Copy the pre-configured files from this repo
cp ~/Documents/GHRepos/genie-web-client/backend/lightspeed-stack/lightspeed-stack.yaml .
cp ~/Documents/GHRepos/genie-web-client/backend/lightspeed-stack/run.yaml .

# Install dependencies
uv sync
```

**Tip:** If you want to keep your existing configs, copy these with different names like `lightspeed-stack-genie.yaml` instead.

### 3. Configure Your API Key

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="sk-your-api-key-here"
```

**Tip:** Add this to your `~/.zshrc` or `~/.bashrc` to persist it:
```bash
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Start the Backend

```bash
cd ~/Documents/GHRepos/lightspeed-stack
uv run python -m src.lightspeed_stack
```

This uses the `lightspeed-stack.yaml` and `run.yaml` files you copied from the genie-web-client repo.

This will start:
- Lightspeed Core Service on port 8080
- Llama Stack with OpenAI provider
- Ready to accept requests from the UI

**Note:** `uv run` automatically uses the virtual environment. If you prefer the traditional approach, you can also:
```bash
cd ~/Documents/GHRepos/lightspeed-stack
source .venv/bin/activate
python -m src.lightspeed_stack
```

**Tip:** You can switch between different config profiles using the `-c` and `-i` flags.

**Keep this terminal running** - this is your backend.

## Verification

Test that the backend is running:

```bash
# Check if backend is listening on port 8080
lsof -i :8080 | grep LISTEN

# Or try a health check (may return 404, but confirms it's responding)
curl http://localhost:8080/health
```

## Configuration Files

### `lightspeed-stack.yaml`

Main configuration for Lightspeed Core Service:
- **Port**: 8080 (matches what the UI expects)
- **Model**: `gpt-4o-mini` (tested and working)
- **MCP Servers**: Includes obs-mcp at `localhost:9100` - comment out if not needed (see below)
- **System Prompt**: "Always use available tools"

### `run.yaml`

Llama Stack configuration:
- **Providers**: OpenAI (uses `$OPENAI_API_KEY`)
- **Models**: Registers `gpt-4o-mini`, `gpt-4o`
- **Tool Runtime**: MCP support enabled
- **Storage**: SQLite databases for persistence

## Optional: MCP Servers

The provided `lightspeed-stack.yaml` includes an MCP server configuration (`obs-mcp` on port 9100). 

**For basic development without MCP servers:**
1. Edit `lightspeed-stack.yaml`
2. Comment out or remove the `mcp_servers` section:
   ```yaml
   # mcp_servers:
   #   - name: "obs"
   #     provider_id: "model-context-protocol"
   #     url: "http://localhost:9100/mcp"
   ```
3. Restart the backend

**If you need MCP servers**, see the [old POC repo](https://github.com/jhadvig/genie-plugin) for:
- `obs-mcp` - Observability/metrics queries
- `layout-manager` - Dashboard layout management

## Troubleshooting

### Port 8080 already in use

```bash
# Find what's using it
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### "uv: command not found"

Install `uv` (Python package installer):
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Backend not responding

```bash
# Check backend logs in the terminal where you started the backend
# Look for errors about:
# - Missing API key
# - Port conflicts
# - Network issues
```

### API Key Issues

Make sure your OpenAI API key:
- Starts with `sk-`
- Is exported in the same terminal where you start the backend
- Has sufficient credits

Test your key:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | head -20
```

## Development Workflow

### Full Stack Development

**Terminal 1: OBS-MCP Server**
```bash
cd ~/Documents/GHRepos/obs-mcp
go run cmd/obs-mcp/main.go --listen 127.0.0.1:9100 --auth-mode kubeconfig --insecure --guardrails none
```

**Terminal 2: Backend**
```bash
cd ~/Documents/GHRepos/lightspeed-stack
export OPENAI_API_KEY="sk-..."
uv run python -m src.lightspeed_stack
```

**Terminal 3: Frontend Dev Server**
```bash
cd ~/Documents/GHRepos/genie-web-client
yarn start
```

**Terminal 4: Console**
```bash
cd ~/Documents/GHRepos/genie-web-client
yarn start-console
```

**Access:** http://localhost:9000/genie

### Backend-Only Changes

If you're only modifying backend config:
1. Stop the backend (Ctrl+C in Terminal 1)
2. Edit `lightspeed-stack.yaml` or `run.yaml` in ~/Documents/GHRepos/lightspeed-stack/
3. Restart: `uv run python -m src.lightspeed_stack`

The UI will automatically reconnect.

## Next Steps

- **Model Selection**: Edit `lightspeed-stack.yaml` → `default_model` to try different models
- **Add MCP Servers**: Uncomment and configure additional MCP servers in `lightspeed-stack.yaml`
- **Production Setup**: For cluster deployment, see the main [DEPLOY-GUIDE.md](../DEPLOY-GUIDE.md)

## Support

- **Backend Issues**: Check [Lightspeed Stack docs](https://github.com/lightspeed-core/lightspeed-stack)
- **UI Integration**: See the main [README.md](../README.md)
- **Questions**: Ask in your team chat or check the POC repo
