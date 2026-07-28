/* ==========================================
                GLOBALS
========================================== */

let appointmentId = null;
let currentUserId = null;
let currentUserRole = null;
let socket = null;
let typingTimeout = null;


/* ==========================================
            GET APPOINTMENT ID
========================================== */

const params = new URLSearchParams(window.location.search);

appointmentId = params.get("appointment");

if (!appointmentId) {

    showToast("Invalid appointment.", "error");

    throw new Error("Appointment ID missing.");
}


/* ==========================================
            LOAD CURRENT USER
========================================== */

async function loadCurrentUser() {

    try {

        const res = await authFetch(
            `${BASE_URL}/api/accounts/me/`
        );

        const data = await safeJson(res);

        if (!res.ok) {

            showToast(
                "Unable to load user",
                "error"
            );

            return;
        }

        currentUserId = Number(data.id);
        currentUserRole = data.role;

    }

    catch (err) {

        console.error(err);

    }

}


/* ==========================================
                LOAD OLD CHAT
========================================== */

async function loadMessages() {

    try {

        const res = await authFetch(
            `${BASE_URL}/api/chat/appointment/${appointmentId}/messages/`
        );

        const data = await safeJson(res);

        if (!res.ok) {

            showToast(
                "Failed to load chat",
                "error"
            );

            return;
        }

        currentUserId = Number(data.current_user.id);
        currentUserRole = data.current_user.role;

        const name =
            currentUserRole === "patient"
                ? data.appointment.doctor_name
                : data.appointment.patient_name;

        const header = getE1("chatUserName");

        if (header) {

            header.innerText = name;

        }

        renderMessages(data.messages);

    }

    catch (err) {

        console.error(err);

    }

}


/* ==========================================
            RENDER MESSAGES
========================================== */

function renderMessages(messages) {

    const container = getE1("chatMessages");

    container.innerHTML = "";

    if (!messages || messages.length === 0) {

        container.innerHTML = `
            <div class="text-center text-muted mt-5">
                No messages yet.
            </div>
        `;

        return;
    }

    messages.forEach(message => {

        appendMessage(message);

    });

}


/* ==========================================
            APPEND MESSAGE
========================================== */

function appendMessage(message) {

    const container = getE1("chatMessages");

    const side =
        Number(message.sender) === Number(currentUserId)
            ? "patient"
            : "doctor";

    container.innerHTML += `

        <div class="message ${side}">

            ${escapeHtml(message.message)}

            <span class="message-time">

                ${formatDate(message.created_at)}

            </span>

        </div>

    `;

    container.scrollTop =
        container.scrollHeight;

}


/* ==========================================
            CONNECT WEBSOCKET
========================================== */

function connectWebSocket() {

    const protocol =
        window.location.protocol === "https:"
            ? "wss"
            : "ws";

    const token =
        localStorage.getItem("access_token");

    socket = new WebSocket(
        `${protocol}://${window.location.host}/ws/chat/${appointmentId}/?token=${token}`
    );

    socket.onopen = function () {

        console.log("✅ WebSocket Connected");

    };


    socket.onmessage = function (event) {

        const data =
            JSON.parse(event.data);

        console.log("Socket Event:", data);

        switch (data.type) {

            case "chat_message":

                appendMessage(data);

                break;

            case "status":

                if (Number(data.user_id) === Number(currentUserId)) {
                    break;
                }

                const status = getE1("chatStatus");

                if (status) {
                    status.innerHTML =
                        data.status === "online"
                            ? "🟢 Online"
                            : "🔴 Offline";
                }

    

                break;

            case "typing":

                const typing =
                    getE1("typingIndicator");

                if (!typing)
                    return;

                if (data.typing) {

                    typing.innerHTML =
                        `${data.username} is typing...`;

                }

                else {

                    typing.innerHTML = "";

                }

                break;

            default:

                console.log(data);

        }

    };


    socket.onclose = function () {

        console.log("❌ WebSocket Closed");

    };


    socket.onerror = function (error) {

        console.error(
            "WebSocket Error",
            error
        );

    };

}
/* ==========================================
                SEND MESSAGE
========================================== */

function sendMessage() {

    const input = getE1("messageInput");

    if (!input) return;

    const message = input.value.trim();

    if (!message) {

        showToast(
            "Message cannot be empty",
            "error"
        );

        return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {

        showToast(
            "Chat not connected",
            "error"
        );

        return;
    }

    socket.send(JSON.stringify({

        type: "chat_message",

        message: message

    }));

    input.value = "";

    const typing = getE1("typingIndicator");

    if (typing) {

        typing.innerHTML = "";

    }

}


/* ==========================================
            MESSAGE INPUT EVENTS
========================================== */

function setupInputEvents() {

    const input = getE1("messageInput");

    if (!input) return;

    // Enter to Send
    input.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            sendMessage();

        }

    });

    // Typing Indicator
    input.addEventListener("input", function () {

        if (
            !socket ||
            socket.readyState !== WebSocket.OPEN
        ) {

            return;

        }

        socket.send(JSON.stringify({

            type: "typing",

            typing: true

        }));

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(function () {

            if (
                socket &&
                socket.readyState === WebSocket.OPEN
            ) {

                socket.send(JSON.stringify({

                    type: "typing",

                    typing: false

                }));

            }

        }, 1000);

    });

}


/* ==========================================
            AUTO RECONNECT
========================================== */

function reconnectSocket() {

    setTimeout(function () {

        console.log("Reconnecting...");

        connectWebSocket();

    }, 3000);

}


/* ==========================================
                INIT
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    async function () {

        await protectPage();

        await loadCurrentUser();

        await loadMessages();

        connectWebSocket();

        setupInputEvents();

        const sendBtn = getE1("sendBtn");

        if (sendBtn) {

            sendBtn.addEventListener(

                "click",

                sendMessage

            );

        }

    }

);


/* ==========================================
        RECONNECT WHEN DISCONNECTED
========================================== */

window.addEventListener("offline", function () {

    console.log("Internet Lost");

});

window.addEventListener("online", function () {

    console.log("Internet Restored");

    if (

        !socket ||

        socket.readyState === WebSocket.CLOSED

    ) {

        reconnectSocket();

    }

});


/* ==========================================
            GLOBAL EXPORT
========================================== */

window.sendMessage = sendMessage;