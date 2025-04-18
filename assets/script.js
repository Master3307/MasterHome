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

// Function to toggle between light and dark mode
function toggleTheme() {
  const body = document.body;
  const header = document.getElementById("header");
  const panel = document.getElementById("panel");
  const footer = document.querySelector("footer");
  const products = document.querySelectorAll(".product");
  const themeToggle = document.getElementById("theme-toggle");

  body.classList.toggle("light-mode");
  header.classList.toggle("light-mode");
  if (panel) panel.classList.toggle("light-mode");
  footer.classList.toggle("light-mode");
  products.forEach((product) => product.classList.toggle("light-mode"));

  themeToggle.classList.toggle("active");

  // Save theme preference
  const isLightMode = body.classList.contains("light-mode");
  localStorage.setItem("theme", isLightMode ? "light" : "dark");
}

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
  const theme = localStorage.getItem("theme") || "dark";
  const savedLanguage = localStorage.getItem("language");
  const browserLanguage = navigator.language.slice(0, 2); // Get the first two characters of the browser's language
  const defaultLanguage = translations[browserLanguage]
    ? browserLanguage
    : "en"; // Default to English if unsupported
  const language = savedLanguage || defaultLanguage;

  // Apply theme
  if (theme === "light") {
    toggleTheme();
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

// Function to set the user's name
function setUserName() {
  const userName = prompt("Please enter your name:");
  if (userName) {
    localStorage.setItem("userName", userName);
    updateUserNameDisplay();
  }
}

// Function to update the displayed user name
function updateUserNameDisplay() {
  const userName = localStorage.getItem("userName") || "Guest";
  const authButtons = document.getElementById("auth-buttons");
  authButtons.innerHTML = `
        <span>Welcome, ${userName}</span>
        <button id="change-name-button">Change Name</button>
        <button id="wishlist-button">Wishlist</button>
    `;
  document
    .getElementById("change-name-button")
    .addEventListener("click", setUserName);
  document
    .getElementById("wishlist-button")
    .addEventListener("click", showWishlist);
}

// Wishlist system
function addToWishlist(item) {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (!wishlist.includes(item)) {
    wishlist.push(item);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    alert(`${item} has been added to your wishlist!`);
  } else {
    alert(`${item} is already in your wishlist.`);
  }
}

function showWishlist() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (wishlist.length > 0) {
    alert(`Your Wishlist:\n- ${wishlist.join("\n- ")}`);
  } else {
    alert("Your wishlist is empty.");
  }
}

// Initialize user name and wishlist on page load
document.addEventListener("DOMContentLoaded", () => {
  updateUserNameDisplay();

  // Add event listeners for "Add to Wishlist" buttons
  const wishlistButtons = document.querySelectorAll(".add-to-wishlist");
  wishlistButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const itemName = button.getAttribute("data-item");
      addToWishlist(itemName);
    });
  });
});

// Function to fetch and display assets
async function fetchAssets() {
  try {
    // Simulate fetching assets (replace with actual backend API if available)
    const assets = [
      "image1.jpg",
      "image2.png",
      "image3.gif",
      "document.pdf",
      "video.mp4",
    ];
    const images = assets.filter((file) =>
      /\.(jpg|jpeg|png|gif|svg)$/i.test(file)
    );
    initializeViewer(images);
  } catch (error) {
    console.error("Error fetching assets:", error);
  }
}

// Function to initialize the image viewer
function initializeViewer(images) {
  let currentIndex = 0;

  function updateImage() {
    const imgElement = document.getElementById("current-image");
    if (images.length > 0) {
      imgElement.src = images[currentIndex];
      imgElement.alt = `Asset ${currentIndex + 1}`;
    } else {
      imgElement.src = "";
      imgElement.alt = "No assets available";
    }
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  function populateAssetList() {
    const listElement = document.getElementById("asset-list");
    listElement.innerHTML = ""; // Clear existing list
    images.forEach((image, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = image;
      listItem.addEventListener("click", () => {
        currentIndex = index;
        updateImage();
      });
      listElement.appendChild(listItem);
    });
  }

  document.querySelector(".prev").addEventListener("click", prevImage);
  document.querySelector(".next").addEventListener("click", nextImage);

  populateAssetList();
  updateImage();
}

// Fetch assets on page load
document.addEventListener("DOMContentLoaded", fetchAssets);

// Include Bootstrap JS
import "./bootstrap.js";
import React from "react";
import ReactDOM from "react-dom";
import "@phosphor-icons/web/light";
import "@phosphor-icons/web/bold";

const images = [
  "image1.jpg",
  "image2.png",
  "image3.gif",
  // Add all image filenames here
];

let currentIndex = 0;

function updateImage() {
  const imgElement = document.getElementById("current-image");
  imgElement.src = images[currentIndex];
  imgElement.alt = `Asset ${currentIndex + 1}`;
}

function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateImage();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  updateImage();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prev-button").addEventListener("click", prevImage);
  document.getElementById("next-button").addEventListener("click", nextImage);
  updateImage();
});

document
  .getElementById("upload-cursor")
  .addEventListener("change", function () {
    const file = this.files[0];
    const fileName = file ? file.name : "No file chosen";
    document.getElementById("file-name").textContent = fileName;

    if (file) {
      const fileURL = URL.createObjectURL(file);
      const validExtensions = [".cur", ".ani", ".png", ".gif"];
      const fileExtension = fileName
        .slice(fileName.lastIndexOf("."))
        .toLowerCase();

      if (validExtensions.includes(fileExtension)) {
        if (fileExtension === ".cur" || fileExtension === ".ani") {
          // Apply .cur and .ani files directly
          document.body.style.cursor = `url(${fileURL}), auto`;
        } else {
          // Handle .png and .gif files with proper scaling
          const img = new Image();
          img.onload = () => {
            const hotspotX = Math.min(img.width / 2, 32); // Limit hotspot to 32px
            const hotspotY = Math.min(img.height / 2, 32); // Limit hotspot to 32px
            document.body.style.cursor = `url(${fileURL}) ${hotspotX} ${hotspotY}, auto`;
          };
          img.src = fileURL;
        }
      } else {
        alert(
          "Unsupported file type. Please upload a .cur, .ani, .png, or .gif file."
        );
        document.body.style.cursor = "default";
      }
    }
  });

// Function to toggle collapsible sections
function toggleCollapsible(header) {
  const content = header.nextElementSibling;
  const arrow = header.querySelector(".arrow");
  const container = header.closest(".collapsible-container");

  if (content.style.maxHeight) {
    // If already open, collapse it
    content.style.maxHeight = null;
    content.classList.remove("open");
    arrow.classList.remove("fa-chevron-down");
    arrow.classList.add("fa-chevron-right");
  } else {
    // If closed, expand it
    content.style.maxHeight = content.scrollHeight + "px";
    content.classList.add("open");
    arrow.classList.remove("fa-chevron-right");
    arrow.classList.add("fa-chevron-down");
  }

  // Dynamically adjust the height of the container
  const totalHeight = Array.from(container.children).reduce((height, child) => {
    const childContent = child.querySelector(".collapsible-content");
    return height + (childContent && childContent.style.maxHeight ? childContent.scrollHeight : 0);
  }, 0);
  container.style.height = `${totalHeight}px`;
}
