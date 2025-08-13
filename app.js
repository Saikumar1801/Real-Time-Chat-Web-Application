// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyCkXiKhWwx_W29ZFU8mmB-eecFHt1WZCX4",
    authDomain: "chat-app-6194f.firebaseapp.com",
    projectId: "chat-app-6194f",
    storageBucket: "chat-app-6194f.appspot.com",
    messagingSenderId: "432201991680",
    appId: "1:432201991680:web:96ac04f905881f5332fae5",
    measurementId: "G-5MG6QESZ5K"
};

// --- Firebase Initialization ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const messaging = firebase.messaging();

// --- Global State ---
let currentUser = null, currentRoomId = null, roomsDataCache = [],
    userRoomsUnsubscribe = null, messagesUnsubscribe = null, typingUnsubscribe = null,
    lastSenderId = null, messageIdToEdit = null, lastMessageDate = null, typingTimeout = null;

// --- DOM Element Selection ---
const sidebar = document.querySelector('.sidebar'), roomList = document.querySelector('.room-list'),
      searchBar = document.getElementById('search-bar'), profileBtn = document.getElementById('profile-btn'),
      newRoomBtn = document.getElementById('new-room-btn'), joinRoomBtn = document.getElementById('join-room-btn'),
      privateChatBtn = document.getElementById('private-chat-btn'), chatArea = document.querySelector('.chat-area'),
      chatPlaceholder = document.querySelector('.chat-placeholder'), chatView = document.querySelector('.chat-view'),
      roomInfoDiv = document.querySelector('.room-info'), roomTitleElem = document.querySelector('.room-title'),
      deleteRoomBtn = document.getElementById('delete-room-btn'),
      chatMessages = document.querySelector('.chat-messages'), inputForm = document.querySelector('.chat-input-area'),
      messageInput = document.querySelector('.message-input'), imageAttachBtn = document.getElementById('image-attach-btn'),
      fileAttachBtn = document.getElementById('file-attach-btn'), imageInput = document.getElementById('image-input'),
      fileInput = document.getElementById('file-input'), backButton = document.querySelector('.back-button.mobile-only'),
      participantModal = document.getElementById('participant-modal'), modalRoomIdContainer = document.getElementById('modal-room-id-container'),
      modalRoomIdText = document.getElementById('modal-room-id-text'), modalRoomIdCopyBtn = document.getElementById('modal-room-id-copy-btn'),
      participantList = document.getElementById('participant-list'), modalCloseBtn = document.getElementById('modal-close-btn'),
      modalTitle = document.getElementById('modal-title'), customPromptModal = document.getElementById('custom-prompt-modal'),
      customPromptTitle = document.getElementById('custom-prompt-title'), customPromptText = document.getElementById('custom-prompt-text'),
      customPromptInput = document.getElementById('custom-prompt-input'), customPromptOk = document.getElementById('custom-prompt-ok'),
      customPromptCancel = document.getElementById('custom-prompt-cancel'),
      editMessageModal = document.getElementById('edit-message-modal'),
      editMessageForm = document.getElementById('edit-message-form'),
      editMessageInput = document.getElementById('edit-message-input'),
      editModalCloseBtn = document.getElementById('edit-modal-close-btn'),
      editMessageCancelBtn = document.getElementById('edit-message-cancel'),
      adminControls = document.getElementById('admin-controls'),
      editRoomBtn = document.getElementById('edit-room-btn'),
      adminDeleteRoomBtn = document.getElementById('admin-delete-room-btn');

// =================================================================================
// --- HELPER & UTILITY FUNCTIONS ---
// =================================================================================

