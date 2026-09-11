/* =========================================================
   BILLING APPLICATION
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const billingState = {

    billNo: "K/1",

    selectedItemIndex: -1,

    items: [],

    discountPercent: 0,

    roundOff: 0

};


/* =========================================================
   SAMPLE ITEM MASTER
   Later API / DB can replace this.
========================================================= */

const itemMaster = {

    "DD0522011715": {
        code: "DD0522011715",
        name: "SCHOOL BAG",
        ecNo: "1000",
        mrp: 629,
        hsn: "4202",
        gst: 18
    },

    "10001": {
        code: "10001",
        name: "NOTE BOOK",
        ecNo: "1001",
        mrp: 120,
        hsn: "4820",
        gst: 12
    },

    "10002": {
        code: "10002",
        name: "SCHOOL SHOE",
        ecNo: "1002",
        mrp: 850,
        hsn: "6402",
        gst: 18
    }

};


/* =========================================================
   DOM HELPER
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeBilling();

});


/* =========================================================
   INITIALIZE
========================================================= */

function initializeBilling() {

    

    setCurrentDateTime();

    bindEvents();

    updateUI();

    focusItemCode();

    loadBillNumber();

}

async function loadBillNumber() {

    const billNumberElement = getElement("billNumber");

    if (!billNumberElement)
    {
        alert("Bill Number element not found.");
        return;
    }

    //const token =
    //    sessionStorage.getItem("accessToken");

    //if (!token) {

    //    alert("Login session expired. Please login again.");

    //    window.location.href = "/login.html";

    //    return;
    //}

    try {

        const response =
            await fetch(
                "/api/Billing/bill-no",
                {
                    method: "GET",

                    //headers: {
                    //    "Authorization":
                    //        `Bearer ${token}`
                    //}
                }
            );

        if (!response.ok) {

            alert("Unable to load Bill Number.\n\n" + "Status: " + response.status);

            return;
        }

        const result = await response.json();

        if (result.success)
        {

            billingState.billNo = result.billNumber;

            billNumberElement.innerText = result.billNumber;

        }
        else {

            alert(result.message || "Unable to load Bill Number.");

        }

    }
    catch (error) {

        alert(
            "Function: loadBillNumber()\n\n" +
            "JavaScript Error\n\n" +
            "Error: " +
            error.message
        );

    }
}

/* =========================================================
   SET CURRENT DATE TIME
========================================================= */

function setCurrentDateTime() {

    const dateInput = getElement("billDate");

    if (!dateInput) {
        return;
    }

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    const hours = String(
        now.getHours()
    ).padStart(2, "0");

    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    dateInput.value =
        `${year}-${month}-${day}T${hours}:${minutes}`;

}


/* =========================================================
   EVENT BINDING
========================================================= */

function bindEvents() {

    const itemCodeElement = getElement("itemCode");
    const ecNoElement = getElement("ecNo");
    const addButton = getElement("addItemBtn");

    let currentItem = null;
    let barcodeTimer = null;
    let ecNoTimer = null;



    //const addButton = getElement("addItemBtn");

    //if (addButton) {
    //    addButton.addEventListener("click",addItem);
    //}


    //const itemCode = getElement("itemCode");

    //if (itemCode) {

    //    itemCode.addEventListener("keydown", function (event)
    //    {

    //            if (event.key === "Enter") {

    //                event.preventDefault();

    //                addItem();

    //            }

    //        }
    //    );

    //}
    if (itemCodeElement) {

        itemCodeElement.addEventListener("input", function () {

            clearTimeout(barcodeTimer);

            const itemCode =
                itemCodeElement.value.trim();

            if (!itemCode) {
                return;
            }

            barcodeTimer = setTimeout(
                function () {

                    validateBarcode(itemCode);

                },
                100
            );
        });
    }

    const qty = getElement("itemQty");

    if (qty) {

        qty.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addItem();

                }

            }
        );

    }


    const removeButton =
        getElement("removeBtn");

    if (removeButton) {
        removeButton.addEventListener(
            "click",
            removeSelectedItem
        );
    }


    const qtyPlus =
        getElement("qtyPlusBtn");

    if (qtyPlus) {
        qtyPlus.addEventListener(
            "click",
            increaseSelectedQty
        );
    }


    const qtyMinus =
        getElement("qtyMinusBtn");

    if (qtyMinus) {
        qtyMinus.addEventListener(
            "click",
            decreaseSelectedQty
        );
    }


    const discountButton =
        getElement("discountBtn");

    if (discountButton) {
        discountButton.addEventListener(
            "click",
            focusDiscount
        );
    }


    const applyDiscount =
        getElement("applyDiscountBtn");

    if (applyDiscount) {
        applyDiscount.addEventListener(
            "click",
            applyDiscountValue
        );
    }

    const clearButton =
        getElement("clearBtn");

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearBill
        );
    }


    const cancelButton =
        getElement("cancelBtn");

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            cancelBill
        );
    }


    const savePrintButton =
        getElement("savePrintBtn");

    if (savePrintButton) {
        savePrintButton.addEventListener(
            "click",
            saveAndPrint
        );
    }


    const mobileNo =
        getElement("mobileNo");

    if (mobileNo) {

        mobileNo.addEventListener(
            "input",
            syncCustomerDetails
        );

    }


    const customerName =
        getElement("customerName");

    if (customerName) {

        customerName.addEventListener(
            "input",
            syncCustomerDetails
        );

    }


    const searchCustomer =
        getElement("searchCustomerBtn");

    if (searchCustomer) {

        searchCustomer.addEventListener(
            "click",
            searchCustomerHandler
        );

    }


    const barcodeButton =
        getElement("barcodeButton");

    if (barcodeButton) {

        barcodeButton.addEventListener(
            "click",
            function () {

                focusItemCode();

                showToast(
                    "Barcode scanner ready",
                    "success"
                );

            }
        );

    }


    const paymentFields = [
        "cashAmount",
        "cardAmount",
        "upiAmount",
        "exchangeAmount",
        "advanceAmount",
        "chequeAmount",
        "giftVoucherAmount"
    ];


    paymentFields.forEach(function (id) {

        const element =
            getElement(id);

        if (element) {

            element.addEventListener(
                "input",
                updatePayment
            );

        }

    });


    const exchangeMore =
        getElement("exchangeMoreBtn");

    if (exchangeMore) {

        exchangeMore.addEventListener(
            "click",
            function () {

                showToast(
                    "Exchange details can be connected here.",
                    "success"
                );

            }
        );

    }


    const advanceMore =
        getElement("advanceMoreBtn");

    if (advanceMore) {

        advanceMore.addEventListener(
            "click",
            function () {

                showToast(
                    "Advance details can be connected here.",
                    "success"
                );

            }
        );

    }


    const chequeMore =
        getElement("chequeMoreBtn");

    if (chequeMore) {

        chequeMore.addEventListener(
            "click",
            function () {

                showToast(
                    "Cheque details can be connected here.",
                    "success"
                );

            }
        );

    }


    document.addEventListener(
        "keydown",
        handleShortcuts
    );

}

