const box = document.querySelector(".box");
const form = document.querySelector("form");
const fileInp = form.querySelector("input");
const infoText = form.querySelector("p");

const closeBtn = document.querySelector(".close");
const copyBtn = document.querySelector(".copy");

const cameraBtn = document.querySelector(".camera-btn");
const stopCameraBtn = document.querySelector(".stop-camera");
const cameraContainer = document.querySelector(".camera-container");

// Camera dropdown
const cameraSelect = document.querySelector("#camera-select");

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

    if (!file) {
        return;
    }

    const formData = new FormData();

    formData.append("file", file);

    const image = form.querySelector("img");

    image.src = URL.createObjectURL(file);

    image.style.display = "block";

    fetchRequest(file, formData);
});


// ================================
// GET AVAILABLE CAMERAS
// ================================

async function getCameras() {

    try {

        const cameras = await Html5Qrcode.getCameras();

        console.log("Available cameras:", cameras);

        // Clear old options
        cameraSelect.innerHTML = "";


        if (!cameras || cameras.length === 0) {

            const option = document.createElement("option");

            option.value = "";

            option.textContent = "No camera found";

            cameraSelect.appendChild(option);

            return;
        }


        // Add every camera to dropdown

        cameras.forEach((camera, index) => {

            const option = document.createElement("option");

            option.value = camera.id;

            option.textContent =
                camera.label || `Camera ${index + 1}`;

            cameraSelect.appendChild(option);

        });


        // Try to automatically select rear camera

        let preferredCamera = cameras.find(camera =>
            /back|rear|environment|main/i.test(camera.label)
        );


        // If rear camera isn't identified,
        // use the last camera.

        if (!preferredCamera && cameras.length > 1) {

            preferredCamera =
                cameras[cameras.length - 1];

        }


        // If there is only one camera

        if (!preferredCamera) {

            preferredCamera = cameras[0];

        }


        cameraSelect.value = preferredCamera.id;


        console.log(
            "Preferred camera:",
            preferredCamera.label
        );

    } catch (error) {

        console.error(
            "Camera detection error:",
            error
        );

        infoText.innerText =
            "Unable to find cameras";
    }
}


// ================================
// START CAMERA
// ================================

async function startCamera(cameraId) {

    if (!cameraId) {

        infoText.innerText =
            "Please select a camera";

        return;
    }


    try {

        // Stop previous camera if running

        if (cameraRunning) {

            await stopCamera();

        }


        if (!html5QrCode) {

            html5QrCode =
                new Html5Qrcode("reader");

        }


        infoText.innerText =
            "Starting camera...";


        await html5QrCode.start(

            cameraId,

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                }
            },


            // QR successfully decoded

            (decodedText) => {

                console.log(
                    "QR result:",
                    decodedText
                );

                showResult(decodedText);

                stopCamera();

            },


            // QR not detected yet

            () => {

                // Keep scanning

            }

        );


        cameraRunning = true;


        infoText.innerText =
            "Point your camera at the QR code";

    } catch (error) {

        console.error(
            "Camera start error:",
            error
        );

        cameraRunning = false;

        infoText.innerText =
            "Unable to start selected camera";
    }
}


// ================================
// CAMERA BUTTON
// ================================

cameraBtn.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        e.stopPropagation();


        cameraContainer.classList.add(
            "active"
        );


        infoText.innerText =
            "Finding cameras...";


        // Find available cameras

        await getCameras();


        // Get selected camera

        const selectedCamera =
            cameraSelect.value;


        if (!selectedCamera) {

            infoText.innerText =
                "No camera available";

            return;
        }


        // Start selected camera

        await startCamera(
            selectedCamera
        );

    }
);


// ================================
// CAMERA DROPDOWN CHANGE
// ================================

cameraSelect.addEventListener(
    "change",
    async () => {

        const selectedCamera =
            cameraSelect.value;


        if (!selectedCamera) {
            return;
        }


        await startCamera(
            selectedCamera
        );

    }
);


// ================================
// STOP CAMERA
// ================================

async function stopCamera() {

    if (
        !html5QrCode ||
        !cameraRunning
    ) {

        cameraContainer.classList.remove(
            "active"
        );

        return;
    }


    try {

        await html5QrCode.stop();

        html5QrCode.clear();

        cameraRunning = false;

        cameraContainer.classList.remove(
            "active"
        );

    } catch (error) {

        console.error(
            "Camera stop error:",
            error
        );

        cameraRunning = false;

        cameraContainer.classList.remove(
            "active"
        );
    }
}


stopCameraBtn.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        e.stopPropagation();


        await stopCamera();


        infoText.innerText =
            "Upload QR Code";

    }
);


// ================================
// COPY RESULT
// ================================

copyBtn.addEventListener(
    "click",
    async () => {

        const text =
            document.querySelector(
                "textarea"
            ).value;


        if (!text) {
            return;
        }


        try {

            await navigator.clipboard
                .writeText(text);


            copyBtn.innerText =
                "Copied!";


            setTimeout(() => {

                copyBtn.innerText =
                    "Copy";

            }, 1500);


        } catch (error) {

            console.error(
                "Copy error:",
                error
            );
        }
    }
);


// ================================
// CLOSE RESULT
// ================================

closeBtn.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        e.stopPropagation();


        // Stop camera if running

        if (cameraRunning) {

            await stopCamera();

        }


        box.classList.remove(
            "active"
        );


        document.querySelector(
            "textarea"
        ).value = "";


        const image =
            form.querySelector("img");


        image.src = "#";

        image.style.display =
            "none";


        fileInp.value = "";

    }
);


// ================================
// PREVENT FORM SUBMIT
// ================================

form.addEventListener(
    "submit",
    (e) => {

        e.preventDefault();

    }
);


// ================================
// OPEN FILE SELECTOR
// ================================

form.addEventListener(
    "click",
    (e) => {

        // Don't open file picker when
        // clicking camera button

        if (
            e.target.closest(
                ".camera-btn"
            ) ||
            e.target.closest(
                "input"
            )
        ) {

            return;
        }


        fileInp.click();

    }
);