function hideParticipantModal() { participantModal.style.display = 'none'; }
function hideEditModal() {
    editMessageModal.style.display = 'none';
    messageIdToEdit = null;
    editMessageInput.value = '';
}
function showEditModal(messageId, currentText) {
    messageIdToEdit = messageId;
    editMessageInput.value = currentText;
    editMessageModal.style.display = 'flex';
    editMessageInput.focus();
}
function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }
function getFormattedDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === yesterday.toDateString()) return '어제';
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}
function showCustomPrompt(title, text, placeholder) {
    return new Promise((resolve, reject) => {
        customPromptTitle.textContent = title; customPromptText.textContent = text;
        customPromptInput.placeholder = placeholder; customPromptInput.value = '';
        customPromptInput.style.display = 'block'; customPromptOk.textContent = '확인';
        customPromptCancel.style.display = 'inline-block'; customPromptCancel.className = 'modal-button secondary';
        customPromptModal.style.display = 'flex';
        const onOk = () => { resolve(customPromptInput.value); cleanup(); };
        const onCancel = () => { reject(null); cleanup(); };
        const cleanup = () => { customPromptModal.style.display = 'none'; customPromptOk.removeEventListener('click', onOk); customPromptCancel.removeEventListener('click', onCancel); };
        customPromptOk.addEventListener('click', onOk); customPromptCancel.addEventListener('click', onCancel);
    });
}
function showCustomAlert(title, text) {
    return new Promise((resolve) => {
        customPromptTitle.textContent = title; customPromptText.textContent = text;
        customPromptInput.style.display = 'none'; customPromptCancel.style.display = 'none';
        customPromptOk.textContent = '닫기'; customPromptModal.style.display = 'flex';
        const onOk = () => { customPromptModal.style.display = 'none'; customPromptOk.removeEventListener('click', onOk); resolve(true); };
        customPromptOk.addEventListener('click', onOk);
    });
}
function showConfirmationModal(title, text) {
    return new Promise((resolve) => {
        customPromptTitle.textContent = title; customPromptText.textContent = text;
        customPromptInput.style.display = 'none';
        customPromptOk.textContent = '확인';
        customPromptCancel.style.display = 'inline-block';
        customPromptModal.style.display = 'flex';
        const onOk = () => { resolve(true); cleanup(); };
        const onCancel = () => { resolve(false); cleanup(); };
        const cleanup = () => {
            customPromptModal.style.display = 'none';
            customPromptOk.removeEventListener('click', onOk);
            customPromptCancel.removeEventListener('click', onCancel);
        };
        customPromptOk.addEventListener('click', onOk);
        customPromptCancel.addEventListener('click', onCancel);
    });
}
function showForwardModal(callback) {
    customPromptTitle.textContent = '메시지 전달';
    customPromptText.innerHTML = '';
    customPromptInput.style.display = 'none';

    const forwardList = document.createElement('div');
    forwardList.className = 'forward-list';
    roomsDataCache.filter(r => r.id !== currentRoomId).forEach(room => {
        let roomTitle = room.title;
        if (room.type === 'private') {
            const otherUserId = room.participantIds.find(id => id !== currentUser.uid);
            roomTitle = room.participantNames[otherUserId] || '알 수 없는 사용자';
        }
        const roomEl = document.createElement('div');
        roomEl.className = 'forward-item';
        roomEl.textContent = roomTitle;
        roomEl.onclick = () => {
            callback(room.id);
            cleanup();
        };
        forwardList.appendChild(roomEl);
    });
    customPromptText.appendChild(forwardList);
    
    customPromptOk.style.display = 'none';
    customPromptCancel.textContent = '취소';
    customPromptCancel.style.display = 'inline-block';
    customPromptModal.style.display = 'flex';
    
    const onCancel = () => cleanup();
    const cleanup = () => {
        customPromptModal.style.display = 'none';
        customPromptOk.style.display = 'inline-block';
        customPromptCancel.removeEventListener('click', onCancel);
    };
    customPromptCancel.addEventListener('click', onCancel);
}

// =================================================================================
// --- MAIN APPLICATION LOGIC ---
// =================================================================================

auth.onAuthStateChanged(user => {
    if (userRoomsUnsubscribe) userRoomsUnsubscribe();
    if (user) {
        if (!user.displayName) { window.location.href = 'setup.html'; return; }
        currentUser = user;
        initializeApp();
    } else { auth.signInAnonymously(); }
});

function initializeApp() {
    attachEventListeners();
    listenForUserRooms();
    setupFCM();
}

function attachEventListeners() {
    profileBtn.addEventListener('click', showMyProfile);
    newRoomBtn.addEventListener('click', createNewGroupRoom);
    joinRoomBtn.addEventListener('click', joinGroupById);
    privateChatBtn.addEventListener('click', startPrivateChat);
    searchBar.addEventListener('input', handleSearch);
    roomInfoDiv.addEventListener('click', showRoomInfo);
    deleteRoomBtn.addEventListener('click', deleteRoomForSelf);
    inputForm.addEventListener('submit', handleSendMessage);
    imageAttachBtn.addEventListener('click', () => imageInput.click());
    fileAttachBtn.addEventListener('click', () => fileInput.click());
    imageInput.addEventListener('change', handleImageUpload);
    fileInput.addEventListener('change', handleFileUpload);
    messageInput.addEventListener('input', updateTypingStatus);
    backButton.addEventListener('click', goBackToRoomList);
    chatMessages.addEventListener('scroll', markVisibleMessagesAsRead);
    participantModal.addEventListener('click', (e) => { if (e.target === participantModal) hideParticipantModal(); });
    modalCloseBtn.addEventListener('click', hideParticipantModal);
    editMessageModal.addEventListener('click', (e) => { if (e.target === editMessageModal) hideEditModal(); });
    editModalCloseBtn.addEventListener('click', hideEditModal);
    editMessageCancelBtn.addEventListener('click', hideEditModal);
    editMessageForm.addEventListener('submit', handleEditMessage);
    editRoomBtn.addEventListener('click', editRoomName);
    adminDeleteRoomBtn.addEventListener('click', deleteRoomAsAdmin);
}

// --- FCM Setup ---
function setupFCM() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                return messaging.getToken();
            }
            return null;
        }).then(token => {
            if (token) {
                console.log("FCM Token:", token);
                db.collection('users').doc(currentUser.uid).set({ 
                    fcmToken: token 
                }, { merge: true });
            }
        }).catch(error => {
            console.error("Error with FCM:", error);
        });

        messaging.onMessage((payload) => {
            console.log('Message received while app is in foreground. ', payload);
        });
    } else {
        console.warn("Push notifications are not supported in this browser.");
    }
}

// --- Room List & Selection ---
function listenForUserRooms() {
    const roomsQuery = db.collection('chatrooms').where('participantIds', 'array-contains', currentUser.uid);
    userRoomsUnsubscribe = roomsQuery.onSnapshot(async (roomsSnapshot) => {
        const mutesRef = db.collection('mutes').doc(currentUser.uid).collection('rooms');
        const mutesSnapshot = await mutesRef.get();
        const mutesMap = new Map(mutesSnapshot.docs.map(doc => [doc.id, doc.data().muted]));
        roomsDataCache = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isMuted: mutesMap.get(doc.id) || false }));
        renderRoomList(roomsDataCache);
    }, (error) => {
        console.error("Error listening for user rooms:", error);
    });
}

