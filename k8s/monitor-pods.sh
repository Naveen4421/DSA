#!/bin/bash
# 🏥 K8s Health Watcher - Smart, Live Pod Monitoring

echo "🚀 Starting DSA Tracker Health Monitor..."
echo "------------------------------------------------"

# 1. Watch for 30 seconds (Control+C to exit)
echo "Watching Pods (Live)..."
kubectl get pods -w &
WATCH_PID=$!

# 2. Check Resource usage (CPU/RAM)
sleep 2
echo ""
echo "🔥 High-level Resource Usage:"
kubectl top pods --containers || echo "Tip: Metric Server needs to be enabled for resources"

echo ""
echo "📈 Current Replica Status:"
kubectl get deployment dsa-tracker

# Keep the watch alive
wait $WATCH_PID
