// Document ready event
document.addEventListener("DOMContentLoaded", function () {
  // Initialize theme
  initializeTheme();

  // Update user profile name
  updateUserInfo();

  // Initialize components
  attachEventListeners();
  initializeDropdowns();
  createBadgePulse();
  initializeSidebar();
  initializeSettings();
  setupMobileSidebar();
  initializeUserDropdown();
  setupDirectNavigation();
  setupLogoutButton();

  // Initialize page sections
  initCreditScore();
  initFarmData();
  initWeather();
  initCropSchedule();

  // Initialize search functionality
  initializeSearch();

  // Show toast to confirm everything is loaded
  setTimeout(() => {
    showToast("Dashboard loaded successfully", "success");
  }, 1000);
});

// Theme initialization and toggle functionality
function initializeTheme() {
  const themeToggle = document.querySelector(".theme-toggle, #themeToggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = localStorage.getItem("theme");

  // Set the initial theme based on saved preference or system preference
  if (currentTheme === "dark" || (!currentTheme && prefersDarkScheme.matches)) {
    document.body.setAttribute("data-theme", "dark");
    if (themeToggle) {
      const moonIcon = themeToggle.querySelector(".fa-moon");
      if (moonIcon) {
        moonIcon.classList.replace("fa-moon", "fa-sun");
      }
    }
  } else {
    document.body.setAttribute("data-theme", "light");
  }

  // Make sure score elements are visible after theme switch
  forceRedisplayScoreElements();
}

// Force redisplay of score elements to ensure they're visible
function forceRedisplayScoreElements() {
  // Find elements that might need redisplay
  const scoreElements = [
    document.getElementById("creditScore"),
    ...document.querySelectorAll(".score-value"),
    ...document.querySelectorAll(".score-value-large"),
    ...document.querySelectorAll(".score-circle svg"),
    ...document.querySelectorAll(".chart-line"),
    ...document.querySelectorAll(".chart-fill"),
    ...document.querySelectorAll(".chart-point"),
    ...document.querySelectorAll(".score-badge"),
    ...document.querySelectorAll(".progress-segment"),
  ];

  // Force redisplay by temporarily hiding and showing
  scoreElements.forEach((element) => {
    if (element) {
      // Save display state
      const originalDisplay = element.style.display;

      // Hide and force reflow
      element.style.display = "none";
      element.offsetHeight; // Trigger reflow

      // Restore display state with a short delay
      setTimeout(() => {
        element.style.display = originalDisplay || "block";
        element.style.opacity = "1";
        element.style.visibility = "visible";
      }, 10);
    }
  });
}

// Function to initialize credit score display
function initCreditScore() {
  const scoreValue = 725; // Example score value

  // Update the score category based on score value
  updateScoreCategory(scoreValue);

  // Add hover effects to detail cards
  initDetailCardEffects();

  // Add animation to the score actions
  initScoreActionButtons();
}

// Function to update the score category based on score
function updateScoreCategory(score) {
  const scoreCategory = document.querySelector(".score-category");
  let category = "Poor";
  let color = "var(--danger-color)";

  if (score >= 300 && score < 580) {
    category = "Poor";
    color = "var(--danger-color)";
  } else if (score >= 580 && score < 670) {
    category = "Fair";
    color = "var(--warning-color)";
  } else if (score >= 670 && score < 740) {
    category = "Good";
    color = "var(--primary-color)";
  } else if (score >= 740 && score <= 850) {
    category = "Excellent";
    color = "var(--success-color)";
  }

  if (scoreCategory) {
    scoreCategory.textContent = category;
    scoreCategory.style.color = color;
    scoreCategory.style.backgroundColor = `rgba(${getColorRgb(color)}, 0.1)`;
  }
}

// Helper function to get RGB values from CSS variable
function getColorRgb(cssVar) {
  if (cssVar === "var(--primary-color)") return "76, 175, 80";
  if (cssVar === "var(--danger-color)") return "244, 67, 54";
  if (cssVar === "var(--warning-color)") return "255, 152, 0";
  if (cssVar === "var(--success-color)") return "76, 175, 80";
  return "76, 175, 80"; // Default to primary color
}

// Function to initialize detail card effects
function initDetailCardEffects() {
  const detailCards = document.querySelectorAll(".detail-card");

  detailCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      // Add a slight bounce effect to icons on hover
      const icon = this.querySelector(".detail-icon");
      if (icon) {
        icon.style.animation = "none";
        setTimeout(() => {
          icon.style.animation = "bounce 0.5s ease";
        }, 10);
      }
    });
  });

  // Add bounce animation if it doesn't exist
  if (!document.querySelector("#bounce-animation")) {
    const style = document.createElement("style");
    style.id = "bounce-animation";
    style.innerHTML = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Function to initialize score action buttons
function initScoreActionButtons() {
  const actionButtons = document.querySelectorAll(".score-action-btn");

  actionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Add a ripple effect
      const ripple = document.createElement("span");
      ripple.classList.add("btn-ripple");
      this.appendChild(ripple);

      // Remove the ripple after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 800);

      // Handle button actions (can be expanded later)
      if (this.textContent.includes("Improve")) {
        // Scroll to tips section
        const tipsHeader = document.querySelector(
          ".credit-score-section .section-header:nth-of-type(2)"
        );
        if (tipsHeader) {
          tipsHeader.scrollIntoView({ behavior: "smooth" });
        }
      } else if (this.textContent.includes("Download")) {
        console.log("Download report action triggered");
        // In real app, would trigger download of report
      }
    });
  });

  // Add ripple animation styles if they don't exist
  if (!document.querySelector("#ripple-animation")) {
    const style = document.createElement("style");
    style.id = "ripple-animation";
    style.innerHTML = `
      .score-action-btn {
        position: relative;
        overflow: hidden;
      }
      .btn-ripple {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        background-color: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        opacity: 1;
        animation: ripple 0.8s ease-out;
      }
      @keyframes ripple {
        to {
          width: 300px;
          height: 300px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// This function is no longer needed, so we'll leave it empty to avoid errors from references elsewhere
function updateProgressBar(container, score) {
  // Intentionally empty - progress bars have been removed
}

// Attach all event listeners
function attachEventListeners() {
  const themeToggle = document.querySelector(".theme-toggle, #themeToggle");
  const userProfileBtn = document.querySelector(
    ".user-profile, #userProfileBtn"
  );
  const notificationsBtn = document.querySelector("#notificationsBtn");
  const messagesBtn = document.querySelector("#messagesBtn");

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const isDark = document.body.getAttribute("data-theme") === "dark";

      if (isDark) {
        document.body.setAttribute("data-theme", "light");
        const sunIcon = this.querySelector(".fa-sun");
        if (sunIcon) {
          sunIcon.classList.replace("fa-sun", "fa-moon");
        }
        localStorage.setItem("theme", "light");
      } else {
        document.body.setAttribute("data-theme", "dark");
        const moonIcon = this.querySelector(".fa-moon");
        if (moonIcon) {
          moonIcon.classList.replace("fa-moon", "fa-sun");
        }
        localStorage.setItem("theme", "dark");
      }

      // Ensure score elements are visible after theme switch
      forceRedisplayScoreElements();

      // Show confirmation toast
      showToast("Theme updated successfully", "success");
    });
  }

  // We no longer need the dropdown menu toggles - setupDirectNavigation handles this
  // This function remains for compatibility but with minimal implementation

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    removeAllDropdowns();
  });
}

// Create user profile dropdown - now deprecated but keeping for reference
function createUserProfileDropdown() {
  // This function is no longer needed - direct navigation is used instead
  console.log(
    "User profile dropdown creation is disabled - using direct navigation instead"
  );
  return document.createElement("div"); // Return empty div for safety
}

// Create notifications dropdown
function createNotificationsDropdown() {
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown-menu";
  dropdown.id = "notificationsDropdown";

  let content = `
    <div class="dropdown-arrow"></div>
    <div class="dropdown-header">
      <h4>Notifications</h4>
      <button class="icon-button small mark-all-read">
        <i class="fas fa-check-double"></i>
      </button>
    </div>
    <div class="notifications-list">
      <div class="notification-item unread">
        <div class="notification-icon warning">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">Weather Alert</div>
          <div class="notification-message">Heavy rainfall expected in your area</div>
          <div class="notification-time">2 hours ago</div>
        </div>
        <div class="notification-action">
          <button class="icon-button small">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="notification-item unread">
        <div class="notification-icon info">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">Schedule Reminder</div>
          <div class="notification-message">Wheat harvesting scheduled for tomorrow</div>
          <div class="notification-time">Yesterday</div>
        </div>
        <div class="notification-action">
          <button class="icon-button small">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="notification-item">
        <div class="notification-icon success">
          <i class="fas fa-rupee-sign"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">Loan Approved</div>
          <div class="notification-message">Your equipment loan has been approved</div>
          <div class="notification-time">2 days ago</div>
        </div>
        <div class="notification-action">
          <button class="icon-button small">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="dropdown-footer">
      <a href="#" class="close-dropdown">Close</a>
    </div>
  `;

  dropdown.innerHTML = content;

  // Add event listeners for buttons
  setTimeout(() => {
    const markAllRead = dropdown.querySelector(".mark-all-read");
    if (markAllRead) {
      markAllRead.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const unreadItems = dropdown.querySelectorAll(
          ".notification-item.unread"
        );
        unreadItems.forEach((item) => {
          item.classList.remove("unread");
        });
        showToast("Marked all notifications as read", "success");
      });
    }

    const dismissButtons = dropdown.querySelectorAll(
      ".notification-action .icon-button"
    );
    dismissButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = button.closest(".notification-item");
        item.style.height = item.offsetHeight + "px";
        setTimeout(() => {
          item.style.height = "0";
          item.style.padding = "0";
          item.style.margin = "0";
          item.style.opacity = "0";
          setTimeout(() => {
            item.remove();
            if (dropdown.querySelectorAll(".notification-item").length === 0) {
              dropdown.querySelector(".notifications-list").innerHTML =
                '<div class="empty-state">No notifications</div>';
            }
          }, 300);
        }, 10);
        showToast("Notification dismissed", "info");
      });
    });

    const closeLink = dropdown.querySelector(".close-dropdown");
    if (closeLink) {
      closeLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeAllDropdowns();
      });
    }
  }, 0);

  return dropdown;
}

// Create messages dropdown
function createMessagesDropdown() {
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown-menu";
  dropdown.id = "messagesDropdown";

  let content = `
    <div class="dropdown-arrow"></div>
    <div class="dropdown-header">
      <h4>Messages</h4>
      <button class="icon-button small mark-all-read">
        <i class="fas fa-check-double"></i>
      </button>
    </div>
    <div class="messages-list">
      <div class="message-item unread">
        <div class="message-avatar">
          <img src="assets/avatar-1.jpg" alt="Avatar" onerror="this.src='https://ui-avatars.com/api/?name=Amit+Patel&background=4CAF50&color=fff'">
        </div>
        <div class="message-content">
          <div class="message-sender">Amit Patel</div>
          <div class="message-text">I've reviewed your loan application and have some questions</div>
          <div class="message-time">2 hours ago</div>
        </div>
        <div class="message-action">
          <button class="icon-button small">
            <i class="fas fa-reply"></i>
          </button>
        </div>
      </div>
      <div class="message-item unread">
        <div class="message-avatar">
          <img src="assets/avatar-2.jpg" alt="Avatar" onerror="this.src='https://ui-avatars.com/api/?name=Priya+Sharma&background=2196F3&color=fff'">
        </div>
        <div class="message-content">
          <div class="message-sender">Priya Sharma</div>
          <div class="message-text">Your crop insurance documents are ready for review</div>
          <div class="message-time">Yesterday</div>
        </div>
        <div class="message-action">
          <button class="icon-button small">
            <i class="fas fa-reply"></i>
          </button>
        </div>
      </div>
      <div class="message-item">
        <div class="message-avatar">
          <img src="assets/avatar-3.jpg" alt="Avatar" onerror="this.src='https://ui-avatars.com/api/?name=Raj+Verma&background=FF9800&color=fff'">
        </div>
        <div class="message-content">
          <div class="message-sender">Raj Verma</div>
          <div class="message-text">Thank you for your payment. Your receipt is attached</div>
          <div class="message-time">3 days ago</div>
        </div>
        <div class="message-action">
          <button class="icon-button small">
            <i class="fas fa-reply"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="dropdown-footer">
      <a href="#messages-center">View All Messages</a>
    </div>
  `;

  dropdown.innerHTML = content;

  // Add event listeners for buttons
  setTimeout(() => {
    const markAllRead = dropdown.querySelector(".mark-all-read");
    if (markAllRead) {
      markAllRead.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const unreadItems = dropdown.querySelectorAll(".message-item.unread");
        unreadItems.forEach((item) => {
          item.classList.remove("unread");
        });
        showToast("Marked all messages as read", "success");
      });
    }

    const replyButtons = dropdown.querySelectorAll(
      ".message-action .icon-button"
    );
    replyButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sender = button
          .closest(".message-item")
          .querySelector(".message-sender").textContent;
        showToast(`Replying to ${sender}...`, "info");
      });
    });

    const messageItems = dropdown.querySelectorAll(".message-item");
    messageItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".message-action")) {
          e.preventDefault();
          e.stopPropagation();
          if (item.classList.contains("unread")) {
            item.classList.remove("unread");
          }
          const sender = item.querySelector(".message-sender").textContent;
          showToast(`Opening message from ${sender}...`, "info");
        }
      });
    });

    const viewAllLink = dropdown.querySelector(".dropdown-footer a");
    if (viewAllLink) {
      viewAllLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeAllDropdowns();
        showToast("Opening messages center...", "info");
      });
    }
  }, 0);

  return dropdown;
}

// Initialize dropdowns
function initializeDropdowns() {
  createBadgePulse();
}

// Create pulse effect for badges
function createBadgePulse() {
  const badges = document.querySelectorAll(".badge");
  badges.forEach((badge) => {
    if (badge.textContent && parseInt(badge.textContent) > 0) {
      badge.classList.add("pulse-badge");
    } else {
      badge.style.display = "none";
    }
  });
}

// Position dropdown relative to its parent button
function positionDropdown(dropdown, parent) {
  const parentRect = parent.getBoundingClientRect();
  const isUserProfile =
    parent.id === "userProfileBtn" || parent.classList.contains("user-profile");

  // Calculate position
  dropdown.style.top = `${parentRect.bottom + 10}px`;

  // Adjust right position based on window width and parent's right edge
  const windowWidth = window.innerWidth;
  const parentRightEdge = windowWidth - parentRect.right;

  if (isUserProfile) {
    dropdown.style.right = `${parentRightEdge}px`;
    // Position the arrow
    const arrow = dropdown.querySelector(".dropdown-arrow");
    if (arrow) {
      arrow.style.right = "20px";
    }
  } else {
    dropdown.style.right = `${parentRightEdge + parentRect.width / 2 - 15}px`;
    // Position the arrow
    const arrow = dropdown.querySelector(".dropdown-arrow");
    if (arrow) {
      arrow.style.right = "15px";
    }
  }

  // Add show class with a slight delay for better animation
  setTimeout(() => {
    dropdown.classList.add("show");
  }, 10);

  // Add animation classes to dropdown items
  const dropdownItems = dropdown.querySelectorAll(
    ".dropdown-item, .notification-item, .message-item, .user-dropdown-item"
  );
  dropdownItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.05}s`;
    item.classList.add("animate-in");
  });
}

