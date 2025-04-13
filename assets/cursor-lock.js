document.addEventListener("DOMContentLoaded", () => {
  const hoverAreas = document.querySelectorAll(".hover-area");
  let activeCursorArea = null; // Track the currently active cursor area

  hoverAreas.forEach((area) => {
    area.addEventListener("click", () => {
      if (activeCursorArea === area) {
        resetGlobalCursor(); // Reset to default if the same area is clicked again
        area.classList.remove("active"); // Remove highlight from the active area
        activeCursorArea = null; // Clear the active cursor area
      } else {
        if (activeCursorArea) {
          activeCursorArea.classList.remove("active"); // Remove highlight from the previously active area
        }
        setGlobalCursor(area); // Set the global cursor to the clicked area's cursor
        area.classList.add("active"); // Highlight the newly active area
        activeCursorArea = area; // Update the active cursor area
      }
    });
  });

  function setGlobalCursor(area) {
    if (!area) return; // Ensure the area is not null before proceeding
    const cursorStyle = window.getComputedStyle(area).cursor;
    document.body.style.cursor = cursorStyle; // Apply the cursor globally
  }

  function resetGlobalCursor() {
    document.body.style.cursor = "default"; // Reset to the default cursor
  }
});
