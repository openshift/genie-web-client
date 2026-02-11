{{/*
Expand the name of the chart.
*/}}
{{- define "aladdin.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "aladdin.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "aladdin.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "aladdin.labels" -}}
helm.sh/chart: {{ include "aladdin.chart" . }}
{{ include "aladdin.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "aladdin.selectorLabels" -}}
app.kubernetes.io/name: {{ include "aladdin.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
============================================================================
Console Plugin Helpers
============================================================================
*/}}

{{/*
Plugin name - defaults to release name or chart name
*/}}
{{- define "aladdin.plugin.name" -}}
{{- default (default .Chart.Name .Release.Name) .Values.plugin.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Plugin labels
*/}}
{{- define "aladdin.plugin.labels" -}}
helm.sh/chart: {{ include "aladdin.chart" . }}
{{ include "aladdin.plugin.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Plugin selector labels
*/}}
{{- define "aladdin.plugin.selectorLabels" -}}
app: {{ include "aladdin.plugin.name" . }}
app.kubernetes.io/name: {{ include "aladdin.plugin.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ include "aladdin.plugin.name" . }}
{{- end }}

{{/*
Create the name of the certificate secret
*/}}
{{- define "aladdin.plugin.certificateSecret" -}}
{{ default (printf "%s-cert" (include "aladdin.plugin.name" .)) .Values.plugin.certificateSecretName }}
{{- end }}

{{/*
Create the name of the plugin service account to use
*/}}
{{- define "aladdin.plugin.serviceAccountName" -}}
{{- if .Values.plugin.serviceAccount.create }}
{{- default (include "aladdin.plugin.name" .) .Values.plugin.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the patcher
*/}}
{{- define "aladdin.plugin.patcherName" -}}
{{- printf "%s-patcher" (include "aladdin.plugin.name" .) }}
{{- end }}

{{/*
Create the name of the patcher service account to use
*/}}
{{- define "aladdin.plugin.patcherServiceAccountName" -}}
{{- if .Values.plugin.patcherServiceAccount.create }}
{{- default (printf "%s-patcher" (include "aladdin.plugin.name" .)) .Values.plugin.patcherServiceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.patcherServiceAccount.name }}
{{- end }}
{{- end }}

{{/*
============================================================================
Backend Service Helpers
============================================================================
*/}}

{{/*
K8S MCP labels
*/}}
{{- define "aladdin.k8sMcp.labels" -}}
app: mcp-kubernetes
{{- end }}

{{/*
K8S MCP selector labels
*/}}
{{- define "aladdin.k8sMcp.selectorLabels" -}}
app: mcp-kubernetes
{{- end }}

{{/*
Obs MCP labels
*/}}
{{- define "aladdin.obsMcp.labels" -}}
app: genie-obs-mcp-server
{{- end }}

{{/*
Obs MCP selector labels
*/}}
{{- define "aladdin.obsMcp.selectorLabels" -}}
app: genie-obs-mcp-server
{{- end }}

{{/*
NGUI MCP labels
*/}}
{{- define "aladdin.nguiMcp.labels" -}}
app: ngui-mcp
{{- end }}

{{/*
NGUI MCP selector labels
*/}}
{{- define "aladdin.nguiMcp.selectorLabels" -}}
app: ngui-mcp
{{- end }}

{{/*
Lightspeed Core labels
*/}}
{{- define "aladdin.lightspeedCore.labels" -}}
app: lightspeed-core
{{- end }}

{{/*
Lightspeed Core selector labels
*/}}
{{- define "aladdin.lightspeedCore.selectorLabels" -}}
app: lightspeed-core
{{- end }}