// Remove all dropdown menus
function removeAllDropdowns() {
  // Remove active state from buttons
  const activeButtons = document.querySelectorAll(
    ".user-profile.active, .icon-button.active, #userProfileBtn.active, #notificationsBtn.active, #messagesBtn.active, #themeToggle.active"
  );
  activeButtons.forEach((button) => button.classList.remove("active"));

  // Remove all dropdowns with animation
  const dropdowns = document.querySelectorAll(".dropdown-menu");
  dropdowns.forEach((dropdown) => {
    // First animate items out
    const items = dropdown.querySelectorAll(
      ".dropdown-item, .notification-item, .message-item, .user-dropdown-item"
    );
    items.forEach((item) => item.classList.remove("animate-in"));

    // Then hide dropdown
    dropdown.classList.remove("show");

    // Remove after animation completes
    setTimeout(() => {
      if (dropdown.parentNode) {
        dropdown.parentNode.removeChild(dropdown);
      }
    }, 300);
  });
}

// Show toast notification
function showToast(message, type = "primary") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Set icon based on type
  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "warning") icon = "exclamation-triangle";
  if (type === "danger") icon = "times-circle";

  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;

  // Add to container
  toastContainer.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add("toast-hiding");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }

      // Remove container if empty
      if (toastContainer.children.length === 0 && toastContainer.parentNode) {
        toastContainer.parentNode.removeChild(toastContainer);
      }
    }, 300);
  }, 3000);
}

