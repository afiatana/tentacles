#!/bin/bash
# Egress Lockdown Implementation (Iptables Host-to-Container Route Sandbox)
# This script sets up the default-deny ruleset for the 'tentacles_internal' bridge.

# Replace bridge_name with the actual docker bridge interface (e.g. br-a1b2c3d4e5)
BRIDGE_IF="br-tentacles"
# Target Subnet from compose
SUBNET="10.99.0.0/16"
# Whitelist LLM and Essential API IP Addresses/CIDRs
WHITELIST_IPS=("1.1.1.1" "8.8.8.8") # Example: Cloudflare and Google DNS
WHITELIST_OAI="api.openai.com" # Requires dnsmasq/ipset in production to resolve dynamically

echo ">>> Applying Egress Lockdown Rules for Tentacles Sandbox ($SUBNET on $BRIDGE_IF)..."

# Flush previous custom chains
iptables -t filter -F FORWARD

# 1. Allow internal Agent-to-Agent (A2A) communication within the subnet
iptables -A FORWARD -i $BRIDGE_IF -o $BRIDGE_IF -j ACCEPT

# 2. Allow established, related connections from the whitelist back inside
iptables -A FORWARD -o $BRIDGE_IF -m state --state ESTABLISHED,RELATED -j ACCEPT

# 3. Whitelist explicit IP connections
for IP in "${WHITELIST_IPS[@]}"; do
    iptables -A FORWARD -i $BRIDGE_IF -d "$IP" -j ACCEPT
    echo "[+] Granted Exception: $IP"
done

# 4. DEFAULT DENY: Drop all other outbound network traffic originating from the containers.
iptables -A FORWARD -i $BRIDGE_IF -j REJECT --reject-with icmp-host-prohibited

echo ">>> Egress Lockdown Engaged. Unauthorized background scraping is now blocked."
