#!/bin/bash
set -e
dir=`cd "$(dirname "$BASH_SOURCE")" && pwd`

deno run -A "$dir/scan.ts" -d "$dir/template/deno" -t console -b