.PHONY: dev backend frontend install

# Start both servers
dev:
	@echo "Starting backend and frontend..."
	@make backend &
	@make frontend

# Start backend
backend:
	cd backend && source .venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start frontend
frontend:
	cd frontend && pnpm dev --port 3000

# Install all dependencies
install:
	cd backend && uv venv && source .venv/bin/activate && uv pip install -r requirements.txt
	cd frontend && pnpm install
