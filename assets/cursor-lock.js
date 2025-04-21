document.addEventListener("DOMContentLoaded", () => {
  const hoverAreas = document.querySelectorAll(".hover-area");
  let activeCursorArea = null;

  hoverAreas.forEach((area) => {
    area.addEventListener("click", () => {
      if (activeCursorArea === area) {
        resetGlobalCursor();
        area.classList.remove("active");
        activeCursorArea = null;
      } else {
        if (activeCursorArea) {
          activeCursorArea.classList.remove("active");
        }
        setGlobalCursor(area);
        area.classList.add("active");
        activeCursorArea = area;
      }
    });
  });

  function setGlobalCursor(area) {
    if (!area) return;
    const cursorStyle = window.getComputedStyle(area).cursor;
    document.body.style.cursor = cursorStyle;
  }

  function resetGlobalCursor() {
    document.body.style.cursor = "default";
  }

  // Handle custom cursor uploads
  const uploadCursorInput = document.getElementById("upload-cursor");
  const fileNameDisplay = document.getElementById("file-name");

  uploadCursorInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const fileName = file.name;
    fileNameDisplay.textContent = fileName;

    const fileURL = URL.createObjectURL(file);
    const validExtensions = [".cur", ".ani", ".png", ".gif"];
    const fileExtension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert("Unsupported file type. Please upload a .cur, .ani, .png, or .gif file.");
      resetGlobalCursor();
      return;
    }

    // Apply the cursor directly for .cur and .ani files
    if (fileExtension === ".cur" || fileExtension === ".ani") {
      document.body.style.cursor = `url(${fileURL}), auto`;
      return;
    }

    // For .png and .gif, calculate the hotspot dynamically
    const img = new Image();
    img.onload = () => {
      const hotspotX = Math.floor(img.width / 2); // Center hotspot
      const hotspotY = Math.floor(img.height / 2); // Center hotspot
      document.body.style.cursor = `url(${fileURL}) ${hotspotX} ${hotspotY}, auto`;
    };
    img.onerror = () => {
      alert("Failed to load the cursor image. Please try a different file.");
      resetGlobalCursor();
    };
    img.src = fileURL;
  });
});
