const camera =
    document.getElementById("camera");

const captureBtn =
    document.getElementById("captureBtn");

const canvas =
    document.getElementById("canvas");

const message =
    document.getElementById("message");


async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({
                    video: true,
                    audio: false
                });

        camera.srcObject = stream;

    }
    catch (error) {

        console.error(error);

        message.textContent =
            "Camera access denied.";

    }
}


captureBtn.addEventListener(
    "click",
    async function () {

        const context =
            canvas.getContext("2d");

        canvas.width =
            camera.videoWidth;

        canvas.height =
            camera.videoHeight;

        context.drawImage(
            camera,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const imageBase64 =
            canvas.toDataURL(
                "image/jpeg"
            );

        console.log(imageBase64);

        message.textContent =
            "Face captured.";

    }
);


startCamera();