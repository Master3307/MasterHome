// Function to highlight the active link
function setActivePage() {
  const currentPath = window.location.pathname; // Get the current page path

  // Get all navigation links
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    // Remove the 'active' class from all links
    link.classList.remove("active");

    // Check if the current path matches the link's href (excluding the domain)
    const linkHref = link.getAttribute("href");

    // Compare paths more precisely
    if (currentPath === linkHref) {
      link.classList.add("active"); // Exact match
    }
  });
}

// Call setActivePage when the page loads
document.addEventListener("DOMContentLoaded", setActivePage);

// Initialize darkmode-js
const darkmode = new Darkmode({
  bottom: '32px', // default: '32px'
  right: '32px', // default: '32px'
  left: 'unset', // default: 'unset'
  time: '0.5s', // default: '0.3s'
  mixColor: '#fff', // default: '#fff'
  backgroundColor: '#000', // default: '#fff'
  buttonColorDark: '#100f2c', // default: '#100f2c'
  buttonColorLight: '#fff', // default: '#fff'
  saveInCookies: true, // default: true
  label: '🌓', // default: ''
  autoMatchOsTheme: true // default: true
});

// Object to store temporary settings
const tempSettings = {
  theme: localStorage.getItem("theme") || "dark",
  language: localStorage.getItem("language") || "en",
  username: localStorage.getItem("userName") || "Guest",
  profilePicture: localStorage.getItem("profilePicture") || "",
};

// Function to apply temporary settings
function applyTempSettings() {
  // Apply theme
  const body = document.body;
  const themeSlider = document.getElementById("theme-slider");
  const isLightMode = tempSettings.theme === "light";
  body.classList.toggle("light-mode", isLightMode);
  if (themeSlider) themeSlider.checked = isLightMode;

  // Apply language
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.value = tempSettings.language;
  }

  // Apply username
  const usernameInput = document.getElementById("username-input");
  if (usernameInput) {
    usernameInput.value = tempSettings.username;
  }

  // Apply profile picture
  const profilePicturePreview = document.getElementById("profile-picture-preview");
  if (profilePicturePreview && tempSettings.profilePicture) {
    profilePicturePreview.src = tempSettings.profilePicture;
  }
}

// Function to save settings to localStorage
function saveSettings() {
  localStorage.setItem("theme", tempSettings.theme);
  localStorage.setItem("language", tempSettings.language);
  localStorage.setItem("userName", tempSettings.username);
  localStorage.setItem("profilePicture", tempSettings.profilePicture);
  alert("Settings saved!");
}

// Function to handle theme slider change
function handleThemeChange() {
  const themeSlider = document.getElementById("theme-slider");
  tempSettings.theme = themeSlider.checked ? "light" : "dark";
}

// Function to handle language selection change
function handleLanguageChange(event) {
  tempSettings.language = event.target.value;
}

// Function to handle username input change
function handleUsernameChange(event) {
  tempSettings.username = event.target.value.trim();
}

// Function to handle profile picture upload
function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      tempSettings.profilePicture = reader.result;
      const profilePicturePreview = document.getElementById("profile-picture-preview");
      if (profilePicturePreview) {
        profilePicturePreview.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Initialize settings on page load
document.addEventListener("DOMContentLoaded", () => {
  applyTempSettings();

  // Add event listeners
  const themeSlider = document.getElementById("theme-slider");
  if (themeSlider) {
    themeSlider.addEventListener("change", handleThemeChange);
  }

  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.addEventListener("change", handleLanguageChange);
  }

  const usernameInput = document.getElementById("username-input");
  if (usernameInput) {
    usernameInput.addEventListener("input", handleUsernameChange);
  }

  const profilePictureUpload = document.getElementById("profile-picture-upload");
  if (profilePictureUpload) {
    profilePictureUpload.addEventListener("change", handleProfilePictureUpload);
  }

  const saveSettingsButton = document.getElementById("save-settings");
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener("click", saveSettings);
  }
});

// Function to set the language
function setLanguage(language) {
  const elements = document.querySelectorAll("[data-lang]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-lang");
    if (translations[language] && translations[language][key]) {
      el.textContent = translations[language][key];
    }
  });

  // Update placeholders for input fields
  const placeholders = document.querySelectorAll("[data-placeholder-lang]");
  placeholders.forEach((el) => {
    const key = el.getAttribute("data-placeholder-lang");
    if (translations[language] && translations[language][key]) {
      el.setAttribute("placeholder", translations[language][key]);
    }
  });

  // Save language preference
  localStorage.setItem("language", language);
}

// Load saved settings and set default language based on browser's language
document.addEventListener("DOMContentLoaded", () => {
  const savedLanguage = localStorage.getItem("language") || "en";
  const browserLanguage = navigator.language.slice(0, 2); // Get the first two characters of the browser's language
  const defaultLanguage = translations[browserLanguage]
    ? browserLanguage
    : "en"; // Default to English if unsupported
  const language = savedLanguage || defaultLanguage;

  // Apply theme
  if (darkmode.isActivated()) {
    document.body.classList.add("light-mode");
  }

  // Apply language
  setLanguage(language);

  // Add event listeners
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", toggleTheme);

  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.value = language;
    languageSelect.addEventListener("change", (e) =>
      setLanguage(e.target.value)
    );
  }
});

// In-memory database for users
const database = {
  users: [],
};

// Function to handle login
function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const user = database.users.find(
    (user) => user.username === username && user.password === password
  );

  const message = document.getElementById("auth-message");
  if (user) {
    message.textContent = `Welcome back, ${username}!`;
    localStorage.setItem("user", username);
    setTimeout(() => {
      window.location.href = "index.html"; // Redirect to home
    }, 1000);
  } else {
    message.textContent = "Invalid username or password.";
  }
}

