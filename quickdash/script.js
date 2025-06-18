document.addEventListener('DOMContentLoaded', () => {
    const body = document.body; // Reference to the body element

    // Removed event listeners for the 9-dot button as it's no longer present
    // The menu is now always displayed.

    // Optional: Add a simple dark mode toggle for testing the CSS
    // For demonstration, let's just make it toggle on 'd' key press (d for dark mode)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'd' || event.key === 'D') {
            body.classList.toggle('dark-mode');
            console.log(`Dark mode: ${body.classList.contains('dark-mode') ? 'On' : 'Off'}`);
        }
    });

    // Add popup opener
    const openBtn = document.getElementById('openAppMenuPopup');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            window.open(
                'app-menu-popup.html',
                'AppMenuPopup',
                'width=380,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
            );
        });
    }
});