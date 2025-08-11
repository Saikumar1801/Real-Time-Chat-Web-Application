// IMPORTANT: Paste your own Firebase configuration here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Initialization and Global State ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser = null, messagesUnsubscribe = null, authUnsubscribe = null, isInitialized = false, roomMembers = [];
const params = new URLSearchParams(window.location.search);
const roomId = params.get('room');

// DOM Elements
const chatMessages = document.querySelector('.chat-messages'), inputForm = document.querySelector('.chat-input-area'),
      messageInput = document.querySelector('.message-input'), roomTitleElem = document.querySelector('.room-title'),
      imageAttachBtn = document.getElementById('image-attach-btn'), fileAttachBtn = document.getElementById('file-attach-btn'),
      imageInput = document.getElementById('image-input'), fileInput = document.getElementById('file-input'),
      deleteRoomBtn = document.getElementById('delete-room-btn'), roomInfoDiv = document.querySelector('.room-info');

// --- Application Entry Point & Lifecycle ---
if (!roomId) { window.location.href = 'chatrooms.html'; }
else {
    authUnsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            tryInitializeApp();
        } else {
            auth.signInAnonymously();
        }
    });
}

// This function now uses async/await to enforce a strict order
async function tryInitializeApp() {
    if (currentUser && !isInitialized) {
        isInitialized = true;

        // 1. Fetch room details FIRST and WAIT for it to complete.
        await fetchRoomDetails();

        // 2. NOW that we have room details (title, members), attach listeners.
        inputForm.addEventListener('submit', handleSendMessage);
        imageAttachBtn.addEventListener('click', () => imageInput.click());
        fileAttachBtn.addEventListener('click', () => fileInput.click());
        imageInput.addEventListener('change', handleImageUpload);
        fileInput.addEventListener('change', handleFileUpload);
        deleteRoomBtn.addEventListener('click', deleteCurrentRoom);
        roomInfoDiv.addEventListener('click', showRoomId);
        chatMessages.addEventListener('scroll', markVisibleMessagesAsRead);
        
        // 3. Finally, start listening for real-time messages.
        listenForMessages();
    }
}

window.addEventListener('beforeunload', () => {
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (authUnsubscribe) authUnsubscribe();
});

// --- Core Data & UI Functions ---
async function fetchRoomDetails() {
    try {
        const doc = await db.collection('chatrooms').doc(roomId).get();
        if (doc.exists) {
            roomTitleElem.textContent = doc.data().title;
            roomMembers = doc.data().members || [];
        } else {
            roomTitleElem.textContent = "Room Not Found";
        }
    } catch (error) {
        console.error("Error fetching room details:", error);
        roomTitleElem.textContent = "Error";
    }
}

function listenForMessages() {
    if (messagesUnsubscribe) messagesUnsubscribe();
    const query = db.collection('chatrooms').doc(roomId).collection('messages').orderBy('timestamp');
    messagesUnsubscribe = query.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                displayMessage(change.doc);
            }
            if (change.type === 'modified') {
                updateMessageReceipts(change.doc);
            }
        });
        markVisibleMessagesAsRead();
        scrollToBottom();
    }, error => {
        console.error("Error listening to messages:", error);
    });
}

function displayMessage(doc) {
    if (document.getElementById(doc.id)) {
        updateMessageReceipts(doc);
        return;
    }
    const msg = doc.data();
    const isSentByCurrentUser = msg.senderId === currentUser.uid;
    const messageDiv = document.createElement('div');
    messageDiv.id = doc.id;
    messageDiv.classList.add('message', isSentByCurrentUser ? 'sent' : 'received');
    messageDiv.dataset.senderId = msg.senderId;
    messageDiv.style.position = 'relative';

    if (msg.forwardedFrom) {
        const el = document.createElement('div');
        el.className = 'forwarded-info';
        el.textContent = `Forwarded from ${msg.forwardedFrom}`;
        messageDiv.prepend(el);
    }
    
    if (msg.base64Image) {
        const el = document.createElement('img');
        el.src = msg.base64Image;
        el.classList.add('message-image');
        messageDiv.appendChild(el);
    } else if (msg.fileUrl && msg.fileName) {
        const el = document.createElement('a');
        el.href = msg.fileUrl;
        el.textContent = `📄 ${msg.fileName}`;
        el.className = 'file-link';
        el.target = '_blank';
        messageDiv.appendChild(el);
    } else if (msg.text) {
        const el = document.createElement('p');
        el.classList.add('message-text');
        el.textContent = msg.text;
        messageDiv.appendChild(el);
    }
    
    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('message-timestamp');
    if (msg.timestamp?.toDate) {
        timestampSpan.textContent = msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const forwardBtn = document.createElement('button');
    forwardBtn.className = 'forward-btn';
    forwardBtn.innerHTML = '↪️';
    forwardBtn.onclick = () => forwardMessage(msg);
    messageDiv.appendChild(forwardBtn);
    messageDiv.appendChild(timestampSpan);
    chatMessages.appendChild(messageDiv);

    if (isSentByCurrentUser) {
        updateMessageReceipts(doc);
    }
}

function updateMessageReceipts(doc) {
    const messageDiv = document.getElementById(doc.id);
    if (!messageDiv || messageDiv.dataset.senderId !== currentUser.uid) return;
    const msgData = doc.data();
    const readByCount = msgData.readBy?.length || 0;
    messageDiv.classList.remove('delivered', 'read-by-all');
    if (readByCount >= roomMembers.length) {
        messageDiv.classList.add('read-by-all');
    } else {
        messageDiv.classList.add('delivered');
    }
}

function markVisibleMessagesAsRead() {
    const unreadMessages = document.querySelectorAll('.message.received:not([data-read="true"])');
    if (unreadMessages.length === 0) return;
    const batch = db.batch();
    let updatesMade = 0;
    unreadMessages.forEach(msgDiv => {
        const rect = msgDiv.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            batch.update(db.collection('chatrooms').doc(roomId).collection('messages').doc(msgDiv.id), {
                readBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            });
            msgDiv.dataset.read = "true";
            updatesMade++;
        }
    });
    if (updatesMade > 0) {
        batch.commit().catch(err => console.error("Failed to mark messages as read:", err));
    }
}

