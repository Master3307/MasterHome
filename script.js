// Function to highlight the active link
function setActivePage() {
    const currentPath = window.location.pathname; // Get the current page path

    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        // Remove the 'active' class from all links
        link.classList.remove('active');

        // Check if the current path matches the link's href (excluding the domain)
        const linkHref = link.getAttribute('href');

        // Compare paths more precisely
        if (currentPath === linkHref) {
            link.classList.add('active');  // Exact match
        }
    });
}

// Call setActivePage when the page loads
document.addEventListener('DOMContentLoaded', setActivePage);

// Function to toggle between light and dark mode
function toggleTheme() {
    const body = document.body;
    const header = document.getElementById('header');
    const panel = document.getElementById('panel');
    const footer = document.querySelector('footer');
    const products = document.querySelectorAll('.product');
    const themeToggle = document.getElementById('theme-toggle');

    body.classList.toggle('light-mode');
    header.classList.toggle('light-mode');
    panel.classList.toggle('light-mode');
    footer.classList.toggle('light-mode');
    products.forEach(product => product.classList.toggle('light-mode'));

    if (body.classList.contains('light-mode')) {
        themeToggle.textContent = '☀️'; // Sun icon for light mode
    } else {
        themeToggle.textContent = '🌙'; // Moon icon for dark mode
    }
}

// Add event listener to the theme toggle button
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Ensure dark mode is the default
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode');
    document.getElementById('header').classList.add('dark-mode');
    document.getElementById('panel').classList.add('dark-mode');
    document.querySelector('footer').classList.add('dark-mode');
    document.querySelectorAll('.product').forEach(product => product.classList.add('dark-mode'));
});
