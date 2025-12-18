# Deploying Genie Web Client

## Prerequisites

- Docker Desktop running
- Quay.io account (https://quay.io)
- OpenShift CLI (`brew install openshift-cli`)
- Helm (`brew install helm`)
- Access to an OpenShift cluster

## Quick Deploy

Run the automated script:

```bash
./deploy.sh
```

## Manual Deployment

If you want more control, you can run each step manually.

### 1. Build Container

```bash
# Mac with Apple Silicon (M1/M2/M3)
docker build --platform=linux/amd64 -t quay.io/YOUR_USERNAME/genie-web-client:latest .

# Intel Mac or Linux
docker build -t quay.io/YOUR_USERNAME/genie-web-client:latest .
```

### 2. Push to Quay.io

```bash
docker login quay.io
docker push quay.io/YOUR_USERNAME/genie-web-client:latest
```

**Important:** Make your repository public at https://quay.io/repository/YOUR_USERNAME/genie-web-client → Settings → Make Public

### 3. Login to OpenShift

**Option A: Get credentials from Slack**
- Check **#forum-ocp-console-clusters** Slack channel (fresh login posted every 24 hours)
- Copy and run the `oc login` command from the post

**Option B: Get from console**
- Open OpenShift console in browser
- Click username → Copy login command → Display Token
- Copy and run the `oc login` command

### 4. Deploy with Helm

```bash
helm upgrade -i genie-web-client ./charts/openshift-console-plugin \
  -n genie-web-client \
  --create-namespace \
  --set plugin.name=genie-web-client \
  --set plugin.image=quay.io/YOUR_USERNAME/genie-web-client:latest
```

## Verify Deployment

```bash
# Check pods
oc get pods -n genie-web-client

# Check plugin registration
oc get consoleplugin genie-web-client

# View logs
oc logs -n genie-web-client -l app.kubernetes.io/name=genie-web-client
```

## Access Plugin

1. Open your OpenShift web console
2. Navigate to: `https://your-console-url/genie`
3. Hard refresh if needed: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

Example: If your console is at `https://console-openshift-console.apps.mycluster.com`, access the plugin at:
```
https://console-openshift-console.apps.mycluster.com/genie
```

## Update After Code Changes

```bash
# Rebuild and push
docker build --platform=linux/amd64 -t quay.io/YOUR_USERNAME/genie-web-client:latest .
docker push quay.io/YOUR_USERNAME/genie-web-client:latest

# Restart deployment
oc rollout restart deployment/genie-web-client -n genie-web-client
```

**Note:** The `dev-build.sh` script handles yarn install, build locally, to speed up the build process.

## Troubleshooting

### Build fails with Terser errors
The webpack config is already set to support modern JavaScript (ES2020). If you still see errors, run `yarn install` and rebuild.

### Pods not running
```bash
oc describe pod -n genie-web-client
oc logs -n genie-web-client -l app.kubernetes.io/name=genie-web-client
```

### Plugin not in console
- Wait 3-5 minutes for patcher job to complete
- Check: `oc get jobs -n genie-web-client`
- Hard refresh browser
- Clear browser cache

### ImagePullBackOff
Make sure your Quay.io repository is public.

## Uninstall

```bash
helm uninstall genie-web-client -n genie-web-client
```

## Help

- **For deployment issues:** Ask in **#forum-ui-extensibility** on Slack
- **For cluster credentials:** Check **#forum-ocp-console-clusters** (fresh login posted every 24 hours)