function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }

// --- Action Handlers ---
function sendMessage(content, targetRoomId = roomId) {
    const { text = '', base64Image = null, fileUrl = null, fileName = null, forwardedFrom = null } = content;
    const newTimestamp = firebase.firestore.FieldValue.serverTimestamp();
    const messageData = { senderId: currentUser.uid, text, base64Image, fileUrl, fileName, forwardedFrom, timestamp: newTimestamp, readBy: [currentUser.uid] };
    const lastMessage = { text: content.text, timestamp: newTimestamp };
    const newMessageRef = db.collection('chatrooms').doc(targetRoomId).collection('messages').doc();
    const roomRef = db.collection('chatrooms').doc(targetRoomId);
    const batch = db.batch();
    batch.set(newMessageRef, messageData);
    batch.update(roomRef, { lastMessage });
    batch.commit();
}

function handleSendMessage(e) { e.preventDefault(); const text = messageInput.value.trim(); if (text) { sendMessage({ text }); messageInput.value = ''; } }
function handleImageUpload(e) { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => sendMessage({ text: '📷 Image', base64Image: event.target.result }); reader.readAsDataURL(file); e.target.value = ''; } }
function handleFileUpload(e) { const file = e.target.files[0]; if (file) { const fileRef = storage.ref(`chatrooms/${roomId}/files/${Date.now()}_${file.name}`); const task = fileRef.put(file); task.on('state_changed', null, null, () => task.snapshot.ref.getDownloadURL().then(url => sendMessage({ text: `📄 ${file.name}`, fileUrl: url, fileName: file.name }))); e.target.value = ''; } }

async function forwardMessage(messageToForward) {
    try {
        const userRoomsRef = db.collection('users').doc(currentUser.uid).collection('rooms');
        const userRoomsSnapshot = await userRoomsRef.get();
        const roomIds = userRoomsSnapshot.docs.map(doc => doc.id).filter(id => id !== roomId);
        if (roomIds.length === 0) { alert("You have no other rooms to forward this to."); return; }
        const roomsSnapshot = await db.collection('chatrooms').where(firebase.firestore.FieldPath.documentId(), 'in', roomIds).get();
        const rooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let promptText = "Choose a room to forward to (enter number):\n\n";
        rooms.forEach((room, index) => { promptText += `${index + 1}: ${room.title}\n`; });
        const choice = prompt(promptText);
        if (!choice) return;
        const selectedRoom = rooms[parseInt(choice, 10) - 1];
        if (!selectedRoom) { alert("Invalid selection."); return; }
        const forwardedContent = {
            text: messageToForward.text,
            base64Image: messageToForward.base64Image || null,
            fileUrl: messageToForward.fileUrl || null,
            fileName: messageToForward.fileName || null,
            forwardedFrom: roomTitleElem.textContent
        };
        sendMessage(forwardedContent, selectedRoom.id);
        alert(`Message forwarded to "${selectedRoom.title}"!`);
    } catch (error) { console.error("Error forwarding message:", error); }
}

async function deleteCurrentRoom() {
    if (!roomId) return;
    const confirmation = confirm(`Are you sure you want to permanently delete the "${roomTitleElem.textContent}" room? This will remove it for all users.`);
    if (confirmation) {
        try {
            const roomRef = db.collection('chatrooms').doc(roomId);
            const messagesSnapshot = await roomRef.collection('messages').get();
            const batch = db.batch();
            messagesSnapshot.forEach(doc => { batch.delete(doc.ref); });
            await batch.commit();
            await roomRef.delete();
            alert("Room has been deleted.");
            window.location.href = 'chatrooms.html';
        } catch (error) { console.error("Error deleting room: ", error); alert("Failed to delete the room."); }
    }
}

function showRoomId() {
    if (document.querySelector('.room-id-display')) return;
    const roomIdElement = document.createElement('div');
    roomIdElement.className = 'room-id-display';
    roomIdElement.textContent = `Click to copy ID: ${roomId}`;
    roomInfoDiv.appendChild(roomIdElement);
    roomIdElement.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(roomId).then(() => { alert(`Room ID "${roomId}" copied to clipboard!`); });
    });

}
