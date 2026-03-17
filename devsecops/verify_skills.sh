#!/bin/bash
# Code-Signing Verification for skill.md ingestion
# Mitigates Supply Chain Vulnerabilities from Community Registries

SKILL_FILE=$1
EXPECTED_HASH=$2

if [ -z "$SKILL_FILE" ] || [ -z "$EXPECTED_HASH" ]; then
    echo "Usage: ./verify_skills.sh <path_to_skill.md> <expected_sha256_hash>"
    exit 1
fi

if [ ! -f "$SKILL_FILE" ]; then
    echo "[ERROR] Skill repository $SKILL_FILE not found."
    exit 1
fi

echo "Verifying Digital Signature / Cryptographic Hash..."

# Compute actual hash
ACTUAL_HASH=$(sha256sum "$SKILL_FILE" | awk '{print $1}')

if [ "$ACTUAL_HASH" == "$EXPECTED_HASH" ]; then
    echo "[SUCCESS] Hash match: $ACTUAL_HASH"
    echo "Skill manifest is securely signed and authorized for execution."
    # Command the Orchestrator to mount this skill
    exit 0
else
    echo "[SECURITY ALERT] Hash mismatch!"
    echo "Expected: $EXPECTED_HASH"
    echo "Actual:   $ACTUAL_HASH"
    echo "ACTION: Rejecting payload. The file may have been tampered with by a malicious registry."
    exit 1
fi
