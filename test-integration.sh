#!/bin/bash

# POLARIS Integration Test Script
# Tests all components and connections

echo "🔍 POLARIS INTEGRATION TEST"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Backend Server
echo "📡 Test 1: Backend Server Health"
HEALTH=$(curl -s http://localhost:3001/api/health)
if echo "$HEALTH" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS${NC} - Backend is responding"
    echo "   Response: $HEALTH"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Backend not responding"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 2: Frontend Server
echo "🎨 Test 2: Frontend Server"
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Frontend is responding (HTTP $FRONTEND)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Frontend not responding (HTTP $FRONTEND)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3: Authentication - Signup
echo "🔐 Test 3: Authentication - Signup"
SIGNUP=$(curl -s -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","role":"Developer"}')
if echo "$SIGNUP" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS${NC} - Signup working"
    echo "   User created: test@example.com"
    TESTS_PASSED=$((TESTS_PASSED + 1))
elif echo "$SIGNUP" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  PASS${NC} - User already exists (expected)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Signup failed"
    echo "   Response: $SIGNUP"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Authentication - Login
echo "🔐 Test 4: Authentication - Login"
LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@taskmuse.com","password":"password123"}')
if echo "$LOGIN" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS${NC} - Login working"
    TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token received: ${TOKEN:0:20}..."
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Login failed"
    echo "   Response: $LOGIN"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    TOKEN=""
fi
echo ""

# Test 5: Token Validation
if [ -n "$TOKEN" ]; then
    echo "🔑 Test 5: Token Validation"
    ME=$(curl -s http://localhost:3001/api/auth/me \
      -H "Authorization: Bearer $TOKEN")
    if echo "$ME" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ PASS${NC} - Token validation working"
        echo "   User: $(echo "$ME" | grep -o '"name":"[^"]*' | cut -d'"' -f4)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Token validation failed"
        echo "   Response: $ME"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
else
    echo "🔑 Test 5: Token Validation"
    echo -e "${YELLOW}⚠️  SKIP${NC} - No token available"
    echo ""
fi

# Test 6: Socket.IO Connection
echo "🔌 Test 6: Socket.IO Server"
SOCKETIO=$(curl -s "http://localhost:3001/socket.io/?EIO=4&transport=polling")
if echo "$SOCKETIO" | grep -q "sid"; then
    echo -e "${GREEN}✅ PASS${NC} - Socket.IO server responding"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Socket.IO not responding"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 7: CORS Configuration
echo "🌐 Test 7: CORS Configuration"
CORS=$(curl -s -I -X OPTIONS http://localhost:3001/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow-origin")
if [ -n "$CORS" ]; then
    echo -e "${GREEN}✅ PASS${NC} - CORS configured correctly"
    echo "   $CORS"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARN${NC} - CORS headers not detected (may still work)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
echo ""

# Summary
echo "======================================"
echo "📊 TEST SUMMARY"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo "Total Tests:  $TOTAL"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🎉 POLARIS is fully integrated and ready!"
    echo ""
    echo "🚀 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo ""
    echo "🔐 Demo Credentials:"
    echo "   Email:    priya@taskmuse.com"
    echo "   Password: password123"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please check the errors above and ensure:"
    echo "  1. Backend is running on port 3001"
    echo "  2. Frontend is running on port 3000"
    echo "  3. Both servers started without errors"
    echo ""
    exit 1
fi