function renderRoomList(rooms) {
    roomList.innerHTML = '';
    if (rooms.length === 0) { roomList.innerHTML = '<p class="empty-list-message">채팅이 없습니다.</p>'; return; }
    rooms.sort((a, b) => (b.lastMessage?.timestamp?.toMillis() || 0) - (a.lastMessage?.timestamp?.toMillis() || 0));
    rooms.forEach(room => {
        const roomItem = document.createElement('div');
        roomItem.className = 'room-item';
        if (room.id === currentRoomId) roomItem.classList.add('active');
        roomItem.dataset.roomId = room.id;
        roomItem.onclick = () => selectRoom(room.id, room.isMuted);
        let roomTitle = room.title;
        if (room.type === 'private') {
            const otherUserId = room.participantIds.find(id => id !== currentUser.uid);
            roomTitle = room.participantNames[otherUserId] || '알 수 없는 사용자';
        }
        const lastMsgTime = room.lastMessage?.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
        const lastMsgText = room.lastMessage?.text || '메시지가 없습니다';
        roomItem.innerHTML = `<div class="room-details"><div class="room-item-header"><h2 class="room-item-title">${roomTitle}</h2><time class="room-item-timestamp">${lastMsgTime}</time></div><div class="room-item-preview">${lastMsgText}</div></div><button class="mute-button ${room.isMuted ? 'muted' : ''}" data-room-id="${room.id}">${room.isMuted ? '🔇' : '🔊'}</button>`;
        const muteButton = roomItem.querySelector('.mute-button');
        muteButton.onclick = (e) => { e.stopPropagation(); toggleMute(room.id); };
        roomList.appendChild(roomItem);
    });
}

function selectRoom(roomId, isMuted) {
    if (currentRoomId === roomId) return;
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
    if (typingTimeout) clearTimeout(typingTimeout);
    currentRoomId = roomId; lastSenderId = null; lastMessageDate = null;
    chatPlaceholder.style.display = 'none'; chatView.style.display = 'flex';
    chatMessages.innerHTML = '';
    document.querySelectorAll('.room-item.active').forEach(el => el.classList.remove('active'));
    document.querySelector(`.room-item[data-room-id="${roomId}"]`)?.classList.add('active');
    sidebar.classList.add('mobile-hidden');
    const roomData = roomsDataCache.find(r => r.id === roomId);
    if (!roomData) return;
    if (roomData.type === 'private') {
        const otherUserId = roomData.participantIds.find(id => id !== currentUser.uid);
        roomTitleElem.textContent = roomData.participantNames[otherUserId] || '알 수 없는 사용자';
    } else {
        roomTitleElem.textContent = roomData.title;
    }
    listenForMessages(roomId, isMuted);
    listenForTyping(roomId);
}

function goBackToRoomList() {
    sidebar.classList.remove('mobile-hidden');
    resetChatView();
}

function resetChatView() {
    currentRoomId = null;
    chatView.style.display = 'none';
    chatPlaceholder.style.display = 'flex';
    document.querySelectorAll('.room-item.active').forEach(el => el.classList.remove('active'));
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
}

async function toggleMute(roomId) {
    const room = roomsDataCache.find(r => r.id === roomId);
    if (!room) return;
    const muteRef = db.collection('mutes').doc(currentUser.uid).collection('rooms').doc(roomId);
    try { await muteRef.set({ muted: !room.isMuted }); } catch (error) { console.error("Failed to toggle mute:", error); }
}

// --- Chat Message Handling ---
function listenForMessages(roomId, isMuted) {
    const messagesQuery = db.collection('chatrooms').doc(roomId).collection('messages').orderBy('timestamp');
    messagesUnsubscribe = messagesQuery.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const msgData = doc.data();
            if (change.type === 'added') {
                displayOrUpdateMessage(doc.id, msgData, true);
                if (msgData.senderId !== currentUser.uid && !msgData.deliveredTo.includes(currentUser.uid)) {
                    db.collection('chatrooms').doc(roomId).collection('messages').doc(doc.id).update({
                        deliveredTo: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                    });
                }
            }
            if (change.type === 'modified') {
                displayOrUpdateMessage(doc.id, msgData, false);
            }
            if (change.type === 'removed') {
                const messageEl = document.getElementById(doc.id);
                if (messageEl) messageEl.closest('.message-wrapper').remove();
            }
        });
        markVisibleMessagesAsRead();
        scrollToBottom();
    }, (error) => {
        console.error("Error listening for messages:", error);
    });
}

