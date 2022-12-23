#!/usr/bin/env pwsh
lint:
	npx eslint  .

fix:
	npx eslint --fix  .
build:
	npm run build
run:
	npm run serve
