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

// Placeholder images
const PLACEHOLDER_IMAGE_40 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="100%" height="100%" fill="lightgray"/></svg>';
const PLACEHOLDER_IMAGE_100 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="#aaa">👤</text></svg>';


// --- Safety Check & Initialization ---
if (typeof firebase === 'undefined') {
    document.body.innerHTML = `<div style="text-align: center; padding: 40px;"><h1>Connection Error</h1><p>Could not load necessary resources. Please check your internet connection and try again.</p><button onclick="window.location.reload()">Retry</button></div>`;
    throw new Error("Firebase SDK not loaded");
}
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const messaging = firebase.messaging();

// --- Global State ---
let currentUser = null, currentRoomId = null, roomsDataCache = [],
    userRoomsUnsubscribe = null, messagesUnsubscribe = null, roomDetailsUnsubscribe = null, typingUnsubscribe = null,
    roomMembersUnsubscribe = null, // For live member list
    lastSenderId = null, messageIdToEdit = null, lastMessageDate = null, typingTimeout = null,
    lastVisibleMessage = null, isFetchingMessages = false, currentUserRole = 'member',
    currentUserProfileData = {}, activeReply = null;

// --- DOM Elements ---
const dom = {
    body: document.body,
    sidebar: document.querySelector('.sidebar'), roomList: document.querySelector('.room-list'),
    searchBar: document.getElementById('search-bar'), profileBtn: document.getElementById('profile-btn'),
    newRoomBtn: document.getElementById('new-room-btn'), joinRoomBtn: document.getElementById('join-room-btn'),
    privateChatBtn: document.getElementById('private-chat-btn'), darkModeToggle: document.getElementById('dark-mode-toggle'),
    chatArea: document.querySelector('.chat-area'), chatPlaceholder: document.querySelector('.chat-placeholder'),
    chatView: document.querySelector('.chat-view'), roomInfoDiv: document.querySelector('.room-info'),
    roomTitleElem: document.querySelector('.room-title'), roomStatusElem: document.querySelector('.room-status'),
    deleteRoomBtn: document.getElementById('delete-room-btn'), chatMessages: document.querySelector('.chat-messages'),
    messageSearchInput: document.getElementById('message-search-input'), // For in-room search
    inputForm: document.querySelector('.chat-input-area'), messageInput: document.querySelector('.message-input'),
    imageAttachBtn: document.getElementById('image-attach-btn'), fileAttachBtn: document.getElementById('file-attach-btn'),
    imageInput: document.getElementById('image-input'), fileInput: document.getElementById('file-input'),
    backButton: document.querySelector('.back-button.mobile-only'),
    participantModal: document.getElementById('participant-modal'), modalCloseBtn: document.getElementById('modal-close-btn'),
    modalTitle: document.getElementById('modal-title'), participantList: document.getElementById('participant-list'),
    modalRoomIdContainer: document.getElementById('modal-room-id-container'), modalRoomIdText: document.getElementById('modal-room-id-text'), 
    modalRoomIdCopyBtn: document.getElementById('modal-room-id-copy-btn'),
    adminControls: document.getElementById('admin-controls'), addMemberBtn: document.getElementById('add-member-btn'),
    editRoomBtn: document.getElementById('edit-room-btn'), adminDeleteRoomBtn: document.getElementById('admin-delete-room-btn'),
    replyPreview: document.getElementById('reply-preview'), replyToName: document.querySelector('#reply-preview .reply-to strong'),
    replyToText: document.querySelector('#reply-preview .reply-text'), cancelReplyBtn: document.getElementById('cancel-reply-btn'),
    pinnedMessageContainer: document.getElementById('pinned-message-container'),
    mediaGalleryBtn: document.getElementById('media-gallery-btn'), mediaGalleryModal: document.getElementById('media-gallery-modal'),
    mediaGrid: document.querySelector('#media-gallery-modal .media-grid'),
    editMessageModal: document.getElementById('edit-message-modal'), editMessageForm: document.getElementById('edit-message-form'),
    editMessageInput: document.getElementById('edit-message-input'), editModalCloseBtn: document.getElementById('edit-modal-close-btn'),
    editMessageCancelBtn: document.getElementById('edit-message-cancel'),
    customPromptModal: document.getElementById('custom-prompt-modal'), customPromptTitle: document.getElementById('custom-prompt-title'),
    customPromptText: document.getElementById('custom-prompt-text'), customPromptInput: document.getElementById('custom-prompt-input'),
    customPromptOk: document.getElementById('custom-prompt-ok'), customPromptCancel: document.getElementById('custom-prompt-cancel'),
    memberPicker: document.getElementById('member-picker'), userSearchInput: document.getElementById('user-search'),
    searchResults: document.getElementById('search-results'), selectedMembers: document.getElementById('selected-members'),
    userProfileModal: document.getElementById('user-profile-modal'), userProfileCloseBtn: document.getElementById('user-profile-close-btn'),
    userProfileEditBtn: document.getElementById('user-profile-edit-btn'), userProfilePhoto: document.getElementById('user-profile-photo'),
    profilePhotoInput: document.getElementById('profile-photo-input'), profilePhotoEditOverlay: document.getElementById('profile-photo-edit-overlay'),
    userProfileNameView: document.getElementById('user-profile-name-view'), userProfileNameEdit: document.getElementById('user-profile-name-edit'),
    userProfileStatusView: document.getElementById('user-profile-status-view'), userProfileStatusEdit: document.getElementById('user-profile-status-edit'),
    userProfileEmailView: document.getElementById('user-profile-email-view'), userProfileEmailEdit: document.getElementById('user-profile-email-edit'),
    userProfilePhoneView: document.getElementById('user-profile-phone-view'), userProfilePhoneEdit: document.getElementById('user-profile-phone-edit'),
    userProfileId: document.getElementById('user-profile-id'), profileModalActions: document.getElementById('profile-modal-actions'),
    profileCancelBtn: document.getElementById('profile-cancel-btn'), profileSaveBtn: document.getElementById('profile-save-btn'),
    progressBarContainer: document.createElement('div'),
    progressBar: document.createElement('div')
};

// Initialize progress bar
dom.progressBarContainer.className = 'upload-progress';
dom.progressBarContainer.style.display = 'none';
dom.progressBar.className = 'progress-bar';
dom.progressBarContainer.appendChild(dom.progressBar);
dom.inputForm.insertBefore(dom.progressBarContainer, dom.inputForm.firstChild);

// Helper function to generate search keys
function generateSearchKeys(displayName) {
    const name = displayName.toLowerCase().trim();
    if (!name) return [];
    const keys = new Set();
    const parts = name.split(' ').filter(p => p);
    for (const part of parts) {
        for (let i = 1; i <= part.length; i++) {
            keys.add(part.substring(0, i));
        }
    }
    return Array.from(keys);
}

// --- AUTH & APP START ---
auth.onAuthStateChanged(user => {
    if (user) {
        const userRef = db.collection('users').doc(user.uid);
        userRef.onSnapshot(doc => {
            if (!doc.exists || !doc.data().displayName) { auth.signOut(); return; }
            currentUser = user; 
            currentUserProfileData = doc.data(); 
            if (!userRoomsUnsubscribe) initializeApp();
        }, () => auth.signOut());
    } else {
        if (userRoomsUnsubscribe) userRoomsUnsubscribe();
        userRoomsUnsubscribe = null;
        window.location.href = 'login.html';
    }
});

function initializeApp() {
    setupEventListeners();
    applyTheme();
    listenForUserRooms();
    setupFCM();
    setupPresenceTracking();
    listenForInvitations();
}

