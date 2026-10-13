#!/usr/bin/env bash
set -euo pipefail
cat site_archive/part-* > site.zip
printf '25bc0afb403b085067df54168b4f1298656447172bd36bf4362dfba2f85c168c  site.zip\n' | sha256sum -c -
mkdir -p dist
unzip -q site.zip -d dist
rm -f dist/.htaccess dist/vercel.json
