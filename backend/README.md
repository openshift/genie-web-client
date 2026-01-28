# Backend Setup for Local Development

This directory contains the backend configuration needed to run Genie Web Client locally.

## Prerequisites

- **Python 3.12+** (requires >=3.12, <3.14) - For running Lightspeed services. See [lightspeed-stack requirements](https://github.com/lightspeed-core/lightspeed-stack/blob/main/pyproject.toml#L21)
- **Node.js 20+** - Already required for frontend
- **Go 1.24.6+** - For running obs-mcp server. See [obs-mcp requirements](https://github.com/rhobs/obs-mcp/blob/main/go.mod#L3)
- **OpenAI API Key** - Or compatible LLM provider

## Architecture

The Genie Web Client local development stack:

```
┌─────────────────────────────────────────────────────────┐
│  Browser: http://localhost:9000/genie                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  OpenShift Console (Port 9000)                          │
│  ├── Hosts the Genie plugin                             │
│  └── Proxies API calls to backend                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend Dev Server (Port 9001)                        │
│  └── Serves Genie UI (React/TypeScript)                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Lightspeed Stack (Port 8080)                           │
│  ├── Lightspeed Core Service (LCS) - REST API           │
│  └── Llama Stack (LLM orchestration) → OpenAI API       │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│  obs-mcp (9100) │ │ kube-mcp    │ │ ngui-mcp (9200) │
│  Metrics/Prom   │ │ (8081)      │ │ UI generation   │
└─────────────────┘ └─────────────┘ └─────────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────────┐
│  OpenShift Cluster (via kubeconfig)                     │
│  ├── Prometheus (metrics)                               │
│  └── Kubernetes API (resources)                         │
└─────────────────────────────────────────────────────────┘
```

### MCP Servers

| Server | Port | Purpose |
|--------|------|---------|
| **obs-mcp** | 9100 | Prometheus metrics queries |
| **kube-mcp** | 8081 | Kubernetes resource queries |
| **ngui-mcp** | 9200 | Next-gen UI component generation |

**Data Flow:** User query → Console (9000) → Backend (8080) → MCP Servers → OpenShift Cluster → Response

## Quick Start

### 1. Start the OBS-MCP Server

The obs-mcp server provides observability tools (metrics, queries) to the AI.

**Prerequisites:**

- Go 1.24.6+ installed
- Logged into your OpenShift cluster (`oc login`)

**Clone and start obs-mcp server (Terminal 1)**

```bash
# Clone the obs-mcp repo (one time only, skip if you already have it)
cd ~/Documents/GHRepos  # or wherever you keep repos
git clone https://github.com/rhobs/obs-mcp.git
cd obs-mcp

# Start obs-mcp (auto-discovers thanos-querier in the cluster, falls back to prometheus if not found)
go run cmd/obs-mcp/main.go --listen 127.0.0.1:9100 --auth-mode kubeconfig --insecure --guardrails none

# Runs on port 9100 - keep this terminal running
```

**Note:** The `--guardrails none` flag allows broader queries for local development. In production, you may want to use the default guardrails.

### 2. Start Kube MCP Server

The kube-mcp server provides Kubernetes resource queries to the AI.

**Start kube-mcp server (Terminal 2)**

```bash
npx kubernetes-mcp-server@latest --port 8081 --list-output table --read-only --toolsets core
```

### 3. Start NGUI MCP Server

The ngui-mcp server enables dynamic UI component generation.

**Start ngui-mcp server (Terminal 3)**

```bash
podman run --rm -it -p 9200:9200 \
   -v $PWD/backend/lightspeed-stack/ngui_openshift_mcp_config.yaml:/opt/app-root/config/ngui_openshift_mcp_config.yaml:z \
   --env MCP_PORT="9200" \
   --env NGUI_MODEL="gpt-4.1-nano" \
   --env NGUI_PROVIDER_API_KEY=$OPENAI_API_KEY \
   --env NGUI_CONFIG_PATH="/opt/app-root/config/ngui_openshift_mcp_config.yaml" \
   --env MCP_TOOLS="generate_ui_component" \
   --env MCP_STRUCTURED_OUTPUT_ENABLED="false" \
   quay.io/next-gen-ui/mcp:dev
```

**Note:** Run this command from the `genie-web-client` directory so it can find the config file.

### 4. Configure Your API Key

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="sk-your-api-key-here"
```

**Tip:** Add this to your `~/.zshrc` or `~/.bashrc` to persist it:

```bash
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 5. Start the Backend (Lightspeed Stack)

You have two options for running the backend. **Option A (Podman)** is recommended for faster setup.

#### Option A: Run with Podman (Recommended)

This is the easiest way to get started - no need to clone repos or install Python dependencies.

**Start lightspeed-stack with Podman (Terminal 4)**

```bash
cd ~/Documents/GHRepos/genie-web-client
podman run --rm -it -p 8080:8080 \
  -v $PWD/backend/lightspeed-stack/lightspeed-stack-podman.yaml:/app-root/lightspeed-stack.yaml:z \
  -v $PWD/backend/lightspeed-stack/run.yaml:/app-root/run.yaml:z \
  --env OPENAI_API_KEY=$OPENAI_API_KEY \
  quay.io/lightspeed-core/lightspeed-stack:0.4.0
```

**Note:** We use `lightspeed-stack-podman.yaml` which has `host: 0.0.0.0` and `host.containers.internal` URLs to work inside the container.

This will start:

- Lightspeed Core Service on port 8080
- Llama Stack with OpenAI provider
- Ready to accept requests from the UI

**Keep this terminal running** - this is your backend.

#### Option B: Run from Source

Use this option if you want to develop or debug the lightspeed-stack itself.

**Clone and setup (one time only)**

```bash
# Clone the upstream lightspeed-stack repo
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

**Start the backend**

```bash
cd ~/Documents/GHRepos/lightspeed-stack
uv run python -m src.lightspeed_stack
```

**Note:** `uv run` automatically uses the virtual environment. If you prefer the traditional approach:

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

### Testing MCP Tool Calls

Once the full stack is running (backend + frontend + console), test obs-mcp integration with these queries:

- "What alerts are firing in the cluster?"
- "Show me CPU usage metrics"
- "What pods are running in the openshift-monitoring namespace?"

## Configuration Files

### `lightspeed-stack.yaml`

Configuration for running from source (Option B):

- **Host**: `localhost`
- **MCP Servers**: Use `localhost` URLs

### `lightspeed-stack-podman.yaml`

Configuration for running with Podman (Option A):

- **Host**: `0.0.0.0` (listens on all interfaces for port forwarding)
- **MCP Servers**: Use `host.containers.internal` URLs to reach host services from inside the container

**Common settings (both files):**

- **Port**: 8080 (matches what the UI expects)
- **Model**: `gpt-4o-mini` (tested and working)
- **MCP Servers**: Configured for obs-mcp (9100), kube-mcp (8081), and ngui-mcp (9200)
- **System Prompt**: "Always use available tools"

### `ngui_openshift_mcp_config.yaml`

Configuration for Next Gen UI MCP server:

- **Data transformers**: Defines how data is transformed for UI components
- **Component mappings**: Maps data types to UI components (tables, logs, etc.)

### `run.yaml`

Llama Stack configuration:

- **Providers**: OpenAI (uses `$OPENAI_API_KEY`)
- **Models**: Registers `gpt-4o-mini`, `gpt-4o`
- **Tool Runtime**: MCP support enabled
- **Storage**: SQLite databases for persistence

## Configuring MCP Servers

The provided `lightspeed-stack.yaml` includes all three MCP servers. You can enable/disable them as needed:

**To disable specific MCP servers:**

1. Edit `lightspeed-stack.yaml`
2. Comment out the servers you don't need:

   ```yaml
   mcp_servers:
     - name: "obs"
       provider_id: "model-context-protocol"
       url: "http://localhost:9100/mcp"
     # - name: "kube"
     #   provider_id: "model-context-protocol"
     #   url: "http://localhost:8081/mcp"
     # - name: "ngui"
     #   provider_id: "model-context-protocol"
     #   url: "http://localhost:9200/mcp"
   ```

3. Restart the backend

All three MCP servers are required for full Genie functionality:

- `obs-mcp` - Prometheus metrics queries
- `kube-mcp` - Kubernetes resource queries  
- `ngui-mcp` - Dynamic UI component generation

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

### "No module named 'mcp'" Error

If you get this error when starting lightspeed-stack:

```
ModuleNotFoundError: No module named 'mcp'
```

**Solution:** Install the required dependencies:

```bash
cd ~/Documents/GHRepos/lightspeed-stack
uv pip install mcp
# Or install all optional dependencies:
uv pip install pandas psycopg2-binary redis aiosqlite pillow "mcp>=1.23.0" scikit-learn pymongo matplotlib
```

This happens because `uv sync` only installs dependencies from `pyproject.toml`, but llama-stack requires additional packages for MCP support.

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

### Full Stack Development (All MCP Servers)

**Terminal 1: OBS-MCP Server**

```bash
cd ~/Documents/GHRepos/obs-mcp
go run cmd/obs-mcp/main.go --listen 127.0.0.1:9100 --auth-mode kubeconfig --insecure --guardrails none
```

**Terminal 2: Kube-MCP Server**

```bash
npx kubernetes-mcp-server@latest --port 8081 --list-output table --read-only --toolsets core
```

**Terminal 3: NGUI-MCP Server**

```bash
cd ~/Documents/GHRepos/genie-web-client
podman run --rm -it -p 9200:9200 \
   -v $PWD/backend/lightspeed-stack/ngui_openshift_mcp_config.yaml:/opt/app-root/config/ngui_openshift_mcp_config.yaml:z \
   --env MCP_PORT="9200" \
   --env NGUI_MODEL="gpt-4.1-nano" \
   --env NGUI_PROVIDER_API_KEY=$OPENAI_API_KEY \
   --env NGUI_CONFIG_PATH="/opt/app-root/config/ngui_openshift_mcp_config.yaml" \
   --env MCP_TOOLS="generate_ui_component" \
   --env MCP_STRUCTURED_OUTPUT_ENABLED="false" \
   quay.io/next-gen-ui/mcp:dev
```

**Terminal 4: Backend (Podman - Recommended)**

```bash
cd ~/Documents/GHRepos/genie-web-client
export OPENAI_API_KEY="sk-..."
podman run --rm -it -p 8080:8080 \
  -v $PWD/backend/lightspeed-stack/lightspeed-stack-podman.yaml:/app-root/lightspeed-stack.yaml:z \
  -v $PWD/backend/lightspeed-stack/run.yaml:/app-root/run.yaml:z \
  --env OPENAI_API_KEY=$OPENAI_API_KEY \
  quay.io/lightspeed-core/lightspeed-stack:0.4.0
```

**Terminal 5: Frontend Dev Server**

```bash
cd ~/Documents/GHRepos/genie-web-client
yarn start
```

**Terminal 6: Console**

```bash
cd ~/Documents/GHRepos/genie-web-client
yarn start-console
```

**Access:** <http://localhost:9000/genie>

### Test Queries

Once everything is running, try these queries:

- `"what are my pods in namespace openshift-lightspeed"` - Tests kube-mcp
- `"what are my pods in namespace openshift-lightspeed, generate ui"` - Tests kube-mcp + ngui-mcp
- `"show me CPU usage metrics"` - Tests obs-mcp

### Backend-Only Changes

If you're only modifying backend config:

1. Stop the backend (Ctrl+C in Terminal 4)
2. Edit `lightspeed-stack.yaml` or `run.yaml` in `backend/lightspeed-stack/`
3. Restart the backend (use the same Podman or Python command from section 5)

The UI will automatically reconnect.

## Next Steps

- **Model Selection**: Edit `lightspeed-stack.yaml` → `default_model` to try different models
- **Add MCP Servers**: Uncomment and configure additional MCP servers in `lightspeed-stack.yaml`
- **Production Setup**: For cluster deployment, see the main [DEPLOY-GUIDE.md](../DEPLOY-GUIDE.md)

## Support

- **Backend Issues**: Check [Lightspeed Stack docs](https://github.com/lightspeed-core/lightspeed-stack)
- **UI Integration**: See the main [README.md](../README.md)
- **Questions**: Ask in your team chat or check the POC repo
