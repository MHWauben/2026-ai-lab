#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

API_PORT="${API_PORT:-3003}"
LAMBDA_PORT="${LAMBDA_PORT:-3004}"
DASH_PORT="${DASH_PORT:-8050}"

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null
  [ -n "$DASH_PID" ] && kill "$DASH_PID" 2>/dev/null
  wait 2>/dev/null
  echo "Done."
}
trap cleanup EXIT INT TERM

# --- 1. Build the API handler if dist is missing ---
if [ ! -f dist/src/proxy/index.mjs ]; then
  echo "Building API..."
  npx tsx build-service.ts
fi

# Ensure .js copy exists for serverless-offline
if [ ! -f dist/src/proxy/index.js ]; then
  cp dist/src/proxy/index.mjs dist/src/proxy/index.js
fi

# --- 2. Start the Node.js compliance API ---
echo "Starting compliance API on port $API_PORT..."
npx sls offline start \
  --httpPort "$API_PORT" \
  --lambdaPort "$LAMBDA_PORT" \
  --noPrependStageInUrl &
API_PID=$!

# --- 3. Wait for the API to be ready ---
echo "Waiting for API..."
for i in $(seq 1 15); do
  if curl -s "http://localhost:$API_PORT/compliance/AV01XYZ" > /dev/null 2>&1; then
    echo "API ready on http://localhost:$API_PORT"
    break
  fi
  sleep 1
done

# --- 4. Start the Python Dash app ---
echo "Starting Dash app on port $DASH_PORT..."
COMPLIANCE_API_URL="http://localhost:$API_PORT" \
  "$PROJECT_DIR/venv/bin/python" "$PROJECT_DIR/app.py" &
DASH_PID=$!

echo ""
echo "====================================="
echo "  AV Compliance Checker is running"
echo "====================================="
echo "  API:  http://localhost:$API_PORT/compliance/{plate}"
echo "  UI:   http://localhost:$DASH_PORT"
echo ""
echo "  Demo plates: AV01XYZ AV02ABC AV03DEF AV04GHI AV05JKL AV06MNO"
echo "  Ctrl+C to stop"
echo "====================================="

wait