// Initialize sidebar navigation
function initializeSidebar() {
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");

      // Check if it's the logout link
      if (targetId === "#logout") {
        console.log("Logout clicked");
        // Handle logout logic (can be implemented later)
        return;
      }

      // Get the target section
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        // Scroll to the section smoothly
        window.scrollTo({
          top: targetSection.offsetTop - 70, // Adjust for top navigation bar
          behavior: "smooth",
        });

        // Update active state manually (for smoother transition)
        sidebarLinks.forEach((link) =>
          link.parentElement.classList.remove("active")
        );
        this.parentElement.classList.add("active");

        // Close sidebar on mobile after clicking
        if (window.innerWidth < 768) {
          const sidebar = document.querySelector(".sidebar");
          if (sidebar) {
            sidebar.classList.remove("open");
            document.body.classList.remove("sidebar-open");
          }
        }
      }
    });
  });

  // Add scroll event listener to update active state based on scroll position
  window.addEventListener("scroll", updateScrollSpy);

  // Set initial active state based on URL hash or default to dashboard
  const hash = window.location.hash || "#dashboard";
  const activeLink = document.querySelector(`.sidebar-nav a[href="${hash}"]`);
  if (activeLink) {
    activeLink.parentElement.classList.add("active");

    // Initial scroll to the active section if hash exists
    if (hash !== "#dashboard") {
      const targetSection = document.querySelector(hash);
      if (targetSection) {
        setTimeout(() => {
          window.scrollTo({
            top: targetSection.offsetTop - 70,
            behavior: "auto",
          });
        }, 100);
      }
    }
  } else {
    // Default to first item
    const firstLink = document.querySelector(".sidebar-nav a");
    if (firstLink) {
      firstLink.parentElement.classList.add("active");
    }
  }
}

