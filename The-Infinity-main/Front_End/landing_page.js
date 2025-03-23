// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Theme Toggle
  const themeToggle = document.getElementById("theme-toggle");

  // Check for saved theme preference or use default
  const currentTheme = localStorage.getItem("theme") || "light";

  // If preference is dark, check the toggle and apply the theme
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.checked = true;
  }

  // Listen for toggle changes
  themeToggle.addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  });

  // Header scroll effect
  const header = document.querySelector("header");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  const authButtons = document.querySelector(".auth-buttons");

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      mobileMenuBtn.classList.toggle("active");

      // Auto close menu when clicking a mobile nav link
      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            navLinks.classList.remove("active");
            mobileMenuBtn.classList.remove("active");
          }
        });
      });
    });
  }

  // Close mobile menu on window resize if opened
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          mobileMenuBtn.classList.remove("active");
        }
      }
    });
  });

  // Testimonial Slider
  const testimonialSlider = document.querySelector(".testimonial-slider");
  const testimonialDots = document.querySelectorAll(".testimonial-dots .dot");
  const testimonialCards = document.querySelectorAll(".testimonial-card");

  if (testimonialDots.length > 0 && testimonialCards.length > 0) {
    testimonialDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        // Remove active class from all dots
        testimonialDots.forEach((d) => d.classList.remove("active"));

        // Add active class to current dot
        dot.classList.add("active");

        // Scroll to the corresponding testimonial
        if (testimonialCards[index]) {
          testimonialCards[index].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      });
    });

    // Update active dot based on visible testimonial
    const observeTestimonials = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = Array.from(testimonialCards).indexOf(entry.target);
              if (index >= 0) {
                testimonialDots.forEach((d) => d.classList.remove("active"));
                testimonialDots[index].classList.add("active");
              }
            }
          });
        },
        { threshold: 0.7 }
      );

      testimonialCards.forEach((card) => {
        observer.observe(card);
      });
    };

    observeTestimonials();
  }

  // Text animation for headings with enhanced subtlety
  const animateText = () => {
    const textElements = document.querySelectorAll(".text-animate");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use more subtle animations
            entry.target.style.opacity = "0";
            entry.target.style.transform = "translateY(10px)";

            // Force a reflow
            void entry.target.offsetWidth;

            // Apply the animation
            entry.target.style.transition =
              "opacity 0.8s ease, transform 0.6s ease";
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    textElements.forEach((element) => {
      // Set initial state
      element.style.opacity = "0";
      element.style.transform = "translateY(10px)";
      observer.observe(element);
    });
  };

  // Feature cards animation with staggered timing
  const animateFeatureCards = () => {
    const cards = document.querySelectorAll(".feature-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // More subtle animation with staggered timing
            setTimeout(() => {
              entry.target.style.opacity = "0";
              entry.target.style.transform = "translateY(20px)";

              // Force a reflow
              void entry.target.offsetWidth;

              // Apply the animation
              entry.target.style.transition =
                "opacity 0.8s ease, transform 0.7s ease";
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";

              observer.unobserve(entry.target);
            }, index * 150);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    cards.forEach((card) => {
      // Set initial state
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      observer.observe(card);
    });
  };

  // Steps animation with enhanced subtlety
  const animateSteps = () => {
    const steps = document.querySelectorAll(".step");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "0";
              entry.target.style.transform = "translateX(-20px)";

              // Force a reflow
              void entry.target.offsetWidth;

              // Apply the animation
              entry.target.style.transition =
                "opacity 0.8s ease, transform 0.7s ease";
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateX(0)";

              observer.unobserve(entry.target);
            }, index * 200);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    steps.forEach((step) => {
      // Set initial state
      step.style.opacity = "0";
      step.style.transform = "translateX(-20px)";
      observer.observe(step);
    });
  };

  // Enhance section headers with subtle fade effects
  const animateSectionHeaders = () => {
    const sectionHeaders = document.querySelectorAll(".section-header");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const heading = entry.target.querySelector("h2");
            const paragraph = entry.target.querySelector("p");

            if (heading) {
              heading.style.opacity = "0";
              heading.style.transform = "translateY(15px)";

              // Force a reflow
              void heading.offsetWidth;

              // Apply the animation
              heading.style.transition =
                "opacity 0.9s ease, transform 0.7s ease";
              heading.style.opacity = "1";
              heading.style.transform = "translateY(0)";
            }

            if (paragraph) {
              paragraph.style.opacity = "0";
              paragraph.style.transform = "translateY(15px)";

              // Force a reflow
              void paragraph.offsetWidth;

              // Apply the animation with delay
              paragraph.style.transition =
                "opacity 0.9s ease, transform 0.7s ease";
              paragraph.style.transitionDelay = "0.2s";
              paragraph.style.opacity = "1";
              paragraph.style.transform = "translateY(0)";
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    sectionHeaders.forEach((header) => {
      const heading = header.querySelector("h2");
      const paragraph = header.querySelector("p");

      if (heading) {
        heading.style.opacity = "0";
        heading.style.transform = "translateY(15px)";
      }

      if (paragraph) {
        paragraph.style.opacity = "0";
        paragraph.style.transform = "translateY(15px)";
      }

      observer.observe(header);
    });
  };

  // Call all animation functions
  animateText();
  animateFeatureCards();
  animateSteps();
  animateSectionHeaders();

  // Wave animation on scroll
  const handleWaveScroll = () => {
    const waveElement = document.querySelector(".wave-container svg");
    const featuresSection = document.getElementById("features");

    if (waveElement && featuresSection) {
      const waveObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // When the features section comes into view, animate the wave
              waveElement.style.animation =
                "waveRise 1s forwards cubic-bezier(0.23, 1, 0.32, 1)";
            }
          });
        },
        {
          rootMargin: "0px 0px -20% 0px", // Trigger animation before fully scrolling to features
        }
      );

      waveObserver.observe(featuresSection);

      // Parallax effect on wave when scrolling
      window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY;
        const heroHeight = document.querySelector(".hero").offsetHeight;
        const scrollProgress = Math.min(scrollPosition / heroHeight, 1);

        if (scrollProgress <= 1) {
          waveElement.style.transform = `translateY(${scrollProgress * 10}px)`;
        }
      });
    }
  };

  handleWaveScroll();

  // Trusted by section - add animation for logos
  const initTrustedLogos = () => {
    const trustedLogos = document.querySelectorAll(".trusted-logo-img");

    // Add fade-in animation when logos come into view
    const trustedSection = document.querySelector(".trusted-by-section");
    if (trustedSection) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              trustedLogos.forEach((logo, index) => {
                setTimeout(() => {
                  logo.classList.add("animate__animated", "animate__fadeIn");
                }, index * 150);
              });
              observer.unobserve(trustedSection);
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(trustedSection);
    }
  };

  // Call the function when DOM is fully loaded
  if (document.readyState === "complete") {
    initTrustedLogos();
  } else {
    window.addEventListener("load", initTrustedLogos);
  }

  // Set up form submissions
  setupFormSubmissions();

  // Set up authentication buttons
  setupAuthButtons();
});