// --- CORE FEATURES (THEME, PRESENCE, FCM) ---
function applyTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    dom.body.classList.toggle('dark-mode', isDarkMode);
    dom.darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function toggleTheme() {
    const isDarkMode = dom.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    dom.darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function setupPresenceTracking() {
    if (!currentUser) return;
    const presenceRef = db.collection('presence').doc(currentUser.uid);
    const update = () => presenceRef.set({ lastActiveAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && update());
    window.addEventListener('focus', update);
    update();
}

async function setupFCM() {
    try {
        await Notification.requestPermission();
        const token = await messaging.getToken();
        if (token) {
            await db.collection('users').doc(currentUser.uid).set({ fcmToken: token }, { merge: true });
        }
        messaging.onMessage((payload) => {
            const { title, body } = payload.notification;
            showCustomAlert(title, body);
        });
    } catch (error) { console.error("FCM Error:", error); }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    dom.darkModeToggle.addEventListener('click', toggleTheme);
    dom.profileBtn.addEventListener('click', () => showUserProfile(currentUser.uid, true));
    dom.newRoomBtn.addEventListener('click', createNewGroupRoom);
    dom.joinRoomBtn.addEventListener('click', joinGroupById);
    dom.privateChatBtn.addEventListener('click', startPrivateChat);
    dom.searchBar.addEventListener('input', (e) => renderRoomList(roomsDataCache, e.target.value));
    dom.roomInfoDiv.addEventListener('click', showRoomInfo);
    dom.deleteRoomBtn.addEventListener('click', deleteRoomForSelf);
    dom.inputForm.addEventListener('submit', handleSendMessage);
    dom.imageAttachBtn.addEventListener('click', () => dom.imageInput.click());
    dom.fileAttachBtn.addEventListener('click', () => dom.fileInput.click());
    dom.imageInput.addEventListener('change', handleImageUpload);
    dom.fileInput.addEventListener('change', handleFileUpload);
    dom.messageInput.addEventListener('input', debounce(updateTypingStatus, 500));
    dom.cancelReplyBtn.addEventListener('click', cancelReply);
    dom.chatMessages.addEventListener('scroll', handleChatScroll);
    dom.messageSearchInput.addEventListener('input', debounce(handleMessageSearch, 300));
    dom.backButton.addEventListener('click', goBackToRoomList);
    // Modals
    dom.participantModal.addEventListener('click', (e) => {
        if (e.target === dom.participantModal) {
            dom.participantModal.style.display = 'none';
            if (roomMembersUnsubscribe) roomMembersUnsubscribe();
        }
    });
    dom.modalCloseBtn.addEventListener('click', () => {
        dom.participantModal.style.display = 'none';
        if (roomMembersUnsubscribe) roomMembersUnsubscribe();
    });
    dom.mediaGalleryBtn.addEventListener('click', showMediaGallery);
    dom.mediaGalleryModal.querySelector('.modal-close-btn').addEventListener('click', () => dom.mediaGalleryModal.style.display = 'none');
    dom.editMessageModal.addEventListener('click', (e) => e.target === dom.editMessageModal && hideEditModal());
    dom.editModalCloseBtn.addEventListener('click', hideEditModal);
    dom.editMessageCancelBtn.addEventListener('click', hideEditModal);
    dom.editMessageForm.addEventListener('submit', handleEditMessage);
    // User Profile Modal
    dom.userProfileCloseBtn.addEventListener('click', () => dom.userProfileModal.style.display = 'none');
    dom.userProfileEditBtn.addEventListener('click', () => toggleProfileEditMode(true));
    dom.profileCancelBtn.addEventListener('click', () => toggleProfileEditMode(false));
    dom.profileSaveBtn.addEventListener('click', saveUserProfile);
    dom.profilePhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (event) => dom.userProfilePhoto.src = event.target.result;
            reader.readAsDataURL(file);
        }
    });
    dom.userProfileModal.addEventListener('click', (e) => {
        if(e.target.classList.contains('copy-button')) {
            const field = e.target.dataset.field;
            const textToCopy = document.getElementById(`user-profile-${field}`)?.textContent || document.getElementById(`user-profile-${field}-view`)?.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => showCustomAlert("복사 완료", "클립보드에 복사되었습니다."));
        }
    });
    // Admin & Member Picker
    dom.addMemberBtn.addEventListener('click', addMembersToRoom);
    dom.editRoomBtn.addEventListener('click', editRoomName);
    dom.adminDeleteRoomBtn.addEventListener('click', deleteRoomAsAdmin);
    dom.userSearchInput.addEventListener('input', debounce(handleUserSearch, 300));
}

// --- ROOM LIST & SELECTION ---
function listenForUserRooms() {
    if (userRoomsUnsubscribe) userRoomsUnsubscribe();
    const query = db.collection('users').doc(currentUser.uid).collection('rooms');
    userRoomsUnsubscribe = query.onSnapshot(async userRoomsSnapshot => {
        const roomIds = userRoomsSnapshot.docs.map(doc => doc.id);
        if (roomIds.length === 0) { roomsDataCache = []; renderRoomList([]); return; }

        const readsSnapshot = await db.collection('reads').doc(currentUser.uid).collection('rooms').get();
        const readsMap = new Map(readsSnapshot.docs.map(doc => [doc.id, doc.data().lastReadTimestamp]));

        db.collection('chatrooms').where(firebase.firestore.FieldPath.documentId(), 'in', roomIds)
            .onSnapshot(async (roomsSnapshot) => {
                const rooms = await Promise.all(roomsSnapshot.docs.map(async doc => {
                    const roomData = doc.data();
                    const lastRead = readsMap.get(doc.id);
                    const isUnread = roomData.lastMessage && (!lastRead || roomData.lastMessage.timestamp > lastRead);

                    const [muteDoc, pinDoc] = await Promise.all([
                        db.collection('mutes').doc(currentUser.uid).collection('rooms').doc(doc.id).get(),
                        db.collection('pinnedRooms').doc(currentUser.uid).collection('rooms').doc(doc.id).get()
                    ]);
                    return { id: doc.id, ...doc.data(), isUnread, isMuted: muteDoc.exists, isPinned: pinDoc.exists };
                }));
                roomsDataCache = rooms;
                renderRoomList(roomsDataCache, dom.searchBar.value);
            });
    });
}

function renderRoomList(rooms, filter = '') {
    const searchTerm = filter.toLowerCase();
    const filtered = rooms.filter(room => {
        const otherUserId = room.participantIds.find(id => id !== currentUser.uid);
        const title = room.type === 'private' ? (room.participantNames[otherUserId] || '') : room.title;
        return title.toLowerCase().includes(searchTerm);
    });

    filtered.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (b.lastMessage?.timestamp?.toMillis() || 0) - (a.lastMessage?.timestamp?.toMillis() || 0);
    });

    dom.roomList.innerHTML = filtered.map(room => {
        const otherUserId = room.participantIds.find(id => id !== currentUser.uid);
        const title = room.type === 'private' ? room.participantNames[otherUserId] || '알 수 없는 사용자' : room.title;
        const lastMsgTime = room.lastMessage?.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
        const lastMsgText = room.lastMessage?.text || '메시지가 없습니다';
        return `
            <div class="room-item ${room.id === currentRoomId ? 'active' : ''} ${room.isPinned ? 'pinned' : ''}" data-room-id="${room.id}">
                <div class="room-details">
                    <div class="room-item-header">
                        <h2 class="room-item-title">${title}</h2>
                        <time class="room-item-timestamp">${lastMsgTime}</time>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="room-item-preview">${lastMsgText}</span>
                        ${room.isUnread ? '<div class="unread-badge"></div>' : ''}
                    </div>
                </div>
                <button class="mute-button ${room.isMuted ? 'muted' : ''}" data-room-id="${room.id}" title="음소거"> ${room.isMuted ? '🔇' : '🔊'}</button>
                <button class="pin-button" data-room-id="${room.id}" title="고정"> ${room.isPinned ? '📌' : '📍'}</button>
            </div>`;
    }).join('') || '<p class="empty-list-message">일치하는 채팅방이 없습니다.</p>';

    dom.roomList.querySelectorAll('.room-item').forEach(el => el.addEventListener('click', () => selectRoom(el.dataset.roomId)));
    dom.roomList.querySelectorAll('.mute-button').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(el.dataset.roomId); }));
    dom.roomList.querySelectorAll('.pin-button').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); togglePin(el.dataset.roomId); }));
}

