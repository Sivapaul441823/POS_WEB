document.addEventListener("DOMContentLoaded", function () {

    const initiateBtn =
        document.getElementById("initiateBtn");

    const backBtn =
        document.getElementById("backBtn");

    const ecNo =
        document.getElementById("ecNo");

    const initiateSection =
        document.getElementById("initiateSection");

    const ecLoginSection =
        document.getElementById("ecLoginSection");

    const verifyMessage =
        document.getElementById("verifyMessage");

    const errorMessage =
        document.getElementById("errorMessage");

    const inputStatus =
        document.getElementById("inputStatus");


    /* =====================================================
       INITIATE
    ===================================================== */

    initiateBtn.addEventListener("click", function () {

        initiateSection.classList.add("hidden");

        ecLoginSection.classList.remove("hidden");

        errorMessage.classList.add("hidden");

        verifyMessage.classList.add("hidden");

        ecNo.value = "";

        /*
         * IMPORTANT
         *
         * Cursor automatically goes to EC No
         */

        setTimeout(function () {

            ecNo.focus();

        }, 100);

    });


    /* =====================================================
       SCANNER INPUT
    =====================================================

       Most barcode / ID scanners behave like keyboard.

       Example:

       Scanner
          ↓
       EMP001 + ENTER
          ↓
       EC textbox
    ===================================================== */

    ecNo.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            const value =
                ecNo.value.trim();

            if (!value) {
                return;
            }

            validateEmployee(value);
        }

    });


    /* =====================================================
       ALSO HANDLE MANUAL INPUT
    ===================================================== */

    ecNo.addEventListener("input", function () {

        errorMessage.classList.add("hidden");

        inputStatus.textContent = "";

    });


    /* =====================================================
       EXISTING BACKEND VALIDATION
    ===================================================== */

    //async function validateEmployee(ecValue) {

    //    verifyMessage.classList.remove("hidden");

    //    errorMessage.classList.add("hidden");

    //    inputStatus.textContent = "●";


    //    try {

    //        /*
    //         * YOUR EXISTING BACKEND API
    //         *
    //         * Change URL according to your API.
    //         */

    //        const response = await fetch(
    //            "/api/Auth/EmployeeLogin",
    //            {
    //                method: "POST",

    //                headers: {
    //                    "Content-Type":
    //                        "application/json"
    //                },

    //                body: JSON.stringify({
    //                    UserName: ecValue
    //                })
    //            }
    //        );


    //        const result = await response.json();


    //        verifyMessage.classList.add("hidden");


    //        /* =============================================
    //           VALID EMPLOYEE
    //        ============================================= */

    //        if (response.ok && result.success === true)
    //        {

    //            inputStatus.textContent = "✓";

    //            inputStatus.classList.add("success");


    //            /*
    //             * Direct Login
    //             *
    //             * If backend already creates
    //             * authentication/session/token,
    //             * redirect to billing.
    //             */
    //            // Check authorization
    //            await openBilling();

    //            return;
    //        }


    //        /* =============================================
    //           INVALID EMPLOYEE
    //        ============================================= */

    //        showInvalidEmployee();

    //    }
    //    catch (error) {

    //        alert("Employee Login Error:",error);

    //        verifyMessage.classList.add("hidden");

    //        showInvalidEmployee();

    //    }

    //}
    //async function openBilling() {

    //    try {

    //        const response = await fetch("/api/Billing/Initialize",
    //            {
    //                method: "GET",
    //                credentials: "include"
    //            }
    //        );

    //        if (response.status === 401) {

    //            showInvalidEmployee();

    //            return;
    //        }

    //        if (response.status === 403) {

    //            alert("You are not authorized to access Billing.");

    //            return;
    //        }

    //        if (!response.ok) {

    //            throw new Error("Authorization failed");
    //        }

    //        // Only now open billing
    //        window.location.href ="billing.html";
    //    }
    //    catch (error) {

    //        alert("Billing authorization error: " + error);
    //    }
    //}


    /* =========================================================
   MESSAGE HELPERS
========================================================= */

    function showVerifyingMessage(message = "Verifying Employee...") {

        verifyMessage.textContent = message;

        verifyMessage.classList.remove("hidden");
        verifyMessage.classList.remove("success");

        errorMessage.classList.add("hidden");

        inputStatus.textContent = "●";
        inputStatus.classList.remove("success");
    }


    function showSuccessMessage(message) {

        verifyMessage.textContent = message;

        verifyMessage.classList.remove("hidden");
        verifyMessage.classList.add("success");

        errorMessage.classList.add("hidden");

        inputStatus.textContent = "✓";
        inputStatus.classList.add("success");
    }


    function showErrorMessage(message) {

        verifyMessage.classList.add("hidden");
        verifyMessage.classList.remove("success");

        errorMessage.textContent = message;

        errorMessage.classList.remove("hidden");

        inputStatus.textContent = "×";
        inputStatus.classList.remove("success");
    }


    /* =========================================================
       EMPLOYEE LOGIN
    ========================================================= */

    //async function validateEmployee(ecValue)
    //{

    //    showVerifyingMessage("Verifying Employee...");

    //    try {

    //        const response = await fetch("/api/Auth/EmployeeLogin",
    //            {
    //                method: "POST",

    //                headers: {
    //                    "Content-Type": "application/json"
    //                },

    //                credentials: "include",

    //                body: JSON.stringify({UserName: ecValue})
    //            }
    //        );


    //        const result = await response.json();
    //        //const result = await response.text();


    //        /* =============================================
    //           VALID EMPLOYEE
    //        ============================================= */

    //        if (response.ok && result.success === true) {

    //            showSuccessMessage("Employee verified successfully.");

    //            return;
    //        }


    //        /* =============================================
    //           INVALID EMPLOYEE
    //        ============================================= */

    //        if (response.status === 401) {

    //            showErrorMessage( result.message || "Invalid Employee. Please contact Admin.");

    //            return;
    //        }


    //        /* =============================================
    //           BAD REQUEST
    //        ============================================= */

    //        if (response.status === 400) {

    //            showErrorMessage(result.message || "Please enter a valid EC No.");

    //            return;
    //        }


    //        /* =============================================
    //           OTHER ERROR
    //        ============================================= */

    //        showErrorMessage(result.message || "Unable to verify Employee. Please try again.");

    //    }
    //    catch (error) {
    //        alert("Employee Login Error: " + error.message);

    //        showErrorMessage("Unable to connect to server. Please try again.");
    //    }
    //}

    async function validateEmployee(ecValue) {

        showVerifyingMessage("Verifying Employee...");

        try {

            const response = await fetch(
                "/api/Auth/EmployeeLogin",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        UserName: ecValue
                    })
                }
            );


            const result = await response.json();


            /* =============================================
               VALID EMPLOYEE
            ============================================= */

            if (response.ok && result.success === true) {

                showSuccessMessage( "Employee verified successfully.");

                // Open Billing Page
                window.location.href = "/billing.html";

                return;
            }


            /* =============================================
               INVALID EMPLOYEE
            ============================================= */

            if (response.status === 401) {

                showErrorMessage( result.message || "Invalid Employee. Please contact Admin." );

                return;
            }


            /* =============================================
               BAD REQUEST
            ============================================= */

            if (response.status === 400) {

                showErrorMessage( result.message ||"Please enter a valid EC No.");

                return;
            }


            /* =============================================
               OTHER ERROR
            ============================================= */

            showErrorMessage( result.message || "Unable to verify Employee. Please try again.");

        }
        catch (error) {

            alert( "Employee Login Error: " + error.message);
        }
    }


    /* =====================================================
       INVALID EMPLOYEE
    ===================================================== */

    function showInvalidEmployee() {

        inputStatus.textContent = "×";

        inputStatus.classList.remove("success");

        errorMessage.classList.remove("hidden");

        ecNo.select();

    }


    /* =====================================================
       BACK
    ===================================================== */

    backBtn.addEventListener("click", function () {

        ecLoginSection.classList.add("hidden");

        initiateSection.classList.remove("hidden");

        ecNo.value = "";

        errorMessage.classList.add("hidden");

        verifyMessage.classList.add("hidden");

    });

});