// Update scroll spy functionality to highlight active sidebar items based on scroll position
function updateScrollSpy() {
  const sections = document.querySelectorAll(".dashboard-section");
  const navItems = document.querySelectorAll(".sidebar-nav li");

  // Get the current scroll position
  const scrollPosition = window.scrollY;

  // Find the section that is currently in view
  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop - 100; // Adjust for offset
    const sectionHeight = section.offsetHeight;

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      // Remove active class from all nav items
      navItems.forEach((item) => item.classList.remove("active"));

      // Add active class to current nav item
      const currentNavItem = document.querySelector(
        `.sidebar-nav li a[href="#${section.id}"]`
      );
      if (currentNavItem) {
        currentNavItem.parentElement.classList.add("active");
      }
    }
  });
}

// Initialize settings section
function initializeSettings() {
  const settingsNav = document.querySelectorAll(".settings-nav a");
  const settingsPanels = document.querySelectorAll(".settings-panel");

  // Toggle between settings panels
  settingsNav.forEach((navItem) => {
    navItem.addEventListener("click", function (e) {
      e.preventDefault();

      // Get the target panel ID from the href
      const targetId = this.getAttribute("href");

      // Remove active class from all nav items and add to clicked item
      settingsNav.forEach((item) => {
        item.parentElement.classList.remove("active");
      });
      this.parentElement.classList.add("active");

      // Hide all panels and show the target panel
      settingsPanels.forEach((panel) => {
        panel.classList.remove("active");
      });
      document.querySelector(targetId).classList.add("active");
    });
  });

  // Sync theme toggle in settings with main theme toggle
  const themeToggleSettings = document.getElementById("theme-toggle-settings");

  if (themeToggleSettings) {
    // Set initial state based on current theme
    const currentTheme = document.body.getAttribute("data-theme") || "light";
    themeToggleSettings.checked = currentTheme === "dark";

    // Add event listener to toggle theme
    themeToggleSettings.addEventListener("change", function () {
      const theme = this.checked ? "dark" : "light";
      document.body.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);

      // Update the icon in the header
      const themeToggleBtn = document.getElementById("theme-toggle");
      if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector("i");
        if (icon) {
          if (theme === "dark") {
            icon.className = "fas fa-sun";
          } else {
            icon.className = "fas fa-moon";
          }
        }
      }
    });
  }

  // Password strength meter
  const passwordInput = document.getElementById("new-password");
  const strengthMeter = document.querySelector(".strength-fill");
  const strengthText = document.querySelector(".strength-text");

  if (passwordInput && strengthMeter && strengthText) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      let strength = 0;
      let strengthDescription = "";

      // Simple password strength calculation
      if (password.length > 5) strength += 20;
      if (password.length > 8) strength += 20;
      if (/[A-Z]/.test(password)) strength += 20;
      if (/[0-9]/.test(password)) strength += 20;
      if (/[^A-Za-z0-9]/.test(password)) strength += 20;

      // Update strength meter
      strengthMeter.style.width = strength + "%";

      // Set color based on strength
      if (strength < 40) {
        strengthMeter.style.background = "var(--danger-color)";
        strengthDescription = "Weak password";
      } else if (strength < 70) {
        strengthMeter.style.background = "var(--warning-color)";
        strengthDescription = "Fair password strength";
      } else {
        strengthMeter.style.background = "var(--primary-color)";
        strengthDescription = "Strong password";
      }

      strengthText.textContent = strengthDescription;
    });
  }

  // Form submission handlers with visual feedback
  const forms = document.querySelectorAll(".settings-form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get the form's heading to use in the toast message
      const heading =
        this.closest(".settings-panel").querySelector("h2").textContent;

      // Show success toast
      showToast(`${heading} updated successfully!`, "success");
    });
  });

  // Handle toggle switches for notifications
  const toggleSwitches = document.querySelectorAll(
    '.toggle-switch input[type="checkbox"]'
  );

  toggleSwitches.forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const labelText =
        this.closest(".form-group").querySelector("label").textContent;
      const status = this.checked ? "enabled" : "disabled";

      // Don't show toast for theme toggle
      if (this.id !== "theme-toggle-settings") {
        showToast(
          `${labelText} ${status}`,
          this.checked ? "success" : "warning"
        );
      }
    });
  });
}

// Function to setup the mobile sidebar toggle
function setupMobileSidebar() {
  const toggleBtn = document.querySelector(".sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      document.body.classList.toggle("sidebar-open");

      // Store preference
      const isSidebarOpen = sidebar.classList.contains("open");
      localStorage.setItem("sidebarOpen", isSidebarOpen);
    });

    // Check stored preference
    const storedPreference = localStorage.getItem("sidebarOpen");
    if (storedPreference === "true") {
      sidebar.classList.add("open");
      document.body.classList.add("sidebar-open");
    }

    // Close sidebar when clicking outside on mobile
    if (mainContent) {
      mainContent.addEventListener("click", function () {
        if (window.innerWidth < 768 && sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
          document.body.classList.remove("sidebar-open");
          localStorage.setItem("sidebarOpen", false);
        }
      });
    }
  }
}

// Initialize all farm data charts and graphs
function initFarmData() {
  // Sample data for farm performance
  const performanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Yield (tons)",
        data: [5, 7, 8, 10, 12, 14],
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderColor: "rgba(76, 175, 80, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Sample data for crop distribution
  const cropData = {
    labels: ["Wheat", "Rice", "Corn", "Soybeans", "Vegetables"],
    datasets: [
      {
        data: [30, 20, 25, 15, 10],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Initialize charts if Chart.js is loaded
  if (window.Chart) {
    // Performance chart
    const perfCtx = document.getElementById("farm-performance-chart");
    if (perfCtx) {
      new Chart(perfCtx, {
        type: "line",
        data: performanceData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Farm Yield Performance",
            },
          },
        },
      });
    }

    // Crop distribution chart
    const cropCtx = document.getElementById("crop-distribution-chart");
    if (cropCtx) {
      new Chart(cropCtx, {
        type: "doughnut",
        data: cropData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
            },
            title: {
              display: true,
              text: "Crop Distribution",
            },
          },
        },
      });
    }
  } else {
    console.warn(
      "Chart.js is not loaded. Farm data visualizations will not be displayed."
    );
  }
}