function displayOrUpdateMessage(docId, msg, isNew) {
    const msgDate = msg.timestamp?.toDate();
    if (isNew && msgDate && (!lastMessageDate || msgDate.toDateString() !== lastMessageDate.toDateString())) {
        const separator = document.createElement('div');
        separator.className = 'date-separator';
        separator.textContent = getFormattedDate(msgDate);
        chatMessages.appendChild(separator);
        lastMessageDate = msgDate;
    }

    const existingMessageEl = document.getElementById(docId);
    if (existingMessageEl) {
        const textEl = existingMessageEl.querySelector('.message-text');
        if (textEl && msg.text && textEl.textContent !== msg.text) { textEl.textContent = msg.text; }
        const editedIndicator = existingMessageEl.querySelector('.edited-indicator');
        if (msg.isEdited && !editedIndicator) {
            const indicator = document.createElement('span');
            indicator.className = 'edited-indicator';
            indicator.textContent = '(수정됨)';
            existingMessageEl.querySelector('.message-meta').prepend(indicator);
        }
        updateReceipts(existingMessageEl, msg);
        renderReactions(existingMessageEl, docId, msg.reactions || {});
        return;
    }

    const roomData = roomsDataCache.find(r => r.id === currentRoomId);
    if (!roomData) return;
    const isSentByCurrentUser = msg.senderId === currentUser.uid;
    const wrapperDiv = document.createElement('div'); wrapperDiv.className = 'message-wrapper';

    if (roomData.type === 'group' && !isSentByCurrentUser) {
        if (!lastSenderId || lastSenderId !== msg.senderId) {
            const nameEl = document.createElement('div'); nameEl.className = 'sender-name'; nameEl.textContent = msg.senderName || 'Anonymous';
            wrapperDiv.appendChild(nameEl);
        }
    }
    lastSenderId = msg.senderId;
    const messageDiv = document.createElement('div');
    messageDiv.id = docId; messageDiv.classList.add('message', isSentByCurrentUser ? 'sent' : 'received');

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';
    const reactionBtn = document.createElement('button'); reactionBtn.textContent = '😀'; reactionBtn.title = '반응';
    reactionBtn.onclick = () => handleReaction(docId, '👍');
    actionsDiv.appendChild(reactionBtn);
    if (isSentByCurrentUser) {
        if (msg.text) {
            const editBtn = document.createElement('button'); editBtn.textContent = '✏️'; editBtn.title = '수정';
            editBtn.onclick = () => showEditModal(docId, msg.text);
            actionsDiv.appendChild(editBtn);
        }
        const deleteBtn = document.createElement('button'); deleteBtn.textContent = '🗑️'; deleteBtn.title = '삭제';
        deleteBtn.onclick = () => deleteMessageForEveryone(docId);
        actionsDiv.appendChild(deleteBtn);
    }
    const forwardBtn = document.createElement('button'); forwardBtn.textContent = '↪️'; forwardBtn.title = '전달';
    forwardBtn.onclick = () => forwardMessage(msg);
    actionsDiv.appendChild(forwardBtn);
    messageDiv.appendChild(actionsDiv);

    if (msg.forwardedFrom) {
        const forwardedEl = document.createElement('div');
        forwardedEl.className = 'forwarded-info';
        forwardedEl.textContent = `↪️ 전달된 메시지`;
        messageDiv.appendChild(forwardedEl);
    }
    if (msg.base64Image) {
        const el = document.createElement('img'); el.src = msg.base64Image; el.classList.add('message-image'); messageDiv.appendChild(el);
    } else if (msg.fileUrl && msg.fileName) {
        const el = document.createElement('a'); el.href = msg.fileUrl; el.textContent = `📄 ${msg.fileName}`; el.className = 'file-link'; el.target = '_blank'; messageDiv.appendChild(el);
    } else if (msg.text) {
        const el = document.createElement('p'); el.classList.add('message-text'); el.textContent = msg.text; messageDiv.appendChild(el);
    }
    
    renderReactions(messageDiv, docId, msg.reactions || {});
    
    const metaDiv = document.createElement('div'); metaDiv.className = 'message-meta';
    if (msg.isEdited) {
        const editedIndicator = document.createElement('span');
        editedIndicator.className = 'edited-indicator';
        editedIndicator.textContent = '(수정됨)';
        metaDiv.appendChild(editedIndicator);
    }
    const timestampSpan = document.createElement('span'); timestampSpan.classList.add('message-timestamp');
    if (msgDate) timestampSpan.textContent = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    metaDiv.appendChild(timestampSpan);
    if (isSentByCurrentUser) {
        const receiptSpan = document.createElement('span'); receiptSpan.className = 'read-receipt';
        metaDiv.appendChild(receiptSpan); updateReceipts(messageDiv, msg);
    }
    messageDiv.appendChild(metaDiv); wrapperDiv.appendChild(messageDiv);
    
    const typingIndicator = chatMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
        chatMessages.insertBefore(wrapperDiv, typingIndicator);
    } else {
        chatMessages.appendChild(wrapperDiv);
    }
}

function updateReceipts(messageEl, msgData) {
    const roomData = roomsDataCache.find(r => r.id === currentRoomId);
    if (!roomData || msgData.senderId !== currentUser.uid) return;
    const receiptSpan = messageEl.querySelector('.read-receipt');
    if (!receiptSpan) return;
    const totalParticipants = roomData.participantIds.length;
    const readCount = msgData.readBy?.length || 0;
    const deliveredCount = msgData.deliveredTo?.length || 0;
    receiptSpan.classList.remove('sent', 'delivered', 'read-by-all');
    if (readCount >= totalParticipants) {
        receiptSpan.classList.add('read-by-all');
    } else if (deliveredCount >= totalParticipants) {
        receiptSpan.classList.add('delivered');
    } else {
        receiptSpan.classList.add('sent');
    }
}

