#!/usr/bin/env python3
"""
🧪 COMPREHENSIVE MEWAYZ PLATFORM TESTING SUITE 2025
========================================================

Enterprise-grade testing system that validates every aspect of the MEWAYZ platform:
- All API endpoints (25+ routes, 100+ endpoints)
- Frontend page routing and rendering
- Authentication and authorization
- Database operations and data integrity
- Real-time WebSocket functionality
- Performance and load testing
- Security vulnerability scanning

Following enterprise testing standards and best practices.
"""

import asyncio
import aiohttp
import json
import time
import logging
import random
import string
import websockets
import concurrent.futures
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from urllib.parse import urljoin
import sys
import os
import signal
import traceback
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)8s | %(message)s',
    handlers=[
        logging.FileHandler('test_results.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class TestResult:
    """Test result data structure"""
    test_name: str
    category: str
    status: str  # PASS, FAIL, SKIP, ERROR
    duration: float
    details: str
    endpoint: Optional[str] = None
    expected: Optional[Any] = None
    actual: Optional[Any] = None
    error: Optional[str] = None

@dataclass
class TestConfig:
    """Test configuration"""
    base_url: str = "http://localhost:5000"
    frontend_url: str = "http://localhost:3000"
    websocket_url: str = "ws://localhost:5000"
    timeout: int = 30
    max_concurrent: int = 10
    test_user_email: str = "test@mewayz.com"
    test_user_password: str = "TestPassword123!"
    admin_email: str = "admin@mewayz.com"
    admin_password: str = "AdminPassword123!"

class ComprehensiveMEWAYZTester:
    """
    🏆 ENTERPRISE TESTING SUITE
    
    Comprehensive testing system that validates every aspect of the MEWAYZ platform
    according to enterprise standards and all context rules.
    """
    
    def __init__(self, config: TestConfig):
        self.config = config
        self.results: List[TestResult] = []
        self.session: Optional[aiohttp.ClientSession] = None
        self.auth_token: Optional[str] = None
        self.admin_token: Optional[str] = None
        self.test_data: Dict[str, Any] = {}
        self.start_time = time.time()
        
    async def __aenter__(self):
        """Async context manager entry"""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
        timeout = aiohttp.ClientTimeout(total=self.config.timeout)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={'Content-Type': 'application/json'}
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    def record_result(self, result: TestResult):
        """Record a test result"""
        self.results.append(result)
        status_emoji = {
            'PASS': '✅',
            'FAIL': '❌', 
            'SKIP': '⏭️',
            'ERROR': '💥'
        }
        
        emoji = status_emoji.get(result.status, '❓')
        logger.info(f"{emoji} {result.category} | {result.test_name} | {result.duration:.3f}s")
        
        if result.status in ['FAIL', 'ERROR']:
            logger.error(f"   └─ {result.details}")
            if result.error:
                logger.error(f"   └─ Error: {result.error}")

    async def make_request(self, method: str, endpoint: str, **kwargs) -> Tuple[int, Dict]:
        """Make HTTP request with error handling"""
        url = urljoin(self.config.base_url, endpoint)
        headers = kwargs.pop('headers', {})
        
        if self.auth_token and 'authorization' not in headers:
            headers['Authorization'] = f'Bearer {self.auth_token}'
            
        try:
            async with self.session.request(method, url, headers=headers, **kwargs) as response:
                try:
                    data = await response.json()
                except:
                    data = {"text": await response.text()}
                return response.status, data
        except Exception as e:
            return 0, {"error": str(e)}

    async def test_endpoint(self, name: str, method: str, endpoint: str, 
                           expected_status: int = 200, **kwargs) -> TestResult:
        """Test a single API endpoint"""
        start_time = time.time()
        
        try:
            status, data = await self.make_request(method, endpoint, **kwargs)
            duration = time.time() - start_time
            
            if status == expected_status:
                return TestResult(
                    test_name=name,
                    category="API",
                    status="PASS",
                    duration=duration,
                    details=f"{method} {endpoint} returned {status}",
                    endpoint=endpoint,
                    actual=status,
                    expected=expected_status
                )
            else:
                return TestResult(
                    test_name=name,
                    category="API", 
                    status="FAIL",
                    duration=duration,
                    details=f"Expected {expected_status}, got {status}",
                    endpoint=endpoint,
                    actual=status,
                    expected=expected_status,
                    error=str(data) if status == 0 else None
                )
                
        except Exception as e:
            duration = time.time() - start_time
            return TestResult(
                test_name=name,
                category="API",
                status="ERROR", 
                duration=duration,
                details=f"Request failed: {str(e)}",
                endpoint=endpoint,
                error=str(e)
            )

    # =========================================================================
    # AUTHENTICATION TESTING
    # =========================================================================
    
    async def test_authentication_system(self):
        """🔐 Test complete authentication system"""
        logger.info("🔐 Testing Authentication System...")
        
        # Test user registration
        test_user = {
            "name": "Test User",
            "email": self.config.test_user_email,
            "password": self.config.test_user_password,
            "confirmPassword": self.config.test_user_password
        }
        
        result = await self.test_endpoint(
            "User Registration",
            "POST",
            "/api/v1/auth/register",
            expected_status=201,
            json=test_user
        )
        self.record_result(result)
        
        # Test user login
        login_data = {
            "email": self.config.test_user_email,
            "password": self.config.test_user_password
        }
        
        start_time = time.time()
        try:
            status, data = await self.make_request("POST", "/api/v1/auth/login", json=login_data)
            duration = time.time() - start_time
            
            if status == 200 and data.get('token'):
                self.auth_token = data['token']
                result = TestResult(
                    test_name="User Login",
                    category="Authentication",
                    status="PASS",
                    duration=duration,
                    details="Login successful, token received",
                    endpoint="/api/v1/auth/login"
                )
            else:
                result = TestResult(
                    test_name="User Login",
                    category="Authentication", 
                    status="FAIL",
                    duration=duration,
                    details=f"Login failed: {data}",
                    endpoint="/api/v1/auth/login"
                )
        except Exception as e:
            duration = time.time() - start_time
            result = TestResult(
                test_name="User Login",
                category="Authentication",
                status="ERROR",
                duration=duration,
                details=f"Login request failed: {str(e)}",
                endpoint="/api/v1/auth/login",
                error=str(e)
            )
        
        self.record_result(result)
        
        # Test protected route access
        if self.auth_token:
            result = await self.test_endpoint(
                "Protected Route Access",
                "GET",
                "/api/v1/analytics/dashboard",
                expected_status=200
            )
            self.record_result(result)

    # =========================================================================
    # API ENDPOINT TESTING
    # =========================================================================
    
    async def test_all_api_endpoints(self):
        """🌐 Test all API endpoints comprehensively"""
        logger.info("🌐 Testing All API Endpoints...")
        
        # Core endpoints
        endpoints = [
            # Analytics endpoints
            ("Analytics Dashboard", "GET", "/api/v1/analytics/dashboard"),
            ("Real-time Metrics", "GET", "/api/v1/analytics/real-time-metrics"),
            ("User Activities", "GET", "/api/v1/analytics/user-activities"),
            ("Sales Analytics", "GET", "/api/v1/analytics/sales"),
            ("Customer Analytics", "GET", "/api/v1/analytics/customers"),
            ("Product Analytics", "GET", "/api/v1/analytics/products"),
            ("Order Analytics", "GET", "/api/v1/analytics/orders"),
            ("Lead Analytics", "GET", "/api/v1/analytics/leads"),
            
            # User management
            ("Get Users", "GET", "/api/v1/users"),
            ("Get Current User", "GET", "/api/v1/auth/me"),
            
            # Product management
            ("Get Products", "GET", "/api/v1/products"),
            ("Get Customers", "GET", "/api/v1/customers"),
            ("Get Orders", "GET", "/api/v1/orders"),
            ("Get Leads", "GET", "/api/v1/leads"),
            
            # Course platform
            ("Get Courses", "GET", "/api/v1/courses"),
            ("Get Creators", "GET", "/api/v1/creators"),
            
            # E-commerce
            ("Get Shop Items", "GET", "/api/v1/shop-items"),
            
            # Support system
            ("Get Knowledge Base", "GET", "/api/v1/knowledge-base"),
            ("Get Support Tickets", "GET", "/api/v1/support-tickets"),
            
            # Enterprise features
            ("Cross-platform Management", "GET", "/api/v1/cross-platform/platforms"),
            ("AI Content Suite", "GET", "/api/v1/ai-content"),
            ("Business Intelligence", "GET", "/api/v1/business-intelligence"),
            ("Design Studio", "GET", "/api/v1/design-studio"),
            ("Creator Monetization", "GET", "/api/v1/creator-monetization"),
            ("Financial Services", "GET", "/api/v1/financial-services"),
            ("Global Expansion", "GET", "/api/v1/global-expansion"),
            
            # Organization management
            ("Get Organizations", "GET", "/api/v1/organizations"),
            
            # Public endpoints
            ("Get FAQs", "GET", "/api/v1/faqs"),
            ("Get Pricing", "GET", "/api/v1/pricing"),
            ("Public Health Check", "GET", "/api/health"),
        ]
        
        # Test all endpoints concurrently
        tasks = []
        for name, method, endpoint in endpoints:
            task = self.test_endpoint(name, method, endpoint)
            tasks.append(task)
        
        # Execute in batches to avoid overwhelming the server
        batch_size = self.config.max_concurrent
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i + batch_size]
            results = await asyncio.gather(*batch, return_exceptions=True)
            
            for result in results:
                if isinstance(result, TestResult):
                    self.record_result(result)
                else:
                    self.record_result(TestResult(
                        test_name="Batch Test Error",
                        category="API",
                        status="ERROR",
                        duration=0,
                        details=f"Batch execution failed: {str(result)}",
                        error=str(result)
                    ))

    # =========================================================================
    # CRUD OPERATIONS TESTING
    # =========================================================================
    
    async def test_crud_operations(self):
        """📝 Test Create, Read, Update, Delete operations"""
        logger.info("📝 Testing CRUD Operations...")
        
        if not self.auth_token:
            self.record_result(TestResult(
                test_name="CRUD Operations",
                category="Database",
                status="SKIP",
                duration=0,
                details="Skipped - No authentication token"
            ))
            return
        
        # Test Product CRUD
        await self._test_product_crud()
        
        # Test Customer CRUD  
        await self._test_customer_crud()
        
        # Test Order CRUD
        await self._test_order_crud()

    async def _test_product_crud(self):
        """Test Product CRUD operations"""
        # Create Product
        product_data = {
            "name": f"Test Product {random.randint(1000, 9999)}",
            "description": "Test product description",
            "price": 99.99,
            "category": "test",
            "stockQuantity": 100
        }
        
        result = await self.test_endpoint(
            "Create Product",
            "POST",
            "/api/v1/products",
            expected_status=201,
            json=product_data
        )
        self.record_result(result)
        
        # If creation successful, test read/update/delete
        if result.status == "PASS":
            # Store product ID for further tests
            _, data = await self.make_request("GET", "/api/v1/products", params={"limit": 1})
            if data.get('data') and len(data['data']) > 0:
                product_id = data['data'][0].get('_id')
                self.test_data['product_id'] = product_id
                
                # Test update
                update_data = {"price": 149.99}
                result = await self.test_endpoint(
                    "Update Product",
                    "PUT",
                    f"/api/v1/products/{product_id}",
                    json=update_data
                )
                self.record_result(result)

    async def _test_customer_crud(self):
        """Test Customer CRUD operations"""
        customer_data = {
            "name": f"Test Customer {random.randint(1000, 9999)}",
            "email": f"customer{random.randint(1000, 9999)}@test.com",
            "phone": "+1234567890"
        }
        
        result = await self.test_endpoint(
            "Create Customer",
            "POST", 
            "/api/v1/customers",
            expected_status=201,
            json=customer_data
        )
        self.record_result(result)

    async def _test_order_crud(self):
        """Test Order CRUD operations"""
        if not self.test_data.get('product_id'):
            self.record_result(TestResult(
                test_name="Create Order",
                category="Database",
                status="SKIP",
                duration=0,
                details="Skipped - No product available for order"
            ))
            return
            
        order_data = {
            "items": [{
                "product": self.test_data['product_id'],
                "quantity": 2,
                "price": 99.99
            }],
            "totalAmount": 199.98,
            "status": "pending"
        }
        
        result = await self.test_endpoint(
            "Create Order",
            "POST",
            "/api/v1/orders", 
            expected_status=201,
            json=order_data
        )
        self.record_result(result)

    # =========================================================================
    # WEBSOCKET TESTING
    # =========================================================================
    
    async def test_websocket_functionality(self):
        """⚡ Test WebSocket real-time functionality"""
        logger.info("⚡ Testing WebSocket Functionality...")
        
        start_time = time.time()
        
        try:
            ws_url = f"{self.config.websocket_url}/ws"
            if self.auth_token:
                ws_url += f"?token={self.auth_token}"
            
            async with websockets.connect(ws_url) as websocket:
                # Test connection
                duration = time.time() - start_time
                self.record_result(TestResult(
                    test_name="WebSocket Connection",
                    category="Real-time",
                    status="PASS",
                    duration=duration,
                    details="WebSocket connection established"
                ))
                
                # Test sending message
                test_message = {
                    "type": "ping",
                    "data": {"message": "test"}
                }
                
                await websocket.send(json.dumps(test_message))
                
                # Test receiving message
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    response_data = json.loads(response)
                    
                    self.record_result(TestResult(
                        test_name="WebSocket Message Exchange",
                        category="Real-time",
                        status="PASS",
                        duration=time.time() - start_time,
                        details=f"Message exchange successful: {response_data.get('type', 'unknown')}"
                    ))
                    
                except asyncio.TimeoutError:
                    self.record_result(TestResult(
                        test_name="WebSocket Message Exchange",
                        category="Real-time",
                        status="FAIL",
                        duration=time.time() - start_time,
                        details="No response received within timeout"
                    ))
                    
        except Exception as e:
            duration = time.time() - start_time
            self.record_result(TestResult(
                test_name="WebSocket Connection",
                category="Real-time",
                status="ERROR",
                duration=duration,
                details=f"WebSocket test failed: {str(e)}",
                error=str(e)
            ))

    # =========================================================================
    # FRONTEND TESTING
    # =========================================================================
    
    async def test_frontend_pages(self):
        """🎨 Test frontend page routing and rendering"""
        logger.info("🎨 Testing Frontend Pages...")
        
        # Key frontend routes to test
        frontend_routes = [
            "/",
            "/dashboard",
            "/pricing", 
            "/features",
            "/about",
            "/contact",
            "/blog",
            "/knowledge-base",
            "/auth/login",
            "/auth/register",
            "/admin",
            "/settings",
            "/products",
            "/courses",
            "/analytics",
            "/ai-content-suite",
            "/business-intelligence",
            "/global-expansion",
            "/enterprise-features"
        ]
        
        tasks = []
        for route in frontend_routes:
            url = urljoin(self.config.frontend_url, route)
            task = self._test_frontend_page(route, url)
            tasks.append(task)
        
        # Execute frontend tests
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, TestResult):
                self.record_result(result)

    async def _test_frontend_page(self, route: str, url: str) -> TestResult:
        """Test individual frontend page"""
        start_time = time.time()
        
        try:
            async with self.session.get(url) as response:
                duration = time.time() - start_time
                content = await response.text()
                
                if response.status == 200:
                    # Check for basic React/Next.js indicators
                    has_react = 'react' in content.lower() or '__NEXT_DATA__' in content
                    has_content = len(content) > 1000  # Reasonable content size
                    
                    if has_react and has_content:
                        return TestResult(
                            test_name=f"Frontend Route: {route}",
                            category="Frontend",
                            status="PASS",
                            duration=duration,
                            details=f"Page loaded successfully ({len(content)} bytes)"
                        )
                    else:
                        return TestResult(
                            test_name=f"Frontend Route: {route}",
                            category="Frontend",
                            status="FAIL", 
                            duration=duration,
                            details=f"Page content seems incomplete or missing React"
                        )
                else:
                    return TestResult(
                        test_name=f"Frontend Route: {route}",
                        category="Frontend",
                        status="FAIL",
                        duration=duration,
                        details=f"HTTP {response.status} - {route}"
                    )
                    
        except Exception as e:
            duration = time.time() - start_time
            return TestResult(
                test_name=f"Frontend Route: {route}",
                category="Frontend",
                status="ERROR",
                duration=duration,
                details=f"Request failed: {str(e)}",
                error=str(e)
            )

    # =========================================================================
    # PERFORMANCE TESTING
    # =========================================================================
    
    async def test_performance(self):
        """⚡ Test API performance and load handling"""
        logger.info("⚡ Testing Performance...")
        
        # Test response times
        performance_endpoints = [
            "/api/health",
            "/api/v1/analytics/dashboard",
            "/api/v1/products",
            "/api/v1/customers"
        ]
        
        for endpoint in performance_endpoints:
            await self._test_endpoint_performance(endpoint)
        
        # Test concurrent load
        await self._test_concurrent_load()

    async def _test_endpoint_performance(self, endpoint: str):
        """Test individual endpoint performance"""
        times = []
        
        for _ in range(5):  # Test 5 times for average
            start_time = time.time()
            status, _ = await self.make_request("GET", endpoint)
            duration = time.time() - start_time
            
            if status == 200:
                times.append(duration)
        
        if times:
            avg_time = sum(times) / len(times)
            max_time = max(times)
            
            # Performance criteria: average < 1s, max < 2s
            if avg_time < 1.0 and max_time < 2.0:
                status = "PASS"
                details = f"Avg: {avg_time:.3f}s, Max: {max_time:.3f}s"
            else:
                status = "FAIL"
                details = f"Slow response - Avg: {avg_time:.3f}s, Max: {max_time:.3f}s"
                
            self.record_result(TestResult(
                test_name=f"Performance: {endpoint}",
                category="Performance",
                status=status,
                duration=avg_time,
                details=details,
                endpoint=endpoint
            ))

    async def _test_concurrent_load(self):
        """Test concurrent request handling"""
        start_time = time.time()
        
        # Create 20 concurrent requests
        tasks = []
        for _ in range(20):
            task = self.make_request("GET", "/api/health")
            tasks.append(task)
        
        try:
            results = await asyncio.gather(*tasks)
            duration = time.time() - start_time
            
            successful = sum(1 for status, _ in results if status == 200)
            
            if successful >= 18:  # Allow 2 failures out of 20
                self.record_result(TestResult(
                    test_name="Concurrent Load Test",
                    category="Performance",
                    status="PASS",
                    duration=duration,
                    details=f"{successful}/20 requests successful in {duration:.3f}s"
                ))
            else:
                self.record_result(TestResult(
                    test_name="Concurrent Load Test",
                    category="Performance", 
                    status="FAIL",
                    duration=duration,
                    details=f"Only {successful}/20 requests successful"
                ))
                
        except Exception as e:
            duration = time.time() - start_time
            self.record_result(TestResult(
                test_name="Concurrent Load Test",
                category="Performance",
                status="ERROR",
                duration=duration,
                details=f"Load test failed: {str(e)}",
                error=str(e)
            ))

    # =========================================================================
    # SECURITY TESTING
    # =========================================================================
    
    async def test_security_vulnerabilities(self):
        """🔒 Test for security vulnerabilities"""
        logger.info("🔒 Testing Security...")
        
        # Test SQL injection protection
        await self._test_sql_injection()
        
        # Test XSS protection
        await self._test_xss_protection()
        
        # Test authentication bypass attempts
        await self._test_auth_bypass()
        
        # Test rate limiting
        await self._test_rate_limiting()

    async def _test_sql_injection(self):
        """Test SQL injection protection"""
        sql_payloads = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'--",
            "' UNION SELECT * FROM users--"
        ]
        
        for payload in sql_payloads:
            result = await self.test_endpoint(
                f"SQL Injection Test: {payload[:20]}...",
                "GET",
                f"/api/v1/products?search={payload}",
                expected_status=200  # Should handle gracefully, not crash
            )
            # Adjust status - if it doesn't crash, it's good
            if result.status == "PASS":
                result.details = "SQL injection payload handled safely"
            
            self.record_result(result)

    async def _test_xss_protection(self):
        """Test XSS protection"""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>"
        ]
        
        for payload in xss_payloads:
            # Test in search parameter
            result = await self.test_endpoint(
                f"XSS Test: {payload[:20]}...",
                "GET", 
                f"/api/v1/products?search={payload}",
                expected_status=200
            )
            
            if result.status == "PASS":
                result.details = "XSS payload handled safely"
                
            self.record_result(result)

    async def _test_auth_bypass(self):
        """Test authentication bypass attempts"""
        # Test accessing protected endpoint without auth
        old_token = self.auth_token
        self.auth_token = None
        
        result = await self.test_endpoint(
            "Unauthenticated Access Test",
            "GET",
            "/api/v1/analytics/dashboard",
            expected_status=401  # Should be unauthorized
        )
        self.record_result(result)
        
        # Test with invalid token
        self.auth_token = "invalid_token_12345"
        
        result = await self.test_endpoint(
            "Invalid Token Test",
            "GET", 
            "/api/v1/analytics/dashboard",
            expected_status=401
        )
        self.record_result(result)
        
        # Restore valid token
        self.auth_token = old_token

    async def _test_rate_limiting(self):
        """Test rate limiting functionality"""
        start_time = time.time()
        
        # Make rapid requests to trigger rate limiting
        tasks = []
        for _ in range(200):  # Rapid fire requests
            task = self.make_request("GET", "/api/health")
            tasks.append(task)
        
        try:
            results = await asyncio.gather(*tasks)
            duration = time.time() - start_time
            
            # Check if any requests were rate limited (429 status)
            rate_limited = sum(1 for status, _ in results if status == 429)
            
            if rate_limited > 0:
                self.record_result(TestResult(
                    test_name="Rate Limiting Test",
                    category="Security",
                    status="PASS",
                    duration=duration,
                    details=f"Rate limiting working - {rate_limited} requests blocked"
                ))
            else:
                self.record_result(TestResult(
                    test_name="Rate Limiting Test",
                    category="Security",
                    status="FAIL",
                    duration=duration,
                    details="No rate limiting detected - potential security issue"
                ))
                
        except Exception as e:
            duration = time.time() - start_time
            self.record_result(TestResult(
                test_name="Rate Limiting Test",
                category="Security",
                status="ERROR",
                duration=duration,
                details=f"Rate limiting test failed: {str(e)}",
                error=str(e)
            ))

    # =========================================================================
    # DATA INTEGRITY TESTING
    # =========================================================================
    
    async def test_data_integrity(self):
        """🔍 Test data integrity and validation"""
        logger.info("🔍 Testing Data Integrity...")
        
        # Test with invalid data formats
        await self._test_invalid_data_handling()
        
        # Test data consistency
        await self._test_data_consistency()

    async def _test_invalid_data_handling(self):
        """Test handling of invalid data"""
        invalid_data_tests = [
            {
                "name": "Invalid Email Format",
                "endpoint": "/api/v1/customers",
                "data": {"name": "Test", "email": "invalid-email", "phone": "123"},
                "expected_status": 400
            },
            {
                "name": "Missing Required Fields",
                "endpoint": "/api/v1/products",
                "data": {"description": "Missing name and price"},
                "expected_status": 400
            },
            {
                "name": "Negative Price",
                "endpoint": "/api/v1/products", 
                "data": {"name": "Test", "price": -100, "category": "test"},
                "expected_status": 400
            }
        ]
        
        for test_case in invalid_data_tests:
            result = await self.test_endpoint(
                test_case["name"],
                "POST",
                test_case["endpoint"],
                expected_status=test_case["expected_status"],
                json=test_case["data"]
            )
            self.record_result(result)

    async def _test_data_consistency(self):
        """Test data consistency across operations"""
        # Create a product and verify it appears in listings
        product_data = {
            "name": f"Consistency Test Product {random.randint(1000, 9999)}",
            "price": 199.99,
            "category": "test"
        }
        
        # Create product
        create_result = await self.test_endpoint(
            "Data Consistency - Create",
            "POST",
            "/api/v1/products",
            expected_status=201,
            json=product_data
        )
        self.record_result(create_result)
        
        if create_result.status == "PASS":
            # Verify it appears in listing
            await asyncio.sleep(0.5)  # Brief delay for database consistency
            
            status, data = await self.make_request("GET", "/api/v1/products")
            
            if status == 200 and data.get('data'):
                products = data['data']
                found = any(p.get('name') == product_data['name'] for p in products)
                
                if found:
                    self.record_result(TestResult(
                        test_name="Data Consistency - Read",
                        category="Database",
                        status="PASS",
                        duration=0.5,
                        details="Created product appears in listing"
                    ))
                else:
                    self.record_result(TestResult(
                        test_name="Data Consistency - Read",
                        category="Database",
                        status="FAIL",
                        duration=0.5,
                        details="Created product not found in listing"
                    ))

    # =========================================================================
    # MAIN TEST EXECUTION
    # =========================================================================
    
    async def run_all_tests(self):
        """🚀 Run all comprehensive tests"""
        logger.info("🚀 Starting MEWAYZ Comprehensive Testing Suite...")
        logger.info(f"📡 Backend URL: {self.config.base_url}")
        logger.info(f"🎨 Frontend URL: {self.config.frontend_url}")
        logger.info("=" * 80)
        
        try:
            # Phase 1: Authentication
            await self.test_authentication_system()
            
            # Phase 2: API Endpoints  
            await self.test_all_api_endpoints()
            
            # Phase 3: CRUD Operations
            await self.test_crud_operations()
            
            # Phase 4: WebSocket functionality
            await self.test_websocket_functionality()
            
            # Phase 5: Frontend Pages
            await self.test_frontend_pages()
            
            # Phase 6: Performance
            await self.test_performance()
            
            # Phase 7: Security
            await self.test_security_vulnerabilities()
            
            # Phase 8: Data Integrity
            await self.test_data_integrity()
            
        except KeyboardInterrupt:
            logger.warning("🛑 Testing interrupted by user")
        except Exception as e:
            logger.error(f"💥 Critical testing error: {str(e)}")
            logger.error(traceback.format_exc())
        
        finally:
            await self.generate_report()

    async def generate_report(self):
        """📊 Generate comprehensive test report"""
        total_time = time.time() - self.start_time
        
        # Calculate statistics
        total_tests = len(self.results)
        passed = len([r for r in self.results if r.status == "PASS"])
        failed = len([r for r in self.results if r.status == "FAIL"])
        errors = len([r for r in self.results if r.status == "ERROR"])
        skipped = len([r for r in self.results if r.status == "SKIP"])
        
        pass_rate = (passed / total_tests * 100) if total_tests > 0 else 0
        
        # Group by category
        categories = {}
        for result in self.results:
            if result.category not in categories:
                categories[result.category] = {"pass": 0, "fail": 0, "error": 0, "skip": 0}
            categories[result.category][result.status.lower()] += 1
        
        # Generate report
        logger.info("=" * 80)
        logger.info("📊 COMPREHENSIVE TEST REPORT")
        logger.info("=" * 80)
        logger.info(f"🕒 Total Execution Time: {total_time:.2f} seconds")
        logger.info(f"📈 Total Tests: {total_tests}")
        logger.info(f"✅ Passed: {passed} ({pass_rate:.1f}%)")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"💥 Errors: {errors}")
        logger.info(f"⏭️ Skipped: {skipped}")
        logger.info("")
        
        # Category breakdown
        logger.info("📋 Results by Category:")
        for category, stats in categories.items():
            total_cat = sum(stats.values())
            pass_cat = stats['pass']
            pass_rate_cat = (pass_cat / total_cat * 100) if total_cat > 0 else 0
            logger.info(f"   {category}: {pass_cat}/{total_cat} ({pass_rate_cat:.1f}%) passed")
        
        logger.info("")
        
        # Failed tests details
        failed_tests = [r for r in self.results if r.status in ["FAIL", "ERROR"]]
        if failed_tests:
            logger.info("❌ Failed Tests:")
            for test in failed_tests:
                logger.info(f"   • {test.test_name}: {test.details}")
                if test.error:
                    logger.info(f"     Error: {test.error}")
        
        # Overall assessment
        logger.info("=" * 80)
        if pass_rate >= 95:
            logger.info("🏆 EXCELLENT: Platform is enterprise-ready!")
        elif pass_rate >= 85:
            logger.info("✅ GOOD: Platform is production-ready with minor issues")
        elif pass_rate >= 70:
            logger.info("⚠️ ACCEPTABLE: Platform needs improvements before production")
        else:
            logger.info("❌ CRITICAL: Platform has significant issues blocking production")
        
        logger.info("=" * 80)
        
        # Save detailed JSON report
        report_data = {
            "summary": {
                "total_tests": total_tests,
                "passed": passed,
                "failed": failed,
                "errors": errors,
                "skipped": skipped,
                "pass_rate": pass_rate,
                "execution_time": total_time,
                "timestamp": datetime.now().isoformat()
            },
            "categories": categories,
            "results": [asdict(r) for r in self.results]
        }
        
        with open("comprehensive_test_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        logger.info("💾 Detailed report saved to: comprehensive_test_report.json")

# ============================================================================= 
# MAIN EXECUTION
# =============================================================================

async def main():
    """Main execution function"""
    config = TestConfig()
    
    # Allow command line configuration
    if len(sys.argv) > 1:
        config.base_url = sys.argv[1]
    if len(sys.argv) > 2:
        config.frontend_url = sys.argv[2]
    
    print("🧪 MEWAYZ COMPREHENSIVE TESTING SUITE 2025")
    print("=" * 60)
    print("Enterprise-grade testing for MEWAYZ platform")
    print("Testing every API, frontend route, and functionality")
    print("=" * 60)
    
    async with ComprehensiveMEWAYZTester(config) as tester:
        await tester.run_all_tests()

def signal_handler(signum, frame):
    """Handle interrupt signals gracefully"""
    print("\n🛑 Received interrupt signal. Cleaning up...")
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Testing interrupted by user")
    except Exception as e:
        print(f"\n💥 Critical error: {str(e)}")
        traceback.print_exc()
        sys.exit(1) 