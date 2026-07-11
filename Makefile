SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -ExecutionPolicy Bypass -Command

NPM := npm.cmd
MVN := mvn.cmd
BACKEND_DIR := backend

.DEFAULT_GOAL := build

.PHONY: help check install build frontend-build backend-build test clean frontend-dev backend-dev

help:
	@Write-Host "WHU Circle build commands:"
	@Write-Host "  make                 Build frontend and backend"
	@Write-Host "  make install         Install frontend and backend dependencies"
	@Write-Host "  make test            Run the backend automated tests"
	@Write-Host "  make frontend-dev    Start the Vite development server"
	@Write-Host "  make backend-dev     Start Spring Boot with the mysql profile"
	@Write-Host "  make clean           Remove generated build output"

check:
	@Get-Command node, $(NPM), java, $(MVN) -ErrorAction Stop | Out-Null
	@Write-Host "Build tools are available."

install: check
	$(NPM) ci
	Set-Location $(BACKEND_DIR); $(MVN) dependency:go-offline

build: check frontend-build backend-build
	@Write-Host "WHU Circle frontend and backend build completed."

frontend-build:
	$(NPM) run build

backend-build:
	Set-Location $(BACKEND_DIR); $(MVN) -DskipTests package

test: check
	Set-Location $(BACKEND_DIR); $(MVN) test

clean:
	Remove-Item -Recurse -Force dist, $(BACKEND_DIR)/target -ErrorAction SilentlyContinue
	@Write-Host "Generated build output removed."

frontend-dev: check
	$(NPM) run dev

backend-dev: check
	powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./$(BACKEND_DIR)/start-backend.ps1