async function sendMessage(content, targetRoomId = currentRoomId) {
    const { text = '', base64Image = null, fileUrl = null, fileName = null, forwardedFrom = null } = content;
    const messageData = { 
        senderId: currentUser.uid, 
        senderName: currentUser.displayName, 
        text, 
        base64Image, 
        fileUrl, 
        fileName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
        deliveredTo: [currentUser.uid], 
        readBy: [currentUser.uid],
        isEdited: false, 
        reactions: {}, 
        forwardedFrom
    };
    const roomRef = db.collection('chatrooms').doc(targetRoomId);
    const batch = db.batch();
    batch.set(roomRef.collection('messages').doc(), messageData);
    batch.update(roomRef, { 
        lastMessage: { 
            text: text || (base64Image ? '📷 사진' : (fileUrl ? '📄 파일' : '메시지')), 
            timestamp: firebase.firestore.FieldValue.serverTimestamp() 
        } 
    });
    await batch.commit();
}

async function markVisibleMessagesAsRead() {
    if (!currentRoomId) return;
    const unreadMessages = chatMessages.querySelectorAll('.message.received:not([data-read="true"])');
    if (unreadMessages.length === 0) return;
    const batch = db.batch();
    let updatesMade = 0;
    const roomRef = db.collection('chatrooms').doc(currentRoomId);
    unreadMessages.forEach(msgDiv => {
        const rect = msgDiv.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            const messageRef = roomRef.collection('messages').doc(msgDiv.id);
            batch.update(messageRef, { readBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
            msgDiv.dataset.read = "true";
            updatesMade++;
        }
    });
    if (updatesMade > 0) {
        batch.commit().catch(err => console.error("Failed to mark messages as read:", err));
    }
}

async function handleEditMessage(e) {
    e.preventDefault();
    const newText = editMessageInput.value.trim();
    if (newText && messageIdToEdit) {
        const messageRef = db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageIdToEdit);
        try {
            await messageRef.update({ text: newText, isEdited: true });
            hideEditModal();
        } catch (error) { console.error("Error editing message:", error); showCustomAlert("오류", "메시지 수정에 실패했습니다."); }
    }
}

async function deleteMessageForEveryone(messageId) {
    try {
        const confirmation = await showConfirmationModal("메시지 삭제", "이 메시지를 모든 대화 상대에게서 삭제하시겠습니까?");
        if (confirmation) {
            await db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageId).delete();
        }
    } catch (error) { if (error) console.error("Error deleting message:", error); }
}

function handleSendMessage(e) { 
    e.preventDefault(); 
    const text = messageInput.value.trim(); 
    if (text) { 
        sendMessage({ text }); 
        messageInput.value = ''; 
        updateTypingStatus(false); 
    } 
}

function handleImageUpload(e) { 
    const file = e.target.files[0]; 
    if (file) { 
        const reader = new FileReader(); 
        reader.onload = (event) => sendMessage({ base64Image: event.target.result }); 
        reader.readAsDataURL(file); 
        e.target.value = ''; 
    } 
}

function handleFileUpload(e) { 
    const file = e.target.files[0]; 
    if (!file || !currentRoomId) return;
    
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`chatrooms/${currentRoomId}/files/${Date.now()}_${file.name}`);
    
    const uploadTask = fileRef.put(file);
    
    uploadTask.on('state_changed',
        null,
        error => console.error("Upload failed:", error),
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then(url => {
                sendMessage({
                    fileUrl: url,
                    fileName: file.name
                });
            });
        }
    );
    e.target.value = '';
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredRooms = roomsDataCache.filter(room => {
        let roomTitle = room.title || '';
        if (room.type === 'private') {
            const otherUserId = room.participantIds.find(id => id !== currentUser.uid);
            roomTitle = room.participantNames[otherUserId] || '';
        }
        return roomTitle.toLowerCase().includes(searchTerm);
    });
    renderRoomList(filteredRooms);
}

