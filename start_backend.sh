#!/bin/bash

# Navigate to the script's directory (project root)
cd "$(dirname "$0")"

# Activate the local virtual environment
if [ -d ".venv" ]; then
    echo "Activating virtual environment (.venv)..."
    source .venv/bin/activate
else
    echo "Warning: .venv directory not found. Trying global environment."
fi

# Run the FastAPI server using uvicorn
echo "Starting FastAPI backend server on port 8000..."
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
