#!/bin/bash
# 🛡️ Falco Setup Script for DSA Tracker

echo "🚀 Setting up Falco Security for DSA Tracker..."
echo "------------------------------------------------"

# Add Falco Helm repository if not exists
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update

# Install or Upgrade Falco using Helm
# We use the falco-custom-rules.yaml to apply our specific rules for the DSA Tracker
# This will deploy Falco as a DaemonSet to monitor all nodes and pods.
# If you are integrating with Grafana via Falcosidekick, we also enable it here.

echo "Deploying Falco..."
helm upgrade --install falco falcosecurity/falco \
  --namespace falco \
  --create-namespace \
  -f falco-custom-rules.yaml \
  --set tty=true \
  --set falcosidekick.enabled=true \
  --set falcosidekick.webui.enabled=true \
  --set falcosidekick.config.prometheus.enabled=true \
  --set falcosidekick.config.loki.host="http://loki.monitoring.svc.cluster.local:3100" \
  --set "falcosidekick.config.customfields.cluster=local"

echo "Applying ServiceMonitor for Prometheus..."
kubectl apply -f falco-servicemonitor.yaml


echo "✅ Falco deployed successfully!"
echo "Check pods status using: kubectl get pods -n falco"
echo "You can view Falco alerts by checking its logs: kubectl logs -l app.kubernetes.io/name=falco -n falco"
