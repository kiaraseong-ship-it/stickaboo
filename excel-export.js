// Font color mapping (from customizer.js)
const fontColorMap = {
  Black: "#000000",
  White: "#FFFFFF",
  Navy: "#1F3A5F",
  Blue: "#43BBEC",
  Green: "#2F6B4F",
  Pink: "#F5A3B7",
  Brown: "#8B5E3C",
};

// Reverse mapping: hex to name
const fontColorNameMap = {
  "#000000": "Black",
  "#FFFFFF": "White",
  "#1F3A5F": "Navy",
  "#43BBEC": "Blue",
  "#2F6B4F": "Green",
  "#F5A3B7": "Pink",
  "#8B5E3C": "Brown",
};

// Helper to normalize font color
function normalizeFontColor(color) {
  if (!color) return "#000000";
  color = color.trim();

  // If it's a name, convert to hex
  if (fontColorMap[color]) {
    return fontColorMap[color];
  }

  // If it's already a hex code, return it
  if (color.startsWith("#")) {
    return color;
  }

  // Default to black
  return "#000000";
}

// Helper to normalize size
function normalizeSize(size) {
  if (!size) return "small";
  const normalized = size.toLowerCase().trim();
  const validSizes = ["small", "medium", "large", "sml-mix", "ml-mix"];
  return validSizes.includes(normalized) ? normalized : "small";
}

// Helper to normalize theme
function normalizeTheme(theme) {
  if (!theme) return "undertheocean";
  const normalized = theme.toLowerCase().trim();
  const validThemes = [
    "undertheocean",
    "animal",
    "dino",
    "unicorn",
    "space",
    "cuteicon",
    "nameonly",
  ];
  return validThemes.includes(normalized) ? normalized : "undertheocean";
}

