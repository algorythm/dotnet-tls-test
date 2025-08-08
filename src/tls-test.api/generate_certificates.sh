#!/usr/bin/env bash
set -euo pipefail

# Usage: ./generate_certificates.sh [HOST] [ORG] [OU] [PFX_PASSWORD] [DAYS]
HOST="${1:-localhost}"
ORG="${2:-Your Org}"
OU="${3:-Dev}"
PFX_PASS="${4:-changeit}"
DAYS="${5:-825}" # ~27 months

OUT_DIR="certs"
KEY="$OUT_DIR/dev.key"
CSR="$OUT_DIR/dev.csr"
CRT="$OUT_DIR/dev.crt"
PFX="$OUT_DIR/dev.pfx"
EXT="$OUT_DIR/v3.ext"

mkdir -p "$OUT_DIR"

# 1) Private key
openssl genrsa -out "$KEY" 2048

# 2) CSR with CN/O/OU
openssl req -new -key "$KEY" -out "$CSR" \
  -subj "/CN=${HOST}/O=${ORG}/OU=${OU}"

# 3) Extensions for SAN, KU, EKU
cat > "$EXT" <<EOF
basicConstraints=CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${HOST}
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# 4) Self-sign leaf cert
openssl x509 -req -in "$CSR" -signkey "$KEY" -sha256 -days "$DAYS" \
  -extfile "$EXT" -out "$CRT"

# 5) Export PFX (one file your colleague needs)
openssl pkcs12 -export -inkey "$KEY" -in "$CRT" \
  -out "$PFX" -passout pass:"$PFX_PASS" -name "$HOST"

# Optional: CER (handy for trusting)
cp "$CRT" "$OUT_DIR/dev.cer"

echo "Done:
  PFX: $PFX  (password: $PFX_PASS)
  CER: $OUT_DIR/dev.cer
  Subject: CN=$HOST, O=$ORG, OU=$OU
  SANs: DNS:$HOST, IP:127.0.0.1, IP:::1"