function selectRoom(roomId) {
    if (currentRoomId === roomId) return;
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (roomDetailsUnsubscribe) roomDetailsUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
    cancelReply();
    
    currentRoomId = roomId; 
    lastSenderId = null; 
    lastMessageDate = null; 
    lastVisibleMessage = null;
    isFetchingMessages = false;

    const readsRef = db.collection('reads').doc(currentUser.uid).collection('rooms').doc(roomId);
    readsRef.set({ lastReadTimestamp: firebase.firestore.FieldValue.serverTimestamp() });
    
    dom.chatPlaceholder.style.display = 'none'; 
    dom.chatView.style.display = 'flex';
    dom.chatMessages.innerHTML = '';
    renderRoomList(roomsDataCache, dom.searchBar.value);
    dom.sidebar.classList.add('mobile-hidden');

    const roomData = roomsDataCache.find(r => r.id === roomId);
    if (!roomData) return;

    roomDetailsUnsubscribe = db.collection('chatrooms').doc(roomId).onSnapshot(doc => {
        const data = doc.data();
        if(!data) { resetChatView(); return; }
        
        dom.roomTitleElem.textContent = data.type === 'private'
            ? data.participantNames[data.participantIds.find(id => id !== currentUser.uid)]
            : data.title;
        
        renderPinnedMessage(data.pinnedMessage);
        
        if (data.type === 'private') {
            const otherUserId = data.participantIds.find(id => id !== currentUser.uid);
            db.collection('users').doc(otherUserId).onSnapshot(userDoc => {
                dom.roomStatusElem.textContent = userDoc.data()?.status || '오프라인';
            });
        } else {
            dom.roomStatusElem.textContent = `${data.participantIds.length} 멤버`;
        }
    });
    
    db.collection('chatrooms').doc(roomId).collection('members').doc(currentUser.uid).get().then(doc => {
        currentUserRole = doc.exists ? doc.data().role || 'member' : 'member';
    });
    
    listenForMessages(roomId);
    listenForTyping(roomId);
}

function goBackToRoomList() {
    dom.sidebar.classList.remove('mobile-hidden');
    resetChatView();
}

function resetChatView() {
    currentRoomId = null;
    dom.chatView.style.display = 'none'; dom.chatPlaceholder.style.display = 'flex';
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (roomDetailsUnsubscribe) roomDetailsUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
    renderRoomList(roomsDataCache, dom.searchBar.value);
}

async function toggleMute(roomId) {
    const room = roomsDataCache.find(r => r.id === roomId);
    if (!room) return;
    const muteRef = db.collection('mutes').doc(currentUser.uid).collection('rooms').doc(roomId);
    if (room.isMuted) await muteRef.delete();
    else await muteRef.set({ muted: true });
}

async function togglePin(roomId) {
    const room = roomsDataCache.find(r => r.id === roomId);
    if (!room) return;
    const pinRef = db.collection('pinnedRooms').doc(currentUser.uid).collection('rooms').doc(roomId);
    if (room.isPinned) await pinRef.delete();
    else await pinRef.set({ pinnedAt: firebase.firestore.FieldValue.serverTimestamp() });
}

// --- MESSAGING ---
function listenForMessages(roomId) {
    const query = db.collection('chatrooms').doc(roomId).collection('messages').orderBy('timestamp', 'desc').limit(30);
    messagesUnsubscribe = query.onSnapshot(snapshot => {
        const isInitialLoad = !lastVisibleMessage;
        
        if (isInitialLoad) {
            dom.chatMessages.innerHTML = '';
            lastMessageDate = null;
            snapshot.docs.reverse().forEach(doc => displayMessage(doc.id, doc.data()));
        } else {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    if (change.doc.metadata.hasPendingWrites) return;
                    displayMessage(change.doc.id, change.doc.data());
                }
                if (change.type === 'modified') updateMessage(change.doc.id, change.doc.data());
                if (change.type === 'removed') document.getElementById(change.doc.id)?.closest('.message-wrapper').remove();
            });
        }
        
        if (!snapshot.empty) {
            lastVisibleMessage = snapshot.docs[snapshot.docs.length - 1];
        } else if (isInitialLoad) {
            lastVisibleMessage = null; // No messages in room
        }

        if (isInitialLoad) scrollToBottom();
        markVisibleMessagesAsRead();
    });
}

function createMessageElement(docId, msg) {
    const msgDate = msg.timestamp?.toDate();
    const isSent = msg.senderId === currentUser.uid;
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';

    const roomData = roomsDataCache.find(r => r.id === currentRoomId);
    if (roomData.type === 'group' && !isSent) {
        wrapper.innerHTML += `<div class="sender-name">${msg.senderName || 'Anonymous'}</div>`;
    }

    let contentHTML = '';
    if (msg.forwardedFrom) contentHTML += `<div class="forwarded-info">↪️ 전달된 메시지</div>`;
    if (msg.replyTo) contentHTML += `<div class="reply-context" onclick="scrollToMessage('${msg.replyTo.messageId}')"><strong>${msg.replyTo.senderName}</strong><p>${msg.replyTo.text}</p></div>`;
    if (msg.base64Image) contentHTML += `<img src="${msg.base64Image}" class="message-image" alt="Image">`;
    else if (msg.fileUrl) contentHTML += `<a href="${msg.fileUrl}" target="_blank" download="${msg.fileName}" class="file-link">📄 ${msg.fileName}</a>`;
    else if (msg.text) contentHTML += `<p class="message-text">${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;

    const canEdit = isSent && msg.text;
    const canDelete = isSent || currentUserRole === 'admin';
    const canPin = currentUserRole === 'admin';
    const textForJs = (msg.text || (msg.base64Image ? '사진' : '파일')).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    const messageDiv = document.createElement('div');
    messageDiv.id = docId;
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div class="message-actions">
            <button title="반응" onclick="handleReaction('${docId}', '👍')">😀</button>
            <button title="답장" onclick="startReply('${docId}', '${msg.senderName}', '${textForJs}')">↩️</button>
            <button title="전달" onclick="forwardMessage('${docId}')">↪️</button>
            ${canEdit ? `<button title="수정" onclick="showEditModal('${docId}', '${textForJs}')">✏️</button>` : ''}
            ${canDelete ? `<button title="삭제" onclick="deleteMessage('${docId}')">🗑️</button>` : ''}
            ${canPin ? `<button title="고정" onclick="pinMessage('${docId}')">📌</button>` : ''}
        </div>
        ${contentHTML}
        <div class="reactions-container"></div>
        <div class="message-meta">
            ${msg.isEdited ? `<span class="edited-indicator">(수정됨)</span>` : ''}
            <span class="message-timestamp">${msgDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}</span>
            ${isSent ? `<span class="read-receipt sent"></span>` : ''}
        </div>`;
    
    wrapper.appendChild(messageDiv);
    updateMessage(docId, msg, messageDiv);
    return wrapper;
}

function displayMessage(docId, msg) {
    const msgDate = msg.timestamp?.toDate();
    if (msgDate && (!lastMessageDate || msgDate.toDateString() !== lastMessageDate.toDateString())) {
        const separator = document.createElement('div');
        separator.className = 'date-separator';
        separator.textContent = getFormattedDate(msgDate);
        dom.chatMessages.appendChild(separator);
        lastMessageDate = msgDate;
    }

    const wrapper = createMessageElement(docId, msg);
    lastSenderId = msg.senderId;

    const target = dom.chatMessages.querySelector('.typing-indicator') || null;
    dom.chatMessages.insertBefore(wrapper, target);
}

