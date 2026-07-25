/* ==========================================
                GLOBALS
========================================== */

let appointmentId = null;
let currentUserId = null;
let currentUserRole = null;
let socket = null;


/* ==========================================
            GET APPOINTMENT ID
========================================== */

const params = new URLSearchParams(
    window.location.search
);


appointmentId = params.get("appointment");


if (!appointmentId) {

    showToast(
        "Invalid appointment.",
        "error"
    );

    throw new Error(
        "Appointment ID missing."
    );

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


        currentUserId = data.id;

        currentUserRole = data.role;


    }


    catch(err){

        console.error(err);

    }

}



/* ==========================================
                LOAD OLD CHAT
========================================== */

async function loadMessages(){

    try {


        const res = await authFetch(

            `${BASE_URL}/api/chat/appointment/${appointmentId}/messages/`

        );


        const data = await safeJson(res);



        if(!res.ok){

            showToast(
                "Failed to load chat",
                "error"
            );

            return;

        }



        /*
            API Response:

            {
                appointment:{},
                current_user:{},
                messages:[]
            }

        */


        currentUserId =
            data.current_user.id;


        currentUserRole =
            data.current_user.role;



        // Chat header

        const name =
            currentUserRole === "patient"
            ? data.appointment.doctor_name
            : data.appointment.patient_name;



        const header =
            getE1("chatUserName");


        if(header){

            header.innerText = name;

        }



        renderMessages(
            data.messages
        );


    }


    catch(err){

        console.error(err);

    }

}



/* ==========================================
            RENDER OLD MESSAGES
========================================== */


function renderMessages(messages){


    const container =
        getE1("chatMessages");



    container.innerHTML = "";



    if(messages.length === 0){


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


function appendMessage(message){


    const container =
        getE1("chatMessages");



    const side =

        message.sender === currentUserId

        ? "patient"

        : "doctor";



    container.innerHTML += `


        <div class="message ${side}">


            ${escapeHtml(message.message)}



            <span class="message-time">

                ${formatDate(
                    message.created_at
                )}

            </span>



        </div>


    `;



    container.scrollTop =
        container.scrollHeight;


}



/* ==========================================
            CONNECT WEBSOCKET
========================================== */


function connectWebSocket(){



    const protocol =

        window.location.protocol === "https:"

        ? "wss"

        : "ws";



        const token = localStorage.getItem("access_token");

        socket = new WebSocket(
            `${protocol}://${window.location.host}/ws/chat/${appointmentId}/?token=${token}`
        );




    socket.onopen = function(){


        console.log(
            "WebSocket Connected"
        );


    };





    socket.onmessage = function(event){


        const data =
            JSON.parse(
                event.data
            );



        console.log(
            "New Message",
            data
        );



        appendMessage(data);



    };





    socket.onclose = function(){


        console.log(
            "WebSocket Closed"
        );


    };





    socket.onerror = function(error){


        console.error(
            "WebSocket Error",
            error
        );


    };

}



/* ==========================================
            SEND MESSAGE
========================================== */


function sendMessage(){


    const input =
        getE1("messageInput");



    const message =
        input.value.trim();



    if(!message){

        showToast(
            "Message cannot be empty",
            "error"
        );

        return;

    }





    if(
        !socket ||
        socket.readyState !== WebSocket.OPEN
    ){

        showToast(
            "Chat not connected",
            "error"
        );

        return;

    }





    socket.send(

        JSON.stringify({

            message: message

        })

    );



    input.value = "";



}




/* ==========================================
                INIT
========================================== */


document.addEventListener(
"DOMContentLoaded",
async ()=>{


    await protectPage();



    await loadCurrentUser();



    await loadMessages();



    connectWebSocket();



    const sendBtn =
        getE1("sendBtn");



    if(sendBtn){

        sendBtn.addEventListener(
            "click",
            sendMessage
        );

    }



    const input =
        getE1("messageInput");



    if(input){

        input.addEventListener(
            "keypress",
            function(e){

                if(e.key === "Enter"){

                    sendMessage();

                }

            }
        );

    }


});



/* ==========================================
            GLOBAL EXPORT
========================================== */

window.sendMessage = sendMessage;