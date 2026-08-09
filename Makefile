.PHONY: help install backend-install frontend-install \
        backend frontend dev \
        migrate makemigrations createsuperuser \
        shell test test-backend test-frontend \
        lint-backend lint-frontend format \
        check clean

# --------------------------------------------------
# Project directories
# --------------------------------------------------

BACKEND_DIR := backend
FRONTEND_DIR := frontend

# --------------------------------------------------
# Default command
# --------------------------------------------------

help:
	@echo ""
	@echo "Room Booking Project"
	@echo "===================="
	@echo ""
	@echo "Setup:"
	@echo "  make install             Install backend and frontend dependencies"
	@echo "  make backend-install     Install Python dependencies with uv"
	@echo "  make frontend-install    Install React dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make backend             Start Django development server"
	@echo "  make frontend            Start React development server"
	@echo "  make dev                 Start backend and frontend"
	@echo ""
	@echo "Django:"
	@echo "  make makemigrations      Create Django migrations"
	@echo "  make migrate             Apply Django migrations"
	@echo "  make createsuperuser     Create Django superuser"
	@echo "  make shell               Open Django shell"
	@echo ""
	@echo "Testing:"
	@echo "  make test                Run backend and frontend tests"
	@echo "  make test-backend        Run Django tests"
	@echo "  make test-frontend       Run React tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint-backend        Check Python code"
	@echo "  make lint-frontend       Check React/JavaScript code"
	@echo "  make format              Format Python code"
	@echo "  make check               Run code quality checks"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean               Remove cache files"
	@echo ""

# --------------------------------------------------
# Installation
# --------------------------------------------------

install: backend-install frontend-install

backend-install:
	cd $(BACKEND_DIR) && uv sync

frontend-install:
	cd $(FRONTEND_DIR) && npm install

# --------------------------------------------------
# Development servers
# --------------------------------------------------

backend:
	cd $(BACKEND_DIR) && uv run python manage.py runserver

frontend:
	cd $(FRONTEND_DIR) && npm run dev

dev:
	@echo "Start backend and frontend in separate terminals:"
	@echo ""
	@echo "Terminal 1:"
	@echo "  make backend"
	@echo ""
	@echo "Terminal 2:"
	@echo "  make frontend"

# --------------------------------------------------
# Django
# --------------------------------------------------

makemigrations:
	cd $(BACKEND_DIR) && uv run python manage.py makemigrations

migrate:
	cd $(BACKEND_DIR) && uv run python manage.py migrate

createsuperuser:
	cd $(BACKEND_DIR) && uv run python manage.py createsuperuser

shell:
	cd $(BACKEND_DIR) && uv run python manage.py shell

# --------------------------------------------------
# Testing
# --------------------------------------------------

test: test-backend test-frontend

test-backend:
	cd $(BACKEND_DIR) && uv run python manage.py test

test-frontend:
	cd $(FRONTEND_DIR) && npm test

# --------------------------------------------------
# Linting
# --------------------------------------------------

lint-backend:
	cd $(BACKEND_DIR) && uv run ruff check .

lint-frontend:
	cd $(FRONTEND_DIR) && npm run lint

# --------------------------------------------------
# Formatting
# --------------------------------------------------

format:
	cd $(BACKEND_DIR) && uv run ruff format .

# --------------------------------------------------
# Complete checks
# --------------------------------------------------

check: lint-backend lint-frontend test-backend

# --------------------------------------------------
# Clean
# --------------------------------------------------

clean:
	cd $(BACKEND_DIR) && \
	find . -type d -name "__pycache__" -prune -exec rm -rf {} \;

	cd $(BACKEND_DIR) && \
	find . -type f -name "*.pyc" -delete;

	cd $(FRONTEND_DIR) && \
	rm -rf node_modules/.cache;

	@echo "Clean completed."