function updateMessage(docId, msg, element = null) {
    const el = element || document.getElementById(docId);
    if (!el) return;

    if (msg.text) {
        const textEl = el.querySelector('.message-text');
        if (textEl && textEl.innerHTML !== msg.text) textEl.innerHTML = msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    
    renderReactions(el, docId, msg.reactions || {});
    updateReceipts(el, msg);
}

async function fetchMoreMessages() {
    if (!currentRoomId || isFetchingMessages || !lastVisibleMessage) return;

    isFetchingMessages = true;
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    dom.chatMessages.prepend(spinner);
    const oldScrollHeight = dom.chatMessages.scrollHeight;

    try {
        const query = db.collection('chatrooms').doc(currentRoomId).collection('messages')
            .orderBy('timestamp', 'desc')
            .startAfter(lastVisibleMessage)
            .limit(30);

        const snapshot = await query.get();

        if (snapshot.empty) {
            lastVisibleMessage = null;
            return;
        }

        lastVisibleMessage = snapshot.docs[snapshot.docs.length - 1];

        snapshot.docs.reverse().forEach(doc => {
            const messageElement = createMessageElement(doc.id, doc.data());
            dom.chatMessages.insertBefore(messageElement, dom.chatMessages.children[1]);
        });
        
        dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight - oldScrollHeight;
    } catch (error) {
        console.error("Error fetching more messages:", error);
    } finally {
        spinner.remove();
        isFetchingMessages = false;
    }
}

async function handleSendMessage(e) {
    e.preventDefault();
    const text = dom.messageInput.value.trim();
    if (text) { 
        sendMessage({ text }); 
        dom.messageInput.value = ''; 
        cancelReply();
        updateTypingStatus();
    }
}

async function sendMessage(content, targetRoomId = currentRoomId) {
    const { text = '', base64Image = null, fileUrl = null, fileName = null, forwardedFrom = null } = content;
    const messageData = {
        senderId: currentUser.uid,
        senderName: currentUserProfileData.displayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        readBy: [currentUser.uid],
        text, base64Image, fileUrl, fileName, forwardedFrom,
        replyTo: activeReply,
        reactions: {},
        isEdited: false
    };
    
    const roomRef = db.collection('chatrooms').doc(targetRoomId);
    await roomRef.collection('messages').add(messageData);
    await roomRef.update({
        lastMessage: { text: text || (fileName || '사진'), timestamp: messageData.timestamp }
    });
}

// --- MESSAGE FEATURES (REPLY, REACTIONS, STATUS, PIN, TYPING) ---
function startReply(messageId, senderName, text) {
    activeReply = { messageId, senderName, text: text.substring(0, 50) };
    dom.replyToName.textContent = senderName;
    dom.replyToText.textContent = activeReply.text;
    dom.replyPreview.style.display = 'flex';
    dom.messageInput.focus();
}

function cancelReply() {
    activeReply = null;
    dom.replyPreview.style.display = 'none';
}

function renderReactions(msgEl, msgId, reactions) {
    const container = msgEl.querySelector('.reactions-container');
    container.innerHTML = Object.entries(reactions).map(([emoji, uids]) => {
        if (!uids || uids.length === 0) return '';
        const isMine = uids.includes(currentUser.uid);
        return `<span class="reaction-chip ${isMine ? 'mine' : ''}" onclick="handleReaction('${msgId}', '${emoji}')">${emoji} ${uids.length}</span>`;
    }).join('');
}

async function handleReaction(msgId, emoji) {
    const ref = db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(msgId);
    const doc = await ref.get();
    if (!doc.exists) return;
    const uids = doc.data().reactions?.[emoji] || [];
    const updateField = `reactions.${emoji}`;
    if (uids.includes(currentUser.uid)) {
        await ref.update({ [updateField]: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    } else {
        await ref.update({ [updateField]: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    }
}

function updateReceipts(msgEl, msgData) {
    if (msgData.senderId !== currentUser.uid) return;
    const receipt = msgEl.querySelector('.read-receipt');
    if (!receipt) return;
    const room = roomsDataCache.find(r => r.id === currentRoomId);
    if (!room) return;
    const total = room.participantIds.length;
    const readCount = msgData.readBy?.length || 0;
    
    receipt.className = 'read-receipt';
    if (readCount >= total) receipt.classList.add('read-by-all');
    else receipt.classList.add('delivered');
}

async function markVisibleMessagesAsRead() {
    if (!currentRoomId || document.hidden) return;
    const unread = dom.chatMessages.querySelectorAll('.message.received:not([data-read])');
    const batch = db.batch();
    let updates = 0;
    unread.forEach(msgDiv => {
        const rect = msgDiv.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            batch.update(db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(msgDiv.id), {
                readBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            });
            msgDiv.dataset.read = "true";
            updates++;
        }
    });
    if (updates > 0) await batch.commit().catch(console.error);
}

function renderPinnedMessage(pinnedData) {
    dom.pinnedMessageContainer.innerHTML = '';
    if (pinnedData && pinnedData.id) {
        const banner = document.createElement('div');
        banner.className = 'pinned-message-banner';
        banner.innerHTML = `
            <div>📌 <strong>${pinnedData.senderName}</strong>: <p>${pinnedData.text}</p></div>
            ${currentUserRole === 'admin' ? `<button class="unpin-button" onclick="unpinMessage()">&times;</button>` : ''}`;
        banner.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') scrollToMessage(pinnedData.id);
        });
        dom.pinnedMessageContainer.appendChild(banner);
    }
}

async function pinMessage(msgId) {
    const msgRef = db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(msgId);
    const msgDoc = await msgRef.get();
    if (msgDoc.exists) {
        const { senderName, text } = msgDoc.data();
        await db.collection('chatrooms').doc(currentRoomId).update({
            pinnedMessage: { id: msgId, senderName, text: text.substring(0, 100) }
        });
    }
}

async function unpinMessage() {
    await db.collection('chatrooms').doc(currentRoomId).update({
        pinnedMessage: firebase.firestore.FieldValue.delete()
    });
}

function scrollToMessage(msgId) {
    const el = document.getElementById(msgId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.classList.add('highlight');
    setTimeout(() => el?.classList.remove('highlight'), 1500);
}

async function forwardMessage(messageId) {
    const msgRef = db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageId);
    const msgDoc = await msgRef.get();
    if (!msgDoc.exists) return;
    const messageData = msgDoc.data();

    showForwardModal(async (targetRoomId) => {
        const roomData = roomsDataCache.find(r => r.id === currentRoomId);
        const content = {
            text: messageData.text || '',
            base64Image: messageData.base64Image || null,
            fileUrl: messageData.fileUrl || null,
            fileName: messageData.fileName || null,
            forwardedFrom: roomData?.title || 'A chat'
        };
        await sendMessage(content, targetRoomId);
        showCustomAlert("성공", "메시지를 전달했습니다.");
    });
}

async function deleteMessage(messageId) {
    if (await showConfirmationModal("메시지 삭제", "이 메시지를 모든 대화 상대에게서 삭제하시겠습니까?")) {
        await db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageId).delete();
    }
}

async function handleEditMessage(e) {
    e.preventDefault();
    const newText = dom.editMessageInput.value.trim();
    if (newText && messageIdToEdit) {
        await db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageIdToEdit).update({
            text: newText, isEdited: true
        });
        hideEditModal();
    }
}

