document.addEventListener("DOMContentLoaded", () => {
  // User type toggle functionality
  const userTypeButtons = document.querySelectorAll(".user-type-toggle button");
  userTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      userTypeButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");

      // You can customize the form or UI based on user type if needed
      const userType = button.getAttribute("data-user-type");
      console.log(`User type selected: ${userType}`);

      // Example: Change the login button text based on user type
      const loginBtn = document.querySelector(".login-btn");
      loginBtn.textContent =
        userType === "farmer" ? "Sign In as Farmer" : "Sign In as Institution";
    });
  });

  // Password visibility toggle
  const togglePassword = document.querySelector(".toggle-password");
  const passwordInput = document.querySelector("#password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      // Toggle password visibility
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Toggle eye icon
      togglePassword.classList.toggle("fa-eye");
      togglePassword.classList.toggle("fa-eye-slash");
    });
  }

  // Form validation
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const userType = document
        .querySelector(".user-type-toggle button.active")
        .getAttribute("data-user-type");
      const rememberMe = document.getElementById("remember").checked;

      // Basic validation
      if (!validateEmail(email)) {
        showError("Please enter a valid email address");
        return;
      }

      if (password.length < 6) {
        showError("Password must be at least 6 characters long");
        return;
      }

      // Simulate login API call with enhanced parameters
      simulateLogin(email, password, userType, rememberMe);
    });
  }

  // Email validation helper
  function validateEmail(email) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  // Error message display
  function showError(message) {
    // Check if error message element already exists
    let errorElement = document.querySelector(".error-message");

    if (!errorElement) {
      // Create error element if it doesn't exist
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      errorElement.style.color = "#ff3333";
      errorElement.style.marginBottom = "15px";
      errorElement.style.fontSize = "14px";

      // Insert before the form
      const form = document.getElementById("login-form");
      form.parentNode.insertBefore(errorElement, form);
    }

    // Update error message
    errorElement.textContent = message;

    // Remove after 3 seconds
    setTimeout(() => {
      errorElement.textContent = "";
    }, 3000);
  }

  // Simulate login API call
  function simulateLogin(email, password, userType, rememberMe) {
    // Show loading state on button
    const loginBtn = document.querySelector(".login-btn");
    const originalText = loginBtn.textContent;
    loginBtn.textContent = "Signing in...";
    loginBtn.disabled = true;

    // Prepare data for backend
    const loginData = {
      email,
      password,
      userType,
      rememberMe,
    };

    // Simulate API request delay
    setTimeout(() => {
      console.log("Login data:", loginData);

      // In a real application, you would make an API call to your backend
      // Example fetch call (commented out as backend isn't implemented yet)
      /*
      fetch('backend/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.href = data.redirectUrl;
        } else {
          showError(data.message || 'Login failed');
        }
      })
      .catch(error => {
        showError('An error occurred. Please try again.');
        console.error('Error:', error);
      })
      .finally(() => {
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
      });
      */

      // For demo, redirect to different dashboards based on user type
      if (userType === "farmer") {
        window.location.href = "user_dashboard.html";
      } else {
        window.location.href = "user_dashboard.html";
      }

      // Reset button state (in case redirect doesn't happen for demo)
      loginBtn.textContent = originalText;
      loginBtn.disabled = false;
    }, 1500);
  }

  // Social login buttons
  const socialButtons = document.querySelectorAll(".social-btn");

  socialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.classList.contains("google")
        ? "Google"
        : button.classList.contains("facebook")
        ? "Facebook"
        : "Mobile";

      console.log(`Attempting to login with ${provider}`);

      // Handle social login based on provider
      switch (provider) {
        case "Google":
          window.location.href = "backend/auth/google";
          break;
        case "Facebook":
          window.location.href = "backend/auth/facebook";
          break;
        case "Mobile":
          // Show mobile number input dialog
          showMobileLoginModal();
          break;
      }
    });
  });

  // Mobile number login modal
  function showMobileLoginModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById("mobile-login-modal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "mobile-login-modal";
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h3>Login with Mobile Number</h3>
          <div class="mobile-login-form">
            <div class="form-group">
              <label for="mobile-number">Mobile Number</label>
              <div class="input-with-icon">
                <i class="fas fa-mobile-alt"></i>
                <input type="tel" id="mobile-number" placeholder="Enter your mobile number" required>
              </div>
            </div>
            <button type="button" class="login-btn" id="send-otp-btn">Send OTP</button>
            
            <div class="form-group otp-group" style="display: none;">
              <label for="otp">Enter OTP</label>
              <div class="input-with-icon">
                <i class="fas fa-key"></i>
                <input type="text" id="otp" placeholder="Enter OTP" maxlength="6" required>
              </div>
              <button type="button" class="login-btn" id="verify-otp-btn">Verify & Login</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Add modal styles if not already in CSS
      const style = document.createElement("style");
      style.textContent = `
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.7);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background-color: white;
          padding: 30px;
          border-radius: var(--border-radius);
          max-width: 400px;
          width: 90%;
          position: relative;
        }
        .close-modal {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-light);
        }
        .mobile-login-form {
          margin-top: 20px;
        }
        .otp-group {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      `;
      document.head.appendChild(style);

      // Close modal when clicking X
      const closeBtn = modal.querySelector(".close-modal");
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });

      // Close modal when clicking outside modal content
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });

      // Send OTP button
      const sendOtpBtn = document.getElementById("send-otp-btn");
      const otpGroup = document.querySelector(".otp-group");

      sendOtpBtn.addEventListener("click", () => {
        const mobileNumber = document.getElementById("mobile-number").value;
        if (!mobileNumber || mobileNumber.length < 10) {
          showError("Please enter a valid mobile number");
          return;
        }

        // Mock API call to send OTP
        sendOtpBtn.textContent = "Sending...";
        sendOtpBtn.disabled = true;

        setTimeout(() => {
          // Show OTP input after sending
          otpGroup.style.display = "block";
          sendOtpBtn.textContent = "Resend OTP";
          sendOtpBtn.disabled = false;

          // Mock successful OTP sending
          console.log(`OTP sent to ${mobileNumber}`);
        }, 1500);
      });

      // Verify OTP button
      const verifyOtpBtn = document.getElementById("verify-otp-btn");

      verifyOtpBtn.addEventListener("click", () => {
        const otp = document.getElementById("otp").value;
        if (!otp || otp.length < 4) {
          showError("Please enter a valid OTP");
          return;
        }

        // Mock API call to verify OTP
        verifyOtpBtn.textContent = "Verifying...";
        verifyOtpBtn.disabled = true;

        setTimeout(() => {
          // Mock successful verification and redirect
          console.log(`OTP verified: ${otp}`);
          window.location.href = "user_dashboard.html";
        }, 1500);
      });
    }

    // Display the modal
    modal.style.display = "flex";
  }
});
