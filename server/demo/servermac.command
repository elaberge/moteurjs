#!/bin/bash
CUR_DIR=$( cd "$( dirname "$0" )" && pwd )
exec "node" "${CUR_DIR}/server.js" $@