// =================================
// validate Barcode
// =================================


async function validateBarcode(itemCode) {

    try {

        const response = await fetch(
            "/api/Billing/validate-barcode",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    itemCode: itemCode
                })
            }
        );


        const data = await response.json();


        // Barcode invalid
        if (!response.ok || !data.isValid) {

            currentItem = null;

            showToast(data.message || "Invalid Barcode.","error");

            itemCodeElement.focus();

            itemCodeElement.select();

            return;
        }


        // =================================
        // Barcode VALID
        // =================================

        currentItem = data;


        // EC No clear
        ecNoElement.value = "";


        // EC No focus
        ecNoElement.focus();

    }
    catch (error) {

        console.error(error);

        currentItem = null;

        showToast(
            "Unable to validate barcode.",
            "error"
        );

        itemCodeElement.focus();
    }
}

/* =========================================================
   REPRINT
========================================================= */


function openReprint() {

    const billNo = prompt("Enter Bill Number:");

    if (billNo === null) {
        return; // Cancel
    }

    const trimmedBillNo = billNo.trim();

    if (trimmedBillNo === "") {
        alert("Enter Bill Number");
        return;
    }

    reprintBill(trimmedBillNo);
}


async function reprintBill(billNo) {

    try {

        const response = await fetch("/api/Billing/RePrint",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    billNo: billNo
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {

            alert(result.message || "Bill not found");
            return;
        }

        console.log(result);

        // API success
        alert("Bill found successfully");

        // Next:
        // result -> print data
        // Customer / Cash / Both
        // Actual printing
    }
    catch (error) {

        console.error(error);

        alert("Unable to connect to server");
    }
}

/* =========================================================
   ADD ITEM
========================================================= */

function addItem() {

    const itemCodeElement =
        getElement("itemCode");

    //const qtyElement =
    //    getElement("itemQty");

    const ecNoElement =
        getElement("ecNo");

    //const offerTypeElement =
    //    getElement("offerType");


    if (!itemCodeElement || !ecNoElement) {

        return;

    }


    const itemCode = itemCodeElement.value.trim();


    //const qty = parseInt(qtyElement.value,10);


    if (!itemCode) {

        showToast(
            "Enter or scan item code.",
            "error"
        );

        itemCodeElement.focus();

        return;

    }


    //if (!Number.isFinite(qty) || qty <= 0) {

    //    showToast(
    //        "Enter a valid quantity.",
    //        "error"
    //    );

    //    qtyElement.focus();

    //    return;

    //}


    let masterItem = itemMaster[itemCode];


    /*
       If item doesn't exist in sample master,
       create a safe demo item.
       Later API can replace this.
    */

    if (!masterItem) {

        masterItem = {

            code: itemCode,

            name: "NEW ITEM",

            ecNo:
                ecNoElement.value.trim() ||
                "-",

            mrp: 100,

            hsn: "-",

            gst: 18

        };

    }


    const enteredEcNo = ecNoElement.value.trim();


    //const offerType = offerTypeElement? offerTypeElement.value: "Normal";


    /*
       Check whether item already exists.
    */

    const existingIndex = billingState.items.findIndex(function (item)
            {

                return item.code ===
                    masterItem.code;

            }
        );


    if (existingIndex >= 0) {

        billingState.items[existingIndex].qty += qty;

        billingState.selectedItemIndex =
            existingIndex;

    } else {

        const newItem = {

            code: masterItem.code,

            name: masterItem.name,

            ecNo: enteredEcNo ||masterItem.ecNo,

            mrp: Number(masterItem.mrp) || 0,

            //qty: qty,

            discountPercent:
                0,

            discountValue:
                0,

            hsn:
                masterItem.hsn || "-",

            gst:
                Number(masterItem.gst) || 0,

            //offerType:
            //    offerType

        };


        billingState.items.push(
            newItem
        );


        billingState.selectedItemIndex =
            billingState.items.length - 1;

    }


    clearItemEntry();

    renderItems();

    updateUI();

    showToast(
        "Item added successfully.",
        "success"
    );

}


/* =========================================================
   CLEAR ITEM ENTRY
========================================================= */

function clearItemEntry() {

    const itemCode =
        getElement("itemCode");

    const ecNo =
        getElement("ecNo");

    const qty =
        getElement("itemQty");


    if (itemCode) {
        itemCode.value = "";
    }


    if (ecNo) {
        ecNo.value = "";
    }


    if (qty) {
        qty.value = "1";
    }


    focusItemCode();

}


/* =========================================================
   RENDER ITEMS
========================================================= */

function renderItems() {

    const tbody =
        getElement("billingTableBody");


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (billingState.items.length === 0) {

        const emptyRow =
            document.createElement("tr");


        emptyRow.innerHTML = `
            <td colspan="13"
                style="
                    height:90px;
                    color:#8290a3;
                    font-weight:600;
                ">
                No items added
            </td>
        `;


        tbody.appendChild(
            emptyRow
        );


        return;

    }


    billingState.items.forEach(
        function (item, index) {

            const row =
                document.createElement("tr");


            if (
                index ===
                billingState.selectedItemIndex
            ) {

                row.classList.add(
                    "selected-row"
                );

            }


            const values =
                calculateItem(item);


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td title="${escapeHtml(item.code)}">
                    ${escapeHtml(item.code)}
                </td>

                <td title="${escapeHtml(item.name)}">
                    ${escapeHtml(item.name)}
                </td>

                <td>
                    ${escapeHtml(item.ecNo)}
                </td>

                <td>
                    ${formatNumber(item.mrp)}
                </td>

                <td>
                    ${item.qty}
                </td>

                <td>
                    ${formatNumber(item.discountPercent)}
                </td>

                <td>
                    ${formatNumber(values.discount)}
                </td>

                <td>
                    ${formatNumber(values.total)}
                </td>

                <td>
                    ${escapeHtml(item.hsn)}
                </td>

                <td>
                    ${formatNumber(item.gst)}
                </td>

                <td>
                    ${formatNumber(values.gstAmount)}
                </td>

                <td>
                    <button
                        type="button"
                        class="delete-item"
                        data-index="${index}"
                        title="Remove Item">
                        🗑
                    </button>
                </td>

            `;


            row.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.closest(
                            ".delete-item"
                        )
                    ) {

                        return;

                    }


                    billingState.selectedItemIndex =
                        index;


                    renderItems();

                }
            );


            tbody.appendChild(row);

        }
    );


    const deleteButtons =
        tbody.querySelectorAll(
            ".delete-item"
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const index =
                        Number(
                            button.dataset.index
                        );


                    removeItem(index);

                }
            );

        }
    );

}


/* =========================================================
   CALCULATE ITEM
========================================================= */

function calculateItem(item) {

    const gross =
        Number(item.mrp || 0) *
        Number(item.qty || 0);


    const discount =
        gross *
        (
            Number(
                item.discountPercent || 0
            ) / 100
        );


    const taxable =
        Math.max(
            0,
            gross - discount
        );


    /*
       GST is calculated on taxable amount.
    */

    const gstAmount =
        taxable *
        (
            Number(item.gst || 0) / 100
        );


    const total =
        taxable +
        gstAmount;


    return {

        gross: gross,

        discount: discount,

        taxable: taxable,

        gstAmount: gstAmount,

        total: total

    };

}


/* =========================================================
   REMOVE ITEM
========================================================= */

function removeItem(index) {

    if (
        index < 0 ||
        index >= billingState.items.length
    ) {

        return;

    }


    billingState.items.splice(
        index,
        1
    );


    if (
        billingState.items.length === 0
    ) {

        billingState.selectedItemIndex = -1;

    } else if (
        billingState.selectedItemIndex >=
        billingState.items.length
    ) {

        billingState.selectedItemIndex =
            billingState.items.length - 1;

    }


    renderItems();

    updateUI();


    showToast(
        "Item removed.",
        "success"
    );

}


/* =========================================================
   REMOVE SELECTED ITEM
========================================================= */

function removeSelectedItem() {

    if (
        billingState.selectedItemIndex < 0
    ) {

        showToast(
            "Select an item first.",
            "error"
        );

        return;

    }


    removeItem(
        billingState.selectedItemIndex
    );

}


/* =========================================================
   QTY +
========================================================= */

function increaseSelectedQty() {

    if (
        billingState.selectedItemIndex < 0
    ) {

        showToast(
            "Select an item first.",
            "error"
        );

        return;

    }


    const item =
        billingState.items[
        billingState.selectedItemIndex
        ];


    item.qty += 1;


    renderItems();

    updateUI();

}


/* =========================================================
   QTY -
========================================================= */

function decreaseSelectedQty() {

    if (
        billingState.selectedItemIndex < 0
    ) {

        showToast(
            "Select an item first.",
            "error"
        );

        return;

    }


    const item =
        billingState.items[
        billingState.selectedItemIndex
        ];


    if (item.qty <= 1) {

        showToast(
            "Quantity cannot be less than 1.",
            "error"
        );

        return;

    }


    item.qty -= 1;


    renderItems();

    updateUI();

}


/* =========================================================
   APPLY DISCOUNT
========================================================= */

function applyDiscountValue() {

    const discountInput =
        getElement("discountPercent");


    if (!discountInput) {
        return;
    }


    let discount =
        parseFloat(
            discountInput.value
        );


    if (!Number.isFinite(discount)) {
        discount = 0;
    }


    discount =
        Math.max(
            0,
            Math.min(
                100,
                discount
            )
        );


    billingState.discountPercent =
        discount;


    /*
       Apply discount to all items.
    */

    billingState.items.forEach(
        function (item) {

            item.discountPercent =
                discount;

        }
    );


    discountInput.value =
        discount;


    renderItems();

    updateUI();


    showToast(
        `${discount}% discount applied.`,
        "success"
    );

}


/* =========================================================
   FOCUS DISCOUNT
========================================================= */

function focusDiscount() {

    const input =
        getElement("discountPercent");


    if (input) {

        input.focus();

        input.select();

    }

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    renderItems();

    updateTotals();

    updateCustomerDetails();

    updatePayment();

}


/* =========================================================
   UPDATE TOTALS
========================================================= */

function updateTotals() {

    let subTotal = 0;

    let totalDiscount = 0;

    let taxableAmount = 0;

    let totalGst = 0;

    let totalQty = 0;


    billingState.items.forEach(
        function (item) {

            const result =
                calculateItem(item);


            subTotal +=
                result.gross;


            totalDiscount +=
                result.discount;


            taxableAmount +=
                result.taxable;


            totalGst +=
                result.gstAmount;


            totalQty +=
                Number(item.qty || 0);

        }
    );


    const beforeRound =
        taxableAmount +
        totalGst;


    const rounded =
        Math.round(
            beforeRound
        );


    const roundOff =
        rounded -
        beforeRound;


    billingState.roundOff =
        roundOff;


    const netAmount =
        rounded;


    /*
       Header
    */

    setText(
        "headerTotalItems",
        billingState.items.length
    );


    setText(
        "headerTotalQty",
        formatNumber(totalQty, 2)
    );


    setText(
        "headerBillAmount",
        formatCurrency(netAmount)
    );


    /*
       Footer
    */

    setValue(
        "footerTotalItems",
        billingState.items.length
    );


    setValue(
        "footerTotalQty",
        formatNumber(totalQty, 2)
    );


    /*
       Summary
    */

    setText(
        "subTotal",
        formatCurrency(subTotal)
    );


    setText(
        "totalDiscount",
        formatCurrency(totalDiscount)
    );


    setText(
        "taxableAmount",
        formatCurrency(taxableAmount)
    );


    setText(
        "totalGst",
        formatCurrency(totalGst)
    );


    setText(
        "roundOff",
        formatCurrency(roundOff)
    );


    setText(
        "netAmount",
        formatCurrency(netAmount)
    );

}


/* =========================================================
   UPDATE PAYMENT
========================================================= */

function updatePayment() {

    const paymentIds = [

        "cashAmount",
        "cardAmount",
        "upiAmount",
        "exchangeAmount",
        "advanceAmount",
        "chequeAmount",
        "giftVoucherAmount"

    ];


    let totalPaid = 0;


    paymentIds.forEach(
        function (id) {

            const element =
                getElement(id);


            if (!element) {
                return;
            }


            let value =
                parseFloat(
                    element.value
                );


            if (!Number.isFinite(value)) {
                value = 0;
            }


            if (value < 0) {
                value = 0;
            }


            totalPaid += value;

        }
    );


    const netAmount =
        getNumericText(
            getElement("netAmount")
        );


    const balance =
        netAmount -
        totalPaid;


    setText(
        "totalPaid",
        formatCurrency(totalPaid)
    );


    const balanceElement =
        getElement("balanceAmount");


    if (balanceElement) {

        if (balance <= 0) {

            balanceElement.textContent =
                formatCurrency(0);

            balanceElement.classList.add(
                "paid"
            );

        } else {

            balanceElement.textContent =
                formatCurrency(balance);

            balanceElement.classList.remove(
                "paid"
            );

        }

    }

}


/* =========================================================
   GET NUMERIC TEXT
========================================================= */

function getNumericText(element) {

    if (!element) {
        return 0;
    }


    const value =
        element.textContent
            .replace(/[₹,\s]/g, "")
            .trim();


    const number =
        parseFloat(value);


    return Number.isFinite(number)
        ? number
        : 0;

}


/* =========================================================
   CUSTOMER DETAILS
========================================================= */

function updateCustomerDetails() {

    const mobile =
        getElement("mobileNo");


    const name =
        getElement("customerName");


    const mobileValue =
        mobile
            ? mobile.value.trim()
            : "";


    const nameValue =
        name
            ? name.value.trim()
            : "";


    setText(
        "detailMobile",
        mobileValue || "-"
    );


    setText(
        "detailName",
        nameValue || "-"
    );


    setText(
        "detailCustomerType",
        nameValue
            ? "CUSTOMER"
            : "WALK-IN"
    );

}


/* =========================================================
   SYNC CUSTOMER
========================================================= */

function syncCustomerDetails() {

    updateCustomerDetails();

}


/* =========================================================
   SEARCH CUSTOMER
========================================================= */

function searchCustomerHandler() {

    const mobile =
        getElement("mobileNo");


    if (!mobile) {
        return;
    }


    const mobileNumber =
        mobile.value.trim();


    if (
        mobileNumber.length !== 10
    ) {

        showToast(
            "Enter valid 10 digit mobile number.",
            "error"
        );

        mobile.focus();

        return;

    }


    /*
       Demo customer.
       Replace this part with API call.
    */

    const name =
        getElement("customerName");


    if (name) {

        name.value =
            "SIVA KUMAR";

    }


    setText(
        "customerType",
        "VIP"
    );


    setText(
        "detailCustomerType",
        "VIP"
    );


    setText(
        "loyaltyPoints",
        "120"
    );


    updateCustomerDetails();


    showToast(
        "Customer details loaded.",
        "success"
    );

}


/* =========================================================
   CLEAR BILL
========================================================= */

function clearBill() {

    const billNo = prompt("Enter Bill Number:");

    if (billNo === null) {
        return; // Cancel
    }

    const trimmedBillNo = billNo.trim();

    if (trimmedBillNo === "") {
        alert("Enter Bill Number");
        return;
    }

    reprintBill(trimmedBillNo);

    //const confirmed =
    //    window.confirm(
    //        "Clear current bill?"
    //    );


    //if (!confirmed) {
    //    return;
    //}


    //billingState.items = [];

    //billingState.selectedItemIndex = -1;

    //billingState.discountPercent = 0;

    //billingState.roundOff = 0;


    //const discount =
    //    getElement("discountPercent");


    //if (discount) {
    //    discount.value = "0";
    //}


    //const paymentIds = [

    //    "cashAmount",
    //    "cardAmount",
    //    "upiAmount",
    //    "exchangeAmount",
    //    "advanceAmount",
    //    "chequeAmount",
    //    "giftVoucherAmount"

    //];


    //paymentIds.forEach(
    //    function (id) {

    //        const element =
    //            getElement(id);


    //        if (element) {
    //            element.value = "0";
    //        }

    //    }
    //);


    //const customerFields = [
    //    "mobileNo",
    //    "customerName",
    //    "ecNo",
    //    "itemCode"
    //];


    //customerFields.forEach(
    //    function (id) {

    //        const element =
    //            getElement(id);


    //        if (element) {
    //            element.value = "";
    //        }

    //    }
    //);


    //const qty =
    //    getElement("itemQty");


    //if (qty) {
    //    qty.value = "1";
    //}


    //updateUI();

    //focusItemCode();


    //showToast(
    //    "Bill cleared.",
    //    "success"
    //);

}

async function reprintBill(billNo) {

    try {

        console.log("1. Calling API...");

        const response = await fetch(
            "/api/Billing/RePrint",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    billNo: billNo
                })
            }
        );

        console.log("2. API Response received");
        console.log("Status:", response.status);
        console.log("OK:", response.ok);

        const result = await response.json();

        console.log("3. JSON parsed successfully");
        console.log("Full Result:", result);

        if (!response.ok) {

            alert(result.message || "Bill not found");
            return;
        }

        console.log("Total Tables:", result.tables.length);

        // 5 Tables
        console.log("Table 1:", result.tables[0]);
        console.log("Table 2:", result.tables[1]);
        console.log("Table 3:", result.tables[2]);
        console.log("Table 4:", result.tables[3]);
        console.log("Table 5:", result.tables[4]);

        console.log("4. RePrint completed");

        alert("Bill found successfully");

        printBill(result.tables);

    }
    catch (error) {

        console.error("❌ RePrint Error:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);

        alert("RePrint Error: " + error.message);
    }
    function printBill(tables) {

        if (!tables || tables.length < 3) {

            alert("Required print tables are missing");
            return;
        }

        const headerTable = tables[0] || [];
        const detailTable = tables[1] || [];
        const gstTable = tables[2] || [];

        if (headerTable.length === 0) {

            alert("Bill header data not found");
            return;
        }

        const header = headerTable[0];

        // =========================
        // HEADER VALUES
        // =========================

        const company =
            getPrintValue(header, "Company");

        const cin =
            getPrintValue(header, "CIN");

        const address1 =
            getPrintValue(header, "BillAdd1");

        const address2 =
            getPrintValue(header, "BillAdd2");

        const state =
            getPrintValue(header, "State");

        const stateCode =
            getPrintValue(header, "StateCode");

        const phone =
            getPrintValue(header, "PhoneNo");

        const email =
            getPrintValue(header, "Email");

        const gstin =
            getPrintValue(header, "GSTIN");

        const billNo =
            getPrintValue(header, "BillId");

        const billDate =
            getPrintValue(header, "BillDate");

        const parcelNo =
            getPrintValue(header, "ParcelNo");

        const noOfPacking =
            getPrintValue(header, "NoofPacking");

        const billAmount =
            getPrintValue(header, "BillAmount");

        const customerName =
            getPrintValue(header, "CustomerName");

        const discount =
            getPrintValue(header, "SDiscount");

        const discountPer =
            getPrintValue(header, "SDiscountPer");


        // =========================
        // TOTALS
        // =========================

        let totalQty = 0;
        let totalAmount = 0;

        detailTable.forEach(function (item) {

            totalQty +=
                Number(getPrintValue(item, "Qty")) || 0;

            totalAmount +=
                Number(getPrintValue(item, "Amount")) || 0;
        });


        // =========================
        // GST TOTAL
        // =========================

        let totalCGST = 0;
        let totalSGST = 0;

        gstTable.forEach(function (item) {

            totalCGST +=
                Number(getPrintValue(item, "CGST")) || 0;

            totalSGST +=
                Number(getPrintValue(item, "SGST")) || 0;
        });


        // =========================
        // ITEM ROWS
        // =========================

        let itemRows = "";

        detailTable.forEach(function (item, index) {

            const itemDescription =
                getPrintValue(item, "ItemDescription");

            const hsn =
                getPrintValue(item, "HSNCode");

            const ec =
                getPrintValue(item, "SaleECNo");

            const qty =
                formatPrintNumber(
                    getPrintValue(item, "Qty")
                );

            const rate =
                formatPrintAmount(
                    getPrintValue(item, "Rate")
                );

            const disc =
                formatPrintAmount(
                    getPrintValue(item, "Discount")
                );

            const gstPer =
                formatPrintAmount(
                    getPrintValue(item, "GSTPer")
                );

            const gstAmt =
                formatPrintAmount(
                    getPrintValue(item, "GstAmt")
                );

            const amount =
                formatPrintAmount(
                    getPrintValue(item, "Amount")
                );


            itemRows += `
            <tr class="item-main">

                <td class="sno">
                    ${index + 1}
                </td>

                <td class="product">
                    ${escapeHtml(itemDescription)}
                </td>

                <td class="qty">
                    ${qty}
                </td>

                <td class="rate">
                    ${rate}
                </td>

                <td class="disc">
                    ${disc}
                </td>

                <td class="gstper">
                    ${gstPer}
                </td>

                <td class="gstamt">
                    ${gstAmt}
                </td>

                <td class="netamt">
                    ${amount}
                </td>

            </tr>

            <tr class="item-extra">

                <td></td>

                <td colspan="7">
                    HSN: ${escapeHtml(hsn)}
                    &nbsp;&nbsp;
                    EC: ${escapeHtml(ec)}
                </td>

            </tr>
        `;
        });


        // =========================
        // GST ROWS
        // =========================

        let gstRows = "";

        gstTable.forEach(function (item) {

            const gstPer =
                formatPrintAmount(
                    getPrintValue(item, "GSTPer")
                );

            const cgst =
                formatPrintAmount(
                    getPrintValue(item, "CGST")
                );

            const sgst =
                formatPrintAmount(
                    getPrintValue(item, "SGST")
                );

            gstRows += `
            <tr>
                <td>${gstPer}%</td>
                <td class="right">${cgst}</td>
                <td class="right">${sgst}</td>
            </tr>
        `;
        });


        // =========================
        // DISCOUNT
        // =========================

        let discountHtml = "";

        if ((Number(discount) || 0) > 0) {

            discountHtml = `
            <div class="line"></div>

            <div class="discount-row">
                <span>S.DISC : ${escapeHtml(discountPer)}%</span>
                <span>${formatPrintAmount(discount)}</span>
            </div>
        `;
        }


        // =========================
        // PRINT HTML
        // =========================

        const printHtml = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Bill - ${escapeHtml(billNo)}</title>

<style>

@page {

    size: 410px auto;

    margin: 0;
}

* {
    box-sizing: border-box;
}

html,
body {

    margin: 0;
    padding: 0;

    width: 410px;

    font-family: Arial, sans-serif;

    color: #000;

    background: #fff;
}

.bill {

    width: 410px;

    padding: 10px 3px;

    font-weight: bold;
}

.center {
    text-align: center;
}

.line {

    width: 100%;

    border-top: 1px solid #000;

    margin: 5px 0;
}

.company {

    font-family: Arial Black, Arial, sans-serif;

    font-size: 10px;

    text-align: center;
}

.header-small {

    font-family: Arial Black, Arial, sans-serif;

    font-size: 9px;

    text-align: center;

    line-height: 20px;
}

.cash-bill {

    font-family: Arial Black, Arial, sans-serif;

    font-size: 10px;

    text-align: center;

    margin-top: 5px;
}

.mrp {

    font-size: 7px;

    text-align: center;

    margin-top: 5px;
}

.bill-info {

    display: flex;

    justify-content: space-between;

    font-family: Calibri, Arial, sans-serif;

    font-size: 10px;

    margin-top: 5px;
}

.place {

    font-family: Calibri, Arial, sans-serif;

    font-size: 10px;

    margin-top: 5px;
}

.parcel-title {

    text-align: right;

    font-family: Calibri, Arial, sans-serif;

    font-size: 14px;

    margin-top: -18px;

    margin-right: 5px;
}

.parcel-row {

    display: flex;

    justify-content: space-between;

    align-items: center;

    margin-top: 5px;
}

.barcode {

    text-align: center;

    width: 280px;
}

.barcode-text {

    font-size: 8px;

    letter-spacing: 1px;
}

.parcel-number {

    font-family: Calibri, Arial, sans-serif;

    font-size: 25px;

    width: 120px;

    text-align: center;
}

.customer {

    font-family: Calibri, Arial, sans-serif;

    font-size: 10px;

    margin-top: 5px;
}

.bill-table {

    width: 100%;

    border-collapse: collapse;

    table-layout: fixed;

    font-family: Calibri, Arial, sans-serif;

    font-size: 8px;
}

.bill-table td {

    padding: 2px 0;

    vertical-align: top;

    word-break: break-word;
}

.bill-table .sno {
    width: 28px;
}

.bill-table .product {
    width: 105px;
}

.bill-table .qty {
    width: 32px;
    text-align: right;
}

.bill-table .rate {
    width: 45px;
    text-align: right;
}

.bill-table .disc {
    width: 43px;
    text-align: right;
}

.bill-table .gstper {
    width: 40px;
    text-align: right;
}

.bill-table .gstamt {
    width: 55px;
    text-align: right;
}

.bill-table .netamt {
    width: 62px;
    text-align: right;
}

.item-extra td {

    font-size: 8px;

    padding-top: 0;

    padding-bottom: 3px;
}

.table-header {

    border-bottom: 1px solid #000;

    border-top: 1px solid #000;

    font-weight: bold;
}

.total {

    display: grid;

    grid-template-columns: 1fr 80px 100px;

    font-family: Calibri, Arial, sans-serif;

    font-size: 14px;

    margin-top: 5px;

    padding: 4px 0;
}

.total-qty {
    text-align: right;
}

.total-amount {
    text-align: right;
}

.discount-row {

    display: flex;

    justify-content: space-around;

    font-size: 10px;

    padding: 5px;
}

.gst-note {

    font-family: Calibri, Arial, sans-serif;

    font-size: 8px;

    margin-top: 5px;
}

.gst-table {

    width: 200px;

    border-collapse: collapse;

    font-family: Calibri, Arial, sans-serif;

    font-size: 8px;
}

.gst-table td {

    padding: 2px 3px;
}

.gst-table .right {

    text-align: right;
}

.parcel-bottom {

    display: flex;

    justify-content: space-between;

    align-items: center;

    font-family: Calibri, Arial, sans-serif;

    font-size: 8px;

    margin-top: 5px;
}

.parcel-bottom-number {

    font-size: 14px;
}

.parcel-bottom-amount {

    font-size: 14px;

    text-align: right;
}

.packing {

    font-family: Calibri, Arial, sans-serif;

    font-size: 8px;

    margin-top: 10px;
}

.savings {

    text-align: center;

    font-family: Calibri, Arial, sans-serif;

    font-size: 10px;

    margin-top: 15px;
}

.customer-copy {

    text-align: center;

    font-family: Calibri, Arial, sans-serif;

    font-size: 10px;

    margin-top: 30px;
}

.exchange {

    text-align: center;

    font-family: Calibri, Arial, sans-serif;

    font-size: 10px;

    margin-top: 10px;
}

.copy-number {

    display: flex;

    justify-content: space-between;

    font-family: Calibri, Arial, sans-serif;

    font-size: 8px;

    margin-top: 5px;
}

.qr {

    text-align: center;

    margin-top: 10px;
}

.qr-placeholder {

    width: 75px;

    height: 75px;

    border: 1px solid #000;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    font-size: 8px;
}

.footer {

    text-align: center;

    font-family: Calibri, Arial, sans-serif;

    font-size: 8px;

    margin-top: 10px;

    line-height: 20px;
}

@media print {

    body {
        width: 410px;
    }

    .bill {
        width: 410px;
    }

}

</style>

</head>

<body>

<div class="bill">

    <!-- COMPANY -->

    <div class="company">
        ${escapeHtml(company)}
    </div>

    <div class="header-small">
        CIN : ${escapeHtml(cin)}
    </div>

    <div class="header-small">
        ${escapeHtml(address1)}
    </div>

    <div class="header-small">
        ${escapeHtml(address2)}
    </div>

    <div class="header-small">
        STATE : ${escapeHtml(state)},
        STATE CODE : ${escapeHtml(stateCode)}
    </div>

    <div class="header-small">
        PH:${escapeHtml(phone)}
        EMAIL:${escapeHtml(email)}
    </div>

    <div class="header-small">
        GSTIN : ${escapeHtml(gstin)}
    </div>

    <div class="cash-bill">
        CASH BILL
    </div>

    <div class="mrp">
        (MRP INCLUDING GST)
    </div>


    <div class="line"></div>


    <!-- BILL INFORMATION -->

    <div class="bill-info">

        <span>
            Bill No : ${escapeHtml(billNo)}
        </span>

        <span>
            Date : ${escapeHtml(billDate)}
        </span>

    </div>

    <div class="place">
        Place of Supply : As Above
    </div>


    <!-- PARCEL -->

    <div class="parcel-title">
        PARCEL NO
    </div>

    <div class="parcel-row">

        <div class="barcode">

            <div class="barcode-text">
                || ${escapeHtml(billNo)} ||
            </div>

        </div>

        <div class="parcel-number">
            ${escapeHtml(parcelNo)}
        </div>

    </div>


    <div class="line"></div>


    <!-- CUSTOMER -->

    <div class="customer">
        Name : ${escapeHtml(customerName)}
    </div>


    <div class="line"></div>


    <!-- PRODUCT HEADER -->

    <table class="bill-table">

        <tbody>

            <tr class="table-header">

                <td class="sno">
                    S.NO
                </td>

                <td class="product">
                    PRODUCT
                </td>

                <td class="qty">
                    QTY
                </td>

                <td class="rate">
                    MRP/QTY
                </td>

                <td class="disc">
                    DISC
                </td>

                <td class="gstper">
                    GST%
                </td>

                <td class="gstamt">
                    GST AMT
                </td>

                <td class="netamt">
                    NET AMT
                </td>

            </tr>

            ${itemRows}

        </tbody>

    </table>


    <div class="line"></div>


    <!-- TOTAL -->

    <div class="total">

        <div>
            TOTAL
        </div>

        <div class="total-qty">
            ${formatPrintNumber(totalQty)}
        </div>

        <div class="total-amount">
            ${formatPrintAmount(totalAmount)}
        </div>

    </div>


    ${discountHtml}


    <div class="line"></div>


    <div class="gst-note">
        Amount stated above includes GST as Detailed below
    </div>


    <!-- GST -->

    <table class="gst-table">

        <tbody>

            <tr>
                <td>GST%</td>
                <td>CGST%</td>
                <td>SGST%</td>
            </tr>

            ${gstRows}

            <tr>

                <td></td>

                <td class="right">
                    ${formatPrintAmount(totalCGST)}
                </td>

                <td class="right">
                    ${formatPrintAmount(totalSGST)}
                </td>

            </tr>

        </tbody>

    </table>


    <div class="line"></div>


    <!-- PARCEL / AMOUNT -->

    <div class="parcel-bottom">

        <div>
            PARCEL NO :
            <span class="parcel-bottom-number">
                ${escapeHtml(parcelNo)}
            </span>
        </div>

        <div class="parcel-bottom-amount">
            ${formatPrintAmount(billAmount)}
        </div>

    </div>


    <!-- PACKING -->

    <div class="packing">

        No of Packing :
        <span class="parcel-bottom-number">
            ${escapeHtml(noOfPacking)}
        </span>

    </div>


    <!-- SAVINGS -->

    ${(Number(discount) || 0) > 0
                ?
                `
        <div class="line"></div>

        <div class="savings">
            Total Savings : ${escapeHtml(discount)}/-
            On MRP
        </div>
        `
                :
                ""
            }


    <!-- CUSTOMER COPY -->

    <div class="customer-copy">
        ****Customer Copy*****
    </div>

    <div class="exchange">
        No Exchange
    </div>


    <div class="line"></div>


    <div class="copy-number">

        <span></span>

        <span>
            1 / ${escapeHtml(noOfPacking)}
        </span>

    </div>


    <!-- QR -->

    <div class="qr">

        <div class="qr-placeholder">
            QR
        </div>

    </div>


    <!-- FOOTER -->

    <div class="footer">

        <div>
            Thank You Visit Again!
        </div>

        <div>
            Share your valuable feedback by scanning the above QR
        </div>

    </div>

</div>


<script>

window.onload = function () {

    setTimeout(function () {

        window.print();

    }, 500);

};

window.onafterprint = function () {

    window.close();

};

</script>

</body>

</html>
`;


        // =========================
        // OPEN PRINT WINDOW
        // =========================

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=500,height=800"
            );

        if (!printWindow) {

            alert(
                "Print window was blocked by browser. Please allow popups."
            );

            return;
        }

        printWindow.document.open();

        printWindow.document.write(printHtml);

        printWindow.document.close();
    }

    function getPrintValue(row, columnName) {

        if (!row) {
            return "";
        }

        if (Object.prototype.hasOwnProperty.call(row, columnName)) {

            const value = row[columnName];

            if (value === null || value === undefined) {
                return "";
            }

            return String(value);
        }

        return "";
    }

    function formatPrintNumber(value) {

        const number = Number(value);

        if (isNaN(number)) {
            return "0";
        }

        return number.toString();
    }
    function formatPrintAmount(value) {

        const number = Number(value);

        if (isNaN(number)) {
            return "0.00";
        }

        return number.toFixed(2);
    }
    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}


/* =========================================================
   CANCEL BILL
========================================================= */

function cancelBill() {

    const confirmed =
        window.confirm(
            "Cancel this bill?"
        );


    if (!confirmed) {
        return;
    }


    billingState.items = [];

    billingState.selectedItemIndex = -1;


    updateUI();

    focusItemCode();


    showToast(
        "Bill cancelled.",
        "success"
    );

}


/* =========================================================
   SAVE & PRINT
========================================================= */

function saveAndPrint() {

    const netAmount =
        getNumericText(
            getElement("netAmount")
        );


    if (
        billingState.items.length === 0
    ) {

        showToast(
            "Add at least one item before saving.",
            "error"
        );

        focusItemCode();

        return;

    }


    const totalPaid =
        getNumericText(
            getElement("totalPaid")
        );


    if (
        totalPaid < netAmount
    ) {

        showToast(
            "Payment is less than bill amount.",
            "error"
        );

        return;

    }


    /*
       This is where your API / SP
       Save Bill call will come.
    */

    showToast(
        "Bill saved successfully.",
        "success"
    );


    setTimeout(
        function () {

            window.print();

        },
        500
    );

}


/* =========================================================
   SHORTCUTS
========================================================= */

function handleShortcuts(event) {

    /*
       Don't intercept normal typing.
    */

    const activeElement =
        document.activeElement;


    const isTyping =
        activeElement &&
        (
            activeElement.tagName === "INPUT" ||
            activeElement.tagName === "SELECT" ||
            activeElement.tagName === "TEXTAREA"
        );


    /*
       Ctrl + P
    */

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "p"
    ) {

        event.preventDefault();

        window.print();

        return;

    }


    /*
       Ctrl + R
    */

    if (event.ctrlKey && event.key.toLowerCase() === "r") {

        event.preventDefault();
        clearBill();
        /*openReprint();*/
        showToast("Reprint selected bill.","success");
        return;

    }


    /*
       ESC
    */

    if (event.key === "Escape") {

        event.preventDefault();

        cancelBill();

        return;

    }


    /*
       DELETE
    */

    if (event.key === "Delete") {

        if (!isTyping) {

            event.preventDefault();

            removeSelectedItem();

        }

        return;

    }


    /*
       Function keys
    */

    switch (event.key) {

        case "F1":

            event.preventDefault();

             clearBill();
            //openReprint();

            break;


        case "F2":

            event.preventDefault();

            focusCash();

            break;


        case "F3":

            event.preventDefault();

            showToast(
                "Pending Bills module.",
                "success"
            );

            break;


        case "F4":

            event.preventDefault();

            showToast(
                "Denomination module.",
                "success"
            );

            break;


        case "F5":

            event.preventDefault();

            showToast(
                "Paid Parcel module.",
                "success"
            );

            break;


        case "F6":

            event.preventDefault();

            increaseSelectedQty();

            break;


        case "F7":

            event.preventDefault();

            decreaseSelectedQty();

            break;


        case "F8":

            event.preventDefault();

            saveAndPrint();

            break;


        case "F9":

            event.preventDefault();

            focusDiscount();

            break;


        case "F10":

            event.preventDefault();

            showToast(
                "Calculator module.",
                "success"
            );

            break;


        case "F11":

            event.preventDefault();

            clearBill();
            //openReprint(); 

            break;

    }

}


