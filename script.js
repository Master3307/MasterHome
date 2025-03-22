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
