# Aladdin Helm Chart

This Helm chart installs the complete Aladdin AI assistant on OpenShift, including both the console plugin (frontend) and all backend components.

## Overview

The Aladdin chart is a unified chart that deploys:

1. **Console Plugin** - The OpenShift console plugin that provides the Aladdin UI
2. **Backend Services** - MCP servers and LLM orchestration services

### Backend Options

The chart supports two backend options for orchestrating LLM interactions:

1. **OLS (OpenShift Lightspeed)** - The default backend. Installs the Red Hat Lightspeed operator from OperatorHub.
2. **Lightspeed Core** - An alternative backend that deploys lightspeed-core as the inference/MCP API provider.

### Components

| Component | Description | Enabled By |
|-----------|-------------|------------|
| **Console Plugin** | OpenShift console plugin for Aladdin UI | Always |
| **Obs MCP Server** | Observability MCP server for cluster metrics and monitoring data | `obsMcp.enabled=true` (default) |
| **NGUI MCP Server** | UI component generation MCP server | `nguiMcp.enabled=true` (default) |
| **K8S MCP Server** | Kubernetes MCP server for cluster resource access.  Not used when OLS is providing the backend (OLS deploys its own openshift mcp server) | `lightspeedCore.enabled=true` |
| **Lightspeed Core** | Core service that orchestrates LLM interactions | `lightspeedCore.enabled=true` |
| **OLS Operator** | Red Hat Lightspeed operator from OperatorHub | `olsConfig.enabled=true` (default) |

## Prerequisites

1. **OpenShift Cluster** - This chart is designed for OpenShift (uses service serving certificates)
2. **API Keys** - OpenAI (or compatible) API keys for LLM access
3. **Console Plugin Image** - You need a container image for the Aladdin web client

### Build or Obtain the Console Plugin Image

You can either use a pre-built image or build your own:

#### Option A: Use Pre-built Image

Use `quay.io/bparees/genie-web-client:latest` as your image.

#### Option B: Build Your Own Image

You can build the image from the root of this repository (`genie-web-client`):

```bash
# Build and push the image
podman build -t quay.io/<your_quay_user>/genie-web-client:latest .
podman push quay.io/<your_quay_user>/genie-web-client:latest
```

Then go to quay.io and ensure the new image repository is public.

## Installation

Choose one of the two backend options below, both assume you have command line access to your target openshift cluster as an administrator.

### Option 1: Install with OLS Backend (Default)

The OLS (OpenShift Lightspeed) backend installs the Red Hat Lightspeed operator from OperatorHub and configures it via an OLSConfig custom resource. This is the default option.

```bash
export LLM_API_KEY=<your llm api key>

helm upgrade -i aladdin ./charts/aladdin \
  -n openshift-aladdin \
  --create-namespace \
  --set plugin.image=quay.io/bparees/genie-web-client:latest \
  --set olsConfig.llm.apiKey=$LLM_API_KEY \
  --set nguiMcp.apiKey=$LLM_API_KEY
```

When it finishes, the chart will print out the URL needed to access the Aladdin console.

### Option 2: Install with Lightspeed Core Backend

The Lightspeed Core backend deploys and configures the lightspeed-core service for LLM inference and MCP server interaction.

```bash
export LLM_API_KEY=<your llm api key>

helm upgrade -i aladdin ./charts/aladdin \
  -n openshift-aladdin \
  --create-namespace \
  --set plugin.image=quay.io/bparees/genie-web-client:latest \
  --set olsConfig.enabled=false \
  --set lightspeedCore.enabled=true \
  --set lightspeedCore.llm.apiKey=$LLM_API_KEY \
  --set nguiMcp.apiKey=$LLM_API_KEY
```

### Installation with Custom Values

The chart allows the overriding of many values, the most relevant ones are the parameters that define which images are using for the components.  See the values.yaml to understand the full set of configurable parameters.  You can either override the values on the command line via `--set` arguments, or provide your own values file with any overrides you want to set.


#### OLS Backend Values File

```bash
cat > my-values.yaml <<EOF
plugin:
  image: quay.io/bparees/genie-web-client:latest
  name: genie-web-client
olsConfig:
  llm:
    apiKey: "sk-..."
nguiMcp:
  apiKey: "sk-..."
EOF

helm upgrade -i aladdin ./charts/aladdin \
  -n openshift-aladdin \
  --create-namespace \
  -f my-values.yaml
```

#### Lightspeed Core Backend Values File

```bash
cat > my-values.yaml <<EOF
plugin:
  image: quay.io/bparees/genie-web-client:latest
  name: genie-web-client
olsConfig:
  enabled: false
lightspeedCore:
  enabled: true
  llm:
    apiKey: "sk-..."
nguiMcp:
  apiKey: "sk-..."
EOF

helm upgrade -i aladdin ./charts/aladdin \
  -n openshift-aladdin \
  --create-namespace \
  -f my-values.yaml
```