// Function to handle register
function handleRegister() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const userExists = database.users.some((user) => user.username === username);

  const message = document.getElementById("auth-message");
  if (userExists) {
    message.textContent = "Username already exists.";
  } else {
    database.users.push({ username, password });
    message.textContent = `Registration successful! Welcome, ${username}!`;
    localStorage.setItem("user", username);
    setTimeout(() => {
      window.location.href = "index.html"; // Redirect to home
    }, 1000);
  }
}

// Add event listeners for login and register buttons
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-submit");
  const registerButton = document.getElementById("register-submit");

  if (loginButton) loginButton.addEventListener("click", handleLogin);
  if (registerButton) registerButton.addEventListener("click", handleRegister);
});

// Function to update auth buttons based on login state
function updateAuthButtons() {
  const user = localStorage.getItem("user");
  const authButtons = document.getElementById("auth-buttons");

  if (user) {
    authButtons.innerHTML = `<span>Welcome, ${user}</span> <button id="logout-button">Logout</button>`;
    document
      .getElementById("logout-button")
      .addEventListener("click", handleLogout);
  } else {
    authButtons.innerHTML = `
            <button id="login-button">Login</button>
            <button id="register-button">Register</button>
        `;
    document
      .getElementById("login-button")
      .addEventListener("click", handleLogin);
    document
      .getElementById("register-button")
      .addEventListener("click", handleRegister);
  }
}

// Function to handle logout
function handleLogout() {
  localStorage.removeItem("user");
  alert("You have been logged out.");
  updateAuthButtons();
}

// Initialize auth buttons on page load
document.addEventListener("DOMContentLoaded", updateAuthButtons);

// Function to handle login button click
function redirectToLogin() {
  window.location.href = "auth/index.html";
}

// Add event listeners for login and register buttons
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-button");
  const registerButton = document.getElementById("register-button");

  if (loginButton) loginButton.addEventListener("click", redirectToLogin);
  if (registerButton) registerButton.addEventListener("click", redirectToLogin);
});

// Ensure middle mouse clicks and left clicks work for links and buttons
document.addEventListener("DOMContentLoaded", () => {
  const linksAndButtons = document.querySelectorAll("a, button[data-href]");

  linksAndButtons.forEach((element) => {
    // Handle middle mouse clicks
    element.addEventListener("auxclick", (event) => {
      if (event.button === 1) {
        // Middle mouse button
        event.preventDefault();
        const href =
          element.tagName === "A"
            ? element.href
            : element.getAttribute("data-href");
        if (href) {
          window.open(href, "_blank");
        }
      }
    });

    // Handle left clicks for buttons
    if (element.tagName === "BUTTON" && element.hasAttribute("data-href")) {
      element.addEventListener("click", () => {
        const href = element.getAttribute("data-href");
        if (href) {
          window.location.href = href;
        }
      });
    }
  });
});

// Add functionality to allow middle mouse clicks on links to open them in a new tab
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("a");

  links.forEach((link) => {
    link.addEventListener("auxclick", (event) => {
      if (event.button === 1) {
        // Middle mouse button
        event.preventDefault();
        const href = link.getAttribute("href");
        if (href) {
          window.open(href, "_blank");
        }
      }
    });
  });
});

// Translations
const translations = {
  de: {
    homeTitle: "Willkommen bei MasterTech Services!",
    servicesTitle: "Unsere Dienstleistungen",
    contactTitle: "Kontakt",
    shopTitle: "Shop",
    product1Title: "Produkt 1",
    product2Title: "Produkt 2",
    product3Title: "Produkt 3",
    settingsTitle: "Einstellungen",
    themeLabel: "Licht/Dunkel Modus",
    languageLabel: "Sprache",
    footerText: "Footer-Inhalt hier",
    aboutTitle: "Über uns",
    sourcesTitle: "Quellen",
    usernamePlaceholder: "Benutzername",
    passwordPlaceholder: "Passwort",
  },
  en: {
    homeTitle: "Welcome to MasterTech Services!",
    servicesTitle: "Our Services",
    contactTitle: "Contact",
    shopTitle: "Shop",
    product1Title: "Product 1",
    product2Title: "Product 2",
    product3Title: "Product 3",
    settingsTitle: "Settings",
    themeLabel: "Light/Dark Mode",
    languageLabel: "Language",
    footerText: "Footer content goes here",
    aboutTitle: "About Us",
    sourcesTitle: "Sources",
    usernamePlaceholder: "Username",
    passwordPlaceholder: "Password",
  },
};

// Function to handle unavailable services
function handleUnavailableService(serviceId, isUnavailable) {
  const priceElement = document.querySelector(`#${serviceId} #price`);
  const paymentOptions = document.querySelector(`#${serviceId} #payment-options`);

  if (isUnavailable) {
    if (priceElement) {
      priceElement.innerHTML = `<s>${priceElement.textContent}</s>`;
      priceElement.style.color = "red";
    }
    if (paymentOptions) {
      paymentOptions.style.display = "none";
    }
  }
}

// Example usage
document.addEventListener("DOMContentLoaded", () => {
  // Mark the Professional Repair service as unavailable
  handleUnavailableService("professional", true);
});

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".button");

  buttons.forEach((button) => {
    button.addEventListener("mousemove", (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse X position relative to button
      const y = e.clientY - rect.top; // Mouse Y position relative to button
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * 10; // Tilt based on Y-axis
      const rotateY = ((x - centerX) / centerX) * -10; // Tilt based on X-axis

      button.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg)";
    });
  });
});
