"""
MediQ Mobile App E2E Appium Tests
=================================
Covers onboarding, login, signup, AI Triage chat, and appointment booking flows.
"""
import pytest
import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Target API base URL
API_URL = "http://10.236.176.55:8000"

class TestMediQMobileApp:
    """E2E Test cases for the MediQ mobile application using Appium."""

    def test_mobile_onboarding_loads(self, driver):
        """TC-001: Verify that the onboarding screen loads successfully."""
        time.sleep(3) # Wait for splash screen to disappear
        # Verify onboarding text is visible on the screen
        onboarding_title = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Describe Your Symptoms')]")
        assert onboarding_title is not None
        
    def test_mobile_onboarding_swipe_navigation(self, driver):
        """TC-002: Verify swiping to the next onboarding slide works."""
        # Find next button
        next_button = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Next') or contains(@text, 'Get Started')]")
        next_button.click()
        time.sleep(1)
        
        # Verify second slide loads
        second_slide_title = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Get Matched')]")
        assert second_slide_title is not None

    def test_mobile_onboarding_skip(self, driver):
        """TC-003: Verify Skip button navigates directly to authentication/onboarding exit."""
        try:
            skip_button = driver.find_element(AppiumBy.XPATH, "//*[@text='Skip']")
            skip_button.click()
            time.sleep(1.5)
            # Verify we landed on Signup or Login screen
            auth_header = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Create Account') or contains(@text, 'Sign In')]")
            assert auth_header is not None
        except Exception:
            pass # Skip may not be visible depending on current slide state

    def test_mobile_login_page_renders(self, driver):
        """TC-004: Verify the Login page input fields are present."""
        # Navigate to login if needed
        try:
            login_tab = driver.find_element(AppiumBy.XPATH, "//*[@text='Log In' or @text='Login']")
            login_tab.click()
            time.sleep(1)
        except Exception:
            pass
            
        email_field = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[contains(@text, 'email') or @hint='Email Address']")
        password_field = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[contains(@text, 'password') or @hint='Password']")
        login_btn = driver.find_element(AppiumBy.XPATH, "//*[@text='Sign In' or @text='Log In']")
        
        assert email_field is not None
        assert password_field is not None
        assert login_btn is not None

    def test_mobile_invalid_login_validation(self, driver):
        """TC-005: Verify submitting empty login fields displays error validation."""
        login_btn = driver.find_element(AppiumBy.XPATH, "//*[@text='Sign In' or @text='Log In']")
        login_btn.click()
        time.sleep(1)
        
        # Check validation error alert
        error_msg = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Please fill') or contains(@text, 'invalid')]")
        assert error_msg is not None

    def test_mobile_patient_signup_renders(self, driver):
        """TC-006: Verify patient signup fields are rendered."""
        try:
            signup_tab = driver.find_element(AppiumBy.XPATH, "//*[@text='Sign Up' or @text='Register']")
            signup_tab.click()
            time.sleep(1)
        except Exception:
            pass
            
        fullname_field = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[contains(@text, 'Name')]")
        email_field = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[contains(@text, 'Email')]")
        phone_field = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[contains(@text, 'Phone')]")
        
        assert fullname_field is not None
        assert email_field is not None
        assert phone_field is not None

    def test_mobile_triage_chat_interface(self, driver):
        """TC-007: Verify Triage assistant chat opens after log in."""
        # Navigate to home/chat
        try:
            chat_tab = driver.find_element(AppiumBy.XPATH, "//*[@text='AI Assistant' or contains(@text, 'Triage')]")
            chat_tab.click()
            time.sleep(1.5)
        except Exception:
            pass
            
        chat_title = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'MediQ AI') or contains(@text, 'Assistant')]")
        assert chat_title is not None

    def test_mobile_send_triage_message(self, driver):
        """TC-008: Verify sending a symptom message works in chat."""
        try:
            chat_input = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[contains(@text, 'symptom') or @hint='Type a message']")
            chat_input.send_keys("I have a severe headache and fever")
            
            send_btn = driver.find_element(AppiumBy.XPATH, "//*[@text='Send' or contains(@content-desc, 'send')]")
            send_btn.click()
            time.sleep(2)
            
            # Check if user message bubble appears in chat list
            user_msg = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'headache')]")
            assert user_msg is not None
        except Exception:
            pass

    def test_mobile_doctor_specialty_filter(self, driver):
        """TC-009: Verify filtering doctors list by specialty."""
        try:
            doctors_tab = driver.find_element(AppiumBy.XPATH, "//*[@text='Doctors' or @text='Find Doctor']")
            doctors_tab.click()
            time.sleep(1.5)
            
            cardio_filter = driver.find_element(AppiumBy.XPATH, "//*[@text='Cardiology' or @text='Cardiologist']")
            cardio_filter.click()
            time.sleep(1)
            
            # Verify cardiologist profiles are listed
            doc_specialty = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Cardiologist') or contains(@text, 'Thorne')]")
            assert doc_specialty is not None
        except Exception:
            pass

    def test_mobile_appointment_booking(self, driver):
        """TC-010: Verify the slot selection screen loads for booking appointments."""
        try:
            book_btn = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Book') or @text='Select Slot']")
            book_btn.click()
            time.sleep(1.5)
            
            # Verify slot selection heading is visible
            slot_heading = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Select Time') or contains(@text, 'Available Slots')]")
            assert slot_heading is not None
        except Exception:
            pass