## Uninstallation

```bash
helm uninstall aladdin -n openshift-aladdin
oc delete ns openshift-aladdin
```

## Configuration Reference

### Console Plugin Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `plugin.name` | Plugin name (used for ConsolePlugin resource) | `""` |
| `plugin.description` | Plugin description | `""` |
| `plugin.image` | Container image for the plugin (required) | `""` |
| `plugin.imagePullPolicy` | Image pull policy | `Always` |
| `plugin.imagePullSecrets` | Image pull secrets | `[]` |
| `plugin.replicas` | Number of replicas | `2` |
| `plugin.port` | Service port | `9443` |
| `plugin.basePath` | Base path for the plugin | `/` |
| `plugin.certificateSecretName` | TLS certificate secret name | `""` (auto-generated) |
| `plugin.serviceAccount.create` | Create service account | `true` |
| `plugin.serviceAccount.name` | Service account name | `""` |
| `plugin.patcherServiceAccount.create` | Create patcher service account | `true` |
| `plugin.jobs.patchConsoles.enabled` | Enable console patching job | `true` |
| `plugin.jobs.patchConsoles.image` | Patcher job image | `registry.redhat.io/openshift4/ose-tools-rhel9@sha256:...` |

### Obs MCP Server Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `obsMcp.enabled` | Enable Obs MCP server | `true` |
| `obsMcp.image.repository` | Container image repository | `quay.io/bparees/obs-mcp` |
| `obsMcp.image.tag` | Container image tag | `latest` |
| `obsMcp.image.pullPolicy` | Image pull policy | `Always` |
| `obsMcp.service.port` | Service port | `8080` |
| `obsMcp.replicas` | Number of replicas | `1` |
| `obsMcp.args` | Container arguments | `["-auth-mode", "header"]` |
| `obsMcp.prometheusUrl` | Prometheus URL for metrics queries | `https://prometheus-k8s.openshift-monitoring.svc:9091` |

### Kubernetes MCP Server Parameters

Note: The K8S MCP server is only deployed when `lightspeedCore.enabled` is `true`.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `k8sMcp.image.repository` | Container image repository | `quay.io/bparees/k8s-mcp` |
| `k8sMcp.image.tag` | Container image tag | `latest` |
| `k8sMcp.image.pullPolicy` | Image pull policy | `Always` |
| `k8sMcp.service.port` | Service port | `8080` |
| `k8sMcp.service.targetPort` | Container target port | `8080` |
| `k8sMcp.containerPort` | Container port | `8080` |
| `k8sMcp.replicas` | Number of replicas | `1` |
| `k8sMcp.args` | Container arguments | `["--read-only", "--toolsets", "core", "--log-level", "8"]` |

### NextGenUI MCP Server Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `nguiMcp.enabled` | Enable NGUI MCP server | `true` |
| `nguiMcp.image.repository` | Container image repository | `quay.io/bparees/ngui-mcp` |
| `nguiMcp.image.tag` | Container image tag | `latest` |
| `nguiMcp.image.pullPolicy` | Image pull policy | `Always` |
| `nguiMcp.service.port` | Service port | `9200` |
| `nguiMcp.containerPort` | Container port | `9200` |
| `nguiMcp.replicas` | Number of replicas | `1` |
| `nguiMcp.apiKey` | NGUI provider API key (required) | `""` |
| `nguiMcp.secretName` | Name of the API key secret | `ngui-llm-api-key` |
| `nguiMcp.configMapName` | Name of the config ConfigMap | `ngui-mcp-config` |
| `nguiMcp.env.model` | NGUI model name | `gpt-4.1-nano` |
| `nguiMcp.env.tools` | Enabled MCP tools | `generate_ui_component` |
| `nguiMcp.env.structuredOutputEnabled` | Enable structured output | `false` |

### OLS Subscription Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `olsSubscription.name` | Subscription name | `lightspeed-operator` |
| `olsSubscription.namespace` | Namespace for the operator | `openshift-lightspeed` |
| `olsSubscription.channel` | Subscription channel | `stable` |
| `olsSubscription.installPlanApproval` | Install plan approval mode | `Automatic` |
| `olsSubscription.source` | Catalog source | `redhat-operators` |
| `olsSubscription.sourceNamespace` | Catalog source namespace | `openshift-marketplace` |
| `olsSubscription.operatorGroupName` | OperatorGroup name | `openshift-lightspeed` |
| `olsSubscription.targetNamespaces` | Target namespaces for the operator | `["openshift-lightspeed"]` |