// Initialize the weather display with sample data
function initWeather() {
  const weatherDisplay = document.querySelector(".weather-display");

  if (weatherDisplay) {
    const currentWeather = weatherDisplay.querySelector(".current-weather");
    const forecastContainer = document.querySelector(".weather-forecast");

    if (currentWeather) {
      // Sample weather data
      const weatherData = {
        temperature: 28,
        condition: "Partly Cloudy",
        location: "Gujarat Region",
        humidity: "65%",
        wind: "12 km/h",
        precipitation: "20%",
        forecast: [
          { day: "Tomorrow", temp: 30, condition: "Sunny", icon: "sun" },
          {
            day: "Wed",
            temp: 29,
            condition: "Partly Cloudy",
            icon: "cloud-sun",
          },
          {
            day: "Thu",
            temp: 27,
            condition: "Rain Showers",
            icon: "cloud-rain",
          },
          {
            day: "Fri",
            temp: 26,
            condition: "Thunderstorms",
            icon: "cloud-bolt",
          },
          { day: "Sat", temp: 28, condition: "Sunny", icon: "sun" },
        ],
      };

      // Update the weather display with sample data
      currentWeather.querySelector(
        ".temperature"
      ).textContent = `${weatherData.temperature}°C`;
      currentWeather.querySelector(".weather-desc").textContent =
        weatherData.condition;
      currentWeather.querySelector(".location").textContent =
        weatherData.location;

      // Set the appropriate weather icon
      const weatherIcon = currentWeather.querySelector(".weather-icon i");
      if (weatherIcon) {
        // Update icon based on condition
        let iconClass = "fa-sun";
        if (weatherData.condition.toLowerCase().includes("cloud")) {
          iconClass = "fa-cloud-sun";
        } else if (weatherData.condition.toLowerCase().includes("rain")) {
          iconClass = "fa-cloud-rain";
        } else if (weatherData.condition.toLowerCase().includes("storm")) {
          iconClass = "fa-cloud-bolt";
        }

        // Remove all existing fa-* classes
        weatherIcon.className = "";
        // Add the new classes
        weatherIcon.classList.add("fas", iconClass);
      }

      // Update weather stats
      const statValues = currentWeather.querySelectorAll(".weather-stat span");
      if (statValues.length >= 3) {
        statValues[0].textContent = weatherData.wind;
        statValues[1].textContent = weatherData.humidity;
        statValues[2].textContent = weatherData.precipitation;
      }

      // Generate forecast items if the container exists
      if (forecastContainer) {
        forecastContainer.innerHTML = ""; // Clear existing content

        // Create forecast items
        weatherData.forecast.forEach((day) => {
          const forecastItem = document.createElement("div");
          forecastItem.className = "forecast-item";
          forecastItem.innerHTML = `
            <div class="forecast-day">${day.day}</div>
            <div class="forecast-icon">
              <i class="fas fa-${day.icon}"></i>
            </div>
            <div class="forecast-temp">${day.temp}°C</div>
            <div class="forecast-condition">${day.condition}</div>
          `;
          forecastContainer.appendChild(forecastItem);
        });
      } else {
        // If forecast container doesn't exist, create it
        const forecastSection = document.createElement("div");
        forecastSection.className = "weather-forecast";

        // Add forecast header
        const forecastHeader = document.createElement("h3");
        forecastHeader.textContent = "5-Day Forecast";
        forecastSection.appendChild(forecastHeader);

        // Add forecast items
        weatherData.forecast.forEach((day) => {
          const forecastItem = document.createElement("div");
          forecastItem.className = "forecast-item";
          forecastItem.innerHTML = `
            <div class="forecast-day">${day.day}</div>
            <div class="forecast-icon">
              <i class="fas fa-${day.icon}"></i>
            </div>
            <div class="forecast-temp">${day.temp}°C</div>
            <div class="forecast-condition">${day.condition}</div>
          `;
          forecastSection.appendChild(forecastItem);
        });

        // Append to weather display
        weatherDisplay.appendChild(forecastSection);
      }
    }
  }
}