// Parse Excel or CSV file
function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isCSV = file.name.toLowerCase().endsWith(".csv");

    reader.onload = function (e) {
      try {
        let jsonData;
        if (isCSV) {
          // Parse CSV
          const text = e.target.result;
          const workbook = XLSX.read(text, { type: "string", raw: false });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(firstSheet);
        } else {
          // Parse Excel
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(firstSheet);
        }
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

// Create a temporary preview element for a row (with full structure for customizer)
function createPreviewElement(rowData, index, size, theme) {
  const container = document.getElementById("hidden-preview-container");

  // Create the root element (matching index.html structure)
  const root = document.createElement("div");
  root.className = "flex-box";
  root.setAttribute("data-custom-root", "");
  root.setAttribute("data-section-type", "customizer");
  root.setAttribute("data-placeholder", "images/small-undertheocean.png");
  root.id = `preview-root-${index}`;
  // Position off-screen but not too far (html2canvas needs elements in viewport)
  root.style.position = "fixed";
  root.style.left = "0px";
  root.style.top = "0px";
  root.style.width = "420px";
  root.style.height = "595px";
  root.style.opacity = "0";
  root.style.pointerEvents = "none";
  root.style.zIndex = "-1";

  // Create print-capture structure
  const printCapture = document.createElement("div");
  printCapture.className = "print-capture";

  const previewWrapper = document.createElement("div");
  previewWrapper.className = "preview-wrapper";

  const previewImage = document.createElement("img");
  previewImage.className = "preview-image";

  const overlayContainer = document.createElement("div");
  overlayContainer.id = "overlay-container";
  overlayContainer.className = "overlay-container";

  previewWrapper.appendChild(previewImage);
  previewWrapper.appendChild(overlayContainer);
  printCapture.appendChild(previewWrapper);
  root.appendChild(printCapture);

  // Create hidden input fields for customizer (required by initCustomizer)
  const firstNameInput = document.createElement("input");
  firstNameInput.type = "text";
  firstNameInput.id = "user-text";
  firstNameInput.className = "text-input";
  firstNameInput.style.display = "none";

  const lastNameInput = document.createElement("input");
  lastNameInput.type = "text";
  lastNameInput.id = "user-text-last-name";
  lastNameInput.className = "text-input";
  lastNameInput.style.display = "none";

  // Create hidden buttons for size and theme (required for customizer to work)
  // Size button (needs to be in a section with class "options options-size")
  const sizeSection = document.createElement("div");
  sizeSection.id = "size-section";
  const sizeOptions = document.createElement("section");
  sizeOptions.className = "options options-size";
  const sizeBtn = document.createElement("button");
  sizeBtn.className = "option-btn size-btn active";
  sizeBtn.setAttribute("data-size", size);
  sizeOptions.appendChild(sizeBtn);
  sizeSection.appendChild(sizeOptions);

  // Theme button (needs to be in a section with class "options options-theme")
  const themeSection = document.createElement("div");
  themeSection.id = "theme-section";
  const themeOptions = document.createElement("section");
  themeOptions.className = "options options-theme";
  const themeBtn = document.createElement("button");
  themeBtn.className = "option-btn theme-btn active";
  themeBtn.setAttribute("data-theme", theme);
  themeOptions.appendChild(themeBtn);
  themeSection.appendChild(themeOptions);

  root.appendChild(firstNameInput);
  root.appendChild(lastNameInput);
  root.appendChild(sizeSection);
  root.appendChild(themeSection);

  container.appendChild(root);

  return {
    root,
    firstNameInput,
    lastNameInput,
    previewImage,
    overlayContainer,
    sizeBtn,
    themeBtn,
  };
}

// Wait for image to load
function waitForImageLoad(img) {
  return new Promise((resolve, reject) => {
    if (img.complete && img.naturalHeight !== 0) {
      resolve();
      return;
    }

    img.onload = resolve;
    img.onerror = reject;
  });
}

// Generate PNG for a single row
async function generatePNGForRow(rowData, index) {
  // Normalize data first (before creating element)
  const firstName = (
    rowData["First Name"] ||
    rowData["first name"] ||
    rowData["firstName"] ||
    ""
  ).trim();
  const lastName = (
    rowData["Last Name"] ||
    rowData["last name"] ||
    rowData["lastName"] ||
    ""
  ).trim();
  const size = normalizeSize(rowData["Size"] || rowData["size"] || "small");
  const theme = normalizeTheme(
    rowData["Theme"] || rowData["theme"] || "undertheocean"
  );
  const fontColor = normalizeFontColor(
    rowData["Font Color"] ||
      rowData["font color"] ||
      rowData["fontColor"] ||
      "Black"
  );

  const {
    root,
    firstNameInput,
    lastNameInput,
    previewImage,
    overlayContainer,
    sizeBtn,
    themeBtn,
  } = createPreviewElement(rowData, index, size, theme);

  // Initialize customizer - this sets up all the overlay logic
  if (typeof initCustomizer === "function") {
    initCustomizer(root);
  }

  // Wait for initialization to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Click size button first to update size and render overlays
  sizeBtn.click();
  await new Promise(resolve => setTimeout(resolve, 300));

  // Click theme button to update theme and preview image
  themeBtn.click();
  await new Promise(resolve => setTimeout(resolve, 400));

  // Set the input values programmatically (this will trigger updateOverlayText via event listeners)
  firstNameInput.value = firstName;
  lastNameInput.value = lastName;

  // Trigger input events to update overlays
  firstNameInput.dispatchEvent(new Event("input", { bubbles: true }));
  lastNameInput.dispatchEvent(new Event("input", { bubbles: true }));

  // Wait a bit for the overlays to update
  await new Promise(resolve => setTimeout(resolve, 500));

  // Update font color on overlays
  root.querySelectorAll(".text-overlay").forEach(text => {
    text.style.color = fontColor;
    if (fontColor === "#FFFFFF") {
      text.style.textShadow = "0 0 1px #000, 0 0 1px #000";
    } else {
      text.style.textShadow = "none";
    }
  });

  // Wait for image to load - check if src is set
  if (!previewImage.src || previewImage.src === window.location.href) {
    // Manually set image src if customizer didn't set it
    const placeholderUrl =
      root.dataset.placeholder || "images/small-undertheocean.png";
    const fileName = `${size}-${theme}.png`;
    const imageSrc = placeholderUrl.replace(/[^/]+$/, fileName);
    previewImage.src = imageSrc;
  }

  // Wait for image to load
  try {
    await waitForImageLoad(previewImage);
  } catch (e) {
    console.warn("Image load failed, continuing anyway", e);
  }

  // Additional wait to ensure everything is rendered
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get the preview wrapper for html2canvas
  const previewWrapper = root.querySelector(".preview-wrapper");

  // Ensure preview wrapper is visible for html2canvas
  if (previewWrapper) {
    previewWrapper.style.visibility = "visible";
    previewWrapper.style.opacity = "1";
  }

  // Generate canvas
  const canvas = await html2canvas(previewWrapper, {
    scale: 4,
    backgroundColor: null,
    useCORS: true,
  });

  // Clean up
  root.remove();

  return {
    canvas: canvas,
    data: {
      firstName,
      lastName,
      size,
      theme,
      fontColor,
      index,
    },
  };
}

// Process all rows
async function processExcelRows(rows) {
  const statusEl = document.getElementById("status");
  const imagesGrid = document.getElementById("images-grid");
  const imagesContainer = document.getElementById("images-container");
  const batchDownloadBtn = document.getElementById("batch-download-btn");

  imagesGrid.innerHTML = "";
  const generatedImages = [];

  statusEl.className = "status processing";
  statusEl.textContent = `Processing ${rows.length} rows...`;

  for (let i = 0; i < rows.length; i++) {
    try {
      statusEl.textContent = `Processing row ${i + 1} of ${rows.length}...`;

      const result = await generatePNGForRow(rows[i], i);
      generatedImages.push(result);

      // Create image item
      const imageItem = document.createElement("div");
      imageItem.className = "image-item";

      const img = document.createElement("img");
      img.src = result.canvas.toDataURL("image/png");
      img.alt = `${result.data.firstName} ${result.data.lastName}`;

      const imageInfo = document.createElement("div");
      imageInfo.className = "image-info";
      imageInfo.textContent = `${result.data.firstName} ${result.data.lastName} - ${result.data.size} - ${result.data.theme}`;

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "download-btn";
      downloadBtn.textContent = "Download";
      downloadBtn.onclick = () => {
        const link = document.createElement("a");
        link.download = `${result.data.firstName}_${result.data.lastName}_${result.data.index}.png`;
        link.href = result.canvas.toDataURL("image/png");
        link.click();
      };

      imageItem.appendChild(img);
      imageItem.appendChild(imageInfo);
      imageItem.appendChild(downloadBtn);
      imagesGrid.appendChild(imageItem);
    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error);
      statusEl.textContent = `Error processing row ${i + 1}: ${error.message}`;
    }
  }

  statusEl.className = "status success";
  statusEl.textContent = `Successfully generated ${generatedImages.length} images!`;

  imagesContainer.style.display = "block";
  batchDownloadBtn.style.display = "inline-block";

  // Set up batch download
  batchDownloadBtn.onclick = async () => {
    const zip = new JSZip();

    generatedImages.forEach((result, index) => {
      const filename = `${result.data.firstName}_${result.data.lastName}_${index}.png`;
      zip.file(filename, result.canvas.toDataURL("image/png").split(",")[1], {
        base64: true,
      });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "stickaboo-prints.zip";
    link.click();
  };

  return generatedImages;
}

// Main event handlers
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("excel-file");
  const fileNameEl = document.getElementById("file-name");
  const processBtn = document.getElementById("process-btn");
  const statusEl = document.getElementById("status");

  let selectedFile = null;

  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      selectedFile = file;
      fileNameEl.textContent = `Selected: ${file.name}`;
      processBtn.style.display = "inline-block";
      statusEl.className = "status";
      statusEl.style.display = "none";
    }
  });

  processBtn.addEventListener("click", async () => {
    if (!selectedFile) {
      alert("Please select an Excel file first");
      return;
    }

    processBtn.disabled = true;
    processBtn.textContent = "Processing...";

    try {
      const rows = await parseExcelFile(selectedFile);

      if (rows.length === 0) {
        statusEl.className = "status error";
        statusEl.textContent = "Excel file is empty or has no data rows";
        statusEl.style.display = "block";
        processBtn.disabled = false;
        processBtn.textContent = "Process Excel";
        return;
      }

      await processExcelRows(rows);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      statusEl.className = "status error";
      statusEl.textContent = `Error: ${error.message}`;
      statusEl.style.display = "block";
    } finally {
      processBtn.disabled = false;
      processBtn.textContent = "Process Excel";
    }
  });
});