function updateTypingStatus() {
    if (!currentRoomId) return;
    if (typingTimeout) clearTimeout(typingTimeout);

    const typingRef = db.collection('typing').doc(currentRoomId).collection('users').doc(currentUser.uid);
    if (dom.messageInput.value.trim().length > 0) {
        typingRef.set({ name: currentUserProfileData.displayName });
        typingTimeout = setTimeout(() => {
            typingRef.delete();
            typingTimeout = null;
        }, 3000);
    } else {
        typingRef.delete();
    }
}

function listenForTyping(roomId) {
    typingUnsubscribe = db.collection('typing').doc(roomId).collection('users').onSnapshot(snapshot => {
        const typingUsers = snapshot.docs.map(doc => doc.data().name).filter(name => doc.id !== currentUser.uid);
        let indicator = dom.chatMessages.querySelector('.typing-indicator');
        if (typingUsers.length > 0) {
            if (!indicator) { indicator = document.createElement('div'); indicator.className = 'typing-indicator'; dom.chatMessages.appendChild(indicator); }
            indicator.textContent = `${typingUsers.join(', ')}님이 입력 중...`;
            scrollToBottom();
        } else if (indicator) {
            indicator.remove();
        }
    });
}

// --- MEDIA & UPLOADS ---
async function showMediaGallery() {
    dom.mediaGrid.innerHTML = '<div class="loading-spinner"></div>';
    dom.mediaGalleryModal.style.display = 'flex';
    
    const mediaSnapshot = await db.collection('chatrooms').doc(currentRoomId).collection('messages')
        .where('base64Image', '!=', null)
        .orderBy('base64Image')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
        
    if(mediaSnapshot.empty) {
        dom.mediaGrid.innerHTML = '<p>이 채팅방에는 이미지가 없습니다.</p>';
        return;
    }
    
    dom.mediaGrid.innerHTML = mediaSnapshot.docs.map(doc => {
        const data = doc.data();
        return `<div class="media-item"><img src="${data.base64Image}" alt="Shared media"></div>`;
    }).join('');
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showCustomAlert("파일 크기 초과", "이미지 크기는 5MB를 초과할 수 없습니다."); return; }
    
    compressImage(file).then(compressedImage => {
        sendMessage({ base64Image: compressedImage, fileName: file.name });
        cancelReply();
    }).catch(console.error);
    e.target.value = '';
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { showCustomAlert("파일 크기 초과", "파일 크기는 20MB를 초과할 수 없습니다."); return; }

    const uploadTask = storage.ref(`files/${currentRoomId}/${Date.now()}_${file.name}`).put(file);
    uploadTask.on('state_changed', 
        (snapshot) => {
             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
             dom.progressBar.style.width = progress + '%';
             dom.progressBarContainer.style.display = 'block';
        }, 
        (error) => {
            console.error("Upload failed:", error);
            dom.progressBarContainer.style.display = 'none';
        }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                sendMessage({ fileUrl: downloadURL, fileName: file.name });
                dom.progressBarContainer.style.display = 'none';
                cancelReply();
            });
        }
    );
    e.target.value = '';
}

function compressImage(file, quality = 0.7, maxWidth = 1024) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(ctx.canvas.toDataURL('image/jpeg', quality));
            };
        };
        reader.onerror = error => reject(error);
    });
}