// Handle forms - adjust for the simplified contact section
function setupFormSubmissions() {
  // Newsletter form submission
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get email
      const email = this.querySelector('input[type="email"]').value;
      console.log("Newsletter subscription:", email);

      // Show success message
      const successMsg = document.createElement("div");
      successMsg.className = "success-message";
      successMsg.innerHTML = `
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <p>Successfully subscribed!</p>
      `;

      // Apply styles to success message
      successMsg.style.backgroundColor = "var(--primary-color)";
      successMsg.style.color = "white";
      successMsg.style.padding = "1rem";
      successMsg.style.borderRadius = "8px";
      successMsg.style.display = "flex";
      successMsg.style.alignItems = "center";
      successMsg.style.justifyContent = "center";
      successMsg.style.marginTop = "1rem";

      // Replace form with success message
      newsletterForm.parentNode.replaceChild(successMsg, newsletterForm);
    });
  }
}

// Set up authentication buttons
function setupAuthButtons() {
  // Register and Sign In buttons
  const authButtons = document.querySelectorAll(
    ".auth-buttons a, .cta-buttons a"
  );

  authButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // If it's a login or register link, make sure user data is stored
      if (href.includes("login.html")) {
        // Store a flag to indicate the user came from the landing page
        localStorage.setItem("cameFromLanding", "true");
      }
    });
  });
}
