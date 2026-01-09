# Genie Web Client

An AI-powered, extensible UI framework built on the OpenShift Console dynamic plugin, enabling unified, intelligent experiences across Red Hat products.

## Prerequisites

- **Node.js 20+** and **yarn** - For frontend development
- **Python 3.11+** - For backend (Lightspeed services)
- **Go 1.21+** - For obs-mcp server
- **OpenShift CLI (`oc`)** - To connect to a cluster
- **Podman 3.2.0+** or **Docker** - To run the console
- **OpenAI API Key** - Or compatible LLM provider

## Getting Started

Genie Web Client requires both a frontend (this repo) and a backend (AI service). Follow these steps:

### 1. Setup Backend (One-Time)

The backend provides AI capabilities. See detailed instructions in [`backend/README.md`](./backend/README.md).

**Quick Start:**
```bash
# First, port-forward Prometheus (terminal 1)
oc login  # Make sure you're logged in
PROM_POD=$(kubectl get pods -n openshift-monitoring -l app.kubernetes.io/instance=thanos-querier -o jsonpath="{.items[0].metadata.name}")
kubectl port-forward -n openshift-monitoring $PROM_POD 9090:9090
# Keep running

# Second, clone and start obs-mcp server (terminal 2)
# Clone obs-mcp (one time only, skip if you already have it)
cd ~/Documents/GHRepos  # or wherever you keep repos
git clone https://github.com/rhobs/obs-mcp.git
cd obs-mcp
go run cmd/obs-mcp/main.go --listen 127.0.0.1:9100 --auth-mode kubeconfig
# Runs on port 9100 - keep running

# Then in another terminal, setup lightspeed-stack
# Clone lightspeed-stack
cd ~/Documents/GHRepos  # or your preferred location
git clone https://github.com/lightspeed-core/lightspeed-stack.git
cd lightspeed-stack

# Copy our configs
cp ~/Documents/GHRepos/genie-web-client/backend/lightspeed-stack/*.yaml .

# Install and start
uv sync
export OPENAI_API_KEY="sk-your-key-here"
uv run python -m src.lightspeed_stack

# Runs on port 8080 - keep this terminal running
```

### 2. Setup Frontend

In separate terminal windows, run:

**Terminal 1: Plugin Dev Server**
```bash
cd ~/Documents/GHRepos/genie-web-client
yarn install
yarn run start
# Runs on port 9001 - keep running
```

**Terminal 2: OpenShift Console**
```bash
cd ~/Documents/GHRepos/genie-web-client
oc login  # Connect to your cluster
yarn run start-console
# Runs on port 9000 - keep running
```

**Access the app:** http://localhost:9000/genie

## Development

### Option 1: Local (Recommended)

In one terminal window, run:

1. `yarn install`
2. `yarn run start`

In another terminal window, run:

1. `oc login` (requires [oc](https://console.redhat.com/openshift/downloads) and an [OpenShift cluster](https://console.redhat.com/openshift/create))
2. `yarn run start-console` (requires [Docker](https://www.docker.com) or [podman 3.2.0+](https://podman.io))

This will run the OpenShift console in a container connected to the cluster
you've logged into. The plugin HTTP server runs on port 9001 with CORS enabled.

**Note:** Make sure the backend is running (see "Getting Started" section above) for full AI functionality.

Navigate to http://localhost:9000/genie to see the running plugin.

#### Running start-console with Apple silicon and podman

If you are using podman on a Mac with Apple silicon, `yarn run start-console`
might fail since it runs an amd64 image. You can workaround the problem with
[qemu-user-static](https://github.com/multiarch/qemu-user-static) by running
these commands:

```bash
podman machine ssh
sudo -i
rpm-ostree install qemu-user-static
systemctl reboot
```

### Option 2: Docker + VSCode Remote Container

Make sure the
[Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension is installed. This method uses Docker Compose where one container is
the OpenShift console and the second container is the plugin. It requires that
you have access to an existing OpenShift cluster. After the initial build, the
cached containers will help you start developing in seconds.

1. Create a `dev.env` file inside the `.devcontainer` folder with the correct values for your cluster:

```bash
OC_PLUGIN_NAME=console-plugin-template
OC_URL=https://api.example.com:6443
OC_USER=kubeadmin
OC_PASS=<password>
```

2. `(Ctrl+Shift+P) => Remote Containers: Open Folder in Container...`
3. `yarn run start`
4. Navigate to <http://localhost:9000/genie>

## Testing

### Unit Tests

This project uses Jest and React Testing Library for unit testing.

#### Running Tests

```bash
# Run all tests once
yarn test

# Run tests in watch mode (re-runs on file changes)
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

#### Writing Tests

Tests should be placed alongside the components they test with a `.test.tsx` extension. For components with multiple test files, use a `__tests__/` directory.

**File Organization:**
- Single test file: `src/components/MyComponent.test.tsx` (co-located)
- Multiple test files: `src/components/my-component/__tests__/` (organized)

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests using Cypress are available. See the `integration-tests` directory for more details.

```bash
# Run Cypress in interactive mode
yarn test-cypress

# Run Cypress in headless mode
yarn test-cypress-headless
```

## Contributing

See `CONTRIBUTING.md` for guidelines. A PR template is in place (see `.github/pull_request_template.md`) prompting for a summary and testing details.