#!/bin/bash

# This script helps you create the necessary secrets in your Kubernetes cluster
# Run this once before deploying the app

echo "Switching to Kubernetes context..."
# kubectl config use-context <your-context>

echo "Creating dsa-secrets..."

# Load from .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

kubectl create secret generic dsa-secrets \
  --from-literal=supabase-url=$NEXT_PUBLIC_SUPABASE_URL \
  --from-literal=supabase-key=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secret created successfully!"