/* =========================================================
   F2 CASH
========================================================= */

function focusCash() {

    const cash =
        getElement("cashAmount");


    if (!cash) {
        return;
    }


    const netAmount =
        getNumericText(
            getElement("netAmount")
        );


    cash.value =
        netAmount.toFixed(2);


    updatePayment();


    cash.focus();

    cash.select();

}


/* =========================================================
   FOCUS ITEM
========================================================= */

function focusItemCode() {

    const itemCode = getElement("itemCode");


    if (!itemCode) {
        return;
    }


    setTimeout(
        function () {

            itemCode.focus();

        },
        50
    );

}


/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {
        return "₹ 0.00";
    }


    return (
        "₹ " +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,

                maximumFractionDigits: 2
            }
        )
    );

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    value,
    decimals = 2
) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {
        return "0.00";
    }


    return number.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: decimals,

            maximumFractionDigits: decimals
        }
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        getElement(id);


    if (element) {

        element.textContent =
            String(value);

    }

}


/* =========================================================
   SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        getElement(id);


    if (element) {

        element.value =
            String(value);

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message,
    type = ""
) {

    const toast =
        getElement("toast");


    const toastMessage =
        getElement("toastMessage");


    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.remove(
        "success",
        "error"
    );


    if (type) {

        toast.classList.add(
            type
        );

    }


    toast.classList.add(
        "show"
    );


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

    }


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}