"""
Shared configurations and fixtures for MediQ Appium E2E mobile testing.
"""
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options

@pytest.fixture(scope="session")
def driver():
    """Set up Appium WebDriver to test builds/mediq-app-debug.apk on Android."""
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "Android Device"
    
    # Path to the pre-built debug APK
    options.app = "../builds/mediq-app-debug.apk"
    options.no_reset = False
    options.auto_grant_permissions = True

    # Connect to local Appium Server
    appium_server_url = "http://localhost:4723"
    browser = webdriver.Remote(appium_server_url, options=options)
    browser.implicitly_wait(10)

    yield browser

    browser.quit()
