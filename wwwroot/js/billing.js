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

    const addButton =
        getElement("addItemBtn");

    if (addButton) {
        addButton.addEventListener(
            "click",
            addItem
        );
    }


    const itemCode =
        getElement("itemCode");

    if (itemCode) {

        itemCode.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addItem();

                }

            }
        );

    }


    const qty =
        getElement("itemQty");

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


/* =========================================================
   ADD ITEM
========================================================= */

function addItem() {

    const itemCodeElement =
        getElement("itemCode");

    const qtyElement =
        getElement("itemQty");

    const ecNoElement =
        getElement("ecNo");

    const offerTypeElement =
        getElement("offerType");


    if (!itemCodeElement ||
        !qtyElement) {

        return;

    }


    const itemCode =
        itemCodeElement.value.trim();


    const qty =
        parseInt(
            qtyElement.value,
            10
        );


    if (!itemCode) {

        showToast(
            "Enter or scan item code.",
            "error"
        );

        itemCodeElement.focus();

        return;

    }


    if (!Number.isFinite(qty) || qty <= 0) {

        showToast(
            "Enter a valid quantity.",
            "error"
        );

        qtyElement.focus();

        return;

    }


    let masterItem =
        itemMaster[itemCode];


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


    const enteredEcNo =
        ecNoElement.value.trim();


    const offerType =
        offerTypeElement
            ? offerTypeElement.value
            : "Normal";


    /*
       Check whether item already exists.
    */

    const existingIndex =
        billingState.items.findIndex(
            function (item) {

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

            ecNo:
                enteredEcNo ||
                masterItem.ecNo,

            mrp: Number(masterItem.mrp) || 0,

            qty: qty,

            discountPercent:
                0,

            discountValue:
                0,

            hsn:
                masterItem.hsn || "-",

            gst:
                Number(masterItem.gst) || 0,

            offerType:
                offerType

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

    const confirmed =
        window.confirm(
            "Clear current bill?"
        );


    if (!confirmed) {
        return;
    }


    billingState.items = [];

    billingState.selectedItemIndex = -1;

    billingState.discountPercent = 0;

    billingState.roundOff = 0;


    const discount =
        getElement("discountPercent");


    if (discount) {
        discount.value = "0";
    }


    const paymentIds = [

        "cashAmount",
        "cardAmount",
        "upiAmount",
        "exchangeAmount",
        "advanceAmount",
        "chequeAmount",
        "giftVoucherAmount"

    ];


    paymentIds.forEach(
        function (id) {

            const element =
                getElement(id);


            if (element) {
                element.value = "0";
            }

        }
    );


    const customerFields = [
        "mobileNo",
        "customerName",
        "ecNo",
        "itemCode"
    ];


    customerFields.forEach(
        function (id) {

            const element =
                getElement(id);


            if (element) {
                element.value = "";
            }

        }
    );


    const qty =
        getElement("itemQty");


    if (qty) {
        qty.value = "1";
    }


    updateUI();

    focusItemCode();


    showToast(
        "Bill cleared.",
        "success"
    );

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

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "r"
    ) {

        event.preventDefault();

        showToast(
            "Reprint selected bill.",
            "success"
        );

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

    const itemCode =
        getElement("itemCode");


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