// Function to initialize crop schedule
function initCropSchedule() {
  const scheduleContainer = document.querySelector(".schedule-items");

  if (scheduleContainer) {
    // Get all schedule items
    const scheduleItems = scheduleContainer.querySelectorAll(".schedule-item");

    // Add hover and click effects
    scheduleItems.forEach((item) => {
      // Add hover effect
      item.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-5px)";
        this.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
      });

      item.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
      });

      // Add click effect to show details
      item.addEventListener("click", function () {
        // Check if details are already showing
        const existingDetails = this.querySelector(".schedule-details");
        if (existingDetails) {
          existingDetails.remove();
          return;
        }

        // Remove any other open details
        const allDetails =
          scheduleContainer.querySelectorAll(".schedule-details");
        allDetails.forEach((detail) => detail.remove());

        // Create and append details
        const details = document.createElement("div");
        details.className = "schedule-details";

        // Get activity title
        const activityTitle = this.querySelector("h3").textContent;

        // Create details content based on activity type
        if (activityTitle.includes("Harvesting")) {
          details.innerHTML = `
            <div class="detail-row">
              <span class="detail-label">Expected Yield:</span>
              <span class="detail-value">4.2 tons/acre</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Equipment:</span>
              <span class="detail-value">Combine Harvester #2</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Labor:</span>
              <span class="detail-value">5 workers</span>
            </div>
            <div class="detail-actions">
              <button class="detail-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
              <button class="detail-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
          `;
        } else if (activityTitle.includes("Planting")) {
          details.innerHTML = `
            <div class="detail-row">
              <span class="detail-label">Seed Variety:</span>
              <span class="detail-value">IR-8 High Yield</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Quantity:</span>
              <span class="detail-value">125 kg</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Labor:</span>
              <span class="detail-value">8 workers</span>
            </div>
            <div class="detail-actions">
              <button class="detail-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
              <button class="detail-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
          `;
        } else {
          details.innerHTML = `
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">Organic Nutrients</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Coverage:</span>
              <span class="detail-value">All 28 acres</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Method:</span>
              <span class="detail-value">Aerial Spraying</span>
            </div>
            <div class="detail-actions">
              <button class="detail-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
              <button class="detail-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
          `;
        }

        // Append details to the item
        this.appendChild(details);

        // Add button event listeners
        const editBtn = details.querySelector(".edit-btn");
        const deleteBtn = details.querySelector(".delete-btn");

        if (editBtn) {
          editBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            showToast(`Editing ${activityTitle}...`, "primary");
          });
        }

        if (deleteBtn) {
          deleteBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            showToast(`Deleting ${activityTitle}...`, "warning");
            // Animate removal
            const parentItem = this.closest(".schedule-item");
            parentItem.style.opacity = "0";
            parentItem.style.transform = "translateX(20px)";

            setTimeout(() => {
              if (parentItem.parentNode) {
                parentItem.parentNode.removeChild(parentItem);
              }
            }, 500);
          });
        }
      });
    });

    // Add new schedule item button functionality
    const addNewBtn = document.querySelector(".btn-link");
    if (addNewBtn && addNewBtn.textContent.includes("Add New")) {
      addNewBtn.addEventListener("click", function (e) {
        e.preventDefault();

        // Create modal for adding new schedule
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.innerHTML = `
          <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Add New Schedule Item</h3>
            <form id="new-schedule-form">
              <div class="form-group">
                <label for="activity-name">Activity Name</label>
                <input type="text" id="activity-name" placeholder="e.g., Wheat Harvesting" required>
              </div>
              <div class="form-group">
                <label for="activity-date">Date</label>
                <input type="date" id="activity-date" required>
              </div>
              <div class="form-group">
                <label for="activity-location">Location</label>
                <input type="text" id="activity-location" placeholder="e.g., North Field (12 acres)" required>
              </div>
              <div class="form-group">
                <label for="activity-status">Status</label>
                <select id="activity-status" required>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Planning">Planning</option>
                </select>
              </div>
              <button type="submit" class="btn-primary">Add Schedule</button>
            </form>
          </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector("#new-schedule-form");
        form.addEventListener("submit", function (e) {
          e.preventDefault();

          // Get form values
          const activityName = this.querySelector("#activity-name").value;
          const activityDate = new Date(
            this.querySelector("#activity-date").value
          );
          const activityLocation =
            this.querySelector("#activity-location").value;
          const activityStatus = this.querySelector("#activity-status").value;

          // Create new schedule item
          const newItem = document.createElement("div");
          newItem.className = "schedule-item";
          newItem.innerHTML = `
            <div class="schedule-date">
              <span class="day">${activityDate.getDate()}</span>
              <span class="month">${activityDate.toLocaleString("default", {
                month: "short",
              })}</span>
            </div>
            <div class="schedule-content">
              <h3>${activityName}</h3>
              <p><i class="fas fa-map-marker-alt"></i> ${activityLocation}</p>
              <div class="schedule-status">${activityStatus}</div>
            </div>
          `;

          // Add to container
          scheduleContainer.appendChild(newItem);

          // Apply the same event listeners
          newItem.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-5px)";
            this.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
          });

          newItem.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
          });

          // Close modal
          document.body.removeChild(modal);

          // Show success toast
          showToast("New schedule item added successfully!", "success");
        });

        // Close modal on X click
        const closeBtn = modal.querySelector(".close-modal");
        closeBtn.addEventListener("click", function () {
          document.body.removeChild(modal);
        });

        // Close modal on outside click
        modal.addEventListener("click", function (e) {
          if (e.target === modal) {
            document.body.removeChild(modal);
          }
        });
      });
    }
  }
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector(".search-box input");
  const searchResults = document.querySelector(".search-results");
  const searchResultItems = document.querySelectorAll(".search-result-item");
  const searchBox = document.querySelector(".search-box");

  if (!searchInput || !searchResults) return;

  // Add keydown event to handle keyboard navigation
  searchInput.addEventListener("keydown", function (e) {
    const items = document.querySelectorAll(
      '.search-result-item:not([style*="display: none"])'
    );
    let focusedItem = document.querySelector(".search-result-item.focused");
    let focusedIndex = -1;

    if (focusedItem) {
      for (let i = 0; i < items.length; i++) {
        if (items[i] === focusedItem) {
          focusedIndex = i;
          break;
        }
      }
    }

    // Handle arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();

      if (focusedIndex < items.length - 1) {
        if (focusedItem) focusedItem.classList.remove("focused");
        items[focusedIndex + 1].classList.add("focused");
        items[focusedIndex + 1].scrollIntoView({ block: "nearest" });
      } else if (items.length > 0 && focusedIndex === -1) {
        items[0].classList.add("focused");
        items[0].scrollIntoView({ block: "nearest" });
      }
    }

    // Handle arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();

      if (focusedIndex > 0) {
        if (focusedItem) focusedItem.classList.remove("focused");
        items[focusedIndex - 1].classList.add("focused");
        items[focusedIndex - 1].scrollIntoView({ block: "nearest" });
      }
    }

    // Handle enter key to select item
    else if (e.key === "Enter" && focusedItem) {
      e.preventDefault();
      focusedItem.click();
    }

    // Handle escape key to close dropdown
    else if (e.key === "Escape") {
      searchInput.blur();
      searchResults.style.opacity = "0";
      searchResults.style.visibility = "hidden";
      searchResults.style.transform = "translateY(-10px)";
      searchResults.style.pointerEvents = "none";
    }
  });

  // Filter search results as user types
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();
    let hasVisibleResults = false;

    if (searchTerm.length > 0) {
      // Show search results container
      searchResults.style.visibility = "visible";
      searchResults.style.opacity = "1";
      searchResults.style.transform = "translateY(0)";
      searchResults.style.pointerEvents = "all";

      // Filter and highlight matching results
      searchResultItems.forEach((item) => {
        const title = item
          .querySelector(".result-title")
          .textContent.toLowerCase();
        const path = item
          .querySelector(".result-path")
          .textContent.toLowerCase();

        if (title.includes(searchTerm) || path.includes(searchTerm)) {
          item.style.display = "block";
          hasVisibleResults = true;

          // Highlight matching text
          const titleEl = item.querySelector(".result-title");
          const pathEl = item.querySelector(".result-path");

          titleEl.innerHTML = highlightMatch(titleEl.textContent, searchTerm);
          pathEl.innerHTML = highlightMatch(pathEl.textContent, searchTerm);
        } else {
          item.style.display = "none";
        }
      });

      // Add no results message if needed
      if (!hasVisibleResults) {
        if (!document.querySelector(".no-results-message")) {
          const noResults = document.createElement("div");
          noResults.className = "no-results-message";
          noResults.innerHTML = `<i class="fas fa-search"></i> No results found for "<strong>${searchTerm}</strong>"`;
          searchResults.appendChild(noResults);
        }
      } else {
        const noResults = document.querySelector(".no-results-message");
        if (noResults) {
          noResults.remove();
        }
      }
    } else {
      // Reset highlights
      searchResultItems.forEach((item) => {
        item.style.display = "block";
        item.classList.remove("focused");
        const titleEl = item.querySelector(".result-title");
        const pathEl = item.querySelector(".result-path");

        titleEl.textContent = titleEl.textContent;
        pathEl.textContent = pathEl.textContent;
      });

      // Hide search results if outside click happens
      if (!searchInput.matches(":focus") && !searchResults.matches(":hover")) {
        searchResults.style.opacity = "0";
        searchResults.style.visibility = "hidden";
        searchResults.style.transform = "translateY(-10px)";
        searchResults.style.pointerEvents = "none";
      }
    }
  });

  // Focus event to show results again if there's search text
  searchInput.addEventListener("focus", function () {
    if (this.value.trim().length > 0) {
      searchResults.style.visibility = "visible";
      searchResults.style.opacity = "1";
      searchResults.style.transform = "translateY(0)";
      searchResults.style.pointerEvents = "all";
    }
  });

  // Handle clicks on search result items
  searchResultItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionName = this.querySelector(".result-title").textContent;
      const sectionId = sectionName.toLowerCase().replace(/\s+/g, "-");
      const sectionElement = document.getElementById(sectionId);

      if (sectionElement) {
        // Navigate to the section
        window.scrollTo({
          top: sectionElement.offsetTop - 80,
          behavior: "smooth",
        });

        // Update active state in sidebar
        const navItems = document.querySelectorAll(".sidebar-nav li");
        navItems.forEach((navItem) => {
          navItem.classList.remove("active");

          const navLink = navItem.querySelector("a");
          if (navLink && navLink.getAttribute("href") === `#${sectionId}`) {
            navItem.classList.add("active");
          }
        });

        // Clear search and hide results
        searchInput.value = "";
        searchResults.style.opacity = "0";
        searchResults.style.visibility = "hidden";
        searchResults.style.transform = "translateY(-10px)";
        searchResults.style.pointerEvents = "none";

        // Show toast message
        showToast(`Navigated to ${sectionName}`, "success");
      }
    });
  });

  // Close search results when clicking outside
  document.addEventListener("click", function (e) {
    if (!searchBox.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.opacity = "0";
      searchResults.style.visibility = "hidden";
      searchResults.style.transform = "translateY(-10px)";
      searchResults.style.pointerEvents = "none";

      // Reset focused item
      const focusedItem = document.querySelector(".search-result-item.focused");
      if (focusedItem) {
        focusedItem.classList.remove("focused");
      }
    }
  });

  // Prevent clicks inside search results from closing them
  searchResults.addEventListener("click", function (e) {
    e.stopPropagation();
  });
}

