/* =========================================
        LOAD LATEST INVOICES
========================================= */

async function loadLatestInvoices() {

    const container = document.getElementById("latestInvoices");

    if (!container) return;

    try {

        const response = await authFetch(`${BASE_URL}/api/invoices/`);
        console.log("Status:", response.status);
        const data = await safeJson(response);
        console.log("Response:", data);


        if (!response.ok) {

            container.innerHTML = `
                <p class="text-danger">
                    Unable to load invoices.
                </p>
            `;

            return;
        }

        const invoices = data.results || data;

        if (!invoices.length) {

            container.innerHTML = `
                <p class="text-muted">
                    No invoices available.
                </p>
            `;

            return;
        }

        container.innerHTML = invoices
            .slice(0, 5)
            .map(i => `
                <div class="card mb-2 shadow-sm">

                    <div class="card-body d-flex justify-content-between align-items-center">

                        <div>

                            <h6 class="mb-1">
                                ${i.invoice_number}
                            </h6>

                            <small class="text-muted">
                                Dr. ${i.doctor_name}
                            </small>

                            <br>

                            <small>
                                ₹${i.total_amount}
                            </small>

                        </div>

                        <button
                            class="btn btn-warning btn-sm"
                            onclick="viewInvoice(${i.id})">

                            View

                        </button>

                    </div>

                </div>
            `).join("");

    }

    catch (err) {

        console.error(err);

        container.innerHTML = `
            <p class="text-danger">
                Network Error
            </p>
        `;
    }

}


/* =========================================
        VIEW INVOICE
========================================= */

async function viewInvoice(invoiceId) {

    try {

        const response = await authFetch(
            `${BASE_URL}/api/invoices/${invoiceId}/`
        );

        const data = await safeJson(response);

        if (!response.ok) {
            showToast("Unable to load invoice", "error");
            return;
        }

        document.getElementById("invoiceNumber").innerText =
            data.invoice_number;

        document.getElementById("paymentStatus").innerText =
            data.payment_status;

        document.getElementById("invoicePatient").innerText =
            data.patient_name;

        document.getElementById("invoiceDoctor").innerText =
            data.doctor_name;

        document.getElementById("consultationFee").innerText =
            `₹${data.consultation_fee}`;

        document.getElementById("extraCharge").innerText =
            `₹${data.extra_charge}`;

        document.getElementById("discount").innerText =
            `₹${data.discount}`;

        document.getElementById("totalAmount").innerText =
            `₹${data.total_amount}`;

        const modal = new bootstrap.Modal(
            document.getElementById("invoiceModal")
        );

        modal.show();
        
    }

    catch (err) {

        console.error(err);

        showToast("Network Error", "error");

    }

}

/* =========================================
        PRINT INVOICE
        ========================================= */
        
    function printInvoice() {

    const printContents =
        document.getElementById("invoicePrintArea").innerHTML;

    const originalContents =
        document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;

    location.reload();

}
    document.addEventListener("DOMContentLoaded", function () {
        loadInvoices();
    });




    /* =========================================
        LOAD ALL INVOICES
========================================= */

async function loadInvoices() {

    const tableBody = document.getElementById("invoiceTableBody");

    if (!tableBody) return;

    try {

        const response = await authFetch(
            `${BASE_URL}/api/invoices/`
        );

        const data = await safeJson(response);

        if (!response.ok) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        Unable to load invoices.
                    </td>
                </tr>
            `;

            return;
        }

        const invoices = data.results || data;

        if (!invoices.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No invoices found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = invoices.map(invoice => `

            <tr>

                <td>${invoice.invoice_number}</td>

                <td>${invoice.doctor_name}</td>

                <td>₹${invoice.total_amount}</td>

                <td>

                    <span class="badge bg-${invoice.payment_status === "paid" ? "success" : "warning"}">

                        ${invoice.payment_status}

                    </span>

                </td>

                <td>${formatDate(invoice.created_at)}</td>

                <td>

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="viewInvoice(${invoice.id})">

                        View

                    </button>

                </td>

            </tr>

        `).join("");

    }

    catch (err) {

        console.error(err);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Network Error
                </td>
            </tr>
        `;

    }

}


/* =========================================
        INIT
========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    await protectPage("patient");

    loadInvoices();

});