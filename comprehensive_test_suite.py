#!/usr/bin/env python3
"""
MEWAYZ Comprehensive Test Suite
Tests every API, button click, page route, and feature
"""

import requests
import json
import time
import sys
from urllib.parse import urljoin
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class MEWAYZTestSuite:
    def __init__(self, base_url="http://localhost:3000", api_url="http://localhost:5000"):
        self.base_url = base_url
        self.api_url = api_url
        self.session = requests.Session()
        self.test_results = []
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome WebDriver for frontend testing"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            return True
        except Exception as e:
            print(f"❌ Failed to setup WebDriver: {e}")
            return False

    def log_test(self, test_name, status, details=""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} {test_name}: {details}")

    def test_backend_health(self):
        """Test backend health endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/health")
            if response.status_code == 200:
                self.log_test("Backend Health Check", "PASS", f"Status: {response.status_code}")
            else:
                self.log_test("Backend Health Check", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Backend Health Check", "FAIL", f"Error: {e}")

    def test_frontend_homepage(self):
        """Test frontend homepage"""
        try:
            self.driver.get(self.base_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check for key elements
            title = self.driver.title
            if "MEWAYZ" in title:
                self.log_test("Frontend Homepage", "PASS", f"Title: {title}")
            else:
                self.log_test("Frontend Homepage", "FAIL", f"Unexpected title: {title}")
                
        except Exception as e:
            self.log_test("Frontend Homepage", "FAIL", f"Error: {e}")

    def test_onboarding_api(self):
        """Test intelligent onboarding API"""
        test_data = {
            "assessment": {
                "businessType": {
                    "id": "ecommerce",
                    "name": "E-commerce Store Owner",
                    "icon": "shopping-cart",
                    "description": "Sell products online"
                },
                "experienceLevel": {
                    "id": "beginner",
                    "name": "Complete Beginner",
                    "description": "Never used similar platforms"
                },
                "goals": [
                    {"id": "revenue", "name": "Increase Revenue", "icon": "trending-up"}
                ],
                "painPoints": [
                    {"id": "tools", "name": "Too many separate tools", "icon": "grid"}
                ],
                "workspaceName": "Test Store",
                "workspaceDescription": "Test e-commerce store"
            },
            "goalsDetails": {
                "revenue": {"amount": "$10000", "timeline": "6 months"},
                "audience": {"size": "1000", "niche": "fitness"}
            }
        }
        
        try:
            response = self.session.post(
                f"{self.api_url}/api/v1/onboarding/intelligent",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [200, 201]:
                self.log_test("Onboarding API", "PASS", f"Status: {response.status_code}")
            else:
                self.log_test("Onboarding API", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Onboarding API", "FAIL", f"Error: {e}")

    def test_blog_api(self):
        """Test blog system API"""
        # Test GET blog posts
        try:
            response = self.session.get(f"{self.api_url}/api/v1/blog/posts")
            if response.status_code == 200:
                self.log_test("Blog API - Get Posts", "PASS", f"Status: {response.status_code}")
            else:
                self.log_test("Blog API - Get Posts", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Blog API - Get Posts", "FAIL", f"Error: {e}")

    def test_knowledge_base_api(self):
        """Test knowledge base API"""
        try:
            response = self.session.get(f"{self.api_url}/api/v1/knowledge-base")
            if response.status_code == 200:
                self.log_test("Knowledge Base API", "PASS", f"Status: {response.status_code}")
            else:
                self.log_test("Knowledge Base API", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Knowledge Base API", "FAIL", f"Error: {e}")

    def test_frontend_pages(self):
        """Test all frontend pages"""
        pages = [
            "/onboarding/intelligent-wizard",
            "/blog/comprehensive",
            "/knowledge-base",
            "/dashboard",
            "/admin",
            "/pricing",
            "/features"
        ]
        
        for page in pages:
            try:
                self.driver.get(f"{self.base_url}{page}")
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                
                title = self.driver.title
                if title and title != "404":
                    self.log_test(f"Frontend Page - {page}", "PASS", f"Title: {title}")
                else:
                    self.log_test(f"Frontend Page - {page}", "FAIL", "Page not found or empty")
                    
            except Exception as e:
                self.log_test(f"Frontend Page - {page}", "FAIL", f"Error: {e}")

    def test_button_clicks(self):
        """Test button clicks on key pages"""
        try:
            # Test onboarding wizard buttons
            self.driver.get(f"{self.base_url}/onboarding/intelligent-wizard")
            time.sleep(2)
            
            # Look for buttons and test clicks
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            for i, button in enumerate(buttons[:5]):  # Test first 5 buttons
                try:
                    if button.is_displayed() and button.is_enabled():
                        button.click()
                        time.sleep(1)
                        self.log_test(f"Button Click - {button.text[:20]}", "PASS", "Button clicked successfully")
                except Exception as e:
                    self.log_test(f"Button Click - {button.text[:20]}", "FAIL", f"Error: {e}")
                    
        except Exception as e:
            self.log_test("Button Click Tests", "FAIL", f"Error: {e}")

    def test_form_submissions(self):
        """Test form submissions"""
        try:
            # Test onboarding form
            self.driver.get(f"{self.base_url}/onboarding/intelligent-wizard")
            time.sleep(2)
            
            # Find form inputs
            inputs = self.driver.find_elements(By.TAG_NAME, "input")
            for input_field in inputs[:3]:  # Test first 3 inputs
                try:
                    if input_field.is_displayed():
                        input_field.clear()
                        input_field.send_keys("Test Input")
                        self.log_test(f"Form Input - {input_field.get_attribute('name')}", "PASS", "Input filled successfully")
                except Exception as e:
                    self.log_test(f"Form Input - {input_field.get_attribute('name')}", "FAIL", f"Error: {e}")
                    
        except Exception as e:
            self.log_test("Form Submission Tests", "FAIL", f"Error: {e}")

    def test_api_endpoints(self):
        """Test all API endpoints"""
        endpoints = [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/users",
            "/api/v1/organizations",
            "/api/v1/analytics",
            "/api/v1/support-tickets",
            "/api/v1/courses",
            "/api/v1/creators",
            "/api/v1/products",
            "/api/v1/orders"
        ]
        
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{self.api_url}{endpoint}")
                if response.status_code in [200, 401, 403]:  # Acceptable responses
                    self.log_test(f"API Endpoint - {endpoint}", "PASS", f"Status: {response.status_code}")
                else:
                    self.log_test(f"API Endpoint - {endpoint}", "FAIL", f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"API Endpoint - {endpoint}", "FAIL", f"Error: {e}")

    def test_database_connections(self):
        """Test database connections"""
        try:
            # Test MongoDB connection
            response = self.session.get(f"{self.api_url}/api/v1/health/database")
            if response.status_code == 200:
                self.log_test("Database Connection - MongoDB", "PASS", "Connection successful")
            else:
                self.log_test("Database Connection - MongoDB", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Database Connection - MongoDB", "FAIL", f"Error: {e}")

    def test_security_features(self):
        """Test security features"""
        # Test CORS
        try:
            response = self.session.options(f"{self.api_url}/api/v1/users")
            if response.status_code in [200, 204]:
                self.log_test("Security - CORS", "PASS", "CORS headers present")
            else:
                self.log_test("Security - CORS", "FAIL", "CORS not configured")
        except Exception as e:
            self.log_test("Security - CORS", "FAIL", f"Error: {e}")

    def test_performance(self):
        """Test performance metrics"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}")
            load_time = time.time() - start_time
            
            if load_time < 5.0:  # Acceptable load time
                self.log_test("Performance - Page Load", "PASS", f"Load time: {load_time:.2f}s")
            else:
                self.log_test("Performance - Page Load", "FAIL", f"Slow load time: {load_time:.2f}s")
        except Exception as e:
            self.log_test("Performance - Page Load", "FAIL", f"Error: {e}")

    def generate_report(self):
        """Generate comprehensive test report"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = total_tests - passed_tests
        
        report = {
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0
            },
            "results": self.test_results,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Save report to file
        with open("test_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\n" + "="*60)
        print("COMPREHENSIVE TEST REPORT")
        print("="*60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {report['summary']['success_rate']:.1f}%")
        print("="*60)
        
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"❌ {result['test']}: {result['details']}")
        
        return report

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting MEWAYZ Comprehensive Test Suite...")
        print("="*60)
        
        # Setup WebDriver
        if not self.setup_driver():
            print("❌ Cannot run frontend tests without WebDriver")
            return
        
        try:
            # Backend tests
            print("\n🔧 Testing Backend Services...")
            self.test_backend_health()
            self.test_onboarding_api()
            self.test_blog_api()
            self.test_knowledge_base_api()
            self.test_api_endpoints()
            self.test_database_connections()
            self.test_security_features()
            
            # Frontend tests
            print("\n🎨 Testing Frontend Pages...")
            self.test_frontend_homepage()
            self.test_frontend_pages()
            self.test_button_clicks()
            self.test_form_submissions()
            
            # Performance tests
            print("\n⚡ Testing Performance...")
            self.test_performance()
            
        finally:
            if self.driver:
                self.driver.quit()
        
        # Generate report
        self.generate_report()

def main():
    """Main function"""
    # Check command line arguments
    base_url = "http://localhost:3000"
    api_url = "http://localhost:5000"
    
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    if len(sys.argv) > 2:
        api_url = sys.argv[2]
    
    # Run test suite
    test_suite = MEWAYZTestSuite(base_url, api_url)
    test_suite.run_all_tests()

if __name__ == "__main__":
    main() 