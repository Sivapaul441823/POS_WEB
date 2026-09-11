/* =========================================================
   LOGIN PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    const password = document.getElementById("password");

    const togglePassword = document.getElementById("togglePassword");

    const scanQrButton = document.getElementById("scanQrButton");

    const qrModal = document.getElementById("qrModal");

    const closeQrButton = document.getElementById("closeQrButton");

    const cancelScanButton = document.getElementById("cancelScanButton");


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    togglePassword.addEventListener(
        "click",
        function () {

            if (password.type === "password") {

                password.type = "text";

                togglePassword.innerText = "🙈";

                togglePassword.setAttribute("aria-label","Hide password");

            }
            else {

                password.type = "password";

                togglePassword.innerText = "👁";

                togglePassword.setAttribute("aria-label","Show password");
            }

        }
    );


    /* =====================================================
       LOGIN
    ===================================================== */

    loginForm.addEventListener("submit",
        async function (event) {

            event.preventDefault();

            await login();

        }
    );


    /* =====================================================
       OPEN QR MODAL
    ===================================================== */

    scanQrButton.addEventListener(
        "click",
        function () {

            openQrScanner();

        }
    );


    /* =====================================================
       CLOSE QR MODAL
    ===================================================== */

    closeQrButton.addEventListener(
        "click",
        function () {

            closeQrScanner();

        }
    );


    cancelScanButton.addEventListener(
        "click",
        function () {

            closeQrScanner();

        }
    );


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                qrModal.classList.contains("active")
            ) {

                closeQrScanner();

            }

        }
    );

});


/* =========================================================
   LOGIN API
========================================================= */

async function login() {

    const userName =
        document
            .getElementById("userName")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;


    clearError();


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (userName === "") {

        showError("Please enter your username.");

        document.getElementById("userName").focus();

        return;
    }


    if (password === "") {

        showError("Please enter your password.");

        document.getElementById("password").focus();

        return;
    }


    setLoginLoading(true);


    try {

        /* =================================================
           LOGIN API
        ================================================= */

        const response =
            await fetch(
                "/api/Auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userName: userName,
                        password: password
                    })
                }
            );


        /* =================================================
           LOGIN SUCCESS
        ================================================= */

        if (response.ok) {

            const result = await response.json();


            console.log("Login Success:",result);


            /* =============================================
               CHECK JWT TOKEN
            ============================================= */

            if (!result.token) {

                console.error("JWT token not received.");

                showError("Login successful, but authentication token was not received.");

                return;
            }


            /* =============================================
               STORE LOGIN INFORMATION
            ============================================= */

            sessionStorage.setItem("accessToken",result.token);

            sessionStorage.setItem("userId",result.userId);

            sessionStorage.setItem("userName",result.userName);

            sessionStorage.setItem("userCat",result.userCat);

            sessionStorage.setItem("branchId",result.branchId);


            console.log("JWT Token Stored Successfully");


            /* =============================================
               JWT TEST API
            ============================================= */

            const testResponse =
                await fetch(
                    "/api/Auth/test",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${result.token}`
                        }
                    }
                );


            /* =============================================
               JWT TEST SUCCESS
            ============================================= */

            if (testResponse.ok) {

                const testResult = await testResponse.json();


                console.log("JWT Test Success:",testResult);


                /* =========================================
                   LOGIN COMPLETED
                ========================================= */

                window.location.href = "billing.html";
                return;
            }


            /* =============================================
               JWT TEST FAILED
            ============================================= */

            console.error("JWT Test Failed:",testResponse.status);


            showError("Login successful, but authentication failed.");

            return;
        }


        /* =================================================
           API LOGIN ERROR
        ================================================= */

        let errorMessage = "Invalid username or password.";


        try {

            const errorData = await response.json();


            if (errorData.message) {

                errorMessage = errorData.message;

            }

        }
        catch {

            // Ignore JSON parsing error

        }


        showError(errorMessage);

    }
    catch (error) {

        console.error("Login Error:",error);


        showError("Unable to connect to the server.");

    }
    finally {

        setLoginLoading(false);

    }

}


/* =========================================================
   LOGIN LOADING
========================================================= */

function setLoginLoading(isLoading) {

    const button = document.getElementById("loginButton");

    const text = document.getElementById("loginButtonText");


    button.disabled = isLoading;


    if (isLoading) {

        button.classList.add("loading");

        text.innerText ="Signing in...";

    }
    else {

        button.classList.remove("loading");

        text.innerText ="Sign In";

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const error =
        document.getElementById(
            "errorMessage"
        );


    error.innerText =
        message;


    error.style.display =
        "block";

}


function clearError() {

    const error =
        document.getElementById(
            "errorMessage"
        );


    error.innerText =
        "";


    error.style.display =
        "none";

}


/* =========================================================
   QR SCANNER
========================================================= */

let cameraStream = null;


async function openQrScanner() {

    const modal =document.getElementById("qrModal");

    const video =document.getElementById("qrVideo");

    const status =document.getElementById("scannerStatus");


    modal.classList.add("active");


    status.innerText ="Starting camera...";


    try {

        cameraStream =
            await navigator.mediaDevices
                .getUserMedia(
                    {
                        video: {
                            facingMode: {
                                ideal:
                                    "environment"
                            }
                        },

                        audio: false
                    }
                );


        video.srcObject =
            cameraStream;


        status.innerText =
            "Waiting for QR code...";


        /*
            QR scanner library
            will be connected here.

            Example:

            QR detected
                ↓
            qrValue
                ↓
            QRLogin(qrValue)
        */

    }
    catch (error) {

        console.error("Camera Error:",error);


        status.innerText ="Unable to access camera.";

    }

}


/* =========================================================
   CLOSE QR SCANNER
========================================================= */

function closeQrScanner() {

    const modal =document.getElementById("qrModal");

    const video =document.getElementById("qrVideo");


    if (cameraStream) {

        cameraStream.getTracks().forEach(
            function (track) {
                    track.stop();
                }
            );


        cameraStream =null;

    }


    video.srcObject =null;


    modal.classList.remove("active");

}


/* =========================================================
   QR LOGIN
========================================================= */

async function QRLogin(qrValue) {

    /*
        Example:

        qrValue = "A0603301180"

        Later we can send
        this QR value to API.
    */


    console.log("QR Value:",qrValue);

}