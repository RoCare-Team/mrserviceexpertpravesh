"use client";

import React, { useState, useRef } from 'react';
import { Modal, Box } from '@mui/material';
import CongratsModal from '../modals/CongratsModal';
import BasicDetails from '../modals/BasicDetails';
import { toast, ToastContainer } from 'react-toastify';

const PhoneVerification = ({ onVerificationComplete, showModal, setShowModal }) => {
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [activeButton, setActiveButton] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [openBasic, setOpenBasic] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
  
    const otpInputRefs = useRef([]);
  
    if (otpInputRefs.current.length === 0) {
      otpInputRefs.current = Array(4).fill().map(() => React.createRef());
    }
  
    const handleCloseModal = () => {
      setShowModal(false);
      setShowOtpModal(false);
      setPhoneNumber('');
      setOtpDigits(['', '', '', '']);
      setActiveButton(null);
      setShowCongrats(false);
      setPhoneError('');
    };
  
    const handleVerification = async () => {
      try {
        const newOtp = otpDigits.join('');
        const payload = { phoneNumber, newOtp };
  
        const res = await fetch("https://waterpurifierservicecenter.in/customer/ro_customer/service_otp_verify.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        const data = await res.json();
  
        if (typeof window !== 'undefined') {
          // Only run on client side
          if (data.name) localStorage.setItem('name', data.name);
          if (data.email) localStorage.setItem('email', data.email);
          if (data.c_id) localStorage.setItem('customer_id', data.c_id);
          
          if (data.AllCartDetails) {
            localStorage.setItem('checkoutState', JSON.stringify(data.AllCartDetails || []));
          }
          
          if (data.total_cart_price) {
            localStorage.setItem('cart_total_price', data.total_cart_price || 0);
          }
  
          if (data.address) {
            let RecentAdd = JSON.stringify(data.address);
            localStorage.setItem('RecentAddress', RecentAdd);
          }
        }
  
        if (data.error === false) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('userPhone', phoneNumber);
            localStorage.setItem('userToken', 'verified');
          }
  
          toast.success(data.msg);
          setShowOtpModal(false);
          
          if (data.status === 1) {
            setOpenBasic(true);
          } else {
            setShowCongrats(true);
          }
        } else {
          toast.error(data.msg);
        }
  
        // Call the callback function if provided
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } catch (error) {
        toast.error("Error verifying OTP: " + error.message);
      }
    };
  
    const handleBasicDetails = async (userData) => {
      const fullUserData = {
        ...userData,
        phoneNumber: phoneNumber
      };
  
      try {
        const res = await fetch("https://waterpurifierservicecenter.in/customer/ro_customer/update_user_dtls.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullUserData),
        });
  
        const data = await res.json();
  
        if (data.error === false) {
          toast.success("Details saved successfully!");
          setOpenBasic(false);
          setShowCongrats(true);
  
          if (typeof window !== 'undefined') {
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userEmail', userData.email);
          }
        } else {
          toast.error(data.msg || "Failed to save details");
        }
  
        return data;
      } catch (error) {
        toast.error("Error saving details: " + error.message);
        throw error;
      }
    };
  
    const handlePhoneChange = (e) => {
      const value = e.target.value;
      // Only allow digits in the phone number
      if (value === '' || /^\d+$/.test(value)) {
        setPhoneNumber(value);
        setPhoneError('');
      } else {
        setPhoneError('Please enter numbers only');
      }
    };
  
    const handlePhoneSubmit = async () => {
      if (phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber)) {
        try {
          const res = await fetch("https://waterpurifierservicecenter.in/customer/ro_customer/roservice_sendotp.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber }),
          });
  
          const data = await res.json();
  
          if (data.error === false) {
            toast.success(data.msg);
            setShowModal(false);
            setShowOtpModal(true);
            setPhoneError('');
          } else {
            toast.error(data.msg);
          }
        } catch (error) {
          toast.error("Error: " + error.message);
        }
      } else if (phoneNumber.length !== 10) {
        setPhoneError('Phone number must be 10 digits');
      } else {
        setPhoneError('Please enter a valid phone number');
      }
    };
  
    const handleOtpChange = (index, value) => {
      if (value.match(/^[0-9]?$/)) {
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);
  
        if (value && index < 3) {
          otpInputRefs.current[index + 1].focus();
        }
      }
    };
  
    const handleKeyDown = (index, e) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1].focus();
      }
    };
  
    const handleResendCode = (method) => {
      setActiveButton(method);
      setToastMessage(`OTP has been resent to your ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'}`);
      setShowToast(true);
  
      // Implement actual resend logic here
  
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    };
  
    // Check if phone number is valid (10 digits)
    const isPhoneValid = phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber);
  
    return (
      <div>
        <ToastContainer position="bottom-right" />
        
        {/* Phone Verification Modal using MUI Modal */}
        <Modal
          open={showModal || showOtpModal}
          onClose={handleCloseModal}
          aria-labelledby="phone-verification-modal"
          aria-describedby="phone-verification-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '600px',
              bgcolor: 'background.paper',
              borderRadius: '0.5rem',
              boxShadow: 24,
              p: 3,
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
  
            {/* Phone Number Modal */}
            {showModal && (
              <div className="text-center flex items-start flex-col gap-3">
                {/* SVG Phone Icon instead of image */}
                <div className="w-full flex justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 w-full text-center">Enter your phone number</h2>
                <p className="text-gray-600 mb-6 w-full text-center">We'll send you a text with a verification code.</p>
                <div className="flex mb-4 w-full">
                  <div className="flex items-center px-4 bg-gray-100 rounded-l-lg border border-gray-300 border-r-0">
                    <span className="text-gray-600">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`flex-1 p-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    name='mobile'
                    id='mobile'
                  />
                </div>
  
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1 w-full">{phoneError}</p>
                )}
  
                <button
                  onClick={handlePhoneSubmit}
                  className={`w-full py-3 rounded-lg font-medium mt-4 transition ${isPhoneValid
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  disabled={!isPhoneValid}
                >
                  Continue
                </button>
                
                <div className="w-full text-center mt-4">
                  <span className='text-gray-400'>By continuing, you agree to our <a href="/terms-and-conditions" className="text-gray-600 font-bold">T&C</a> and <a href="/privacy-and-policy" className="text-gray-600 font-bold">Privacy policy</a>.</span>
                </div>
              </div>
            )}
  
            {/* OTP Verification Modal */}
            {showOtpModal && (
              <div className="text-center">
                <div className='flex items-center justify-center mb-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">Enter verification code</h2>
                <p className="text-gray-600 mb-6">A 4-digit verification code has been sent to +91 {phoneNumber}</p>
  
                <div className="flex justify-center gap-2 mb-6">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
                      type="text"
                      maxLength="1"
                      className="w-12 h-12 text-center border border-gray-300 rounded-md text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                  ))}
                </div>
                
                <div className="mb-6">
                  <span className='text-gray-400'>Resend the code on</span>
                  <div className='flex items-center gap-2.5 justify-center mt-2'>
                    <button
                      className={`px-4 py-2 rounded-md transition ${activeButton === 'whatsapp' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => handleResendCode('whatsapp')}
                    >
                      WhatsApp
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md transition ${activeButton === 'sms' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => handleResendCode('sms')}
                    >
                      SMS
                    </button>
                  </div>
                </div>
                
                <button
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
                  onClick={handleVerification}
                >
                  Verify
                </button>
              </div>
            )}
          </Box>
        </Modal>
  
        {/* Basic Details Modal */}
        {openBasic && (
          <BasicDetails 
            setOpen={setOpenBasic} 
            open={openBasic} 
            phoneNumber={phoneNumber}
            onSubmitDetails={handleBasicDetails} 
          />
        )}
  
        {/* Congrats Modal */}
        {showCongrats && (
          <CongratsModal 
            setShowCongrats={setShowCongrats} 
            open={showCongrats} 
          />
        )}
  
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default PhoneVerification;