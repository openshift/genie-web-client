#!/bin/bash
#
# Simple deployment script for Genie Web Client
# Based on: https://github.com/openshift/console-plugin-template
#
# This script automates the 3 deployment steps:
# 1. Build container image
# 2. Push to Quay.io  
# 3. Deploy to OpenShift with Helm
#

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  Genie Web Client - Deployment"
echo "=========================================="
echo ""

# Get Quay.io username
echo -e "${BLUE}Step 1: Quay.io Configuration${NC}"
echo ""
read -p "Enter your Quay.io username: " QUAY_USERNAME

if [ -z "$QUAY_USERNAME" ]; then
    echo -e "${RED}Error: Username required${NC}"
    exit 1
fi

IMAGE_NAME="quay.io/${QUAY_USERNAME}/genie-web-client:latest"
echo ""
echo -e "${GREEN}✓ Image: ${IMAGE_NAME}${NC}"
echo ""

# Build container
echo -e "${BLUE}Step 2: Building Container${NC}"
echo ""
echo "Packaging your code (2-5 minutes)..."
echo ""

# Detect Mac Apple Silicon
PLATFORM_FLAG=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ $(uname -m) == "arm64" ]]; then
        echo -e "${YELLOW}Detected Apple Silicon - adding --platform=linux/amd64${NC}"
        echo ""
        PLATFORM_FLAG="--platform=linux/amd64"
    fi
fi

if docker build ${PLATFORM_FLAG} -t "${IMAGE_NAME}" .; then
    echo ""
    echo -e "${GREEN}✓ Build successful${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}Build failed. Is Docker running?${NC}"
    exit 1
fi

# Login to Quay.io
echo -e "${BLUE}Step 3: Login to Quay.io${NC}"
echo ""

if docker login quay.io; then
    echo ""
    echo -e "${GREEN}✓ Logged in${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}Login failed${NC}"
    exit 1
fi

# Push container
echo -e "${BLUE}Step 4: Pushing to Quay.io${NC}"
echo ""
echo "Uploading container (1-3 minutes)..."
echo ""

if docker push "${IMAGE_NAME}"; then
    echo ""
    echo -e "${GREEN}✓ Push successful${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}Push failed${NC}"
    exit 1
fi

echo -e "${YELLOW}Important: Make repository PUBLIC on Quay.io${NC}"
echo "Visit: https://quay.io/repository/${QUAY_USERNAME}/genie-web-client"
echo ""
read -p "Press Enter when done..."
echo ""

# Check OpenShift login
echo -e "${BLUE}Step 5: OpenShift Check${NC}"
echo ""

if ! command -v oc &> /dev/null; then
    echo -e "${RED}oc command not found${NC}"
    echo "Install: brew install openshift-cli"
    exit 1
fi

if oc whoami &> /dev/null; then
    echo -e "${GREEN}✓ Logged in as: $(oc whoami)${NC}"
    echo ""
else
    echo -e "${RED}Not logged into OpenShift${NC}"
    echo ""
    echo "To login:"
    echo "  1. Open OpenShift console"
    echo "  2. Click username → 'Copy login command'"
    echo "  3. Run the oc login command"
    echo ""
    exit 1
fi

# Check Helm
echo -e "${BLUE}Step 6: Helm Check${NC}"
echo ""

if ! command -v helm &> /dev/null; then
    echo "Installing Helm..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install helm
        else
            echo -e "${RED}Homebrew required. Install from: https://brew.sh/${NC}"
            exit 1
        fi
    else
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    fi
fi

echo -e "${GREEN}✓ Helm ready${NC}"
echo ""

# Deploy with Helm
echo -e "${BLUE}Step 7: Deploying to OpenShift${NC}"
echo ""
echo "Deploying your plugin..."
echo ""

if helm upgrade -i genie-web-client ./charts/openshift-console-plugin \
    -n genie-web-client \
    --create-namespace \
    --set plugin.name=genie-web-client \
    --set plugin.image="${IMAGE_NAME}"; then
    
    echo ""
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}Deployment failed${NC}"
    exit 1
fi

# Success
echo ""
echo -e "${GREEN}=========================================="
echo "🎉 Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Wait 2-3 minutes, then check status:"
echo ""
echo "  oc get pods -n genie-web-client"
echo "  oc get consoleplugin genie-web-client"
echo ""
echo "Access your plugin at:"
echo "  https://your-console-url/genie"
echo ""
echo "Hard refresh if needed: Cmd+Shift+R (Mac) or Ctrl+Shift+R"
echo ""

