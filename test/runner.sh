#!/usr/bin/env bash
echo "Configure environment for unit tests"

export NPM_COMMAND=$1

export NODE_ENV="test"

export HOST=0.0.0.0
export PORT=3001

export DATABASE_URL=postgres://postgres@127.0.0.1/

export SBM_HOST="n/a"
export SBM_KEY="n/a"
export SBM_ORG="n/a"
export SBM_USER="n/a"
export SBM_USER_PWD="n/a"

echo
echo "Recreate test database"
psql -c 'drop database if exists ;' -U postgres
psql -c 'create database ;' -U postgres

echo
echo "Reseed test database"
npm run db:init

echo
echo "Running test command $NPM_COMMAND"
npm run $NPM_COMMAND
