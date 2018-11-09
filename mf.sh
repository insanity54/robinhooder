#!/bin/bash

bindir="$(dirname "$(readlink -fn "$0")")"
source "${bindir}/.env"

cd "${bindir}"
#espeak "firefoxy node binary path ${NODE_BINARY_PATH}"
espeak "Adding magnetlink" &
espeak $("${NODE_BINARY_PATH}" ./index.js "${1}" | jq .msg | cut -d '-' -f2)
