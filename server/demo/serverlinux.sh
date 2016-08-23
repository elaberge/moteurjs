#!/usr/bin/env bash
NODE_EXEC=node

CUR_DIR=$( cd "$( dirname "$0" )" && pwd )
$NODE_EXEC "${CUR_DIR}/server.js" $@