// --- Reactions, Forwarding, Typing ---
function renderReactions(messageDiv, messageId, reactions) {
    let container = messageDiv.querySelector('.reactions-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'reactions-container';
        messageDiv.appendChild(container);
    }
    container.innerHTML = '';
    Object.entries(reactions).forEach(([emoji, uids]) => {
        if (uids.length > 0) {
            const reactionChip = document.createElement('span');
            reactionChip.className = 'reaction-chip';
            reactionChip.textContent = `${emoji} ${uids.length}`;
            if (uids.includes(currentUser.uid)) reactionChip.classList.add('mine');
            reactionChip.onclick = () => handleReaction(messageId, emoji);
            container.appendChild(reactionChip);
        }
    });
}
async function handleReaction(messageId, emoji) {
    const messageRef = db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageId);
    const doc = await messageRef.get();
    if (!doc.exists) return;
    const uidsForEmoji = doc.data().reactions?.[emoji] || [];
    const updateField = `reactions.${emoji}`;
    if (uidsForEmoji.includes(currentUser.uid)) {
        await messageRef.update({ [updateField]: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    } else {
        await messageRef.update({ [updateField]: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    }
}
async function forwardMessage(messageData) {
    showForwardModal(async (targetRoomId) => {
        const content = {
            text: messageData.text || '', 
            base64Image: messageData.base64Image || null,
            fileUrl: messageData.fileUrl || null, 
            fileName: messageData.fileName || null,
            forwardedFrom: roomsDataCache.find(r => r.id === currentRoomId)?.title || 'A chat'
        };
        await sendMessage(content, targetRoomId);
        showCustomAlert("성공", "메시지를 전달했습니다.");
    });
}

let lastTypingUpdate = 0;
function updateTypingStatus() {
    if (!currentRoomId) return;
    const now = Date.now();
    if (now - lastTypingUpdate < 2000) return;
    lastTypingUpdate = now;
    
    const isTyping = messageInput.value.trim().length > 0;
    const typingRef = db.collection('chatrooms').doc(currentRoomId);
    
    if (isTyping) {
        typingRef.update({ 
            typing: firebase.firestore.FieldValue.arrayUnion(currentUser.displayName) 
        });
    } else {
        typingRef.update({ 
            typing: firebase.firestore.FieldValue.arrayRemove(currentUser.displayName) 
        });
    }
}

function listenForTyping(roomId) {
    typingUnsubscribe = db.collection('chatrooms').doc(roomId).onSnapshot(doc => {
        const typingUsers = doc.data()?.typing?.filter(name => name !== currentUser.displayName);
        let indicator = chatMessages.querySelector('.typing-indicator');
        if (typingUsers && typingUsers.length > 0) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'typing-indicator';
                chatMessages.appendChild(indicator);
            }
            indicator.textContent = `${typingUsers.join(', ')} 님이 입력 중...`;
            scrollToBottom();
        } else if (indicator) {
            indicator.remove();
        }
    });
}

// --- Room Creation, Info & Deletion ---
function showMyProfile() {
    customPromptTitle.textContent = '내 프로필';
    customPromptText.innerHTML = `이름: ${currentUser.displayName}<br><br>사용자 ID:<br><span class="user-id-text">${currentUser.uid}</span>`;
    customPromptInput.style.display = 'none';
    const actionsDiv = customPromptModal.querySelector('.modal-actions');
    actionsDiv.innerHTML = ''; 

    const copyBtn = document.createElement('button'); copyBtn.className = 'modal-button primary'; copyBtn.textContent = 'ID 복사';
    const logoutBtn = document.createElement('button'); logoutBtn.className = 'modal-button danger'; logoutBtn.textContent = '로그아웃';
    const closeBtn = document.createElement('button'); closeBtn.className = 'modal-button secondary'; closeBtn.textContent = '닫기';

    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(logoutBtn);
    actionsDiv.appendChild(closeBtn);
    customPromptModal.style.display = 'flex';

    const onCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentUser.uid).then(() => {
                showCustomAlert("복사 완료", "사용자 ID가 클립보드에 복사되었습니다.");
            }).catch(() => { showCustomAlert("복사 실패", "클립보드에 복사할 수 없습니다."); });
        } else {
            showCustomAlert("복사 실패", "이 브라우저에서는 클립보드 복사를 지원하지 않습니다.");
        }
    };
    const onLogout = async () => {
        try { await auth.signOut(); cleanup(); } catch (error) { console.error("Logout failed:", error); }
    };
    const onClose = () => cleanup();
    const cleanup = () => {
        customPromptModal.style.display = 'none';
        copyBtn.removeEventListener('click', onCopy);
        logoutBtn.removeEventListener('click', onLogout);
        closeBtn.removeEventListener('click', onClose);
    };
    copyBtn.addEventListener('click', onCopy);
    logoutBtn.addEventListener('click', onLogout);
    closeBtn.addEventListener('click', onClose);
}

async function createNewGroupRoom() {
    try {
        const roomName = await showCustomPrompt('새 그룹 채팅방 생성', '그룹 채팅방의 이름을 입력하세요.', '그룹 채팅방 이름');
        if (!roomName) return;
        
        const roomRef = db.collection("chatrooms").doc();
        await roomRef.set({
            title: roomName.trim(),
            creatorId: currentUser.uid,
            type: 'group',
            participantIds: [currentUser.uid],
            participantNames: { [currentUser.uid]: currentUser.displayName },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: null
        });
        
        await db.collection('users').doc(currentUser.uid).collection('rooms').doc(roomRef.id).set({ 
            addedAt: firebase.firestore.FieldValue.serverTimestamp() 
        });
        
        await showCustomAlert('성공!', `그룹 채팅방이 생성되었습니다!`);
        selectRoom(roomRef.id, false);
    } catch (error) { 
        if (error) {
            console.error("그룹 채팅방 생성 오류:", error); 
            showCustomAlert("오류", "채팅방 생성에 실패했습니다. 권한을 확인하세요.");
        }
    }
}

