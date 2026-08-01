#!/usr/bin/env bash
# Provision a free Atlas cluster + DB user, write MONGO_URI into root .env
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
PROJECT_NAME="${ATLAS_PROJECT_NAME:-gila-community}"
CLUSTER_NAME="${ATLAS_CLUSTER_NAME:-gila-community}"
DB_USER="${ATLAS_DB_USER:-gila_app}"
DB_NAME="${ATLAS_DB_NAME:-gila-community}"

if ! atlas auth whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: atlas auth login"
  exit 1
fi

ORG_ID="$(atlas organizations list -o json | node -e '
  const d=JSON.parse(require("fs").readFileSync(0,"utf8"));
  const results=d.results||d;
  if(!results.length){console.error("No Atlas org found"); process.exit(1)}
  console.log(results[0].id);
')"

echo "Using org: $ORG_ID"

PROJECT_ID="$(atlas projects list -o json | node -e '
  const name=process.env.PROJECT_NAME;
  const d=JSON.parse(require("fs").readFileSync(0,"utf8"));
  const results=d.results||d;
  const hit=results.find((p)=>p.name===name);
  if(hit) console.log(hit.id);
' PROJECT_NAME="$PROJECT_NAME")"

if [[ -z "${PROJECT_ID:-}" ]]; then
  echo "Creating project $PROJECT_NAME..."
  PROJECT_ID="$(atlas projects create "$PROJECT_NAME" --orgId "$ORG_ID" -o json | node -e '
    const d=JSON.parse(require("fs").readFileSync(0,"utf8"));
    console.log(d.id);
  ')"
fi

echo "Using project: $PROJECT_ID"
export MONGODB_ATLAS_PROJECT_ID="$PROJECT_ID"

# Allow access from anywhere (tighten later for known IPs / deploy host)
atlas accessLists create "0.0.0.0/0" --type cidrBlock --comment "gila community app" --projectId "$PROJECT_ID" >/dev/null 2>&1 || true
atlas accessLists create --currentIp --comment "bootstrap machine" --projectId "$PROJECT_ID" >/dev/null 2>&1 || true

CLUSTER_EXISTS="$(atlas clusters list --projectId "$PROJECT_ID" -o json | node -e '
  const name=process.env.CLUSTER_NAME;
  const d=JSON.parse(require("fs").readFileSync(0,"utf8"));
  const results=d.results||d;
  console.log(results.some((c)=>c.name===name) ? "yes" : "no");
' CLUSTER_NAME="$CLUSTER_NAME")"

if [[ "$CLUSTER_EXISTS" != "yes" ]]; then
  echo "Creating free M0 cluster $CLUSTER_NAME (may take a few minutes)..."
  atlas clusters create "$CLUSTER_NAME" \
    --projectId "$PROJECT_ID" \
    --provider AWS \
    --region US_EAST_1 \
    --tier M0 \
    --mdbVersion 7.0 \
    --type REPLICASET
  atlas clusters watch "$CLUSTER_NAME" --projectId "$PROJECT_ID"
fi

DB_PASS="${ATLAS_DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)}"

# Create or rotate DB user
atlas dbusers delete "$DB_USER" --projectId "$PROJECT_ID" --force >/dev/null 2>&1 || true
atlas dbusers create \
  --username "$DB_USER" \
  --password "$DB_PASS" \
  --role readWriteAnyDatabase \
  --projectId "$PROJECT_ID" >/dev/null

CONN="$(atlas clusters connectionStrings describe "$CLUSTER_NAME" --projectId "$PROJECT_ID" -o json | node -e '
  const d=JSON.parse(require("fs").readFileSync(0,"utf8"));
  const srv=d.standardSrv || (d.connectionStrings&&d.connectionStrings.standardSrv);
  if(!srv){console.error("No SRV connection string"); process.exit(1)}
  console.log(srv);
')"

# Inject credentials + db name into mongodb+srv URI
MONGO_URI="$(node -e '
  const u=new URL(process.argv[1].replace("mongodb+srv://","https://"));
  u.username=process.argv[2];
  u.password=process.argv[3];
  u.pathname="/"+process.argv[4];
  u.searchParams.set("retryWrites","true");
  u.searchParams.set("w","majority");
  console.log("mongodb+srv://"+u.username+":"+encodeURIComponent(u.password)+"@"+u.host+u.pathname+"?"+u.searchParams.toString());
' "$CONN" "$DB_USER" "$DB_PASS" "$DB_NAME")"

touch "$ENV_FILE"
if grep -q '^MONGO_URI=' "$ENV_FILE"; then
  # portable in-place replace
  node -e '
    const fs=require("fs");
    const p=process.argv[1];
    const uri=process.argv[2];
    let t=fs.readFileSync(p,"utf8");
    t=t.replace(/^MONGO_URI=.*$/m,"MONGO_URI="+uri);
    fs.writeFileSync(p,t);
  ' "$ENV_FILE" "$MONGO_URI"
else
  echo "MONGO_URI=$MONGO_URI" >> "$ENV_FILE"
fi

echo ""
echo "Atlas ready."
echo "  Project:  $PROJECT_NAME ($PROJECT_ID)"
echo "  Cluster:  $CLUSTER_NAME"
echo "  DB user:  $DB_USER"
echo "  Updated:  $ENV_FILE"
echo ""
echo "Restart the API: npm run dev --prefix server"