// Helper function to highlight matching text
function highlightMatch(text, searchTerm) {
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, '<span class="highlight-match">$1</span>');
}

// Function to navigate directly to settings without dropdown
function setupDirectNavigation() {
  const profileElement = document.querySelector(".user-profile");

  // Only the profile element navigates directly to settings
  if (profileElement) {
    profileElement.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Navigate to the profile settings panel
      navigateToSettingsPanel("#profile-settings", "Profile Settings");
    });
  }

  // Set up notifications dropdown
  const notificationsIcon = document.querySelector(
    ".notifications .icon-button"
  );
  if (notificationsIcon) {
    notificationsIcon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      removeAllDropdowns();
      this.classList.toggle("active");

      if (this.classList.contains("active")) {
        const dropdown = createNotificationsDropdown();
        document.body.appendChild(dropdown);
        positionDropdown(dropdown, this);
      }
    });
  }

  // Set up messages dropdown
  const messagesIcon = document.querySelector(
    "#messagesBtn, .messages .icon-button"
  );
  if (messagesIcon) {
    messagesIcon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      removeAllDropdowns();
      this.classList.toggle("active");

      if (this.classList.contains("active")) {
        const dropdown = createMessagesDropdown();
        document.body.appendChild(dropdown);
        positionDropdown(dropdown, this);
      }
    });
  }
}

// Handle user dropdown menu functionality - now simplified to direct navigation
function initializeUserDropdown() {
  // This function is now handled by setupDirectNavigation
  // Keeping the empty function to avoid breaking existing code
}

// Helper function to navigate to specific settings panel
function navigateToSettingsPanel(targetPanelId, toastMessage) {
  const settingsSection = document.getElementById("settings");
  const targetPanel = document.querySelector(targetPanelId);

  if (!settingsSection || !targetPanel) return;

  // Scroll to settings section
  window.scrollTo({
    top: settingsSection.offsetTop - 80,
    behavior: "smooth",
  });

  // Update active state in settings sidebar
  const settingsNavLinks = document.querySelectorAll(".settings-nav a");
  settingsNavLinks.forEach((navLink) => {
    navLink.parentElement.classList.remove("active");

    if (navLink.getAttribute("href") === targetPanelId) {
      navLink.parentElement.classList.add("active");

      // Activate the correct panel
      const settingsPanels = document.querySelectorAll(".settings-panel");
      settingsPanels.forEach((panel) => {
        panel.classList.remove("active");
      });
      targetPanel.classList.add("active");
    }
  });

  // Update sidebar nav active state
  const sidebarNavItems = document.querySelectorAll(".sidebar-nav li");
  sidebarNavItems.forEach((item) => {
    item.classList.remove("active");
  });
  const settingsNavItem = document.getElementById("nav-settings");
  if (settingsNavItem) {
    settingsNavItem.classList.add("active");
  }

  // Show toast message
  showToast(`Navigated to ${toastMessage}`, "success");
}

// Handle logout functionality
function handleLogout() {
  // Show logout confirmation
  showToast("Logging out...", "warning");

  // Clear all user data from localStorage
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("username");
  localStorage.removeItem("userAvatar");

  // Redirect to landing page after a short delay
  setTimeout(() => {
    window.location.href = "landing_page.html";
  }, 1000);
}

// Set up logout functionality
function setupLogoutButton() {
  // Target only the sidebar nav logout link
  const logoutButton = document.querySelector('.sidebar-nav a[href="#logout"]');

  if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleLogout();
    });
  }
}