// --- JOIN REQUEST SYSTEM ---
async function joinGroupById() {
    try {
        const roomIdToJoin = await showCustomPrompt('그룹 채팅 참여', '참여할 그룹 채팅방의 ID를 입력하세요.', '채팅방 ID');
        if (!roomIdToJoin) return;
        
        const roomRef = db.collection('chatrooms').doc(roomIdToJoin);
        const roomDoc = await roomRef.get();
        
        if (!roomDoc.exists) { 
            showCustomAlert("오류", "해당 ID의 채팅방을 찾을 수 없습니다."); 
            return; 
        }
        
        const roomData = roomDoc.data();
        if (roomData.type !== 'group') { 
            showCustomAlert("오류", "개인 채팅방에는 ID로 참여할 수 없습니다."); 
            return; 
        }
        
        if (roomData.participantIds.includes(currentUser.uid)) { 
            showCustomAlert("알림", "이미 참여하고 있는 채팅방입니다."); 
            return; 
        }
        
        // Create join request
        await db.collection('joinRequests').add({
            roomId: roomIdToJoin,
            roomName: roomData.title,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            adminId: roomData.creatorId,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showCustomAlert("성공", "가입 요청이 전송되었습니다. 관리자의 승인을 기다려주세요.");
    } catch (error) { 
        if(error) { 
            console.error("그룹 참여 오류:", error); 
            showCustomAlert("오류", "그룹 참여 요청에 실패했습니다: " + error.message); 
        } 
    }
}

// --- ADMIN FUNCTIONS ---
function showRoomInfo() {
    const roomData = roomsDataCache.find(r => r.id === currentRoomId);
    if (!roomData) return;
    
    participantList.innerHTML = '';
    const participantIds = roomData.participantIds || [];
    modalTitle.textContent = roomData.title;
    modalRoomIdContainer.style.display = 'block';
    modalRoomIdText.textContent = roomData.id;
    modalRoomIdCopyBtn.onclick = () => { navigator.clipboard.writeText(roomData.id).then(() => { showCustomAlert("복사 완료", "채팅방 ID가 클립보드에 복사되었습니다."); }); };
    
    // Show participants
    const listHeader = document.createElement('h3');
    listHeader.className = 'participant-list-header';
    listHeader.textContent = `참여자 (${participantIds.length}명)`;
    participantList.appendChild(listHeader);
    
    participantIds.forEach(id => {
        const name = roomData.participantNames[id] || '알 수 없는 사용자';
        const item = document.createElement('div'); item.className = 'participant-item';
        const nameSpan = document.createElement('span'); nameSpan.className = 'participant-name'; nameSpan.textContent = name;
        if (id === currentUser.uid) { 
            const selfBadge = document.createElement('span'); 
            selfBadge.className = 'self-badge'; 
            selfBadge.textContent = '나'; 
            nameSpan.appendChild(selfBadge); 
        }
        const idWrapper = document.createElement('div'); idWrapper.className = 'copyable-id-wrapper';
        const idSpan = document.createElement('span'); idSpan.className = 'participant-id'; idSpan.textContent = id;
        const copyBtn = document.createElement('button'); copyBtn.className = 'copy-button'; copyBtn.title = '사용자 ID 복사'; copyBtn.textContent = '📄';
        copyBtn.onclick = () => { navigator.clipboard.writeText(id).then(() => { showCustomAlert("복사 완료", `${name}님의 ID가 복사되었습니다.`); }); };
        idWrapper.appendChild(idSpan); idWrapper.appendChild(copyBtn);
        
        // Show remove button only for admin and non-self users
        if (roomData.creatorId === currentUser.uid && id !== currentUser.uid) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-user-btn';
            removeBtn.textContent = '강퇴';
            removeBtn.onclick = () => removeParticipant(id, name);
            idWrapper.appendChild(removeBtn);
        }
        
        item.appendChild(nameSpan); item.appendChild(idWrapper);
        participantList.appendChild(item);
    });
    
    // Show admin controls if current user is admin
    if (roomData.creatorId === currentUser.uid) {
        adminControls.style.display = 'block';
        
        // Show pending join requests
        const requestsHeader = document.createElement('h3');
        requestsHeader.className = 'participant-list-header';
        requestsHeader.textContent = '가입 요청';
        participantList.appendChild(requestsHeader);
        
        const requestsQuery = db.collection('joinRequests')
            .where('roomId', '==', currentRoomId)
            .where('status', '==', 'pending')
            .orderBy('timestamp', 'desc');
        
        requestsQuery.get().then(snapshot => {
            if (snapshot.empty) {
                const noRequests = document.createElement('p');
                noRequests.className = 'empty-requests';
                noRequests.textContent = '대기 중인 요청이 없습니다.';
                participantList.appendChild(noRequests);
            } else {
                snapshot.forEach(doc => {
                    const request = doc.data();
                    const requestItem = document.createElement('div');
                    requestItem.className = 'participant-item';
                    requestItem.innerHTML = `
                        <div>
                            <strong>${request.userName}</strong>
                            <p>가입 요청 보냄</p>
                        </div>
                        <div class="request-actions">
                            <button class="accept-request" data-request-id="${doc.id}">수락</button>
                            <button class="reject-request" data-request-id="${doc.id}">거절</button>
                        </div>
                    `;
                    participantList.appendChild(requestItem);
                    
                    // Add event listeners
                    requestItem.querySelector('.accept-request').addEventListener('click', () => handleJoinRequest(doc.id, 'accepted'));
                    requestItem.querySelector('.reject-request').addEventListener('click', () => handleJoinRequest(doc.id, 'rejected'));
                });
            }
        });
    } else {
        adminControls.style.display = 'none';
    }
    
    participantModal.style.display = 'flex';
}

async function handleJoinRequest(requestId, status) {
    try {
        const requestRef = db.collection('joinRequests').doc(requestId);
        const requestDoc = await requestRef.get();
        const requestData = requestDoc.data();
        
        if (status === 'accepted') {
            // Add user to room
            const roomRef = db.collection('chatrooms').doc(requestData.roomId);
            await roomRef.update({
                participantIds: firebase.firestore.FieldValue.arrayUnion(requestData.userId),
                [`participantNames.${requestData.userId}`]: requestData.userName
            });
            
            // Add room to user's rooms
            await db.collection('users').doc(requestData.userId).collection('rooms').doc(requestData.roomId).set({
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Notify user
            sendNotification(requestData.userId, {
                title: '가입 요청 수락됨',
                body: `"${requestData.roomName}" 그룹에 가입되었습니다!`,
                roomId: requestData.roomId
            });
        } else {
            // Notify user about rejection
            sendNotification(requestData.userId, {
                title: '가입 요청 거절됨',
                body: `"${requestData.roomName}" 그룹 가입 요청이 거절되었습니다`,
                roomId: requestData.roomId
            });
        }
        
        // Update request status
        await requestRef.update({ status });
        
        // Refresh room info
        showRoomInfo();
    } catch (error) {
        console.error("요청 처리 오류:", error);
        showCustomAlert("오류", "요청 처리에 실패했습니다.");
    }
}

async function sendNotification(userId, payload) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().fcmToken) {
            const message = {
                token: userDoc.data().fcmToken,
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: {
                    roomId: payload.roomId
                }
            };
            
            // Send via FCM
            if (messaging) {
                await messaging.send(message);
            }
        }
    } catch (error) {
        console.error("알림 전송 실패:", error);
    }
}

