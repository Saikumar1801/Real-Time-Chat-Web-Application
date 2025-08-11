// IMPORTANT: Paste your own Firebase configuration here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM References
const roomList = document.querySelector('.room-list');
const searchBar = document.getElementById('search-bar');
const newRoomBtn = document.getElementById('new-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');

// Global State
let currentUser = null;
let roomsDataCache = [];
let userRoomsUnsubscribe = null;

// --- Main Flow ---
auth.onAuthStateChanged(user => {
    if (userRoomsUnsubscribe) userRoomsUnsubscribe();

    if (user) {
        currentUser = user;
        listenForUserRooms();
        newRoomBtn.addEventListener('click', createNewRoom);
        joinRoomBtn.addEventListener('click', joinRoomById);
    } else {
        auth.signInAnonymously();
    }
});

function listenForUserRooms() {
    const userRoomsRef = db.collection('users').doc(currentUser.uid).collection('rooms');
    
    userRoomsUnsubscribe = userRoomsRef.onSnapshot(async (snapshot) => {
        if (snapshot.empty) {
            renderRoomList([]);
            return;
        }
        const roomIds = snapshot.docs.map(doc => doc.id);
        if (roomIds.length === 0) {
            renderRoomList([]);
            return;
        }
        const roomsSnapshot = await db.collection('chatrooms').where(firebase.firestore.FieldPath.documentId(), 'in', roomIds).get();
        processRoomData(roomsSnapshot);
    });
}

async function processRoomData(roomSnapshot) {
    try {
        const readsRef = db.collection('reads').doc(currentUser.uid).collection('rooms');
        const mutesRef = db.collection('mutes').doc(currentUser.uid).collection('rooms');
        const [readsSnapshot, mutesSnapshot] = await Promise.all([readsRef.get(), mutesRef.get()]);
        const readsMap = new Map(readsSnapshot.docs.map(doc => [doc.id, doc.data().lastReadTimestamp]));
        const mutesMap = new Map(mutesSnapshot.docs.map(doc => [doc.id, doc.data().muted]));
        const roomPromises = roomSnapshot.docs.map(async (roomDoc) => {
            const room = { id: roomDoc.id, ...roomDoc.data() };
            const lastReadTimestamp = readsMap.get(room.id) || null;
            if (room.lastMessage && room.lastMessage.timestamp && (!lastReadTimestamp || room.lastMessage.timestamp.toMillis() > lastReadTimestamp.toMillis())) {
                const unreadSnapshot = await db.collection('chatrooms').doc(room.id).collection('messages').where('timestamp', '>', lastReadTimestamp || new Date(0)).get();
                room.unreadCount = unreadSnapshot.size;
            } else { room.unreadCount = 0; }
            room.isMuted = mutesMap.get(room.id) || false;
            return room;
        });
        const processedRooms = await Promise.all(roomPromises);
        roomsDataCache = processedRooms;
        renderRoomList(processedRooms);
    } catch (error) {
        console.error("Error processing room data:", error);
        renderError("An error occurred loading chats.");
    }
}

function renderRoomList(rooms) {
    roomList.innerHTML = '';
    if (rooms.length === 0) {
        roomList.innerHTML = '<p style="text-align:center; padding: 20px;">You have no chats. Click + to create one or 🔗 to join!</p>';
        return;
    }
    rooms.sort((a, b) => (b.lastMessage?.timestamp?.toMillis() || 0) - (a.lastMessage?.timestamp?.toMillis() || 0));
    rooms.forEach(room => {
        const roomItem = document.createElement('a');
        roomItem.href = `chat.html?room=${room.id}`;
        roomItem.className = 'room-item';
        roomItem.dataset.roomId = room.id;
        const lastMsgTime = room.lastMessage?.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
        roomItem.innerHTML = `
            <div class="room-details">
                <div class="room-item-header">
                    <h2 class="room-item-title">${room.title}</h2>
                    <time class="room-item-timestamp">${lastMsgTime}</time>
                </div>
                <div class="room-item-preview">${room.lastMessage?.text || 'No messages yet'}</div>
            </div>
            ${room.unreadCount > 0 ? `<span class="unread-badge">${room.unreadCount}</span>` : ''}
            <button class="mute-button ${room.isMuted ? 'muted' : ''}" data-room-id="${room.id}">
                ${room.isMuted ? '🔇' : '🔊'}
            </button>
        `;
        roomList.appendChild(roomItem);
    });
}

function renderError(message) { roomList.innerHTML = `<p style="text-align:center; padding: 20px; color: red;">${message}</p>`; }

// --- Event Handlers ---
roomList.addEventListener('click', (e) => {
    const muteButton = e.target.closest('.mute-button');
    if (muteButton) { e.preventDefault(); toggleMute(muteButton.dataset.roomId); }
});

searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    renderRoomList(roomsDataCache.filter(room => room.title.toLowerCase().includes(searchTerm)));
});

async function toggleMute(roomId) {
    const room = roomsDataCache.find(r => r.id === roomId);
    if (!room) return;
    const isCurrentlyMuted = room.isMuted;
    const muteRef = db.collection('mutes').doc(currentUser.uid).collection('rooms').doc(roomId);
    try {
        await muteRef.set({ muted: !isCurrentlyMuted });
        room.isMuted = !isCurrentlyMuted;
        const muteButton = document.querySelector(`.room-item[data-room-id="${roomId}"] .mute-button`);
        if (muteButton) {
            muteButton.classList.toggle('muted', !isCurrentlyMuted);
            muteButton.innerHTML = !isCurrentlyMuted ? '🔇' : '🔊';
        }
    } catch (error) { console.error("Failed to toggle mute:", error); }
}

async function createNewRoom() {
    const roomName = prompt("Enter a name for the new room:");
    if (!roomName || roomName.trim() === "") return;
    try {
        const newRoomRef = await db.collection("chatrooms").add({
            title: roomName.trim(),
            creatorId: currentUser.uid,
            members: [currentUser.uid], // Add creator as first member
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: null
        });
        await db.collection('users').doc(currentUser.uid).collection('rooms').doc(newRoomRef.id).set({
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        prompt("Room created! Share this ID with others to have them join:", newRoomRef.id);
        window.location.href = `chat.html?room=${newRoomRef.id}`;
    } catch (error) { console.error("Error creating room:", error); }
}

async function joinRoomById() {
    const idToJoin = prompt("Enter the Room ID to join:");
    if (!idToJoin || idToJoin.trim() === "") return;
    const roomId = idToJoin.trim();
    const roomRef = db.collection('chatrooms').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) { alert("A room with that ID does not exist."); return; }

    // Add user to the room's member list and their personal room list
    await roomRef.update({
        members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    await db.collection('users').doc(currentUser.uid).collection('rooms').doc(roomId).set({
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.location.href = `chat.html?room=${roomId}`;

}