// --- ROOM MANAGEMENT ---
async function createNewGroupRoom() {
    try {
        const roomName = await showCustomPrompt('새 그룹 채팅 생성', '그룹 채팅방의 이름을 입력하세요.', '그룹 채팅방 이름', '다음');
        if (!roomName) return;

        const selectedMemberIds = await showMemberPickerModal('멤버 초대', '채팅방에 초대할 멤버를 선택하세요.');

        const roomRef = db.collection('chatrooms').doc();
        const batch = db.batch();
        const allParticipantIds = [...new Set([...selectedMemberIds, currentUser.uid])];
        
        const participantNames = { [currentUser.uid]: currentUser.displayName };
        const userPromises = selectedMemberIds.map(uid =>
            db.collection('users').doc(uid).get().then(doc => { if (doc.exists) participantNames[uid] = doc.data().displayName; })
        );
        await Promise.all(userPromises);

        batch.set(roomRef, { title: roomName.trim(), type: 'group', createdBy: currentUser.uid, participantIds: allParticipantIds, participantNames, createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastMessage: null });
        batch.set(roomRef.collection('members').doc(currentUser.uid), { role: 'admin', joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
        batch.set(db.collection('users').doc(currentUser.uid).collection('rooms').doc(roomRef.id), { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
        
        selectedMemberIds.forEach(uid => {
            db.collection('invitations').add({ roomId: roomRef.id, roomName: roomName.trim(), userId: uid, invitedBy: currentUser.uid, invitedByName: currentUser.displayName, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        });
        
        await batch.commit();
        showCustomAlert('성공!', `그룹 채팅방이 생성되었습니다! 초대가 전송되었습니다.`);
        selectRoom(roomRef.id);

    } catch (error) { if (error) { console.error("그룹 채팅방 생성 오류:", error); showCustomAlert("오류", `채팅방 생성에 실패했습니다: ${error.message}`); }}
}

async function joinGroupById() {
    try {
        const roomIdToJoin = await showCustomPrompt('그룹 채팅 참여', '참여할 그룹 채팅방의 ID를 입력하세요.', '채팅방 ID', '가입 요청');
        if (!roomIdToJoin) return;
        
        const roomRef = db.collection('chatrooms').doc(roomIdToJoin);
        const roomDoc = await roomRef.get();
        if (!roomDoc.exists) { return showCustomAlert("오류", "해당 ID의 채팅방을 찾을 수 없습니다."); }
        
        const roomData = roomDoc.data();
        if (roomData.type !== 'group') { return showCustomAlert("오류", "개인 채팅방에는 ID로 참여할 수 없습니다."); }
        if (roomData.participantIds.includes(currentUser.uid)) { return showCustomAlert("알림", "이미 참여하고 있는 채팅방입니다."); }
        
        await db.collection('joinRequests').add({ roomId: roomIdToJoin, roomName: roomData.title, userId: currentUser.uid, userName: currentUser.displayName, adminId: roomData.createdBy, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        showCustomAlert("성공", "가입 요청이 전송되었습니다. 관리자의 승인을 기다려주세요.");
    } catch (error) { if (error) { console.error("그룹 참여 오류:", error); showCustomAlert("오류", `그룹 참여 요청에 실패했습니다: ${error.message}`); }}
}

async function startPrivateChat() {
    try {
        const targetUser = await showUserPickerModal('1:1 채팅 시작', '채팅할 상대를 검색하여 선택하세요.');
        if (!targetUser) return;
        
        if (targetUser.id === currentUser.uid) { return showCustomAlert("오류", "자기 자신과는 채팅할 수 없습니다."); }
        
        const privateRoomId = [currentUser.uid, targetUser.id].sort().join('_');
        const roomRef = db.collection('chatrooms').doc(privateRoomId);
        
        await roomRef.set({ type: 'private', participantIds: [currentUser.uid, targetUser.id], participantNames: { [currentUser.uid]: currentUser.displayName, [targetUser.id]: targetUser.displayName }, createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastMessage: null }, { merge: true });
        
        const batch = db.batch();
        batch.set(db.collection('users').doc(currentUser.uid).collection('rooms').doc(privateRoomId), { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
        batch.set(db.collection('users').doc(targetUser.id).collection('rooms').doc(privateRoomId), { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
        await batch.commit();
        
        selectRoom(privateRoomId);
    } catch (error) { if (error) { console.error("1:1 채팅 시작 오류:", error); showCustomAlert("오류", `1:1 채팅 시작에 실패했습니다: ${error.message}`); }}
}

async function showRoomInfo() {
    const roomData = roomsDataCache.find(r => r.id === currentRoomId);
    if (!roomData) return;
    if (roomMembersUnsubscribe) roomMembersUnsubscribe();

    dom.modalTitle.textContent = roomData.type === 'private' ? '대화 정보' : roomData.title;
    
    if (roomData.type === 'group') {
        dom.modalRoomIdContainer.style.display = 'block';
        dom.modalRoomIdText.textContent = roomData.id;
        dom.modalRoomIdCopyBtn.onclick = () => { navigator.clipboard.writeText(roomData.id); showCustomAlert("복사 완료", "채팅방 ID가 복사되었습니다."); };
    } else {
        dom.modalRoomIdContainer.style.display = 'none';
    }
    
    const membersRef = db.collection('chatrooms').doc(currentRoomId).collection('members');
    
    roomMembersUnsubscribe = membersRef.onSnapshot(membersSnapshot => {
        dom.participantList.innerHTML = '<div class="loading-spinner"></div>';
        const roles = new Map(membersSnapshot.docs.map(doc => [doc.id, doc.data().role]));
        
        db.collection('chatrooms').doc(currentRoomId).get().then(roomDoc => {
             if (!roomDoc.exists) return;
             const fullRoomData = roomDoc.data();
             const participantIds = fullRoomData.participantIds || [];

             dom.participantList.innerHTML = '';

             participantIds.forEach(id => {
                const isAdmin = roles.get(id) === 'admin';
                const name = fullRoomData.participantNames[id] || '알 수 없는 사용자';
                const isBlocked = currentUserProfileData.blockedUsers?.includes(id);

                const item = document.createElement('div');
                item.className = 'participant-item';
                item.innerHTML = `
                    <div class="participant-info" onclick="showUserProfile('${id}', ${id === currentUser.uid})">
                        <span class="participant-name">${name}</span>
                        ${id === currentUser.uid ? '<span class="self-badge">나</span>' : ''}
                        ${isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                    </div>
                    <div class="participant-actions">
                        ${(currentUserRole === 'admin' && id !== currentUser.uid) ? `<button onclick="updateRole('${id}', '${isAdmin ? 'member' : 'admin'}')">${isAdmin ? '강등' : '관리자'}</button><button class="danger" onclick="removeParticipant('${id}', '${name}')">내보내기</button>` : ''}
                        ${(roomData.type === 'private' && id !== currentUser.uid) ? `<button class="${isBlocked ? 'secondary' : 'danger'}" onclick="${isBlocked ? `unblockUser('${id}')` : `blockUser('${id}')`}">${isBlocked ? '차단 해제' : '차단'}</button>` : ''}
                    </div>`;
                dom.participantList.appendChild(item);
            });
        });
    });
    
    dom.adminControls.style.display = (currentUserRole === 'admin' && roomData.type === 'group') ? 'block' : 'none';
    dom.participantModal.style.display = 'flex';
}

async function addMembersToRoom() {
    if (!currentRoomId || currentUserRole !== 'admin') return;

    try {
        const selectedMemberIds = await showMemberPickerModal('멤버 추가', '채팅방에 추가할 멤버를 선택하세요.');
        if (!selectedMemberIds || selectedMemberIds.length === 0) return;
        const roomRef = db.collection('chatrooms').doc(currentRoomId);
        const roomData = roomsDataCache.find(r => r.id === currentRoomId);

        for (const uid of selectedMemberIds) {
            db.collection('invitations').add({ roomId: currentRoomId, roomName: roomData.title, userId: uid, invitedBy: currentUser.uid, invitedByName: currentUser.displayName, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }
        showCustomAlert("성공", "새 멤버 초대가 전송되었습니다.");
        dom.participantModal.style.display = 'none';
    } catch (error) { if (error) { console.error("멤버 추가 오류:", error); showCustomAlert("오류", `멤버 추가에 실패했습니다: ${error.message}`); }}
}

async function editRoomName() {
    try {
        const newName = await showCustomPrompt('채팅방 이름 변경', '새 채팅방 이름을 입력하세요', '채팅방 이름');
        if (newName) {
            await db.collection('chatrooms').doc(currentRoomId).update({ title: newName });
            showRoomInfo();
            dom.roomTitleElem.textContent = newName;
        }
    } catch (error) { if (error) console.error("채팅방 이름 변경 오류:", error); }
}

async function deleteRoomAsAdmin() {
    if (await showConfirmationModal('채팅방 삭제', '이 채팅방을 삭제하시겠습니까? 모든 메시지가 영구 삭제됩니다.')) {
        await db.collection('chatrooms').doc(currentRoomId).delete();
        dom.participantModal.style.display = 'none';
        resetChatView();
    }
}

async function deleteRoomForSelf() {
    const roomData = roomsDataCache.find(r => r.id === currentRoomId);
    if (!roomData) return;
    if (!(await showConfirmationModal('채팅방 나가기', '정말로 이 채팅방에서 나가시겠습니까?'))) return;
    
    const adminCount = roomData.type === 'group' ? (await db.collection('chatrooms').doc(currentRoomId).collection('members').where('role', '==', 'admin').get()).size : 0;
    if (roomData.type === 'group' && currentUserRole === 'admin' && adminCount <= 1) {
        return showCustomAlert("작업 불가", "마지막 관리자는 그룹을 나갈 수 없습니다. 다른 관리자를 지정하거나 그룹을 삭제하세요.");
    }

    const roomRef = db.collection('chatrooms').doc(currentRoomId);
    const batch = db.batch();
    batch.delete(db.collection('users').doc(currentUser.uid).collection('rooms').doc(currentRoomId));
    
    if (roomData.type === 'group') {
        batch.update(roomRef, { participantIds: firebase.firestore.FieldValue.arrayRemove(currentUser.uid), [`participantNames.${currentUser.uid}`]: firebase.firestore.FieldValue.delete() });
        batch.delete(roomRef.collection('members').doc(currentUser.uid));
    }
    
    await batch.commit();
    resetChatView();
}

async function removeParticipant(userId, userName) {
    if (!(await showConfirmationModal("멤버 내보내기", `${userName}님을 그룹에서 내보내시겠습니까?`))) return;
    const roomRef = db.collection('chatrooms').doc(currentRoomId);
    const batch = db.batch();
    batch.update(roomRef, { participantIds: firebase.firestore.FieldValue.arrayRemove(userId), [`participantNames.${userId}`]: firebase.firestore.FieldValue.delete() });
    batch.delete(roomRef.collection('members').doc(userId));
    batch.delete(db.collection('users').doc(userId).collection('rooms').doc(currentRoomId));
    await batch.commit();
    showRoomInfo();
}

async function updateRole(userId, newRole) {
    const adminCount = (await db.collection('chatrooms').doc(currentRoomId).collection('members').where('role', '==', 'admin').get()).size;
    if (newRole === 'member' && adminCount <= 1) { return showCustomAlert("작업 불가", "마지막 관리자를 일반 멤버로 강등할 수 없습니다."); }
    await db.collection('chatrooms').doc(currentRoomId).collection('members').doc(userId).update({ role: newRole });
    showRoomInfo();
}

// --- USER PROFILE & BLOCKING ---
async function showUserProfile(userId, isCurrentUser = false) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return showCustomAlert("오류", "사용자 정보를 찾을 수 없습니다.");
    
    const userData = userDoc.data();
    dom.userProfilePhoto.src = userData.photoUrl || PLACEHOLDER_IMAGE_100;
    dom.userProfileNameView.textContent = userData.displayName || "이름 없음";
    dom.userProfileStatusView.textContent = userData.status || "온라인";
    dom.userProfileEmailView.textContent = userData.isGuest ? "게스트 사용자" : (userData.email || "이메일 없음");
    dom.userProfilePhoneView.textContent = userData.isGuest ? "게스트 사용자" : (userData.phone || "전화번호 없음");
    dom.userProfileId.textContent = userId;

    const existingLogoutBtn = dom.profileModalActions.querySelector('#profile-logout-btn');
    if (isCurrentUser && !existingLogoutBtn) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'profile-logout-btn'; logoutBtn.className = 'modal-button danger'; logoutBtn.textContent = '로그아웃';
        logoutBtn.onclick = () => auth.signOut();
        dom.profileModalActions.appendChild(logoutBtn);
    } else if (!isCurrentUser && existingLogoutBtn) {
        existingLogoutBtn.remove();
    }

    dom.userProfileEditBtn.style.display = isCurrentUser && !userData.isGuest ? 'block' : 'none';
    toggleProfileEditMode(false, userData);
    dom.userProfileModal.style.display = 'flex';
}

function toggleProfileEditMode(isEditing, data = currentUserProfileData) {
    const v = (el) => el.style.display = isEditing ? 'none' : 'block';
    const e = (el) => el.style.display = isEditing ? 'block' : 'none';
    v(dom.userProfileNameView); e(dom.userProfileNameEdit);
    v(dom.userProfileStatusView); e(dom.userProfileStatusEdit);
    v(dom.userProfileEmailView); e(dom.userProfileEmailEdit);
    v(dom.userProfilePhoneView); e(dom.userProfilePhoneEdit);
    e(dom.profilePhotoEditOverlay);
    dom.profileModalActions.style.display = isEditing ? 'flex' : 'none';
    dom.userProfileEditBtn.style.display = isEditing ? 'none' : 'block';

    if (isEditing) {
        dom.userProfileNameEdit.value = data.displayName || '';
        dom.userProfileStatusEdit.value = data.status || '온라인';
        dom.userProfileEmailEdit.value = data.email || '';
        dom.userProfilePhoneEdit.value = data.phone || '';
        dom.userProfilePhoto.src = data.photoUrl || PLACEHOLDER_IMAGE_100;
        dom.profilePhotoInput.value = '';
    }
}

async function saveUserProfile() {
    const newName = dom.userProfileNameEdit.value.trim();
    if (!newName) return showCustomAlert("오류", "이름은 비워둘 수 없습니다.");

    const updateData = {
        displayName: newName,
        displayName_lower: newName.toLowerCase(),
        searchKeys: generateSearchKeys(newName),
        status: dom.userProfileStatusEdit.value,
        email: dom.userProfileEmailEdit.value.trim(),
        phone: dom.userProfilePhoneEdit.value.trim()
    };
    const file = dom.profilePhotoInput.files[0];
    if (file) {
        const photoRef = storage.ref(`profile_photos/${currentUser.uid}`);
        await photoRef.put(file);
        updateData.photoUrl = await photoRef.getDownloadURL();
        await currentUser.updateProfile({ photoURL: updateData.photoUrl });
    }

    await db.collection('users').doc(currentUser.uid).update(updateData);
    await currentUser.updateProfile({ displayName: newName });
    
    showCustomAlert("성공", "프로필이 업데이트되었습니다.");
    toggleProfileEditMode(false, {...currentUserProfileData, ...updateData});
}

async function blockUser(userId) {
    if(!await showConfirmationModal('사용자 차단', '이 사용자를 차단하시겠습니까? 차단하면 이 사용자의 메시지가 더 이상 표시되지 않습니다.')) return;
    await db.collection('users').doc(currentUser.uid).update({ blockedUsers: firebase.firestore.FieldValue.arrayUnion(userId) });
    showCustomAlert('성공', '사용자를 차단했습니다.');
    dom.participantModal.style.display = 'none';
    resetChatView();
}

async function unblockUser(userId) {
    await db.collection('users').doc(currentUser.uid).update({ blockedUsers: firebase.firestore.FieldValue.arrayRemove(userId) });
    showCustomAlert('성공', '사용자를 차단 해제했습니다. 메시지를 보려면 채팅방에 다시 입장하세요.');
    dom.participantModal.style.display = 'none';
}

// --- MODALS, PROMPTS & INVITATIONS ---
function showCustomPrompt(title, text, placeholder, okText = '확인') {
    return new Promise((resolve, reject) => {
        dom.customPromptTitle.textContent = title; dom.customPromptText.innerHTML = text;
        dom.customPromptInput.placeholder = placeholder; dom.customPromptInput.value = '';
        dom.customPromptInput.style.display = 'block'; dom.memberPicker.style.display = 'none';
        dom.customPromptOk.textContent = okText; dom.customPromptCancel.style.display = 'inline-block';
        dom.customPromptModal.style.display = 'flex';

        const onOk = () => { resolve(dom.customPromptInput.value); cleanup(); };
        const onCancel = () => { reject(null); cleanup(); };
        const cleanup = () => { dom.customPromptModal.style.display = 'none'; dom.customPromptOk.removeEventListener('click', onOk); dom.customPromptCancel.removeEventListener('click', onCancel); };
        dom.customPromptOk.addEventListener('click', onOk, { once: true });
        dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
    });
}

function showCustomAlert(title, text) {
    return new Promise(resolve => {
        dom.customPromptTitle.textContent = title; dom.customPromptText.textContent = text;
        dom.customPromptInput.style.display = 'none'; dom.memberPicker.style.display = 'none'; dom.customPromptCancel.style.display = 'none';
        dom.customPromptOk.textContent = '닫기'; dom.customPromptModal.style.display = 'flex';
        const onOk = () => { dom.customPromptModal.style.display = 'none'; dom.customPromptOk.removeEventListener('click', onOk); resolve(true); };
        dom.customPromptOk.addEventListener('click', onOk, { once: true });
    });
}

function showConfirmationModal(title, text) {
    return new Promise(resolve => {
        dom.customPromptTitle.textContent = title; dom.customPromptText.textContent = text;
        dom.customPromptInput.style.display = 'none'; dom.memberPicker.style.display = 'none';
        dom.customPromptOk.textContent = '확인'; dom.customPromptCancel.style.display = 'inline-block';
        dom.customPromptModal.style.display = 'flex';
        const onOk = () => { resolve(true); cleanup(); }; const onCancel = () => { resolve(false); cleanup(); };
        const cleanup = () => { dom.customPromptModal.style.display = 'none'; dom.customPromptOk.removeEventListener('click', onOk); dom.customPromptCancel.removeEventListener('click', onCancel); };
        dom.customPromptOk.addEventListener('click', onOk, { once: true });
        dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
    });
}

function showForwardModal(callback) {
    dom.customPromptTitle.textContent = '메시지 전달'; dom.customPromptText.innerHTML = '';
    dom.customPromptInput.style.display = 'none'; dom.memberPicker.style.display = 'none';
    const forwardList = document.createElement('div'); forwardList.className = 'forward-list';
    roomsDataCache.filter(r => r.id !== currentRoomId).forEach(room => {
        const otherUserId = room.participantIds.find(id => id !== currentUser.uid);
        let roomTitle = room.type === 'private' ? room.participantNames[otherUserId] || '알 수 없는 사용자' : room.title;
        const roomEl = document.createElement('div'); roomEl.className = 'forward-item'; roomEl.textContent = roomTitle;
        roomEl.onclick = () => { callback(room.id); cleanup(); };
        forwardList.appendChild(roomEl);
    });
    dom.customPromptText.appendChild(forwardList);
    dom.customPromptOk.style.display = 'none'; dom.customPromptCancel.textContent = '취소';
    dom.customPromptCancel.style.display = 'inline-block'; dom.customPromptModal.style.display = 'flex';
    const onCancel = () => cleanup();
    const cleanup = () => { dom.customPromptModal.style.display = 'none'; dom.customPromptOk.style.display = 'inline-block'; dom.customPromptCancel.removeEventListener('click', onCancel); };
    dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
}

function showMemberPickerModal(title, text) {
    return new Promise((resolve, reject) => {
        dom.customPromptTitle.textContent = title; dom.customPromptText.textContent = text;
        dom.customPromptInput.style.display = 'none'; dom.memberPicker.style.display = 'block';
        dom.selectedMembers.innerHTML = ''; dom.searchResults.innerHTML = ''; dom.userSearchInput.value = '';
        dom.customPromptOk.textContent = '초대'; dom.customPromptOk.style.display = 'inline-block'; dom.customPromptCancel.style.display = 'inline-block';
        dom.customPromptModal.style.display = 'flex';
        const onOk = () => { const memberIds = Array.from(document.querySelectorAll('.selected-member[data-uid]')).map(el => el.dataset.uid); resolve(memberIds); cleanup(); };
        const onCancel = () => { reject(null); cleanup(); };
        const cleanup = () => { dom.customPromptModal.style.display = 'none'; dom.memberPicker.style.display = 'none'; dom.customPromptOk.removeEventListener('click', onOk); dom.customPromptCancel.removeEventListener('click', onCancel); };
        dom.customPromptOk.addEventListener('click', onOk, { once: true });
        dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
    });
}

function showUserPickerModal(title, text) {
    return new Promise((resolve, reject) => {
        dom.customPromptTitle.textContent = title; dom.customPromptText.textContent = text;
        dom.customPromptInput.style.display = 'none'; dom.memberPicker.style.display = 'block';
        dom.selectedMembers.innerHTML = ''; dom.searchResults.innerHTML = ''; dom.userSearchInput.value = '';
        dom.customPromptOk.style.display = 'none'; dom.customPromptCancel.textContent = '닫기'; dom.customPromptCancel.style.display = 'inline-block';
        dom.customPromptModal.style.display = 'flex';
        const originalRender = renderSearchResults;
        renderSearchResults = (users) => {
            dom.searchResults.innerHTML = users.length === 0 ? '<div class="no-results">사용자를 찾을 수 없습니다.</div>' : '';
            users.forEach(user => {
                const userEl = document.createElement('div'); userEl.className = 'search-result-item';
                userEl.innerHTML = `<img src="${user.photoUrl || PLACEHOLDER_IMAGE_40}" class="user-avatar"><div class="user-info"><div class="user-name">${user.displayName}</div><div class="user-email">${user.email || ''}</div></div>`;
                userEl.onclick = () => { resolve(user); cleanup(); };
                dom.searchResults.appendChild(userEl);
            });
        };
        const onCancel = () => { reject(null); cleanup(); };
        const cleanup = () => { renderSearchResults = originalRender; dom.customPromptModal.style.display = 'none'; dom.memberPicker.style.display = 'none'; dom.customPromptOk.style.display = 'inline-block'; dom.customPromptCancel.removeEventListener('click', onCancel); };
        dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
    });
}

function listenForInvitations() {
    if (!currentUser) return;
    db.collection('invitations').where('userId', '==', currentUser.uid).where('status', '==', 'pending').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') showInvitationAlert(change.doc.data(), change.doc.id);
        });
    });
}

function showInvitationAlert(invitation, docId) {
    showConfirmationModal("채팅방 초대", `${invitation.invitedByName || '사용자'}님이 "${invitation.roomName}" 그룹에 초대했습니다. 참여하시겠습니까?`)
    .then(async accepted => {
        const invitationRef = db.collection('invitations').doc(docId);
        if (accepted) {
            const batch = db.batch();
            const roomRef = db.collection('chatrooms').doc(invitation.roomId);
            batch.update(roomRef, { participantIds: firebase.firestore.FieldValue.arrayUnion(currentUser.uid), [`participantNames.${currentUser.uid}`]: currentUser.displayName });
            batch.set(db.collection('users').doc(currentUser.uid).collection('rooms').doc(invitation.roomId), { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
            batch.set(roomRef.collection('members').doc(currentUser.uid), { role: 'member', joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
            batch.update(invitationRef, { status: 'accepted' });
            await batch.commit();
            showCustomAlert("환영합니다!", `"${invitation.roomName}" 그룹에 참여했습니다.`);
        } else {
            await invitationRef.update({ status: 'rejected' });
        }
    });
}

// --- USER SEARCH ---
async function handleUserSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 1) { dom.searchResults.innerHTML = ''; return; }
    try {
        const users = await searchUsers(query);
        renderSearchResults(users);
    } catch (error) { console.error("User search failed:", error); }
}

async function searchUsers(query) {
    const lowerCaseQuery = query.toLowerCase();
    const nameStartsWithQuery = db.collection('users')
        .where('displayName_lower', '>=', lowerCaseQuery)
        .where('displayName_lower', '<=', lowerCaseQuery + '\uf8ff')
        .limit(10)
        .get();
    const searchKeysQuery = db.collection('users')
        .where('searchKeys', 'array-contains', lowerCaseQuery)
        .limit(10)
        .get();

    const [nameSnapshot, keysSnapshot] = await Promise.all([nameStartsWithQuery, searchKeysQuery]);
    
    const usersMap = new Map();
    nameSnapshot.docs.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() }));
    keysSnapshot.docs.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() }));
    usersMap.delete(currentUser.uid);

    return Array.from(usersMap.values());
}

let renderSearchResults = (users) => {
    dom.searchResults.innerHTML = users.length === 0 ? '<div class="no-results">사용자를 찾을 수 없습니다.</div>' : '';
    users.forEach(user => {
        const userEl = document.createElement('div'); userEl.className = 'search-result-item';
        userEl.innerHTML = `<img src="${user.photoUrl || PLACEHOLDER_IMAGE_40}" class="user-avatar"><div class="user-info"><div class="user-name">${user.displayName}</div><div class="user-email">${user.email || ''}</div></div>`;
        userEl.onclick = () => addSelectedMember(user);
        dom.searchResults.appendChild(userEl);
    });
}

function addSelectedMember(user) {
    if (document.querySelector(`.selected-member[data-uid="${user.id}"]`)) return;
    const memberEl = document.createElement('div');
    memberEl.className = 'selected-member'; memberEl.dataset.uid = user.id;
    memberEl.innerHTML = `${user.displayName}<button class="remove-member">×</button>`;
    memberEl.querySelector('.remove-member').onclick = () => memberEl.remove();
    dom.selectedMembers.appendChild(memberEl);
}

// --- UTILS & HELPERS ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleChatScroll() {
    markVisibleMessagesAsRead();
    if (dom.chatMessages.scrollTop === 0 && !isFetchingMessages && lastVisibleMessage) {
        fetchMoreMessages();
    }
}

function handleMessageSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const allMessages = dom.chatMessages.querySelectorAll('.message-wrapper');

    allMessages.forEach(wrapper => {
        const textEl = wrapper.querySelector('.message-text');
        if (textEl) {
            textEl.innerHTML = textEl.textContent;
        }
    });

    if (searchTerm === '') {
        allMessages.forEach(wrapper => wrapper.style.display = 'flex');
        return;
    }

    const searchRegex = new RegExp(searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    allMessages.forEach(wrapper => {
        const textEl = wrapper.querySelector('.message-text');
        if (textEl && textEl.textContent.toLowerCase().includes(searchTerm)) {
            wrapper.style.display = 'flex';
            textEl.innerHTML = textEl.textContent.replace(searchRegex, (match) => `<mark>${match}</mark>`);
        } else {
            wrapper.style.display = 'none';
        }
    });
}

function hideEditModal() {
    dom.editMessageModal.style.display = 'none';
    messageIdToEdit = null;
    dom.editMessageInput.value = '';
}

function showEditModal(messageId, currentText) {
    messageIdToEdit = messageId;
    dom.editMessageInput.value = currentText;
    dom.editMessageModal.style.display = 'flex';
    dom.editMessageInput.focus();
}

function getFormattedDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === yesterday.toDateString()) return '어제';
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function scrollToBottom() { dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight; }