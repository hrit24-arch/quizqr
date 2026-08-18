const box = document.querySelector(".box");
const form = document.querySelector("form");
const fileInp = form.querySelector("input");
const infoText = form.querySelector("p");
const closeBtn = document.querySelector(".close");
const copyBtn = document.querySelector(".copy");

const cameraBtn = document.querySelector(".camera-btn");
const stopCameraBtn = document.querySelector(".stop-camera");
const cameraContainer = document.querySelector(".camera-container");

let html5QrCode = null;
let cameraRunning = false;


// ================================
// SHOW RESULT
// ================================

function showResult(result) {

    if (!result) {
        infoText.innerText = "Couldn't scan QR code";
        return;
    }

    document.querySelector("textarea").value = result;

    infoText.innerText = "QR code scanned successfully";

    box.classList.add("active");
}


// ================================
// SCAN UPLOADED QR IMAGE
// ================================

async function fetchRequest(file, formData) {

    infoText.innerText = "Scanning QR...";

    try {

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        const result = await html5QrCode.scanFile(file, true);

        console.log("Scanned result:", result);

        showResult(result);

    } catch (error) {

        console.error("QR scan error:", error);

        infoText.innerText = "Couldn't scan QR code";
    }
}


// ================================
// FILE UPLOAD
// ================================

fileInp.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    const image = form.querySelector("img");

    image.src = URL.createObjectURL(file);
    image.style.display = "block";

    fetchRequest(file, formData);
});


// ================================
// START CAMERA
// ================================

cameraBtn.addEventListener("click", async (e) => {

    e.preventDefault();
    e.stopPropagation();

    infoText.innerText = "Starting laptop camera...";
    cameraContainer.classList.add("active");

    try {

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        // Get all cameras available to the browser
        const cameras = await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
            infoText.innerText = "No camera found";
            return;
        }

        console.log("Available cameras:", cameras);

        // Look for a laptop/built-in camera
        let laptopCamera = cameras.find(camera =>
            /integrated|built.?in|internal|webcam|hd camera|facetime/i
                .test(camera.label)
        );

        // If no obvious laptop camera is found,
        // use the first available camera
        if (!laptopCamera) {
            laptopCamera = cameras[0];
        }

        console.log("Selected camera:", laptopCamera);

        await html5QrCode.start(
            laptopCamera.id,
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },

            (decodedText) => {

                console.log("QR result:", decodedText);

                showResult(decodedText);

                stopCamera();
            },

            () => {
                // QR not detected yet
            }
        );

        cameraRunning = true;

        infoText.innerText = "Point your laptop camera at the QR code";

    } catch (error) {

        console.error("Camera error:", error);

        cameraContainer.classList.remove("active");

        infoText.innerText = "Unable to access laptop camera";
    }
});

// ================================
// STOP CAMERA
// ================================

async function stopCamera() {

    if (!html5QrCode || !cameraRunning) {
        cameraContainer.classList.remove("active");
        return;
    }

    try {

        await html5QrCode.stop();

        html5QrCode.clear();

        cameraRunning = false;

        cameraContainer.classList.remove("active");

    } catch (error) {

        console.error("Stop camera error:", error);

        cameraRunning = false;

        cameraContainer.classList.remove("active");
    }
}


stopCameraBtn.addEventListener("click", (e) => {

    e.preventDefault();
    e.stopPropagation();

    stopCamera();

    infoText.innerText = "Upload QR Code";
});


// ================================
// COPY
// ================================

copyBtn.addEventListener("click", async () => {

    const text = document.querySelector("textarea").value;

    if (!text) return;

    try {

        await navigator.clipboard.writeText(text);

        copyBtn.innerText = "Copied!";

        setTimeout(() => {
            copyBtn.innerText = "Copy";
        }, 1500);

    } catch (error) {

        console.error("Copy error:", error);
    }
});


// ================================
// CLOSE RESULT
// ================================

closeBtn.addEventListener("click", (e) => {

    e.preventDefault();
    e.stopPropagation();

    box.classList.remove("active");

    document.querySelector("textarea").value = "";

    const image = form.querySelector("img");

    image.src = "#";
    image.style.display = "none";

    fileInp.value = "";
});


// ================================
// PREVENT FORM SUBMIT
// ================================

form.addEventListener("submit", (e) => {
    e.preventDefault();
});


// ================================
// OPEN FILE SELECTOR
// ================================

form.addEventListener("click", (e) => {

    if (
        e.target.closest(".camera-btn") ||
        e.target.closest("input")
    ) {
        return;
    }

    fileInp.click();
});