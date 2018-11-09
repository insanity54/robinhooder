#!/bin/bash

bindir="$(dirname "$(readlink -fn "$0")")"
source "${bindir}/.env"

cd "${bindir}"
#espeak "firefoxy node binary path ${NODE_BINARY_PATH}"
"${NODE_BINARY_PATH}" ./index.js "${1}"
