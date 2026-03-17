#!/bin/bash
# Tentacles LMA - Secure End-User Installer
# Wrap everything in a function to prevent partial execution if the connection drops during download.

install_tentacles() {
    echo "====================================================="
    echo " 🦑 WELCOME TO TENTACLES LMA INSTALLER 🦑"
    echo "====================================================="
    echo ""

    # 1. Dependency Checks
    echo "[1/4] Checking system requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Error: Node.js is not installed. Please install Node.js (v18+) and try again."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker is not installed. Please install Docker Engine and try again."
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        echo "❌ Error: Git is not installed. Please install Git and try again."
        exit 1
    fi

    echo "✅ All prerequisites met (Node.js, Docker, Git)."

    # 2. Clone Repository
    echo ""
    echo "[2/4] Cloning Tentacles core repository..."
    if [ -d "tentacles" ]; then
        echo "⚠️  Directory 'tentacles' already exists. Skipping clone..."
        cd tentacles || exit 1
    else
        git clone https://github.com/afiatana/tentacles.git
        if [ $? -ne 0 ]; then
            echo "❌ Error: Failed to clone repository."
            exit 1
        fi
        cd tentacles || exit 1
    fi

    # 3. Install CLI Dependencies dynamically (to ensure wizard runs smoothly)
    echo ""
    echo "[3/4] Initializing CLI Wizard engine..."
    # We install 'prompts' temporarily in the root to power the CLI wizard
    npm install prompts --no-fund --no-audit --loglevel=error

    # 4. Launch Interactive Setup Wizard
    echo ""
    echo "[4/4] Launching Interactive Configuration Wizard..."
    if [ -f "cli/onboard.js" ]; then
        node cli/onboard.js
    else
        echo "❌ Error: cli/onboard.js not found in repository."
        exit 1
    fi
}

# Execute the wrapped function
install_tentacles
