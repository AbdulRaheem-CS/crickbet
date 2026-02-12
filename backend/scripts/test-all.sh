#!/bin/bash

##############################################################################
# Master Test Script
# Runs all API tests in sequence to demonstrate complete functionality
##############################################################################

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}${BOLD}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        CRICKBET API COMPREHENSIVE TEST SUITE               ║"
echo "║                                                            ║"
echo "║  Testing all major functionalities:                        ║"
echo "║  • Authentication (Register & Login)                       ║"
echo "║  • Wallet Deposits                                         ║"
echo "║  • Wallet Withdrawals                                      ║"
echo "║  • Betting Logic                                           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${API_URL:-http://localhost:5001/api}"
FAILED_TESTS=0

echo -e "${BLUE}Configuration:${NC}"
echo -e "  API URL: $API_URL"
echo -e "  Script Dir: $SCRIPT_DIR"
echo -e "\n${YELLOW}Starting tests in 3 seconds...${NC}\n"
sleep 3

# Function to run test and track results
run_test() {
  local test_name=$1
  local test_script=$2
  
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}${BOLD}  RUNNING: $test_name${NC}"
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  
  if bash "$SCRIPT_DIR/$test_script"; then
    echo -e "\n${GREEN}${BOLD}✓ $test_name PASSED${NC}\n"
    sleep 2
  else
    echo -e "\n${RED}${BOLD}✗ $test_name FAILED${NC}\n"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 2
  fi
}

# Run all tests in sequence
run_test "AUTHENTICATION TEST" "test-auth.sh"
run_test "DEPOSIT TEST" "test-deposit.sh"
run_test "WITHDRAWAL TEST" "test-withdrawal.sh"
run_test "BETTING TEST" "test-betting.sh"

# Final Summary
echo -e "${CYAN}${BOLD}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                    TEST SUMMARY                            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ ALL TESTS PASSED SUCCESSFULLY!${NC}\n"
  echo -e "${GREEN}Summary:${NC}"
  echo -e "  ${GREEN}✓${NC} Authentication (Register & Login)"
  echo -e "  ${GREEN}✓${NC} Wallet Deposits (with payment methods)"
  echo -e "  ${GREEN}✓${NC} Wallet Withdrawals (with bank details)"
  echo -e "  ${GREEN}✓${NC} Betting Logic (place bet, check balance, history)"
  echo -e "\n${BLUE}All core functionalities are working correctly!${NC}\n"
  exit 0
else
  echo -e "${RED}${BOLD}✗ SOME TESTS FAILED${NC}\n"
  echo -e "${RED}Failed Tests: $FAILED_TESTS${NC}\n"
  echo -e "${YELLOW}Please check the output above for error details.${NC}\n"
  exit 1
fi
