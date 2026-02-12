#!/bin/bash

##############################################################################
# Quick Demo Script
# Shows client how to run the comprehensive test suite
##############################################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

clear

echo -e "${CYAN}${BOLD}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗██████╗ ██╗ ██████╗██╗  ██╗██████╗ ███████╗████████╗║
║  ██╔════╝██╔══██╗██║██╔════╝██║ ██╔╝██╔══██╗██╔════╝╚══██╔══╝║
║  ██║     ██████╔╝██║██║     █████╔╝ ██████╔╝█████╗     ██║   ║
║  ██║     ██╔══██╗██║██║     ██╔═██╗ ██╔══██╗██╔══╝     ██║   ║
║  ╚██████╗██║  ██║██║╚██████╗██║  ██╗██████╔╝███████╗   ██║   ║
║   ╚═════╝╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝╚═════╝ ╚══════╝   ╚═╝   ║
║                                                              ║
║              API TEST SUITE - CLIENT DEMONSTRATION           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${BLUE}${BOLD}Welcome to the CrickBet API Test Suite!${NC}\n"

echo -e "${YELLOW}This comprehensive test suite will demonstrate:${NC}"
echo -e "  1. ${GREEN}✓${NC} User Authentication (Register & Login)"
echo -e "  2. ${GREEN}✓${NC} Wallet Deposits (with multiple payment methods)"
echo -e "  3. ${GREEN}✓${NC} Wallet Withdrawals (with bank details)"
echo -e "  4. ${GREEN}✓${NC} Betting Logic (place bets, track balance)"
echo -e ""

echo -e "${BLUE}${BOLD}Prerequisites Check:${NC}"

# Check if server is running
echo -n "  • Backend server... "
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not running${NC}"
  echo -e "\n${YELLOW}Please start the backend server first:${NC}"
  echo -e "  cd backend"
  echo -e "  npm start"
  exit 1
fi

# Check required tools
echo -n "  • curl command... "
if command -v curl &> /dev/null; then
  echo -e "${GREEN}✓ Installed${NC}"
else
  echo -e "${RED}✗ Missing${NC}"
  exit 1
fi

echo -n "  • jq command... "
if command -v jq &> /dev/null; then
  echo -e "${GREEN}✓ Installed${NC}"
else
  echo -e "${RED}✗ Missing (run: brew install jq)${NC}"
  exit 1
fi

echo -e ""
echo -e "${BLUE}${BOLD}Available Test Options:${NC}\n"

echo -e "${CYAN}1. Run Complete Test Suite${NC}"
echo -e "   Tests all features in sequence (recommended for client demo)"
echo -e "   ${YELLOW}Command:${NC} ./test-all.sh"
echo -e ""

echo -e "${CYAN}2. Run Individual Tests${NC}"
echo -e "   Test specific features separately:"
echo -e "   ${YELLOW}• Authentication:${NC} ./test-auth.sh"
echo -e "   ${YELLOW}• Deposits:${NC}       ./test-deposit.sh"
echo -e "   ${YELLOW}• Withdrawals:${NC}    ./test-withdrawal.sh"
echo -e "   ${YELLOW}• Betting:${NC}        ./test-betting.sh"
echo -e ""

echo -e "${BLUE}${BOLD}Test Execution Time:${NC}"
echo -e "  • Individual tests: ~10-15 seconds each"
echo -e "  • Complete suite: ~30-45 seconds"
echo -e ""

# Ask user what they want to do
echo -e "${YELLOW}${BOLD}What would you like to do?${NC}"
echo -e "  ${CYAN}1${NC} - Run complete test suite (recommended)"
echo -e "  ${CYAN}2${NC} - Run individual tests"
echo -e "  ${CYAN}q${NC} - Quit"
echo -e ""
read -p "Enter your choice: " choice

case $choice in
  1)
    echo -e "\n${GREEN}${BOLD}Starting complete test suite...${NC}\n"
    sleep 2
    ./test-all.sh
    ;;
  2)
    echo -e "\n${BLUE}${BOLD}Individual Test Menu:${NC}"
    echo -e "  ${CYAN}1${NC} - Authentication Test"
    echo -e "  ${CYAN}2${NC} - Deposit Test"
    echo -e "  ${CYAN}3${NC} - Withdrawal Test"
    echo -e "  ${CYAN}4${NC} - Betting Test"
    echo -e "  ${CYAN}a${NC} - Run all individual tests in sequence"
    echo -e ""
    read -p "Enter your choice: " test_choice
    
    case $test_choice in
      1) ./test-auth.sh ;;
      2) ./test-deposit.sh ;;
      3) ./test-withdrawal.sh ;;
      4) ./test-betting.sh ;;
      a)
        ./test-auth.sh
        echo -e "\n${YELLOW}Press Enter to continue to Deposit test...${NC}"
        read
        ./test-deposit.sh
        echo -e "\n${YELLOW}Press Enter to continue to Withdrawal test...${NC}"
        read
        ./test-withdrawal.sh
        echo -e "\n${YELLOW}Press Enter to continue to Betting test...${NC}"
        read
        ./test-betting.sh
        ;;
      *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
    ;;
  q|Q)
    echo -e "\n${YELLOW}Exiting...${NC}\n"
    exit 0
    ;;
  *)
    echo -e "\n${RED}Invalid choice${NC}\n"
    exit 1
    ;;
esac

echo -e "\n${GREEN}${BOLD}Test execution completed!${NC}\n"
echo -e "${BLUE}For detailed documentation, see: ${NC}README-TESTS.md\n"
