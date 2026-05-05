#!/bin/bash
# 📊 Install Full Monitoring Stack (Prometheus + Grafana + Loki)

echo "🚀 Setting up the Monitoring Stack (Grafana, Prometheus, Loki)..."
echo "------------------------------------------------"

# Add required Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# 1. Install Prometheus and Grafana (kube-prometheus-stack)
echo "📦 Installing Kube-Prometheus-Stack..."
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# 2. Install Loki (for logging Falco events)
echo "📦 Installing Loki for log aggregation..."
helm upgrade --install loki grafana/loki-stack \
  --namespace monitoring \
  --set grafana.enabled=false \
  --set prometheus.enabled=false \
  --set loki.isDefault=false

echo "✅ Monitoring stack deployed successfully!"
echo ""
echo "🔐 Grafana Login Info:"
echo "User: admin"
echo "Password: admin"
echo ""
echo "To access Grafana locally, run:"
echo "kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80"
echo "Then visit: http://localhost:3000"
