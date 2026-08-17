#!/bin/sh

set -e

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL}"
};
EOF

exec nginx -g "daemon off;"