async function editRoomName() {
    try {
        const newName = await showCustomPrompt('채팅방 이름 변경', '새 채팅방 이름을 입력하세요', '채팅방 이름');
        if (newName) {
            await db.collection('chatrooms').doc(currentRoomId).update({
                title: newName
            });
            showRoomInfo(); // Refresh modal
            roomTitleElem.textContent = newName; // Update header
        }
    } catch (error) {
        console.error("채팅방 이름 변경 오류:", error);
        showCustomAlert("오류", "이름 변경에 실패했습니다.");
    }
}

async function deleteRoomAsAdmin() {
    try {
        const confirmation = await showConfirmationModal('채팅방 삭제', '이 채팅방을 삭제하시겠습니까? 모든 메시지가 영구 삭제됩니다.');
        if (confirmation) {
            // Delete room and all messages
            await db.collection('chatrooms').doc(currentRoomId).delete();
            
            // Delete all user references to this room
            const usersSnapshot = await db.collection('users').get();
            const batch = db.batch();
            
            usersSnapshot.forEach(userDoc => {
                const userRoomRef = db.collection('users').doc(userDoc.id).collection('rooms').doc(currentRoomId);
                batch.delete(userRoomRef);
            });
            
            await batch.commit();
            
            hideParticipantModal();
            resetChatView();
        }
    } catch(error) { 
        console.error("채팅방 삭제 오류:", error);
        showCustomAlert("오류", "채팅방 삭제에 실패했습니다.");
    }
}

async function startPrivateChat() {
    try {
        const targetUid = await showCustomPrompt('1:1 채팅 시작', '채팅할 상대방의 사용자 ID를 입력하세요.', '사용자 ID');
        if (!targetUid) return;
        
        if (targetUid === currentUser.uid) { 
            showCustomAlert("오류", "자기 자신과는 채팅할 수 없습니다."); 
            return; 
        }
        
        const targetUserDoc = await db.collection('users').doc(targetUid).get();
        if (!targetUserDoc.exists) { 
            showCustomAlert("오류", "해당 ID의 사용자를 찾을 수 없습니다."); 
            return; 
        }
        
        const targetUserName = targetUserDoc.data().displayName;
        const privateRoomId = [currentUser.uid, targetUid].sort().join('_');
        const roomRef = db.collection('chatrooms').doc(privateRoomId);
        
        await roomRef.set({
            type: 'private',
            participantIds: [currentUser.uid, targetUid],
            participantNames: { 
                [currentUser.uid]: currentUser.displayName, 
                [targetUid]: targetUserName 
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: null
        }, { merge: true });
        
        await db.collection('users').doc(currentUser.uid).collection('rooms').doc(privateRoomId).set({ 
            addedAt: firebase.firestore.FieldValue.serverTimestamp() 
        });
        
        await db.collection('users').doc(targetUid).collection('rooms').doc(privateRoomId).set({ 
            addedAt: firebase.firestore.FieldValue.serverTimestamp() 
        });
        
        selectRoom(privateRoomId, false);
    } catch (error) { 
        if (error) { 
            console.error("1:1 채팅 시작 오류:", error); 
            showCustomAlert("오류", "1:1 채팅 시작에 실패했습니다. 권한을 확인하세요."); 
        } 
    }
}

async function removeParticipant(userId, userName) {
    try {
        const confirmation = await showConfirmationModal("멤버 삭제", `${userName}님을 그룹에서 삭제하시겠습니까?`);
        if (!confirmation) return;
        const roomRef = db.collection('chatrooms').doc(currentRoomId);
        await roomRef.update({
            participantIds: firebase.firestore.FieldValue.arrayRemove(userId),
            [`participantNames.${userId}`]: firebase.firestore.FieldValue.delete()
        });
        await db.collection('users').doc(userId).collection('rooms').doc(currentRoomId).delete();
        showCustomAlert("성공", `${userName}님을 삭제했습니다.`);
        showRoomInfo();
    } catch(error) { if (error) console.error("Error removing participant:", error); }
}

async function deleteRoomForSelf() {
    if (!currentRoomId) return;
    try {
        const confirmation = await showConfirmationModal('채팅방 나가기', `"${roomTitleElem.textContent}" 채팅방에서 나가시겠습니까?\n이 작업은 되돌릴 수 없으며, 나의 대화 내역이 모두 삭제됩니다.`);
        if (!confirmation) return;
        const userRoomRef = db.collection('users').doc(currentUser.uid).collection('rooms').doc(currentRoomId);
        await userRoomRef.delete();
        resetChatView();
    } catch(error) { if(error) console.error("Error leaving room:", error); }
}