### OLS Config Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `olsConfig.enabled` | Enable OLS backend (controls all OLS resources) | `true` |
| `olsConfig.llm.apiKey` | LLM API key (required) | `""` |
| `olsConfig.llm.apiKeySecretName` | Name of the API key secret | `ols-llm-api-key` |
| `olsConfig.llm.providers` | Array of LLM provider configurations | See values.yaml |
| `olsConfig.ols.defaultModel` | Default model to use | `gpt-4o-mini` |
| `olsConfig.ols.defaultProvider` | Default provider to use | `OpenAI` |
| `olsConfig.mcpServers` | MCP server configuration for OLS | See values.yaml |

### Lightspeed Core Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `lightspeedCore.enabled` | Enable Lightspeed Core | `false` |
| `lightspeedCore.llm.apiKey` | LLM API key (required) | `""` |
| `lightspeedCore.llm.apiKeySecretName` | Name of the API key secret | `lcore-llm-api-key` |
| `lightspeedCore.image.repository` | Container image repository | `quay.io/bparees/lightspeed-core` |
| `lightspeedCore.image.tag` | Container image tag | `latest` |
| `lightspeedCore.image.pullPolicy` | Image pull policy | `Always` |
| `lightspeedCore.service.port` | Service port (HTTPS) | `8443` |
| `lightspeedCore.containerPort` | Container port | `8443` |
| `lightspeedCore.replicas` | Number of replicas | `1` |
| `lightspeedCore.tlsSecretName` | TLS secret name (auto-generated by OpenShift) | `lightspeed-core-tls` |
| `lightspeedCore.runConfigMapName` | LlamaStack run.yaml ConfigMap name | `llamastack-run` |
| `lightspeedCore.stackConfigMapName` | Lightspeed stack config ConfigMap name | `lightspeed-stack` |
| `lightspeedCore.mcpServers` | MCP server configuration | See values.yaml |
| `lightspeedCore.models.providerId` | LLM provider ID | `openai` |
| `lightspeedCore.models.providerType` | LLM provider type | `remote::openai` |
| `lightspeedCore.models.modelId` | Model ID | `gpt-4o-mini` |
| `lightspeedCore.models.modelType` | Model type | `llm` |
| `lightspeedCore.models.providerModelId` | Provider-specific model ID | `gpt-4o-mini` |

### ConsolePlugin Patch Parameters

The ConsolePlugin proxy is automatically configured based on which backend is enabled.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `consolePluginPatch.lcoreTargetService.name` | Lightspeed Core service name | `lightspeed-core` |
| `consolePluginPatch.lcoreTargetService.namespace` | Lightspeed Core service namespace | `openshift-aladdin` |
| `consolePluginPatch.lcoreTargetService.port` | Lightspeed Core service port | `8443` |
| `consolePluginPatch.olsTargetService.name` | OLS service name | `lightspeed-app-server` |
| `consolePluginPatch.olsTargetService.namespace` | OLS service namespace | `openshift-lightspeed` |
| `consolePluginPatch.olsTargetService.port` | OLS service port | `8443` |

## Advanced Options

### Modify System Prompt

The Aladdin system prompt is defined in `charts/aladdin/files/prompts/system-prompt.txt`, you can modify it before installing the chart.

### Building Custom Images

By default this chart uses images from `quay.io/bparees`, but you can build and use your own images.

#### Observability MCP Server

1. Clone https://github.com/rhobs/obs-mcp
2. `podman build -t quay.io/<your quay org>/obs-mcp:<some-tag> .`
3. `podman push quay.io/<your quay org>/obs-mcp:<some-tag>`
4. Ensure the quay repository is public
5. Override the `obsMcp.image.repository` and `obsMcp.image.tag` chart parameters

#### Kubernetes MCP Server

1. Clone https://github.com/containers/kubernetes-mcp-server
2. `podman build -t quay.io/<your quay org>/k8s-mcp:<some-tag> .`
3. `podman push quay.io/<your quay org>/k8s-mcp:<some-tag>`
4. Ensure the quay repository is public
5. Override the `k8sMcp.image.repository` and `k8sMcp.image.tag` chart parameters

#### NextGenUI MCP Server

1. Clone https://github.com/RedHat-UX/next-gen-ui-agent/
2. `./get-pants.sh` - only need to run this once to install `pants`
3. `pants package --filter-target-type=docker_image ::` - this builds the images
4. `podman tag quay.io/next-gen-ui/mcp:dev quay.io/<your quay org>/nextgenui-mcp:<some-tag>`
5. `podman push quay.io/<your quay org>/nextgenui-mcp:<some-tag>`
6. Ensure the quay repository is public
7. Override the `nguiMcp.image.repository` and `nguiMcp.image.tag` chart parameters

#### Lightspeed Core

