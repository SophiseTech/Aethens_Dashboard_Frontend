#!/bin/bash

ENV_FILE=$1       # e.g., .env.staging or .env.production
REPO=$2           # e.g., org/repo

if [ -z "$ENV_FILE" ] || [ -z "$REPO" ]; then
  echo "Usage: $0 <env_file> <repo>"
  exit 1
fi

# Check if gh is logged in
if ! gh auth status &> /dev/null; then
  echo "You are not logged in. Run 'gh auth login'"
  exit 1
fi

# Read .env file line by line and set repo-level secrets
while IFS='=' read -r KEY VALUE || [ -n "$KEY" ]; do
  # Skip comments or empty lines
  [[ "$KEY" =~ ^#.*$ ]] && continue
  [[ -z "$KEY" ]] && continue

  # Trim whitespace
  KEY=$(echo "$KEY" | xargs)
  VALUE=$(echo "$VALUE" | xargs)

  # Set secret at repo level
  echo "Setting repo-level secret $KEY..."
  gh secret set "$KEY" --repo "$REPO" --body "$VALUE"
done < "$ENV_FILE"