// Update user information from localStorage
function updateUserInfo() {
  const username = localStorage.getItem("username");
  const userEmail = localStorage.getItem("userEmail");
  const userType = localStorage.getItem("userType") || "farmer";
  const isNewUser = localStorage.getItem("isNewUser") === "true";

  // Get additional user data
  let userData = {};
  try {
    userData = JSON.parse(localStorage.getItem("userData") || "{}");
  } catch (e) {
    console.error("Error parsing userData:", e);
  }

  // Update user name in profile dropdown
  const userNameElement = document.querySelector(".user-name");
  if (userNameElement && username) {
    userNameElement.textContent = username;
  }

  // Update profile settings form with user data
  updateProfileSettingsForm(username, userEmail, userData, userType);

  // Update user avatar if needed (use first letter of username for avatar)
  if (username) {
    const userAvatar = document.querySelector(".user-avatar");
    if (userAvatar) {
      // Check if there's an img tag inside
      const avatarImg = userAvatar.querySelector("img");
      if (avatarImg) {
        // Set a fallback avatar using UI Avatars service
        avatarImg.onerror = function () {
          this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            username
          )}&background=4CAF50&color=fff`;
        };

        // Try to load avatar from localStorage or use default
        avatarImg.src =
          localStorage.getItem("userAvatar") ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            username
          )}&background=4CAF50&color=fff`;
      }
    }
  }

  // If this is a farmer user, display farm information
  if (userType === "farmer" && userData && userData.farmLocation) {
    // Create or update farm info section if it doesn't exist
    let farmInfoSection = document.querySelector(".farm-info-section");

    if (!farmInfoSection) {
      // Create farm info section if it doesn't exist
      const contentMain = document.querySelector(".content-main");
      if (contentMain) {
        // Create farm info section
        farmInfoSection = document.createElement("div");
        farmInfoSection.className = "dashboard-card farm-info-section";

        // Insert at the beginning of content-main
        contentMain.insertBefore(farmInfoSection, contentMain.firstChild);
      }
    }

    if (farmInfoSection) {
      // Update farm info content
      farmInfoSection.innerHTML = `
        <div class="card-header">
          <h3><i class="fas fa-tractor"></i> Farm Information</h3>
        </div>
        <div class="card-body">
          <div class="farm-details">
            <div class="farm-detail">
              <span class="detail-label">Farmer Name:</span>
              <span class="detail-value">${username}</span>
            </div>
            <div class="farm-detail">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${userEmail}</span>
            </div>
            <div class="farm-detail">
              <span class="detail-label">Farm Location:</span>
              <span class="detail-value">${userData.farmLocation}</span>
            </div>
            <div class="farm-detail">
              <span class="detail-label">Crops:</span>
              <div class="crops-list">
                ${
                  userData.crops
                    ?.map((crop) => `<span class="crop-tag">${crop}</span>`)
                    .join("") || "No crops data available"
                }
              </div>
            </div>
          </div>
        </div>
      `;
    }
  } else if (userType === "lender" && userData) {
    // Create or update lender info section if it doesn't exist
    let lenderInfoSection = document.querySelector(".lender-info-section");

    if (!lenderInfoSection) {
      // Create lender info section if it doesn't exist
      const contentMain = document.querySelector(".content-main");
      if (contentMain) {
        // Create lender info section
        lenderInfoSection = document.createElement("div");
        lenderInfoSection.className = "dashboard-card lender-info-section";

        // Insert at the beginning of content-main
        contentMain.insertBefore(lenderInfoSection, contentMain.firstChild);
      }
    }

    if (lenderInfoSection) {
      // Update lender info content
      lenderInfoSection.innerHTML = `
        <div class="card-header">
          <h3><i class="fas fa-university"></i> Financial Institution Information</h3>
        </div>
        <div class="card-body">
          <div class="farm-details">
            <div class="farm-detail">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${username}</span>
            </div>
            <div class="farm-detail">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${userEmail}</span>
            </div>
            <div class="farm-detail">
              <span class="detail-label">Institution:</span>
              <span class="detail-value">${
                userData.institution || "Not specified"
              }</span>
            </div>
            <div class="farm-detail">
              <span class="detail-label">Position:</span>
              <span class="detail-value">${
                userData.position || "Not specified"
              }</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // If this is a new user, show welcome message
  if (isNewUser) {
    setTimeout(() => {
      showToast(
        `Welcome to FarmFinances, ${username}! Your profile has been created.`,
        "success",
        5000
      );
      localStorage.removeItem("isNewUser");
    }, 1500);
  }
}

// Helper function to update profile settings form
function updateProfileSettingsForm(username, userEmail, userData, userType) {
  // Update user info in profile settings form
  const displayNameInput = document.getElementById("display-name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");

  if (displayNameInput && username) {
    displayNameInput.value = username;
  }

  if (emailInput && userEmail) {
    emailInput.value = userEmail;
  }

  // Update farm specific fields if the user is a farmer
  if (userType === "farmer") {
    if (addressInput && userData.farmLocation) {
      addressInput.value = userData.farmLocation;
    }

    // Update farm type and farm size if available in the form
    const farmTypeSelect = document.getElementById("farm-type");
    const farmSizeInput = document.getElementById("farm-size");
    const farmNameInput = document.getElementById("farm-name");

    if (farmNameInput) {
      farmNameInput.value = `${username}'s Farm`;
    }

    if (farmTypeSelect && userData.crops && userData.crops.length > 0) {
      // Try to select a farm type based on crops
      const cropTypes = {
        wheat: "Crop Farming",
        rice: "Crop Farming",
        corn: "Crop Farming",
        cotton: "Crop Farming",
        vegetables: "Mixed Farming",
      };

      // Find the first matching crop type or default to Mixed Farming
      const mainCrop = userData.crops[0].toLowerCase();
      const farmType = Object.keys(cropTypes).find((crop) =>
        mainCrop.includes(crop)
      )
        ? cropTypes[
            Object.keys(cropTypes).find((crop) => mainCrop.includes(crop))
          ]
        : "Mixed Farming";

      // Select the option
      for (let i = 0; i < farmTypeSelect.options.length; i++) {
        if (farmTypeSelect.options[i].text === farmType) {
          farmTypeSelect.selectedIndex = i;
          break;
        }
      }
    }
  }
  // Update institution fields if the user is a lender
  else if (userType === "lender") {
    if (userData.institution) {
      // If there's a company or institution field in the form
      const companyInput = document.getElementById("company");
      if (companyInput) {
        companyInput.value = userData.institution;
      }
    }

    if (userData.position) {
      // If there's a position or title field in the form
      const positionInput = document.getElementById("position");
      if (positionInput) {
        positionInput.value = userData.position;
      }
    }
  }
}