1. Clone https://github.com/lightspeed-core/lightspeed-stack
2. `podman build -t quay.io/<your quay org>/lightspeed-core:<some-tag> .`
3. `podman push quay.io/<your quay org>/lightspeed-core:<some-tag>`
4. Ensure the quay repository is public
5. Override the `lightspeedCore.image.repository` and `lightspeedCore.image.tag` chart parameters

## Resources Created

### Console Plugin Resources (always created)

| Resource Type | Names |
|---------------|-------|
| ServiceAccount | `<plugin-name>`, `<plugin-name>-patcher` |
| ConfigMap | `<plugin-name>` (nginx config) |
| Service | `<plugin-name>` |
| Deployment | `<plugin-name>` |
| ConsolePlugin | `<plugin-name>` |
| ClusterRole | `<plugin-name>-patcher` |
| ClusterRoleBinding | `<plugin-name>-patcher` |
| Job | `<plugin-name>-patcher` (post-install hook) |

### MCP Server Resources (based on configuration)

| Resource Type | Names | Condition |
|---------------|-------|-----------|
| ServiceAccount | `genie-obs-mcp-server` | `obsMcp.enabled=true` |
| Service | `genie-obs-mcp-server` | `obsMcp.enabled=true` |
| Deployment | `genie-obs-mcp-server` | `obsMcp.enabled=true` |
| ServiceAccount | `ngui-mcp` | `nguiMcp.enabled=true` |
| ConfigMap | `ngui-mcp-config` | `nguiMcp.enabled=true` |
| Secret | `ngui-llm-api-key` | `nguiMcp.enabled=true` and `nguiMcp.apiKey` set |
| Service | `ngui-mcp` | `nguiMcp.enabled=true` |
| Deployment | `ngui-mcp` | `nguiMcp.enabled=true` |
| ServiceAccount | `mcp-kubernetes` | `lightspeedCore.enabled=true` |
| Service | `mcp-kubernetes-svc` | `lightspeedCore.enabled=true` |
| Deployment | `mcp-kubernetes` | `lightspeedCore.enabled=true` |

### OLS Backend Resources (when `olsConfig.enabled=true`)

| Resource Type | Names | Notes |
|---------------|-------|-------|
| Namespace | `openshift-lightspeed` | Created via pre-install hook |
| OperatorGroup | `openshift-lightspeed` | Created via pre-install hook |
| Subscription | `lightspeed-operator` | Installs the Lightspeed operator |
| Secret | `ols-llm-api-key` | In `openshift-lightspeed` namespace |
| OLSConfig | `cluster` | Created via post-install hook after CRD is available |
| ServiceAccount | `ols-crd-wait-sa` | Helm hook, deleted after success |
| ClusterRole | `ols-crd-wait-role` | Helm hook, deleted after success |
| ClusterRoleBinding | `ols-crd-wait-rolebinding` | Helm hook, deleted after success |
| Job | `ols-wait-for-crd` | Waits for OLS CRD, deleted after success |

### Lightspeed Core Backend Resources (when `lightspeedCore.enabled=true`)

| Resource Type | Names |
|---------------|-------|
| Secret | `lcore-llm-api-key` |
| ConfigMap | `llamastack-run`, `lightspeed-stack` |
| ServiceAccount | `lightspeed-core` |
| Deployment | `lightspeed-core` |
| Service | `lightspeed-core` |
| ClusterRole | `<namespace>-lightspeed-core-clusterversion-reader` |
| ClusterRoleBinding | `<namespace>-lightspeed-core-tokenreview`, `<namespace>-lightspeed-core-clusterversion-reader` |

## Troubleshooting

### Check Pod Status

```bash
oc get pods -n openshift-aladdin
```

### Check Console Plugin Status

```bash
# Verify the plugin is enabled
oc get consoles.operator.openshift.io cluster -o jsonpath='{.spec.plugins}'

# Check the ConsolePlugin resource
oc get consoleplugin <plugin-name> -o yaml
```

### View Logs

```bash
# Console plugin
oc logs -l app=<plugin-name> -n openshift-aladdin

# MCP servers
oc logs -l app=genie-obs-mcp-server -n openshift-aladdin
oc logs -l app=ngui-mcp -n openshift-aladdin

# Lightspeed Core (if enabled)
oc logs -l app=lightspeed-core -n openshift-aladdin
oc logs -l app=mcp-kubernetes -n openshift-aladdin

# OLS (if enabled)
oc logs -n openshift-lightspeed -l app.kubernetes.io/component=application-server
```

### Verify TLS Certificate

```bash
# Plugin certificate
oc get secret <plugin-name>-cert -n openshift-aladdin

# Lightspeed Core certificate (if enabled)
oc get secret lightspeed-core-tls -n openshift-aladdin
```

### Check Patcher Job

```bash
# View patcher job status
oc get jobs -n openshift-aladdin

# View patcher job logs
oc logs job/<plugin-name>-patcher -n openshift-aladdin
```
