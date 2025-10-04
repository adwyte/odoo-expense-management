#!/bin/bash

# API Testing Script for Odoo Expense Management
# This script tests all the authentication and user management endpoints

BASE_URL="http://localhost:5000"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_test() {
    echo -e "${BLUE}🧪 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Company Signup (First User)
print_test "Company Signup"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "admin@testcompany.com",
    "password": "securepassword123",
    "first_name": "Test",
    "last_name": "Admin",
    "company_name": "Test Company Ltd",
    "company_email": "contact@testcompany.com",
    "country_code": "US",
    "company_phone": "+1-555-0123",
    "company_address": "123 Test Street, Test City, TS 12345"
  }')

if echo "$SIGNUP_RESPONSE" | grep -q "access_token"; then
    print_success "Company signup successful"
    ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
    USER_ID=$(echo "$SIGNUP_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")
    print_info "Access token obtained: ${ACCESS_TOKEN:0:20}..."
else
    print_error "Company signup failed"
    echo "$SIGNUP_RESPONSE"
    exit 1
fi

# Test 2: Login
print_test "User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "admin@testcompany.com",
    "password": "securepassword123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    print_success "Login successful"
else
    print_error "Login failed"
    echo "$LOGIN_RESPONSE"
fi

# Test 3: Get Current User
print_test "Get Current User"
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$USER_RESPONSE" | grep -q "admin@testcompany.com"; then
    print_success "Get current user successful"
else
    print_error "Get current user failed"
    echo "$USER_RESPONSE"
fi

# Test 4: Create Manager
print_test "Create Manager"
MANAGER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "email": "manager@testcompany.com",
    "password": "manager123",
    "first_name": "Test",
    "last_name": "Manager",
    "role": "manager"
  }')

if echo "$MANAGER_RESPONSE" | grep -q "manager@testcompany.com"; then
    print_success "Manager creation successful"
    MANAGER_ID=$(echo "$MANAGER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")
else
    print_error "Manager creation failed"
    echo "$MANAGER_RESPONSE"
fi

# Test 5: Create Employee
print_test "Create Employee"
EMPLOYEE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"email\": \"employee@testcompany.com\",
    \"password\": \"employee123\",
    \"first_name\": \"Test\",
    \"last_name\": \"Employee\",
    \"role\": \"employee\",
    \"manager_id\": \"$MANAGER_ID\"
  }")

if echo "$EMPLOYEE_RESPONSE" | grep -q "employee@testcompany.com"; then
    print_success "Employee creation successful"
    EMPLOYEE_ID=$(echo "$EMPLOYEE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")
else
    print_error "Employee creation failed"
    echo "$EMPLOYEE_RESPONSE"
fi

# Test 6: List Users
print_test "List Users"
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$USERS_RESPONSE" | grep -q "users"; then
    print_success "List users successful"
    USER_COUNT=$(echo "$USERS_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['users']))")
    print_info "Total users: $USER_COUNT"
else
    print_error "List users failed"
    echo "$USERS_RESPONSE"
fi

# Test 7: Get Managers
print_test "Get Managers"
MANAGERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/managers" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$MANAGERS_RESPONSE" | grep -q "managers"; then
    print_success "Get managers successful"
else
    print_error "Get managers failed"
    echo "$MANAGERS_RESPONSE"
fi

# Test 8: Update Employee
print_test "Update Employee"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/$EMPLOYEE_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "first_name": "Updated",
    "last_name": "Employee"
  }')

if echo "$UPDATE_RESPONSE" | grep -q "Updated"; then
    print_success "Update employee successful"
else
    print_error "Update employee failed"
    echo "$UPDATE_RESPONSE"
fi

# Test 9: Company Stats
print_test "Company Statistics"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/companies/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$STATS_RESPONSE" | grep -q "total_users"; then
    print_success "Company stats successful"
    TOTAL_USERS=$(echo "$STATS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['total_users'])")
    print_info "Company has $TOTAL_USERS users"
else
    print_error "Company stats failed"
    echo "$STATS_RESPONSE"
fi

# Test 10: Company Info
print_test "Company Information"
COMPANY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/companies/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$COMPANY_RESPONSE" | grep -q "Test Company Ltd"; then
    print_success "Company info successful"
else
    print_error "Company info failed"
    echo "$COMPANY_RESPONSE"
fi

echo ""
print_success "All tests completed!"
print_info "Check the responses above for any failures"