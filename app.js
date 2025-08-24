window.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyCkXiKhWwx_W29ZFU8mmB-eecFHt1WZCX4",
        authDomain: "chat-app-6194f.firebaseapp.com",
        projectId: "chat-app-6194f",
        appId: "1:432201991680:web:96ac04f905881f5332fae5",
        measurementId: "G-5MG6QESZ5K"
    };

    // Placeholder images & Icons
    const PLACEHOLDER_IMAGE_40 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="100%" height="100%" fill="lightgray"/></svg>';
    const PLACEHOLDER_IMAGE_100 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="#aaa">👤</text></svg>';
    const PLACEHOLDER_GROUP_AVATAR_40 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="100%" height="100%" fill="%23e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23888">👥</text></svg>';
    const GROUP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
    const PERSONAL_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    const NOTIFICATION_SOUND_URI = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGliZXJ0eSBtdXNpYy5jb20ATUFJAEyреставраторQQP/80DEeSAAAAAAAAAAAAAAAAAAAAAANUjEuNSwwLjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1QS4uRQsAAAAA//wAxkkLAM0AAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASDs90AFG8AAAAaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/96DE4AhQAAAAAABVQQBAAAAAA+gYAMDERiAKAEQk4AAAAAD/96DE4AhQADGkQAAAAAABJwgAADB1AAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//wAxg4gAAAABAAAAAAAAB/96DE4QAQAAAAAAAFQQBAAAAACgGAwATAtAAAADgA//+xwv/96DE4QAQADGkQAAAAAABJwgAADB1AAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//wAxg4gAAAABAAAAAAAAD/96DE4QAQAAAAAAAFQQBAAAAACgGAwATAtAAAADgA//+xwv/96DE4QAQADGkQAAAAAABJwgAADB1AAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';


    // --- Safety Check & Initialization ---
    if (typeof firebase === 'undefined') {
        document.body.innerHTML = `<div style="text-align: center; padding: 40px;"><h1>Connection Error</h1><p>Could not load necessary resources. Please check your internet connection and try again.</p><button onclick="window.location.reload()">Retry</button></div>`;
        throw new Error("Firebase SDK not loaded");
    }
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    let offlineDB = null;

    // --- Global State ---
    let currentUser = null, currentRoomId = null, roomsDataCache = [],
        userRoomsUnsubscribe = null, messagesUnsubscribe = null, roomDetailsUnsubscribe = null, typingUnsubscribe = null,
        roomMembersUnsubscribe = null, invitationsUnsubscribe = null, adminRequestsUnsubscribe = null, presenceUnsubscribe = null,
        roomPresenceUnsubscribe = null, lastSenderId = null, messageIdToEdit = null, lastMessageDate = null, typingTimeout = null,
        lastVisibleMessage = null, isFetchingMessages = false, currentUserRole = 'member',
        currentUserProfileData = {}, activeReply = null,
        currentSearchResults = [], currentSearchIndex = -1,
        swipeState = { startX: 0, currentX: 0, isSwiping: false, target: null, openItemWrapper: null },
        roomListPresenceUnsubscribes = {},
        readByPopover = null, hidePopoverTimeout = null,
        lightboxGallery = [], lightboxCurrentIndex = -1,
        lastFocusedElement = null, mediaRecorder = null, audioChunks = [], isRecording = false, recordingInterval = null,
        soundNotificationsEnabled = false,
        activePicker = null;
        
    const notificationSound = new Audio(NOTIFICATION_SOUND_URI);

    // --- DOM Elements ---
    const dom = {
        body: document.body,
        sidebar: document.querySelector('.sidebar'), roomList: document.querySelector('.room-list'),
        searchBar: document.getElementById('search-bar'), profileBtn: document.getElementById('profile-btn'),
        newRoomBtn: document.getElementById('new-room-btn'), joinRoomBtn: document.getElementById('join-room-btn'),
        privateChatBtn: document.getElementById('private-chat-btn'), darkModeToggle: document.getElementById('dark-mode-toggle'),
        adminPanelBtn: document.getElementById('admin-panel-btn'), invitationsBtn: document.getElementById('invitations-btn'),
        soundNotificationToggle: document.getElementById('sound-notification-toggle'),
        chatArea: document.querySelector('.chat-area'), chatPlaceholder: document.querySelector('.chat-placeholder'),
        chatView: document.querySelector('.chat-view'), roomInfoDiv: document.querySelector('.room-info'),
        roomTitleElem: document.querySelector('.room-title'), roomStatusElem: document.querySelector('.room-status'),
        leaveRoomBtn: document.getElementById('leave-room-btn'),
        clearChatBtn: document.getElementById('clear-chat-btn'),
        chatMessages: document.querySelector('.chat-messages'),
        messageSearchInput: document.getElementById('message-search-input'),
        searchPrevBtn: document.getElementById('search-prev-btn'), searchNextBtn: document.getElementById('search-next-btn'),
        inputForm: document.querySelector('.chat-input-area'), messageInput: document.querySelector('.message-input'),
        sendButton: document.querySelector('.send-button'),
        micButton: document.getElementById('mic-btn'),
        emojiBtn: document.getElementById('emoji-btn'), emojiPicker: document.getElementById('emoji-picker'),
        pollBtn: document.getElementById('poll-btn'), createPollModal: document.getElementById('create-poll-modal'),
        createPollForm: document.getElementById('create-poll-form'), addPollOptionBtn: document.getElementById('add-poll-option-btn'),
        pollOptionsContainer: document.getElementById('poll-options-container'),
        imageAttachBtn: document.getElementById('image-attach-btn'), imageInput: document.getElementById('image-input'),
        fileAttachBtn: document.getElementById('file-attach-btn'), fileInput: document.getElementById('file-input'),
        backButton: document.querySelector('.back-button.mobile-only'),
        participantModal: document.getElementById('participant-modal'),
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
        editMessageInput: document.getElementById('edit-message-input'),
        customPromptModal: document.getElementById('custom-prompt-modal'), customPromptTitle: document.getElementById('custom-prompt-title'),
        customPromptText: document.getElementById('custom-prompt-text'), customPromptInput: document.getElementById('custom-prompt-input'),
        customPromptOk: document.getElementById('custom-prompt-ok'), customPromptCancel: document.getElementById('custom-prompt-cancel'),
        memberPicker: document.getElementById('member-picker'), userSearchInput: document.getElementById('user-search'),
        searchResults: document.getElementById('search-results'), selectedMembers: document.getElementById('selected-members'),
        userProfileModal: document.getElementById('user-profile-modal'),
        userProfileModalTitle: document.getElementById('user-profile-modal-title'),
        userProfileEditBtn: document.getElementById('user-profile-edit-btn'), userProfilePhoto: document.getElementById('user-profile-photo'),
        profilePhotoInput: document.getElementById('profile-photo-input'), profilePhotoEditOverlay: document.getElementById('profile-photo-edit-overlay'),
        userProfileNameView: document.getElementById('user-profile-name-view'), userProfileNameEdit: document.getElementById('user-profile-name-edit'),
        userProfileStatusView: document.getElementById('user-profile-status-view'), userProfileCustomStatusView: document.getElementById('user-profile-custom-status-view'), userProfileStatusEdit: document.getElementById('user-profile-custom-status-edit'),
        userProfileEmailView: document.getElementById('user-profile-email-view'), userProfileEmailEdit: document.getElementById('user-profile-email-edit'),
        userProfilePhoneView: document.getElementById('user-profile-phone-view'), userProfilePhoneEdit: document.getElementById('user-profile-phone-edit'),
        userProfileId: document.getElementById('user-profile-id'),
        profileModalActions: document.getElementById('profile-modal-actions'), profileCancelBtn: document.getElementById('profile-cancel-btn'),
        profileSaveBtn: document.getElementById('profile-save-btn'), profileModalFooter: document.getElementById('profile-modal-footer'),
        adminPanelModal: document.getElementById('admin-panel-modal'), joinRequestsList: document.getElementById('join-requests-list'),
        invitationsModal: document.getElementById('invitations-modal'), pendingInvitationsList: document.getElementById('pending-invitations-list'),
        lightbox: document.getElementById('image-lightbox'),
        lightboxImage: document.getElementById('lightbox-image'),
        lightboxSender: document.getElementById('lightbox-sender'),
        lightboxTimestamp: document.getElementById('lightbox-timestamp'),
        lightboxDownload: document.getElementById('lightbox-download'),
        lightboxClose: document.getElementById('lightbox-close'),
        lightboxPrev: document.getElementById('lightbox-prev'),
        lightboxNext: document.getElementById('lightbox-next'),
        recordingIndicator: document.getElementById('recording-indicator'),
        recordingTimer: document.getElementById('recording-timer'),
        progressBarContainer: document.createElement('div'),
        progressBar: document.createElement('div')
    };

    dom.progressBarContainer.className = 'upload-progress';
    dom.progressBarContainer.style.display = 'none';
    dom.progressBarContainer.appendChild(dom.progressBar);
    dom.progressBar.className = 'progress-bar';
    if (dom.inputForm) {
        dom.inputForm.insertBefore(dom.progressBarContainer, dom.inputForm.firstChild);
    }

    // --- HELPER FUNCTIONS ---
    function toggleButtonLoading(button, isLoading) {
        if (!button) return;
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        button.disabled = isLoading;
        if (btnText) btnText.style.opacity = isLoading ? '0' : '1';
        if (btnLoader) btnLoader.classList.toggle('hidden', !isLoading);
    }
    function showModal(modalElement) {
        lastFocusedElement = document.activeElement;
        modalElement.style.display = 'flex';
        document.body.classList.add('modal-open');
        const firstFocusable = modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    function hideModal(modalElement) {
        modalElement.style.display = 'none';
        if (document.querySelectorAll('.modal-overlay[style*="display: flex"]').length === 0) {
            document.body.classList.remove('modal-open');
        }
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }
    function generateSearchKeys(displayName) {
        const name = displayName.toLowerCase().trim().substring(0, 20); // Cap name length
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
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    function formatLastSeen(timestamp) {
        if (!timestamp) return 'Offline';
    
        const now = new Date();
        const lastSeen = timestamp.toDate();
        const diffSeconds = (now.getTime() - lastSeen.getTime()) / 1000;
    
        if (diffSeconds < 300) return 'Online'; // 5 minutes
        if (diffSeconds < 3600) return `Last seen ${Math.round(diffSeconds / 60)} minutes ago`;
    
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    
        if (lastSeen >= today) {
            return `Last seen today at ${lastSeen.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        }
        if (lastSeen >= yesterday) {
            return `Last seen yesterday at ${lastSeen.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        }
        return `Last seen on ${lastSeen.toLocaleDateString()}`;
    }

    // --- AUTH & APP START ---
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userRef = db.collection('users').doc(user.uid);
                const doc = await userRef.get(); // Use a one-time read

                if (!doc.exists || !doc.data()?.displayName) { 
                    console.log("User document not found or incomplete, signing out.");
                    auth.signOut(); 
                    return; 
                }
                
                currentUser = user; 
                currentUserProfileData = doc.data(); 
                
                if (!userRoomsUnsubscribe) {
                    initializeApp();
                }
            } catch (error) {
                console.error("Error fetching user profile during auth state change:", error);
                auth.signOut();
            }
        } else {
            // Logout logic
            if (userRoomsUnsubscribe) userRoomsUnsubscribe();
            if (invitationsUnsubscribe) invitationsUnsubscribe();
            if (adminRequestsUnsubscribe) adminRequestsUnsubscribe();
            Object.values(roomListPresenceUnsubscribes).forEach(unsub => unsub());
            roomListPresenceUnsubscribes = {};
            userRoomsUnsubscribe = null;
            invitationsUnsubscribe = null;
            adminRequestsUnsubscribe = null;
            window.location.href = 'login.html';
        }
    });
    function initializeApp() {
        setupEventListeners();
        applyTheme();
        listenForUserRooms();
        setupPresenceTracking();
        listenForInvitations();
        listenForAdminUpdates();
        setupOfflineHandling();
        setupEmojiPicker();
        setupPollCreator();

        // Load sound setting from localStorage
        soundNotificationsEnabled = localStorage.getItem('soundNotificationsEnabled') === 'true';
        if (dom.soundNotificationToggle) dom.soundNotificationToggle.checked = soundNotificationsEnabled;
    }

    // --- CORE FEATURES ---
    function applyTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        dom.body.classList.toggle('dark-mode', isDarkMode);
        if (dom.darkModeToggle) {
            dom.darkModeToggle.querySelector('.sun-icon').style.display = isDarkMode ? 'none' : 'block';
            dom.darkModeToggle.querySelector('.moon-icon').style.display = isDarkMode ? 'block' : 'none';
        }
    }
    function toggleTheme() {
        localStorage.setItem('darkMode', !dom.body.classList.contains('dark-mode'));
        applyTheme();
    }
    function setupPresenceTracking() {
        if (!currentUser) return;
        const presenceRef = db.collection('presence').doc(currentUser.uid);
        const update = () => presenceRef.set({ lastActiveAt: firebase.firestore.FieldValue.serverTimestamp() });
        document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && update());
        window.addEventListener('focus', update);
        update();
    }
    function playNotificationSound(message) {
        if (
            soundNotificationsEnabled &&
            message.senderId !== currentUser.uid &&
            (currentRoomId !== message.roomId || !document.hasFocus())
        ) {
            notificationSound.play().catch(error => console.warn("Audio play failed:", error));
        }
    }
    
    // --- OFFLINE SUPPORT ---
    function initOfflineDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("chatAppDB", 1);
            request.onerror = (event) => reject("IndexedDB error: " + request.error);
            request.onsuccess = (event) => {
                offlineDB = event.target.result;
                resolve(offlineDB);
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('offlineMessages')) {
                    db.createObjectStore('offlineMessages', { keyPath: 'id' });
                }
            };
        });
    }

    async function saveMessageOffline(message) {
        if (!offlineDB) return;
        const transaction = offlineDB.transaction(['offlineMessages'], 'readwrite');
        const store = transaction.objectStore('offlineMessages');
        store.add(message);
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => {
                console.error('Failed to save offline message:', e.target.error);
                reject(transaction.error);
            }
        });
    }

    async function sendOfflineMessages() {
        if (!offlineDB || !navigator.onLine) return;
        const transaction = offlineDB.transaction(['offlineMessages'], 'readwrite');
        const store = transaction.objectStore('offlineMessages');
        const messages = await new Promise(resolve => store.getAll().onsuccess = e => resolve(e.target.result));

        if (messages.length > 0) {
            console.log(`Sending ${messages.length} offline messages...`);
            for (const msg of messages) {
                try {
                    const queuedMsgEl = document.getElementById(msg.id);
                    if (queuedMsgEl && msg.roomId === currentRoomId) {
                         const receipt = queuedMsgEl.querySelector('.read-receipt');
                         if(receipt) {
                            receipt.className = 'read-receipt sending';
                         }
                    }
                    
                    await sendMessage(msg.content, msg.roomId, msg.replyContext);
                    
                    const deleteTransaction = offlineDB.transaction(['offlineMessages'], 'readwrite');
                    deleteTransaction.objectStore('offlineMessages').delete(msg.id);
                } catch (error) {
                    console.error("Failed to send offline message, will retry later:", msg, error);
                     const failedMsgEl = document.getElementById(msg.id);
                     if (failedMsgEl) {
                        const receipt = failedMsgEl.querySelector('.read-receipt');
                        if(receipt) {
                            receipt.className = 'read-receipt failed';
                            receipt.innerHTML = `&#x26A0;`;
                        }
                     }
                }
            }
        }
    }

    async function setupOfflineHandling() {
        await initOfflineDB();
        const updateOnlineStatus = () => {
            const isOffline = !navigator.onLine;
            document.body.classList.toggle('offline', isOffline);

            if (!isOffline) {
                sendOfflineMessages();
            }
        };
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }


    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        if (dom.darkModeToggle) dom.darkModeToggle.addEventListener('click', toggleTheme);
        if (dom.profileBtn) dom.profileBtn.addEventListener('click', () => showUserProfile(currentUser.uid, true));
        if (dom.newRoomBtn) dom.newRoomBtn.addEventListener('click', createNewGroupRoom);
        if (dom.joinRoomBtn) dom.joinRoomBtn.addEventListener('click', joinGroupById);
        if (dom.privateChatBtn) dom.privateChatBtn.addEventListener('click', startPrivateChat);
        if (dom.adminPanelBtn) dom.adminPanelBtn.addEventListener('click', showAdminPanel);
        if (dom.invitationsBtn) dom.invitationsBtn.addEventListener('click', showInvitationsPanel);
        if (dom.searchBar) dom.searchBar.addEventListener('input', (e) => renderRoomList(roomsDataCache, e.target.value));
        if (dom.roomInfoDiv) dom.roomInfoDiv.addEventListener('click', showRoomInfo);
        if (dom.leaveRoomBtn) dom.leaveRoomBtn.addEventListener('click', deleteRoomForSelf);
        if (dom.clearChatBtn) dom.clearChatBtn.addEventListener('click', handleClearChat);
        if (dom.inputForm) dom.inputForm.addEventListener('submit', handleSendMessage);
        if (dom.imageAttachBtn) dom.imageAttachBtn.addEventListener('click', () => dom.imageInput.click());
        if (dom.imageInput) dom.imageInput.addEventListener('change', handleImageUpload);
        if (dom.fileAttachBtn) dom.fileAttachBtn.addEventListener('click', () => dom.fileInput.click());
        if (dom.fileInput) dom.fileInput.addEventListener('change', handleFileUpload);
        if (dom.micButton) dom.micButton.addEventListener('pointerdown', handleStartRecording);
        if (dom.messageInput) dom.messageInput.addEventListener('input', () => {
            const hasText = dom.messageInput.value.trim() !== '';
            dom.sendButton.disabled = !hasText;
            // dom.sendButton.style.display = hasText ? 'inline-flex' : 'none';
            // dom.micButton.style.display = hasText ? 'none' : 'inline-flex';
            debounce(updateTypingStatus, 500)();
        });
        if (dom.cancelReplyBtn) dom.cancelReplyBtn.addEventListener('click', cancelReply);
        if (dom.chatMessages) {
            dom.chatMessages.addEventListener('scroll', handleChatScroll);
            dom.chatMessages.addEventListener('click', (e) => {
                if (e.target.classList.contains('message-image')) {
                    openLightbox(e.target);
                }
                const playBtn = e.target.closest('.voice-play-btn');
                if (playBtn) {
                    toggleVoiceMessage(playBtn);
                }
            });
        }
        if (dom.messageSearchInput) dom.messageSearchInput.addEventListener('input', debounce(handleMessageSearch, 300));
        if (dom.searchPrevBtn) dom.searchPrevBtn.addEventListener('click', () => navigateToSearchResult(-1));
        if (dom.searchNextBtn) dom.searchNextBtn.addEventListener('click', () => navigateToSearchResult(1));
        if (dom.backButton) dom.backButton.addEventListener('click', goBackToRoomList);
        if (dom.roomList) dom.roomList.addEventListener('pointerdown', handlePointerDown);
        if (dom.soundNotificationToggle) dom.soundNotificationToggle.addEventListener('change', (e) => {
            soundNotificationsEnabled = e.target.checked;
            localStorage.setItem('soundNotificationsEnabled', soundNotificationsEnabled);
        });

        // Lightbox Listeners
        if (dom.lightbox) {
            dom.lightbox.addEventListener('click', (e) => {
                if (e.target === dom.lightbox) closeLightbox();
            });
            dom.lightboxClose.addEventListener('click', closeLightbox);
            dom.lightboxPrev.addEventListener('click', showPrevImage);
            dom.lightboxNext.addEventListener('click', showNextImage);
        }
        
        document.body.addEventListener('click', (e) => {
            if (activePicker && !activePicker.contains(e.target)) {
                const isButtonClick = [dom.emojiBtn].some(btn => btn.contains(e.target));
                if (!isButtonClick) {
                    togglePicker(null);
                }
            }

            const copyButton = e.target.closest('.copy-button');
            if (copyButton) {
                e.stopPropagation();
                const field = copyButton.dataset.field;
                let textToCopy = '';
                if (field === 'id') textToCopy = dom.userProfileId.textContent;
                else if (field === 'email') textToCopy = dom.userProfileEmailView.textContent;
                else if (field === 'phone') textToCopy = dom.userProfilePhoneView.textContent;
                else if (field === 'roomId' && dom.modalRoomIdText) textToCopy = dom.modalRoomIdText.textContent;
                
                if (textToCopy) {
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => showCustomAlert("Copied!", "Copied to clipboard."))
                        .catch(err => console.error('Failed to copy:', err));
                }
                return;
            }

            const actionTarget = e.target.closest('[data-action]');
            if (actionTarget) {
                e.stopPropagation();
                const { action, payload } = actionTarget.dataset;
                const participantItem = actionTarget.closest('.participant-item');
                if (!participantItem) return;
                const { userId, userName } = participantItem.dataset;

                switch(action) {
                    case 'view-profile':
                        showUserProfile(userId);
                        break;
                    case 'update-role':
                        updateRole(userId, payload);
                        break;
                    case 'remove-member':
                        removeParticipant(userId, userName);
                        break;
                    case 'toggle-block':
                        const isBlocked = participantItem.dataset.blocked === 'true';
                        if (isBlocked) unblockUser(userId);
                        else blockUser(userId);
                        break;
                }
            }
        });

        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => { 
                if (e.target === modal && modal.id !== 'image-lightbox') {
                    hideModal(modal);
                    if (modal.id === 'participant-modal' && presenceUnsubscribe) {
                        presenceUnsubscribe();
                        presenceUnsubscribe = null;
                    }
                }
            });
            modal.querySelector('.modal-close-btn')?.addEventListener('click', () => {
                 hideModal(modal);
                 if (modal.id === 'participant-modal' && presenceUnsubscribe) {
                    presenceUnsubscribe();
                    presenceUnsubscribe = null;
                }
            });
            // A11y: Focus trapping
            modal.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                const focusable = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            });
        });
        
        if (dom.userProfileEditBtn) dom.userProfileEditBtn.addEventListener('click', () => toggleProfileEditMode(true));
        if (dom.profileCancelBtn) dom.profileCancelBtn.addEventListener('click', () => toggleProfileEditMode(false));
        if (dom.profileSaveBtn) dom.profileSaveBtn.addEventListener('click', saveUserProfile);
        if (dom.customPromptModal) dom.customPromptModal.querySelector('#custom-prompt-cancel').addEventListener('click', () => hideModal(dom.customPromptModal));
        if (dom.editMessageForm) dom.editMessageForm.addEventListener('submit', handleEditMessage);
        if (dom.editMessageModal) dom.editMessageModal.querySelector('#edit-message-cancel').addEventListener('click', () => hideModal(dom.editMessageModal));
        
        if (dom.addMemberBtn) dom.addMemberBtn.addEventListener('click', addMembersToRoom);
        if (dom.editRoomBtn) dom.editRoomBtn.addEventListener('click', editRoomName);
        if (dom.adminDeleteRoomBtn) dom.adminDeleteRoomBtn.addEventListener('click', deleteRoomAsAdmin);
        if (dom.mediaGalleryBtn) dom.mediaGalleryBtn.addEventListener('click', showMediaGallery);
    }

    // --- ROOM LIST & SELECTION ---
    function listenForUserRooms() {
        if (userRoomsUnsubscribe) userRoomsUnsubscribe();

        if (!currentUser || !currentUser.uid) {
            console.error("CRITICAL ERROR: listenForUserRooms called but currentUser is not set!");
            return;
        }

        const userRoomsQuery = db.collection('users').doc(currentUser.uid).collection('rooms');

        userRoomsUnsubscribe = userRoomsQuery.onSnapshot(async (userRoomsSnapshot) => {
            const userRoomsMap = new Map(userRoomsSnapshot.docs.map(doc => [doc.id, doc.data()]));
            const roomIds = Array.from(userRoomsMap.keys());

            if (roomIds.length === 0) {
                roomsDataCache = [];
                renderRoomList([]);
                return;
            }

            try {
                const roomPromises = roomIds.map(id => db.collection('chatrooms').doc(id).get());
                const roomDocs = await Promise.all(roomPromises);
                
                const mutesSnapshot = await db.collection('mutes').doc(currentUser.uid).collection('rooms').get();
                const mutedIds = new Set(mutesSnapshot.docs.map(doc => doc.id));

                const pinsSnapshot = await db.collection('pinnedRooms').doc(currentUser.uid).collection('rooms').get();
                const pinnedIds = new Set(pinsSnapshot.docs.map(doc => doc.id));

                const rooms = roomDocs.map(doc => {
                    if (!doc.exists) return null;
                    
                    const roomData = doc.data();
                    const userRoomData = userRoomsMap.get(doc.id) || {};
                    const unreadCount = userRoomData.unreadCount || 0;

                    return { 
                        id: doc.id, 
                        ...roomData, 
                        unreadCount, 
                        isMuted: mutedIds.has(doc.id), 
                        isPinned: pinnedIds.has(doc.id) 
                    };
                }).filter(Boolean);

                roomsDataCache = rooms;
                roomsDataCache.sort((a, b) => (b.lastMessage?.timestamp?.toMillis() || 0) - (a.lastMessage?.timestamp?.toMillis() || 0));
                renderRoomList(roomsDataCache, dom.searchBar.value);

            } catch (error) {
                console.error("Error fetching individual room details:", error);
            }
        }, (error) => {
            console.error("Error listening to user's private room subcollection:", error);
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
        
        const muteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`;
        const unMuteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
        const pinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M12 12c-2 0-4.5-1-4.5-3.5S10 5 12 5s4.5 1.5 4.5 3.5-2 3.5-4.5 3.5Z"/><path d="m18 9 1.3-1.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0L12 3"/></svg>`;
        const pinnedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M12 12c-2 0-4.5-1-4.5-3.5S10 5 12 5s4.5 1.5 4.5 3.5-2 3.5-4.5 3.5Z"/><path d="m18 9 1.3-1.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0L12 3"/></svg>`;

        dom.roomList.innerHTML = filtered.map(room => {
            const isPrivate = room.type === 'private';
            const otherUserId = isPrivate ? room.participantIds.find(id => id !== currentUser.uid) : null;
            const title = isPrivate ? (room.participantNames[otherUserId] || 'Unknown User') : room.title;
            const lastMsgTime = room.lastMessage?.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
            const lastMsgText = room.lastMessage?.text || 'No messages yet';

            let avatarHTML;
            if (isPrivate) {
                const avatarUrl = room.participantAvatars[otherUserId];
                avatarHTML = avatarUrl ? `<img src="${avatarUrl}" alt="${title}" class="room-item-avatar">` : PERSONAL_ICON_SVG;
            } else {
                avatarHTML = room.photoUrl ? `<img src="${room.photoUrl}" alt="${title}" class="room-item-avatar">` : GROUP_ICON_SVG;
            }

            return `<li class="room-item-wrapper" data-room-id="${room.id}">
                        <div class="room-item-actions">
                            <button class="mute-button" data-room-id="${room.id}" aria-label="${room.isMuted ? 'Unmute' : 'Mute'} chat with ${title}">
                                ${room.isMuted ? unMuteIcon : muteIcon}
                                <span>${room.isMuted ? 'Unmute' : 'Mute'}</span>
                            </button>
                            <button class="pin-button" data-room-id="${room.id}" aria-label="${room.isPinned ? 'Unpin' : 'Pin'} chat with ${title}">
                                ${room.isPinned ? pinnedIcon : pinIcon}
                                <span>${room.isPinned ? 'Unpin' : 'Pin'}</span>
                            </button>
                        </div>
                        <button class="room-item-content" ${room.id === currentRoomId ? 'aria-current="page"' : ''} ${room.isPinned ? 'data-pinned="true"' : ''}>
                            <div class="room-item-avatar-wrapper">
                                <div class="room-item-avatar" aria-hidden="true">
                                    ${avatarHTML}
                                </div>
                                ${isPrivate ? `<span class="online-status-indicator" data-user-id="${otherUserId}"></span>` : ''}
                            </div>
                            <div class="room-details">
                                <div class="room-item-header">
                                    <h2 class="room-item-title">${title}</h2>
                                    <time class="room-item-timestamp">${lastMsgTime}</time>
                                </div>
                                <div class="room-item-footer">
                                    <span class="room-item-preview">${lastMsgText}</span>
                                    ${room.unreadCount > 0 ? `<div class="unread-badge" aria-label="${room.unreadCount} unread messages">${room.unreadCount}</div>` : ''}
                                </div>
                            </div>
                        </button>
                    </li>`;
        }).join('') || '<p class="empty-list-message">No matching rooms found.</p>';
        
        dom.roomList.querySelectorAll('.mute-button').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(el.dataset.roomId); }));
        dom.roomList.querySelectorAll('.pin-button').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); togglePin(el.dataset.roomId); }));
        dom.roomList.querySelectorAll('.room-item-content').forEach(el => el.addEventListener('click', (e) => {
             e.stopPropagation();
             const roomId = el.closest('.room-item-wrapper').dataset.roomId;
             if (roomId) selectRoom(roomId);
        }));
        updateRoomListPresence();
    }
    function updateRoomListPresence() {
        const currentListenerIds = Object.keys(roomListPresenceUnsubscribes);
        const visibleUserIds = new Set();
        document.querySelectorAll('.online-status-indicator[data-user-id]').forEach(el => {
            if (el.dataset.userId) visibleUserIds.add(el.dataset.userId);
        });

        currentListenerIds.forEach(userId => {
            if (!visibleUserIds.has(userId)) {
                if (roomListPresenceUnsubscribes[userId]) {
                    roomListPresenceUnsubscribes[userId]();
                    delete roomListPresenceUnsubscribes[userId];
                }
            }
        });

        visibleUserIds.forEach(userId => {
            if (!roomListPresenceUnsubscribes[userId]) {
                const presenceRef = db.collection('presence').doc(userId);
                roomListPresenceUnsubscribes[userId] = presenceRef.onSnapshot(doc => {
                    const indicator = document.querySelector(`.online-status-indicator[data-user-id="${userId}"]`);
                    if (indicator) {
                        const statusText = doc.exists ? formatLastSeen(doc.data().lastActiveAt) : 'Offline';
                        const isOnline = statusText === 'Online';
                        indicator.classList.toggle('online', isOnline);
                        indicator.title = statusText;
                    }
                }, err => {
                    console.error(`Error listening to presence for ${userId}:`, err);
                    delete roomListPresenceUnsubscribes[userId];
                });
            }
        });
    }
    function selectRoom(roomId) {
        closeSwipedItem();
        if (currentRoomId === roomId) return;
        if (messagesUnsubscribe) messagesUnsubscribe();
        if (roomDetailsUnsubscribe) roomDetailsUnsubscribe();
        if (typingUnsubscribe) typingUnsubscribe();
        if (presenceUnsubscribe) presenceUnsubscribe();
        if (roomPresenceUnsubscribe) roomPresenceUnsubscribe();
        cancelReply();
        currentRoomId = roomId; 
        lastSenderId = null; 
        lastMessageDate = null; 
        lastVisibleMessage = null;
        isFetchingMessages = false;
        db.collection('users').doc(currentUser.uid).collection('rooms').doc(roomId).set({ unreadCount: 0 }, { merge: true });
        dom.chatPlaceholder.style.display = 'none'; 
        dom.chatView.style.display = 'flex';
        dom.chatMessages.innerHTML = '';
        renderRoomList(roomsDataCache, dom.searchBar.value);
        dom.sidebar.classList.add('mobile-hidden');
        roomDetailsUnsubscribe = db.collection('chatrooms').doc(roomId).onSnapshot(doc => {
            const data = doc.data();
            if(!data || !data.participantIds.includes(currentUser.uid)) {
                if (currentRoomId === roomId) {
                    showCustomAlert("Notice", "You have been removed from this room, or it has been deleted.");
                    resetChatView();
                }
                return;
            }
            roomsDataCache = roomsDataCache.map(r => r.id === roomId ? { ...r, ...data } : r);
            dom.roomTitleElem.textContent = data.type === 'private'
                ? data.participantNames[data.participantIds.find(id => id !== currentUser.uid)]
                : data.title;
            renderPinnedMessage(data.pinnedMessage);
            if (roomPresenceUnsubscribe) { roomPresenceUnsubscribe(); roomPresenceUnsubscribe = null; }
            if (data.type === 'private') {
                const otherUserId = data.participantIds.find(id => id !== currentUser.uid);
                roomPresenceUnsubscribe = db.collection('presence').doc(otherUserId).onSnapshot(presenceDoc => {
                    const statusText = presenceDoc.exists ? formatLastSeen(presenceDoc.data().lastActiveAt) : 'Offline';
                    dom.roomStatusElem.textContent = statusText;
                });
            } else {
                dom.roomStatusElem.textContent = `${data.participantIds.length} members`;
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
        dom.chatView.style.display = 'none'; 
        dom.chatPlaceholder.style.display = 'flex';
        if (messagesUnsubscribe) messagesUnsubscribe();
        if (roomDetailsUnsubscribe) roomDetailsUnsubscribe();
        if (typingUnsubscribe) typingUnsubscribe();
        if (presenceUnsubscribe) presenceUnsubscribe();
        if (roomPresenceUnsubscribe) roomPresenceUnsubscribe();
        renderRoomList(roomsDataCache, dom.searchBar.value);
    }
    async function toggleMute(roomId) {
        const room = roomsDataCache.find(r => r.id === roomId);
        if (!room) return;
    
        room.isMuted = !room.isMuted;
        
        const roomItemWrapper = document.querySelector(`.room-item-wrapper[data-room-id="${roomId}"]`);
        if (roomItemWrapper) {
            const muteButton = roomItemWrapper.querySelector('.mute-button');
            if (muteButton) {
                const muteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`;
                const unMuteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
                
                muteButton.title = room.isMuted ? 'Unmute' : 'Mute';
                muteButton.innerHTML = `
                    ${room.isMuted ? unMuteIcon : muteIcon}
                    <span>${room.isMuted ? 'Unmute' : 'Mute'}</span>
                `;
            }
        }
        
        closeSwipedItem();
    
        const muteRef = db.collection('mutes').doc(currentUser.uid).collection('rooms').doc(roomId);
        try {
            if (room.isMuted) {
                await muteRef.set({ muted: true });
            } else {
                await muteRef.delete();
            }
        } catch (error) {
            console.error("Failed to update mute status:", error);
            room.isMuted = !room.isMuted;
            renderRoomList(roomsDataCache, dom.searchBar.value);
            showCustomAlert("Error", "Could not update mute status.");
        }
    }
    
    async function togglePin(roomId) {
        const room = roomsDataCache.find(r => r.id === roomId);
        if (!room) return;
    
        room.isPinned = !room.isPinned;
        renderRoomList(roomsDataCache, dom.searchBar.value);
        closeSwipedItem(false);
    
        const pinRef = db.collection('pinnedRooms').doc(currentUser.uid).collection('rooms').doc(roomId);
        try {
            if (room.isPinned) {
                await pinRef.set({ pinnedAt: firebase.firestore.FieldValue.serverTimestamp() });
            } else {
                await pinRef.delete();
            }
        } catch (error) {
            console.error("Failed to update pin status:", error);
            room.isPinned = !room.isPinned;
            renderRoomList(roomsDataCache, dom.searchBar.value);
            showCustomAlert("Error", "Could not update pin status.");
        }
    }
    
    // --- SWIPE ACTIONS ---
    function handlePointerDown(e) {
        if (e.target.closest('.room-item-actions button')) return;
        const targetContent = e.target.closest('.room-item-content');
        if (!targetContent) return;

        if (swipeState.openItemWrapper && swipeState.openItemWrapper !== targetContent.parentElement.parentElement) {
            closeSwipedItem();
        }
        
        swipeState.target = targetContent;
        swipeState.startX = e.clientX;
        swipeState.currentX = e.clientX;
        swipeState.isSwiping = false;
        
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerup', handlePointerUp);
    }
    function handlePointerMove(e) {
        if (!swipeState.target) return;
        swipeState.currentX = e.clientX;
        const diffX = swipeState.currentX - swipeState.startX;
        if (!swipeState.isSwiping && Math.abs(diffX) > 10) {
            swipeState.isSwiping = true;
        }
        if (swipeState.isSwiping) {
            e.preventDefault();
            swipeState.target.style.transition = 'none';
            const newTranslateX = Math.max(-140, Math.min(0, diffX));
            swipeState.target.style.transform = `translateX(${newTranslateX}px)`;
        }
    }
    function handlePointerUp(e) {
        if (!swipeState.target) return cleanupSwipe();
        const diffX = swipeState.currentX - swipeState.startX;
        const threshold = -70;
        swipeState.target.style.transition = 'transform 0.3s ease-out';
        if (swipeState.isSwiping) {
            if (diffX < threshold) {
                swipeState.target.style.transform = 'translateX(-140px)';
                swipeState.openItemWrapper = swipeState.target.parentElement;
            } else {
                swipeState.target.style.transform = 'translateX(0px)';
                if (swipeState.openItemWrapper === swipeState.target.parentElement) {
                    swipeState.openItemWrapper = null;
                }
            }
        }
        cleanupSwipe();
    }
    function cleanupSwipe() {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        swipeState = { ...swipeState, startX: 0, currentX: 0, isSwiping: false, target: null };
    }
    function closeSwipedItem(animate = true) {
        if (swipeState.openItemWrapper) {
            const content = swipeState.openItemWrapper.querySelector('.room-item-content');
            if(content) {
                content.style.transition = animate ? 'transform 0.3s ease-out' : 'none';
                content.style.transform = 'translateX(0px)';
            }
            swipeState.openItemWrapper = null;
        }
    }

    // --- MESSAGING ---
    async function listenForMessages(roomId) {
        const userRoomDoc = await db.collection('users').doc(currentUser.uid).collection('rooms').doc(roomId).get();
        const clearedAt = userRoomDoc.data()?.clearedAt;

        let query = db.collection('chatrooms').doc(roomId).collection('messages').orderBy('timestamp', 'desc');

        if (clearedAt) {
            query = query.where('timestamp', '>', clearedAt);
        }
        query = query.limit(30);

        messagesUnsubscribe = query.onSnapshot(snapshot => {
            const isInitialLoad = !lastVisibleMessage;
            let newMessagesForCurrentUser = false;

            if (isInitialLoad) {
                dom.chatMessages.innerHTML = '';
                lastMessageDate = null;
                snapshot.docs.reverse().forEach(doc => displayMessage(doc.id, doc.data()));
            } else {
                snapshot.docChanges().forEach(change => {
                    const docId = change.doc.id;
                    const docData = change.doc.data();
                    if (change.type === 'added') {
                        if (docData.senderId !== currentUser.uid) {
                            newMessagesForCurrentUser = true;
                            playNotificationSound({ ...docData, roomId });
                        }
                        const isScrolledToBottom = dom.chatMessages.scrollHeight - dom.chatMessages.clientHeight <= dom.chatMessages.scrollTop + 50;
                        const tempId = Array.from(dom.chatMessages.querySelectorAll('.message[id^="temp_"]')).find(el => el.dataset.text === docData.text || el.dataset.file === docData.file?.name);
                        tempId?.closest('.message-wrapper')?.remove();
                        if (!document.getElementById(docId)) displayMessage(docId, docData);
                        if (isScrolledToBottom) scrollToBottom();
                    }
                    if (change.type === 'modified') updateMessage(docId, docData);
                    if (change.type === 'removed') document.getElementById(docId)?.closest('.message-wrapper').remove();
                });
            }
            if (!snapshot.empty) lastVisibleMessage = snapshot.docs[0]; // Desc query, so first doc is the oldest in this batch
            else if (isInitialLoad) lastVisibleMessage = null;
            if (isInitialLoad) scrollToBottom();
            
            markVisibleMessagesAsRead();
            
            if (newMessagesForCurrentUser) {
                db.collection('users').doc(currentUser.uid).collection('rooms').doc(roomId).set({ unreadCount: 0 }, { merge: true }).catch(console.error);
            }
        });
    }
    
    function renderPoll(pollData, messageId) {
       const totalVotes = Object.values(pollData.options).reduce((sum, option) => sum + option.votes.length, 0);

       const optionsHtml = Object.entries(pollData.options).map(([optionText, optionData]) => {
           const voteCount = optionData.votes.length;
           const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
           const isVotedByMe = optionData.votes.includes(currentUser.uid);
           const escapedOptionText = optionText.replace(/'/g, "\\'");
           
           return `
               <div class="poll-option ${isVotedByMe ? 'voted-by-me' : ''}" onclick="window.handleVote('${messageId}', '${escapedOptionText}')" role="button" tabindex="0">
                   <div class="poll-option-bar" style="width: ${percentage}%;"></div>
                   <div class="poll-option-content">
                       <span class="poll-option-text">${optionText}</span>
                       <span class="poll-option-votes">${voteCount}</span>
                   </div>
               </div>
           `;
       }).join('');

       return `
            <div class="poll-container">
                <p class="poll-question">${pollData.question}</p>
                <div class="poll-options">${optionsHtml}</div>
                <div class="poll-footer">${totalVotes} total votes</div>
            </div>
        `;
    }
    
    async function handleVote(messageId, optionText) {
        const messageRef = db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageId);
        
        await db.runTransaction(async (transaction) => {
            const messageDoc = await transaction.get(messageRef);
            if (!messageDoc.exists) {
                throw "Message does not exist!";
            }
            
            const pollData = messageDoc.data();
            const newOptions = { ...pollData.options };

            // Remove previous vote if any
            for (const key in newOptions) {
                const index = newOptions[key].votes.indexOf(currentUser.uid);
                if (index > -1) {
                    newOptions[key].votes.splice(index, 1);
                }
            }

            // Add new vote
            if (newOptions[optionText]) {
                 if (!newOptions[optionText].votes.includes(currentUser.uid)) {
                    newOptions[optionText].votes.push(currentUser.uid);
                }
            }
            
            transaction.update(messageRef, { options: newOptions });
        });
    }

    function createMessageElement(docId, msg, isContinuation) {
        const msgDate = msg.timestamp?.toDate();
        const isSent = msg.senderId === currentUser.uid;
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isSent ? 'sent' : 'received'}`;
        if (isContinuation) {
            wrapper.classList.add('is-continuation');
        }

        const roomData = roomsDataCache.find(r => r.id === currentRoomId);
        if (roomData && roomData.type === 'group' && !isSent && !isContinuation) {
            wrapper.innerHTML += `<div class="sender-name">${msg.senderName || 'Anonymous'}</div>`;
        }
        let contentHTML = '';
        if (msg.forwardedFrom) contentHTML += `<div class="forwarded-info">↪️ Forwarded message</div>`;
        if (msg.replyTo) contentHTML += `<div class="reply-context" onclick="window.scrollToMessage('${msg.replyTo.messageId}')"><strong>${msg.replyTo.senderName}</strong><p>${msg.replyTo.text}</p></div>`;
        
        if (msg.base64Image) {
            contentHTML += `<img src="${msg.base64Image}" class="message-image" alt="Image" data-sender-name="${msg.senderName}" data-timestamp="${msgDate?.toLocaleString() || ''}">`;
        } else if (msg.voiceMessage) {
            const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z"/></svg>`;
            contentHTML += `<div class="voice-message-player">
                <button class="voice-play-btn" aria-label="Play voice message">${playIcon}</button>
                <div class="voice-progress-container"><div class="voice-progress-bar"></div></div>
                <span class="voice-duration">${(msg.voiceMessage.duration / 1000).toFixed(1)}s</span>
            </div>`;
        } else if (msg.file) {
            contentHTML += `<a href="${msg.file.dataUrl}" download="${msg.file.name}" class="file-link" target="_blank" rel="noopener noreferrer">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                    <div>
                        <strong>${msg.file.name}</strong>
                        <small style="display: block;">${(msg.file.size / 1024).toFixed(1)} KB</small>
                    </div>
                </div>
            </a>`;
        } else if (msg.type === 'poll') {
             contentHTML += renderPoll(msg, docId);
        }
        if (msg.text) contentHTML += `<p class="message-text">${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
        
        if (msg.linkPreview) {
            contentHTML += `<a href="${msg.linkPreview.url}" target="_blank" rel="noopener noreferrer" class="link-preview">
                ${msg.linkPreview.image ? `<img src="${msg.linkPreview.image}" class="link-preview-image" alt="Link preview image">` : ''}
                <div class="link-preview-details">
                    <div class="link-preview-sitename">${msg.linkPreview.siteName || ''}</div>
                    <div class="link-preview-title">${msg.linkPreview.title || ''}</div>
                    <div class="link-preview-description">${msg.linkPreview.description || ''}</div>
                </div>
            </a>`;
        }
        
        const canEdit = isSent && msg.text;
        const canDelete = isSent || currentUserRole === 'admin';
        const canPin = currentUserRole === 'admin';
        const textForJs = (msg.text || (msg.base64Image ? 'Photo' : (msg.file ? `File: ${msg.file.name}` : 'Message'))).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        const reactIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`;
        const replyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`;
        const forwardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg>`;
        const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
        const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
        const pinActionIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M12 12c-2 0-4.5-1-4.5-3.5S10 5 12 5s4.5 1.5 4.5 3.5-2 3.5-4.5 3.5Z"/><path d="m18 9 1.3-1.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0L12 3"/></svg>`;
        
        const messageDiv = document.createElement('div');
        messageDiv.id = docId;
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        if (msg.type === 'poll') messageDiv.classList.add('is-poll');

        messageDiv.dataset.text = msg.text || '';
        if (msg.voiceMessage) messageDiv.dataset.voiceUrl = msg.voiceMessage.dataUrl;
        if (msg.file) messageDiv.dataset.file = msg.file.name;
        
        let receiptHTML = '';
        if (isSent) {
            if (docId.startsWith('temp_')) {
                const isFailed = msg.status === 'failed';
                const statusIcon = isFailed ? '&#x26A0;' : '🕒';
                const statusClass = msg.status || 'sending';
                const statusTitle = isFailed ? 'Failed to send' : (msg.status === 'queued' ? 'Queued' : 'Sending...');
                receiptHTML = `<span class="read-receipt ${statusClass}" title="${statusTitle}">${statusIcon}</span>`;
            } else {
                receiptHTML = `<span class="read-receipt"></span>`;
            }
        }

        messageDiv.innerHTML = `<div class="message-actions">
                <button title="React" onclick="window.handleReaction('${docId}', '👍')">${reactIcon}</button>
                <button title="Reply" onclick="window.startReply('${docId}', '${msg.senderName}', '${textForJs}')">${replyIcon}</button>
                <button title="Forward" onclick="window.forwardMessage('${docId}')">${forwardIcon}</button>
                ${canEdit ? `<button title="Edit" onclick="window.showEditModal('${docId}', '${textForJs}')">${editIcon}</button>` : ''}
                ${canDelete ? `<button title="Delete" onclick="window.deleteMessage('${docId}')">${deleteIcon}</button>` : ''}
                ${canPin ? `<button title="Pin" onclick="window.pinMessage('${docId}')">${pinActionIcon}</button>` : ''}
            </div>
            ${contentHTML}
             <div class="reactions-container"></div>
            <div class="message-meta">
                ${msg.isEdited ? `<span class="edited-indicator">(edited)</span>` : ''}
                <span class="message-timestamp">${msgDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}</span>
                ${receiptHTML}
            </div>`;
        wrapper.appendChild(messageDiv);
        
        if (!docId.startsWith('temp_') && isSent) {
            updateMessage(docId, msg, wrapper);
        }

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

        const lastMsgWrapper = dom.chatMessages.querySelector('.message-wrapper:last-of-type');
        let isContinuation = false;

        if (lastMsgWrapper && !lastMsgWrapper.classList.contains('date-separator')) {
            const lastSender = lastMsgWrapper.dataset.senderId;
            const lastTimestamp = parseInt(lastMsgWrapper.dataset.timestamp, 10);
            const currentTimestamp = msg.timestamp?.toDate().getTime();

            if (lastSender === msg.senderId && currentTimestamp && lastTimestamp) {
                const timeDiffMinutes = (currentTimestamp - lastTimestamp) / (1000 * 60);
                if (timeDiffMinutes < 5) {
                    isContinuation = true;
                    lastMsgWrapper.classList.add('has-continuation');
                }
            }
        }

        const wrapper = createMessageElement(docId, msg, isContinuation);
        wrapper.dataset.senderId = msg.senderId;
        if(msg.timestamp) {
            wrapper.dataset.timestamp = msg.timestamp.toDate().getTime();
        }

        lastSenderId = msg.senderId;
        const target = dom.chatMessages.querySelector('.typing-indicator') || null;
        dom.chatMessages.insertBefore(wrapper, target);
    }
    function updateMessage(docId, msg, wrapperEl = null) {
        const wrapper = wrapperEl || document.getElementById(docId)?.closest('.message-wrapper');
        if (!wrapper) return;
        const el = wrapper.querySelector('.message');
        if (!el) return;

        if (msg.text) {
            const textEl = el.querySelector('.message-text');
            if (textEl && textEl.innerHTML !== msg.text) textEl.innerHTML = msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        if (msg.type === 'poll') {
            const pollContainer = el.querySelector('.poll-container');
            if (pollContainer) {
                pollContainer.outerHTML = renderPoll(msg, docId);
            }
        }

        renderReactions(el, docId, msg.reactions || {});
        updateReceipts(wrapper, msg);
    }
    async function fetchMoreMessages() {
        if (!currentRoomId || isFetchingMessages || !lastVisibleMessage) return;
        isFetchingMessages = true;
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        dom.chatMessages.prepend(spinner);
        const oldScrollHeight = dom.chatMessages.scrollHeight;
        try {
            const userRoomDoc = await db.collection('users').doc(currentUser.uid).collection('rooms').doc(currentRoomId).get();
            const clearedAt = userRoomDoc.data()?.clearedAt;
    
            let query = db.collection('chatrooms').doc(currentRoomId).collection('messages').orderBy('timestamp', 'desc');
    
            if (clearedAt) {
                query = query.where('timestamp', '>', clearedAt);
            }
    
            query = query.startAfter(lastVisibleMessage).limit(30);
            
            const snapshot = await query.get();
            
            // Remove spinner before adding messages
            spinner.remove();
            
            if (snapshot.empty) { 
                lastVisibleMessage = null; // No more messages to load
                isFetchingMessages = false;
                return; 
            }
            
            lastVisibleMessage = snapshot.docs[snapshot.docs.length - 1]; // Oldest message in this batch is the new cursor
            
            let previousMessageDate = null;
            const topMessage = dom.chatMessages.querySelector('.message-wrapper');
            if(topMessage && topMessage.dataset.timestamp) {
                 previousMessageDate = new Date(parseInt(topMessage.dataset.timestamp, 10));
            }
    
            snapshot.docs.reverse().forEach(doc => {
                 const msgData = doc.data();
                 const msgDate = msgData.timestamp.toDate();
    
                if (previousMessageDate && msgDate.toDateString() !== previousMessageDate.toDateString()) {
                    const separator = document.createElement('div');
                    separator.className = 'date-separator';
                    separator.textContent = getFormattedDate(previousMessageDate);
                    dom.chatMessages.insertBefore(separator, topMessage);
                }
    
                const messageElement = createMessageElement(doc.id, msgData);
                dom.chatMessages.prepend(messageElement);
                previousMessageDate = msgDate;
            });
    
            dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight - oldScrollHeight;
        } catch (error) {
            console.error("Error fetching more messages:", error);
            spinner.remove();
        } finally {
            isFetchingMessages = false;
        }
    }
    async function handleSendMessage(e) {
        e.preventDefault();
        const text = dom.messageInput.value.trim();
        if (!text) return;

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundUrl = text.match(urlRegex)?.[0];
        let previewData = null;

        if (foundUrl) {
            previewData = await generateLinkPreview(foundUrl);
        }

        const content = { text, linkPreview: previewData };
        const replyContext = activeReply;

        dom.messageInput.value = '';
        dom.messageInput.dispatchEvent(new Event('input')); // Trigger UI update
        cancelReply();
        updateTypingStatus();
        attemptToSend(content, replyContext);
    }
    async function attemptToSend(content, replyContext) {
        const tempId = `temp_${Date.now()}`;
        const optimisticMessageData = {
            senderId: currentUser.uid,
            senderName: currentUserProfileData.displayName,
            timestamp: { toDate: () => new Date() },
            ...content,
            replyTo: replyContext,
            status: navigator.onLine ? 'sending' : 'queued'
        };
    
        displayMessage(tempId, optimisticMessageData);
        scrollToBottom();
        
        if (!navigator.onLine) {
            await saveMessageOffline({ id: tempId, content, replyContext, roomId: currentRoomId });
            return;
        }
    
        try {
            await sendMessage(content, currentRoomId, replyContext);
        } catch (error) {
            console.error("Message send failed:", error);
            const failedMsgEl = document.getElementById(tempId);
            if (failedMsgEl) {
                failedMsgEl.dataset.status = 'failed';
                const receipt = failedMsgEl.querySelector('.read-receipt');
                if (receipt) {
                    receipt.className = 'read-receipt failed';
                    receipt.title = 'Failed to send';
                    receipt.innerHTML = `&#x26A0;`;
                }
                const meta = failedMsgEl.querySelector('.message-meta');
                if (meta && !meta.querySelector('.retry-button')) {
                    const retryBtn = document.createElement('button');
                    retryBtn.className = 'modal-button danger small retry-button';
                    retryBtn.textContent = 'Retry';
                    retryBtn.onclick = (e) => {
                        e.stopPropagation();
                        failedMsgEl.closest('.message-wrapper').remove();
                        attemptToSend(content, replyContext);
                    };
                    meta.appendChild(retryBtn);
                }
            }
        }
    }
    async function sendMessage(content, targetRoomId, replyContext) {
        const messageData = {
            senderId: currentUser.uid,
            senderName: currentUserProfileData.displayName,
            senderPhotoUrl: currentUserProfileData.photoUrl || null,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            readBy: [currentUser.uid],
            ...content,
            replyTo: replyContext,
            isEdited: false
        };
        if (messageData.linkPreview === undefined) {
            messageData.linkPreview = null;
        }

        const roomRef = db.collection('chatrooms').doc(targetRoomId);
        const batch = db.batch();
        const messageRef = roomRef.collection('messages').doc();
        batch.set(messageRef, messageData);
        batch.update(roomRef, {
            lastMessage: { text: content.text || (content.base64Image ? '📷 Photo' : (content.voiceMessage ? '🎤 Voice Message' : (content.file ? `📄 ${content.file.name}` : (content.type === 'poll' ? '📊 Poll' : '')))), timestamp: messageData.timestamp }
        });

        const roomData = roomsDataCache.find(r => r.id === targetRoomId);
        if (roomData && roomData.participantIds) {
            roomData.participantIds.forEach(participantId => {
                if (participantId !== currentUser.uid) {
                    const userRoomRef = db.collection('users').doc(participantId).collection('rooms').doc(targetRoomId);
                    batch.update(userRoomRef, {
                        unreadCount: firebase.firestore.FieldValue.increment(1)
                    });
                }
            });
        }

        await batch.commit();
    }
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
        if (!container) return;
        container.innerHTML = Object.entries(reactions).map(([emoji, uids]) => {
            if (!uids || uids.length === 0) return '';
            const isMine = uids.includes(currentUser.uid);
            return `<span class="reaction-chip ${isMine ? 'mine' : ''}" onclick="window.handleReaction('${msgId}', '${emoji}')">${emoji} ${uids.length}</span>`;
        }).join('');
    }
    async function handleReaction(msgId, emoji) {
        if (msgId.startsWith('temp_')) return;
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
    function updateReceipts(msgWrapper, msgData) {
        if (msgWrapper.querySelector('.message').id.startsWith('temp_') || msgData.senderId !== currentUser.uid) return;
    
        const metaContainer = msgWrapper.querySelector('.message-meta');
        if (!metaContainer) return;
    
        const existingReceipt = metaContainer.querySelector('.read-receipt');
        const existingUnreadCount = metaContainer.querySelector('.unread-count-indicator');
        if (existingUnreadCount) existingUnreadCount.remove();
        
        if (existingReceipt) {
            existingReceipt.style.display = 'none';
            existingReceipt.className = 'read-receipt';
            existingReceipt.innerHTML = '';
            existingReceipt.onmouseenter = null;
            existingReceipt.onmouseleave = null;
        }
    
        const room = roomsDataCache.find(r => r.id === currentRoomId);
        if (!room || !room.participantIds) return;
    
        const total = room.participantIds.length;
        const readCount = msgData.readBy?.length || 0;
    
        if (room.type === 'group' && total > 2) {
            const unreadCount = total - readCount;
    
            if (unreadCount > 0) {
                const unreadIndicator = document.createElement('span');
                unreadIndicator.className = 'unread-count-indicator interactive';
                unreadIndicator.textContent = unreadCount;
                unreadIndicator.title = `Unread by ${unreadCount} people`;
                unreadIndicator.onmouseenter = (e) => showReadByPopover(e, msgData.readBy, true);
                unreadIndicator.onmouseleave = hideReadByPopover;
                metaContainer.insertBefore(unreadIndicator, metaContainer.querySelector('.message-timestamp'));
            } else {
                if (existingReceipt) {
                    existingReceipt.style.display = 'inline-block';
                    existingReceipt.className = 'read-receipt receipt-read interactive';
                    existingReceipt.title = 'Read by everyone';
                    existingReceipt.onmouseenter = (e) => showReadByPopover(e, msgData.readBy, false);
                    existingReceipt.onmouseleave = hideReadByPopover;
                }
            }
        } else {
            if (existingReceipt) {
                existingReceipt.style.display = 'inline-block';
                const isRead = readCount >= total;
                existingReceipt.className = isRead ? 'read-receipt receipt-read' : 'read-receipt receipt-sent';
                existingReceipt.title = isRead ? 'Read' : 'Sent';
            }
        }
    }
    async function markVisibleMessagesAsRead() {
        if (!currentRoomId || document.hidden) return;
        const unread = dom.chatMessages.querySelectorAll('.message.received:not([data-read])');
        if (unread.length === 0) return;

        const batch = db.batch();
        let updates = 0;
        
        const containerRect = dom.chatMessages.getBoundingClientRect();

        unread.forEach(msgDiv => {
            const msgRect = msgDiv.getBoundingClientRect();
            
            const isVisible = (
                msgRect.top <= containerRect.bottom &&
                msgRect.bottom >= containerRect.top
            );

            if (isVisible) {
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
            const unpinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`;
            banner.innerHTML = `<div>📌 <strong>${pinnedData.senderName}</strong>: <p>${pinnedData.text}</p></div>
                                ${currentUserRole === 'admin' ? `<button class="unpin-button icon-button" onclick="window.unpinMessage()">${unpinIcon}</button>` : ''}`;
            banner.addEventListener('click', (e) => {
                if (!e.target.closest('button')) scrollToMessage(pinnedData.id);
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
                forwardedFrom: roomData?.title || 'A chat'
            };
            await sendMessage(content, targetRoomId, null);
            showCustomAlert("Success", "Message forwarded.");
        });
    }
    async function deleteMessage(messageId) {
        if (await showConfirmationModal("Delete Message", "Delete this message for everyone? This cannot be undone.")) {
            await db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageId).delete();
        }
    }
    async function handleEditMessage(e) {
        e.preventDefault();
        const newText = dom.editMessageInput.value.trim();
        if (newText && messageIdToEdit) {
            await db.collection('chatrooms').doc(currentRoomId).collection('messages').doc(messageIdToEdit).update({ text: newText, isEdited: true });
            hideModal(dom.editMessageModal);
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
            const typingUsers = snapshot.docs
                .filter(doc => doc.id !== currentUser.uid)
                .map(doc => doc.data().name);
            
            let indicator = dom.chatMessages.querySelector('.typing-indicator');
            if (typingUsers.length > 0) {
                if (!indicator) { indicator = document.createElement('div'); indicator.className = 'typing-indicator'; dom.chatMessages.appendChild(indicator); }
                indicator.textContent = `${typingUsers.join(', ')} is typing...`;
                scrollToBottom();
            } else if (indicator) {
                indicator.remove();
            }
        });
    }

    // --- MEDIA & UPLOADS ---
    async function showMediaGallery() {
        showModal(dom.mediaGalleryModal);
        dom.mediaGrid.innerHTML = '<div class="loading-spinner"></div>';
        const mediaSnapshot = await db.collection('chatrooms').doc(currentRoomId).collection('messages').where('base64Image', '!=', null).orderBy('base64Image').orderBy('timestamp', 'desc').limit(50).get();
        if(mediaSnapshot.empty) {
            dom.mediaGrid.innerHTML = '<p>No images in this chat.</p>';
            return;
        }
        dom.mediaGrid.innerHTML = mediaSnapshot.docs.map(doc => `<div class="media-item"><img src="${doc.data().base64Image}" alt="Shared media"></div>`).join('');
    }
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) { 
            showCustomAlert("File Too Large", "Image size cannot exceed 1MB."); 
            e.target.value = '';
            return; 
        }
        const replyContext = activeReply;
        cancelReply();
        
        dom.progressBarContainer.style.display = 'block';
        dom.progressBar.style.width = '50%';
        
        compressImage(file).then(compressedImage => {
            dom.progressBar.style.width = '100%';
            attemptToSend({ base64Image: compressedImage }, replyContext);
            setTimeout(() => {
                dom.progressBarContainer.style.display = 'none';
                dom.progressBar.style.width = '0%';
            }, 500);
        }).catch(err => {
            console.error("Image compression error:", err);
            showCustomAlert("Error", "Could not process image.");
            dom.progressBarContainer.style.display = 'none';
            dom.progressBar.style.width = '0%';
        });
        e.target.value = '';
    }
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) { // 1MB limit
            showCustomAlert("File Too Large", "File size cannot exceed 1MB.");
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: event.target.result
            };
            attemptToSend({ file: fileData }, activeReply);
        };
        reader.onerror = () => {
            showCustomAlert("Error", "Could not read file.");
        };
        reader.readAsDataURL(file);
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
                img.onerror = reject;
            };
            reader.onerror = error => reject(error);
        });
    }

    // --- ROOM MANAGEMENT ---
    async function handleClearChat() {
        if (!currentRoomId) return;
    
        const confirmed = await showConfirmationModal(
            "Clear My Chat History",
            "This will permanently delete your copy of the message history in this chat. Other participants' history will not be affected. Are you sure?"
        );
    
        if (confirmed) {
            try {
                const userRoomRef = db.collection('users').doc(currentUser.uid).collection('rooms').doc(currentRoomId);
                await userRoomRef.set({
                    clearedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                dom.chatMessages.innerHTML = '';
                lastVisibleMessage = null;
                lastMessageDate = null;
                if (messagesUnsubscribe) messagesUnsubscribe();
                listenForMessages(currentRoomId);
                
                hideModal(dom.participantModal);
    
            } catch (error) {
                console.error("Error clearing chat history:", error);
                showCustomAlert("Error", "Failed to clear chat history.");
            }
        }
    }
    async function createNewGroupRoom() {
        try {
            const roomName = await showCustomPrompt('Create New Group Chat', 'Enter a name for your group chat.', 'Group Chat Name', 'Next');
            if (!roomName) return;
            const selectedMemberIds = await showMemberPickerModal('Invite Members', 'Select members to invite to the chat.');
            
            showCustomAlert("Creating...", "Please wait while we set up your new group chat.");
            
            const batch = db.batch();
            const newRoomRef = db.collection('chatrooms').doc();
            const roomId = newRoomRef.id;
    
            const roomData = {
                title: roomName.trim(),
                type: 'group',
                createdBy: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: null,
                participantIds: [currentUser.uid],
                participantNames: { [currentUser.uid]: currentUserProfileData.displayName },
                participantAvatars: { [currentUser.uid]: currentUserProfileData.photoUrl || null },
            };
            batch.set(newRoomRef, roomData);
    
            const creatorMemberRef = newRoomRef.collection('members').doc(currentUser.uid);
            batch.set(creatorMemberRef, { role: "admin", joinedAt: firebase.firestore.FieldValue.serverTimestamp(), userId: currentUser.uid });
            
            const userRoomRef = db.collection("users").doc(currentUser.uid).collection("rooms").doc(roomId);
            batch.set(userRoomRef, { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
    
            if (selectedMemberIds && selectedMemberIds.length > 0) {
                selectedMemberIds.forEach(userIdToInvite => {
                    const invitationRef = db.collection("invitations").doc();
                    batch.set(invitationRef, {
                        roomId: roomId, 
                        roomName: roomData.title, 
                        userId: userIdToInvite,
                        invitedBy: currentUser.uid, 
                        invitedByName: currentUserProfileData.displayName,
                        status: 'pending', 
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
            }
            
            await batch.commit();
    
            showCustomAlert('Success!', `Group chat created! Invitations will be sent.`);
            selectRoom(roomId);
            
        } catch (error) { 
            console.error("Error creating group room:", error); 
            showCustomAlert('Error', `Failed to create group chat: ${error.message}`);
        }
    }
    async function joinGroupById() {
        try {
            const roomIdToJoin = await showCustomPrompt('Join Group by ID', 'Enter the ID of the group chat to join.', 'Chat Room ID', 'Request to Join');
            if (!roomIdToJoin) return;

            const roomRef = db.collection('chatrooms').doc(roomIdToJoin);
            const roomDoc = await roomRef.get();
    
            if (!roomDoc.exists) {
                return showCustomAlert('Error', 'No chat room found with that ID.');
            }
            const roomData = roomDoc.data();
            if (roomData.type !== 'group') {
                return showCustomAlert('Error', 'You can only join group chats by ID.');
            }
            if (roomData.participantIds.includes(currentUser.uid)) {
                return showCustomAlert('Info', 'You are already a member of this chat.');
            }
            
            const existingRequest = await db.collection('joinRequests')
                                        .where('userId', '==', currentUser.uid)
                                        .where('roomId', '==', roomIdToJoin)
                                        .where('status', '==', 'pending')
                                        .limit(1)
                                        .get();
    
            if (!existingRequest.empty) {
                return showCustomAlert('Info', 'You have already sent a request to join this group.');
            }
    
            const joinRequestData = {
                roomId: roomIdToJoin,
                roomName: roomData.title || 'Untitled Group',
                userId: currentUser.uid,
                userName: currentUserProfileData.displayName,
                adminId: roomData.createdBy,
                status: 'pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
    
            await db.collection('joinRequests').add(joinRequestData);
            showCustomAlert("Success", "Your request to join has been sent. Please wait for an admin to approve it.");
        } catch (error) {
            console.error("Error joining group:", error);
            showCustomAlert("Error", error.message || "Failed to send join request.");
        }
    }
    async function startPrivateChat() {
        try {
            const targetUser = await showUserPickerModal('Start 1-on-1 Chat', 'Search for and select a user to chat with.');
            if (!targetUser || targetUser.id === currentUser.uid) return;
    
            const roomId = [currentUser.uid, targetUser.id].sort().join('_');
            const roomRef = db.collection('chatrooms').doc(roomId);
            const existingRoomDoc = await roomRef.get();
    
            if (existingRoomDoc.exists) {
                selectRoom(roomId);
                return;
            }
    
            const batch = db.batch();
    
            const roomData = {
                type: 'private', 
                createdBy: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                lastMessage: null,
                participantIds: [currentUser.uid, targetUser.id], 
                participantNames: { 
                    [currentUser.uid]: currentUserProfileData.displayName, 
                    [targetUser.id]: targetUser.displayName 
                },
                participantAvatars: { 
                    [currentUser.uid]: currentUserProfileData.photoUrl || null, 
                    [targetUser.id]: targetUser.photoUrl || null 
                },
            };
            batch.set(roomRef, roomData);
    
            const currentUserRoomRef = db.collection("users").doc(currentUser.uid).collection("rooms").doc(roomId);
            batch.set(currentUserRoomRef, { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
            const targetUserRoomRef = db.collection("users").doc(targetUser.id).collection("rooms").doc(roomId);
            batch.set(targetUserRoomRef, { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
    
            await batch.commit();
            selectRoom(roomId);
    
        } catch (error) {
            console.error("Error starting 1-on-1 chat:", error);
            showCustomAlert("Error", `Failed to start chat: ${error.message}`);
        }
    }
    async function showRoomInfo() {
        const roomData = roomsDataCache.find(r => r.id === currentRoomId);
        if (!roomData) return;
        if (roomMembersUnsubscribe) roomMembersUnsubscribe();
        if (presenceUnsubscribe) presenceUnsubscribe();
        dom.modalTitle.textContent = roomData.type === 'private' ? 'Conversation Info' : roomData.title;
        if (roomData.type === 'group') {
            dom.modalRoomIdContainer.style.display = 'block';
            dom.modalRoomIdText.textContent = roomData.id;
        } else {
            dom.modalRoomIdContainer.style.display = 'none';
        }
        const membersRef = db.collection('chatrooms').doc(currentRoomId).collection('members');
        roomMembersUnsubscribe = membersRef.onSnapshot(async membersSnapshot => {
            dom.participantList.innerHTML = '<div class="loading-spinner"></div>';
            const roles = new Map(membersSnapshot.docs.map(doc => [doc.id, doc.data().role]));
            const fullRoomData = roomsDataCache.find(r => r.id === currentRoomId);
            if (!fullRoomData) return;
            const participantIds = fullRoomData.participantIds || [];
            dom.participantList.innerHTML = '';
            participantIds.forEach(id => {
                const isAdmin = roles.get(id) === 'admin';
                const name = fullRoomData.participantNames[id] || 'Unknown User';
                const isBlocked = currentUserProfileData.blockedUsers?.includes(id);
                const item = document.createElement('div');
                item.className = 'participant-item';
                item.dataset.userId = id;
                item.dataset.userName = name;
                item.dataset.role = isAdmin ? 'admin' : 'member';
                item.dataset.blocked = isBlocked;
                item.innerHTML = `<div class="participant-info" data-action="view-profile" role="button" tabindex="0">
                        <span class="online-status" title="Offline"></span>
                        <span class="participant-name">${name}</span>
                        ${id === currentUser.uid ? '<span class="self-badge">You</span>' : ''}
                        ${isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                    </div>
                    <div class="participant-actions">
                        ${(currentUserRole === 'admin' && id !== currentUser.uid) ? `<button class="modal-button secondary small" data-action="update-role" data-payload="${isAdmin ? 'member' : 'admin'}">${isAdmin ? 'Demote' : 'Promote'}</button><button class="modal-button danger small" data-action="remove-member">Remove</button>` : ''}
                        ${(roomData.type === 'private' && id !== currentUser.uid) ? `<button class="modal-button ${isBlocked ? 'secondary' : 'danger'} small" data-action="toggle-block">${isBlocked ? 'Unblock' : 'Block'}</button>` : ''}
                    </div>`;
                dom.participantList.appendChild(item);
            });
            if (presenceUnsubscribe) presenceUnsubscribe();
            if (participantIds.length > 0 && roomData.type === 'group') {
                const idsToListen = participantIds.slice(0, 30);
                presenceUnsubscribe = db.collection('presence').where(firebase.firestore.FieldPath.documentId(), 'in', idsToListen)
                    .onSnapshot(presenceSnapshot => {
                        const now = Date.now();
                        const onlineThreshold = 5 * 60 * 1000;
                        const onlineUsers = new Set();
                        presenceSnapshot.forEach(doc => {
                            const presenceData = doc.data();
                            if (presenceData.lastActiveAt && (now - presenceData.lastActiveAt.toMillis() < onlineThreshold)) {
                                onlineUsers.add(doc.id);
                            }
                        });
                        dom.participantList.querySelectorAll('.participant-item').forEach(item => {
                            const userId = item.dataset.userId;
                            const statusIndicator = item.querySelector('.online-status');
                            if (statusIndicator) {
                                if (onlineUsers.has(userId)) {
                                    statusIndicator.classList.add('online');
                                    statusIndicator.title = 'Online';
                                } else {
                                    statusIndicator.classList.remove('online');
                                    statusIndicator.title = 'Offline';
                                }
                            }
                        });
                    });
            }
        });
        dom.adminControls.style.display = (currentUserRole === 'admin' && roomData.type === 'group') ? 'block' : 'none';
        showModal(dom.participantModal);
    }
    async function addMembersToRoom() {
        try {
            const selectedMemberIds = await showMemberPickerModal('Add Members', 'Select members to add to the chat.');
            if (!selectedMemberIds || selectedMemberIds.length === 0) return;
            const roomData = roomsDataCache.find(r => r.id === currentRoomId);
            selectedMemberIds.forEach(uid => {
                db.collection('invitations').add({ roomId: currentRoomId, roomName: roomData.title, userId: uid, invitedBy: currentUser.uid, invitedByName: currentUserProfileData.displayName, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            });
            showCustomAlert("Success", "New member invitations have been sent.");
            hideModal(dom.participantModal);
        } catch (error) { if (error) console.error("Error adding members:", error); }
    }
    async function editRoomName() {
        try {
            const newName = await showCustomPrompt('Change Chat Room Name', 'Enter the new name for the chat room', 'Chat Room Name');
            if (newName) {
                await db.collection('chatrooms').doc(currentRoomId).update({ title: newName });
                dom.roomTitleElem.textContent = newName;
            }
        } catch (error) { if (error) console.error("Error changing room name:", error); }
    }
    async function deleteRoomAsAdmin() {
        if (await showConfirmationModal('Delete Chat Room', 'Are you sure you want to delete this chat room? All messages will be permanently deleted.')) {
            await db.collection('chatrooms').doc(currentRoomId).delete();
            hideModal(dom.participantModal);
            resetChatView();
        }
    }
    async function deleteRoomForSelf() {
        const roomData = roomsDataCache.find(r => r.id === currentRoomId);
        if (!roomData) return;
        if (!(await showConfirmationModal('Leave Chat Room', 'Are you sure you want to leave this chat room?'))) return;
        
        try {
            const adminCountSnapshot = await db.collection('chatrooms').doc(currentRoomId).collection('members').where('role', '==', 'admin').get();
            if (roomData.type === 'group' && currentUserRole === 'admin' && adminCountSnapshot.size <= 1) {
                return showCustomAlert("Action Not Allowed", "You are the last admin. Please promote another member to admin before leaving, or delete the group.");
            }
            const roomRef = db.collection('chatrooms').doc(currentRoomId);
            const batch = db.batch();
            batch.delete(db.collection('users').doc(currentUser.uid).collection('rooms').doc(currentRoomId));
            if (roomData.type === 'group') {
                batch.update(roomRef, { 
                    participantIds: firebase.firestore.FieldValue.arrayRemove(currentUser.uid), 
                    [`participantNames.${currentUser.uid}`]: firebase.firestore.FieldValue.delete(),
                    [`participantAvatars.${currentUser.uid}`]: firebase.firestore.FieldValue.delete()
                });
                batch.delete(roomRef.collection('members').doc(currentUser.uid));
            }
            await batch.commit();
            resetChatView();
        } catch (error) {
            console.error("Error leaving room:", error);
            showCustomAlert("Error", "Could not leave the room. Please try again.");
        }
    }
    async function removeParticipant(userId, userName) {
        if (!(await showConfirmationModal("Remove Member", `Are you sure you want to remove ${userName} from the group?`))) return;
        
        const userToRemoveIsAdminDoc = await db.collection('chatrooms').doc(currentRoomId).collection('members').doc(userId).get();
        if (userToRemoveIsAdminDoc.exists && userToRemoveIsAdminDoc.data().role === 'admin') {
            const adminCountSnapshot = await db.collection('chatrooms').doc(currentRoomId).collection('members').where('role', '==', 'admin').get();
            if (adminCountSnapshot.size <= 1) {
                return showCustomAlert("Action Not Allowed", "The group must have at least one admin. You cannot remove the last admin.");
            }
        }
    
        const batch = db.batch();
        const roomRef = db.collection('chatrooms').doc(currentRoomId);
        
        batch.update(roomRef, {
            participantIds: firebase.firestore.FieldValue.arrayRemove(userId),
            [`participantNames.${userId}`]: firebase.firestore.FieldValue.delete(),
            [`participantAvatars.${userId}`]: firebase.firestore.FieldValue.delete()
        });
        batch.delete(roomRef.collection('members').doc(userId));
        batch.delete(db.collection('users').doc(userId).collection('rooms').doc(currentRoomId));
    
        await batch.commit();
    }
    async function updateRole(userId, newRole) {
        const adminCountSnapshot = await db.collection('chatrooms').doc(currentRoomId).collection('members').where('role', '==', 'admin').get();
        if (newRole === 'member' && adminCountSnapshot.size <= 1) { return showCustomAlert("Action Not Allowed", "Cannot demote the last admin."); }
        await db.collection('chatrooms').doc(currentRoomId).collection('members').doc(userId).update({ role: newRole });
    }

    // --- USER PROFILE & BLOCKING ---
    async function showUserProfile(userId, isCurrentUser = false) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) return showCustomAlert("Error", "Could not find user information.");
            const userData = userDoc.data();

            const presenceDoc = await db.collection('presence').doc(userId).get();
            const lastSeenText = presenceDoc.exists ? formatLastSeen(presenceDoc.data().lastActiveAt) : 'Last seen: Unknown';

            dom.userProfileModalTitle.textContent = isCurrentUser ? "My Profile" : "Profile Information";
            dom.userProfileId.textContent = userId;
            dom.profileModalFooter.style.display = isCurrentUser ? 'flex' : 'none';
            if (isCurrentUser) {
                dom.profileModalFooter.querySelector('#profile-logout-btn').onclick = () => auth.signOut();
            }
            toggleProfileEditMode(false, userData, lastSeenText);
            showModal(dom.userProfileModal);
        } catch (error) {
            console.error("Error showing user profile:", error);
        }
    }
    function toggleProfileEditMode(isEditing, data = currentUserProfileData, lastSeen = 'Online') {
        const v = (el) => el.style.display = isEditing ? 'none' : 'block';
        const e = (el) => el.style.display = isEditing ? 'block' : 'none';
    
        dom.userProfilePhoto.src = data.photoUrl || PLACEHOLDER_IMAGE_100;
        dom.userProfileNameView.textContent = data.displayName || "No Name";
        dom.userProfileStatusView.textContent = data.isGuest ? "Guest User" : lastSeen;
        dom.userProfileCustomStatusView.textContent = data.status || "";
        dom.userProfileEmailView.textContent = data.isGuest ? "Guest User" : (data.email || "No Email");
        dom.userProfilePhoneView.textContent = data.phone || "Not provided";
    
        v(dom.userProfileNameView); e(dom.userProfileNameEdit);
        v(dom.userProfileCustomStatusView); e(dom.userProfileStatusEdit);
        v(dom.userProfileEmailView); e(dom.userProfileEmailEdit);
        v(dom.userProfilePhoneView); e(dom.userProfilePhoneEdit);
        e(dom.profilePhotoEditOverlay);
        dom.profileModalActions.style.display = isEditing ? 'flex' : 'none';
        
        const isOwnProfile = dom.userProfileId.textContent === currentUser.uid;
        dom.userProfileEditBtn.style.display = isEditing || !isOwnProfile || data.isGuest ? 'none' : 'inline-flex';

        if (isEditing) {
            dom.userProfileNameEdit.value = data.displayName || '';
            dom.userProfileStatusEdit.value = data.status || '';
            dom.userProfileEmailEdit.value = data.email || '';
            dom.userProfilePhoneEdit.value = data.phone || '';
            dom.profilePhotoInput.value = '';
        }
    }
    async function saveUserProfile(e) {
        const saveButton = e.target.closest('button');
        toggleButtonLoading(saveButton, true);
        try {
            const newName = dom.userProfileNameEdit.value.trim();
            if (!newName) throw new Error("Name cannot be empty.");
            
            let newPhotoUrl = currentUserProfileData.photoUrl;
            const file = dom.profilePhotoInput.files[0];
            if (file) {
                newPhotoUrl = await compressImage(file);
            }
    
            const updateData = {
                displayName: newName,
                displayName_lower: newName.toLowerCase(),
                searchKeys: generateSearchKeys(newName),
                status: dom.userProfileStatusEdit.value,
                email: dom.userProfileEmailEdit.value.trim(),
                phone: dom.userProfilePhoneEdit.value.trim(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                photoUrl: newPhotoUrl,
            };
            
            const nameChanged = currentUserProfileData.displayName !== newName;
            const photoChanged = currentUserProfileData.photoUrl !== newPhotoUrl;
            
            const batch = db.batch();
    
            batch.update(db.collection('users').doc(currentUser.uid), updateData);
            
            if (nameChanged || photoChanged) {
                const userRoomsSnapshot = await db.collection('users').doc(currentUser.uid).collection('rooms').get();
                if (!userRoomsSnapshot.empty) {
                    const propagationUpdate = {};
                    if (nameChanged) { propagationUpdate[`participantNames.${currentUser.uid}`] = newName; }
                    if (photoChanged) { propagationUpdate[`participantAvatars.${currentUser.uid}`] = newPhotoUrl; }
                    
                    userRoomsSnapshot.docs.forEach(doc => {
                        const roomRef = db.collection('chatrooms').doc(doc.id);
                        batch.update(roomRef, propagationUpdate);
                    });
                }
            }
            
            await batch.commit();
            
            await currentUser.updateProfile({ displayName: newName });
            
            currentUserProfileData = { ...currentUserProfileData, ...updateData };
            showCustomAlert("Success", "Profile updated successfully.");
            toggleProfileEditMode(false, currentUserProfileData);
        } catch (error) {
            console.error("Profile save failed:", error);
            showCustomAlert("Error", error.message || "Failed to save profile.");
        } finally {
            toggleButtonLoading(saveButton, false);
        }
    }
    async function blockUser(userId) {
        if (!await showConfirmationModal('Block User', 'Are you sure you want to block this user? You will no longer see their messages.')) return;
        await db.collection('users').doc(currentUser.uid).update({ blockedUsers: firebase.firestore.FieldValue.arrayUnion(userId) });
        showCustomAlert('Success', 'User has been blocked.');
        hideModal(dom.participantModal);
        resetChatView();
    }
    async function unblockUser(userId) {
        await db.collection('users').doc(currentUser.uid).update({ blockedUsers: firebase.firestore.FieldValue.arrayRemove(userId) });
        showCustomAlert('Success', 'User has been unblocked. You may need to re-enter the chat to see their messages.');
        hideModal(dom.participantModal);
    }
    function showReadByPopover(event, readByList, showUnread = false) {
        clearTimeout(hidePopoverTimeout);
        if (readByPopover) readByPopover.remove();
    
        readByPopover = document.createElement('div');
        readByPopover.className = 'read-by-popover';
    
        const roomData = roomsDataCache.find(r => r.id === currentRoomId);
        if (!roomData) return;
    
        if (showUnread) {
            const unreadUserIds = roomData.participantIds.filter(id => !readByList.includes(id));
            const unreadUserNames = unreadUserIds.map(id => roomData.participantNames[id] || 'Unknown User');
            
            readByPopover.innerHTML = `<h4>Unread By</h4>`;
            if (unreadUserNames.length > 0) {
                const list = document.createElement('ul');
                unreadUserNames.forEach(name => {
                    const item = document.createElement('li');
                    item.textContent = name;
                    list.appendChild(item);
                });
                readByPopover.appendChild(list);
            } else {
                readByPopover.innerHTML += `<p>Everyone has read this message.</p>`;
            }
        } else {
            const readerNames = readByList
                .filter(id => id !== currentUser.uid)
                .map(id => roomData.participantNames[id] || 'Unknown User');
    
            readByPopover.innerHTML = `<h4>Read By</h4>`;
            if (readerNames.length > 0) {
                const list = document.createElement('ul');
                readerNames.forEach(name => {
                    const item = document.createElement('li');
                    item.textContent = name;
                    list.appendChild(item);
                });
                readByPopover.appendChild(list);
            } else {
                readByPopover.innerHTML += `<p>No one else has read this yet.</p>`;
            }
        }
        
        document.body.appendChild(readByPopover);
    
        const targetRect = event.target.getBoundingClientRect();
        const popoverRect = readByPopover.getBoundingClientRect();
    
        let top = targetRect.top - popoverRect.height - 5;
        if (top < 5) {
            top = targetRect.bottom + 5;
        }
    
        let left = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
        if (left < 5) left = 5;
        if (left + popoverRect.width > window.innerWidth) {
            left = window.innerWidth - popoverRect.width - 5;
        }
        
        readByPopover.style.left = `${left}px`;
        readByPopover.style.top = `${top}px`;
    
        readByPopover.addEventListener('mouseenter', () => clearTimeout(hidePopoverTimeout));
        readByPopover.addEventListener('mouseleave', hideReadByPopover);
    }

    function hideReadByPopover() {
        hidePopoverTimeout = setTimeout(() => {
            if (readByPopover) {
                readByPopover.remove();
                readByPopover = null;
            }
        }, 200);
    }
    
    // --- ADMIN & INVITATIONS PANELS ---
    function listenForAdminUpdates() {
        if (adminRequestsUnsubscribe) adminRequestsUnsubscribe();
        adminRequestsUnsubscribe = db.collection('joinRequests')
            .where('adminId', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .onSnapshot(snapshot => {
                const hasRequests = !snapshot.empty;
                dom.adminPanelBtn.style.display = hasRequests ? 'flex' : 'none';
                dom.adminPanelBtn.classList.toggle('has-badge', hasRequests);
            });
    }
    async function showAdminPanel() {
        showModal(dom.adminPanelModal);
        dom.joinRequestsList.innerHTML = '<div class="loading-spinner"></div>';
        const requestsSnapshot = await db.collection('joinRequests').where('adminId', '==', currentUser.uid).where('status', '==', 'pending').get();
        if (requestsSnapshot.empty) {
            dom.joinRequestsList.innerHTML = '<p class="empty-list-message">No new join requests.</p>';
            return;
        }
        const userIds = [...new Set(requestsSnapshot.docs.map(doc => doc.data().userId))];
        const userDocs = userIds.length > 0 ? await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', userIds).get() : { docs: [] };
        const usersData = new Map(userDocs.docs.map(d => [d.id, d.data()]));
        dom.joinRequestsList.innerHTML = requestsSnapshot.docs.map(doc => {
            const req = doc.data();
            const userData = usersData.get(req.userId);
            return `<div class="modal-list-item" data-request-id="${doc.id}">
                        <img src="${userData?.photoUrl || PLACEHOLDER_IMAGE_40}" alt="${req.userName}" class="avatar">
                        <div class="item-info">
                            <span class="item-title">${req.userName}</span>
                            <span class="item-subtitle">Wants to join "${req.roomName}"</span>
                        </div>
                        <div class="item-actions">
                            <button class="modal-button secondary small" onclick="window.handleJoinRequest(this, '${doc.id}', false)">Decline</button>
                            <button class="modal-button primary small" onclick="window.handleJoinRequest(this, '${doc.id}', true)">
                                <span class="btn-text">Accept</span>
                                <div class="btn-loader hidden"><div class="spinner small"></div></div>
                            </button>
                        </div>
                    </div>`;
        }).join('');
    }
    async function handleJoinRequest(button, requestId, accepted) {
        toggleButtonLoading(button, true);
        try {
            const requestRef = db.collection('joinRequests').doc(requestId);
            if (accepted) {
                const reqDoc = await requestRef.get();
                const { userId, userName, roomId } = reqDoc.data();
                
                const userDoc = await db.collection('users').doc(userId).get();
                const userPhotoUrl = userDoc.exists ? (userDoc.data().photoUrl || null) : null;

                const batch = db.batch();
                const roomRef = db.collection('chatrooms').doc(roomId);
                batch.update(roomRef, { 
                    participantIds: firebase.firestore.FieldValue.arrayUnion(userId),
                    [`participantNames.${userId}`]: userName,
                    [`participantAvatars.${userId}`]: userPhotoUrl
                });
                batch.set(db.collection('users').doc(userId).collection('rooms').doc(roomId), { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
                batch.set(roomRef.collection('members').doc(userId), { role: 'member', joinedAt: firebase.firestore.FieldValue.serverTimestamp(), userId: userId });
                batch.update(requestRef, { status: 'accepted' });
                await batch.commit();
            } else {
                await requestRef.update({ status: 'declined' });
            }
            document.querySelector(`.modal-list-item[data-request-id="${requestId}"]`)?.remove();
        } catch (error) {
            console.error("Error handling join request:", error);
            showCustomAlert("Error", "Failed to process request.");
            toggleButtonLoading(button, false);
        }
    }
    function listenForInvitations() {
        if (!currentUser) return;
        if (invitationsUnsubscribe) invitationsUnsubscribe();
        invitationsUnsubscribe = db.collection('invitations')
          .where('userId', '==', currentUser.uid)
          .where('status', '==', 'pending')
          .onSnapshot(snapshot => {
            dom.invitationsBtn.classList.toggle('has-badge', !snapshot.empty);
            if(dom.invitationsModal.style.display === 'flex') {
                renderInvitations(snapshot);
            }
          });
    }
    function renderInvitations(snapshot) {
        if (snapshot.empty) {
            dom.pendingInvitationsList.innerHTML = '<p class="empty-list-message">No pending invitations.</p>';
            return;
        }
        dom.pendingInvitationsList.innerHTML = snapshot.docs.map(doc => {
            const inv = doc.data();
            return `<div class="modal-list-item" data-invitation-id="${doc.id}">
                        <div class="item-info">
                            <span class="item-title">"${inv.roomName}"</span>
                            <span class="item-subtitle">Invited by ${inv.invitedByName}</span>
                        </div>
                        <div class="item-actions">
                            <button class="modal-button secondary small" onclick="window.handleInvitationResponse(this, '${doc.id}', false)">Decline</button>
                            <button class="modal-button primary small" onclick="window.handleInvitationResponse(this, '${doc.id}', true)">
                                <span class="btn-text">Accept</span>
                                <div class="btn-loader hidden"><div class="spinner small"></div></div>
                            </button>
                        </div>
                    </div>`;
        }).join('');
    }
    async function showInvitationsPanel() {
        showModal(dom.invitationsModal);
        dom.pendingInvitationsList.innerHTML = '<div class="loading-spinner"></div>';
        const snapshot = await db.collection('invitations').where('userId', '==', currentUser.uid).where('status', '==', 'pending').get();
        renderInvitations(snapshot);
    }
    async function handleInvitationResponse(button, invitationId, accepted) {
        toggleButtonLoading(button, true);
        const invitationRef = db.collection('invitations').doc(invitationId);
        try {
            if (accepted) {
                const invitationDoc = await invitationRef.get();
                if (!invitationDoc.exists) throw new Error("Invitation not found or has been revoked.");
                
                const { userId, roomId } = invitationDoc.data();
                if (userId !== currentUser.uid) throw new Error("This invitation is not for you.");

                const roomRef = db.collection("chatrooms").doc(roomId);
                const userRoomsRef = db.collection("users").doc(userId).collection("rooms").doc(roomId);
                const memberRef = roomRef.collection("members").doc(userId);
                
                const batch = db.batch();
                
                batch.update(roomRef, {
                    participantIds: firebase.firestore.FieldValue.arrayUnion(userId),
                    [`participantNames.${userId}`]: currentUserProfileData.displayName,
                    [`participantAvatars.${userId}`]: currentUserProfileData.photoUrl || null,
                });
                batch.set(userRoomsRef, { joinedAt: firebase.firestore.FieldValue.serverTimestamp() });
                batch.set(memberRef, { role: "member", joinedAt: firebase.firestore.FieldValue.serverTimestamp(), userId: userId });
                batch.update(invitationRef, { status: 'accepted' });
    
                await batch.commit();
                showCustomAlert("Success!", "You have joined the group.");

            } else {
                await invitationRef.update({ status: 'declined' });
            }
        } catch (error) {
            console.error("Error responding to invitation:", error);
            showCustomAlert("Error", `Failed to process response: ${error.message}`);
        } finally {
            toggleButtonLoading(button, false);
        }
    }

    // --- MODALS, PROMPTS & USER SEARCH ---
    function showCustomPrompt(title, text, placeholder, okText = 'OK') {
        return new Promise((resolve, reject) => {
            dom.customPromptTitle.textContent = title; 
            dom.customPromptText.innerHTML = text;
            const input = dom.customPromptInput;
            input.placeholder = placeholder;
            input.value = '';
            input.style.display = 'block';
            dom.memberPicker.style.display = 'none';
            const okBtnText = dom.customPromptOk.querySelector('.btn-text');
            if (okBtnText) okBtnText.textContent = okText;
            dom.customPromptCancel.style.display = 'inline-block';
            showModal(dom.customPromptModal);
            const onOk = () => { resolve(input.value); cleanup(); };
            const onCancel = () => { reject(null); cleanup(); };
            const cleanup = () => {
                hideModal(dom.customPromptModal);
                dom.customPromptOk.removeEventListener('click', onOk);
                dom.customPromptCancel.removeEventListener('click', onCancel);
            };
            dom.customPromptOk.addEventListener('click', onOk, { once: true });
            dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
        });
    }
    function showCustomAlert(title, text) {
        return new Promise(resolve => {
            dom.customPromptTitle.textContent = title;
            dom.customPromptText.textContent = text;
            dom.customPromptInput.style.display = 'none';
            dom.memberPicker.style.display = 'none';
            dom.customPromptCancel.style.display = 'none';
            const okButtonText = dom.customPromptOk.querySelector('.btn-text');
            if (okButtonText) okButtonText.textContent = 'Close';
            showModal(dom.customPromptModal);
            const onOk = () => {
                hideModal(dom.customPromptModal);
                dom.customPromptOk.removeEventListener('click', onOk);
                resolve(true);
            };
            dom.customPromptOk.addEventListener('click', onOk, { once: true });
        });
    }
    function showConfirmationModal(title, text) {
        return new Promise(resolve => {
            dom.customPromptTitle.textContent = title;
            dom.customPromptText.textContent = text;
            dom.customPromptInput.style.display = 'none';
            dom.memberPicker.style.display = 'none';
            const okButtonText = dom.customPromptOk.querySelector('.btn-text');
            if (okButtonText) okButtonText.textContent = 'Confirm';
            dom.customPromptCancel.style.display = 'inline-block';
            showModal(dom.customPromptModal);
            const onOk = () => { resolve(true); cleanup(); };
            const onCancel = () => { resolve(false); cleanup(); };
            const cleanup = () => {
                hideModal(dom.customPromptModal);
                dom.customPromptOk.removeEventListener('click', onOk);
                dom.customPromptCancel.removeEventListener('click', onCancel);
            };
            dom.customPromptOk.addEventListener('click', onOk, { once: true });
            dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
        });
    }
    function showForwardModal(callback) {
        dom.customPromptTitle.textContent = 'Forward Message';
        dom.customPromptText.innerHTML = '';
        dom.customPromptInput.style.display = 'none';
        dom.memberPicker.style.display = 'none';
    
        const forwardList = document.createElement('div');
        forwardList.className = 'modal-list';
    
        const roomsToForward = roomsDataCache.filter(r => r.id !== currentRoomId);
    
        if (roomsToForward.length === 0) {
            forwardList.innerHTML = '<p class="empty-list-message">No other chats to forward to.</p>';
        } else {
            roomsToForward.forEach(room => {
                const isPrivate = room.type === 'private';
                const otherUserId = isPrivate ? room.participantIds.find(id => id !== currentUser.uid) : null;
                const title = isPrivate ? (room.participantNames[otherUserId] || 'Unknown User') : room.title;
                const avatarSrc = (isPrivate && room.participantAvatars && room.participantAvatars[otherUserId]) 
                                  ? room.participantAvatars[otherUserId] 
                                  : (isPrivate ? PLACEHOLDER_IMAGE_40 : PLACEHOLDER_GROUP_AVATAR_40);
    
                const roomEl = document.createElement('div');
                roomEl.className = 'modal-list-item';
                roomEl.style.cursor = 'pointer';
                roomEl.innerHTML = `
                    <img src="${avatarSrc}" alt="${title}" class="avatar">
                    <div class="item-info">
                        <span class="item-title">${title}</span>
                    </div>`;
                roomEl.onclick = () => { callback(room.id); hideModal(dom.customPromptModal); };
                forwardList.appendChild(roomEl);
            });
        }
    
        dom.customPromptText.appendChild(forwardList);
        dom.customPromptOk.style.display = 'none';
        dom.customPromptCancel.style.display = 'inline-block';
        showModal(dom.customPromptModal);
    }
    function showMemberPickerModal(title, text) {
        return new Promise((resolve, reject) => {
            dom.customPromptTitle.textContent = title;
            dom.customPromptText.textContent = text;
            dom.customPromptInput.style.display = 'none';
            dom.memberPicker.style.display = 'block';
            dom.selectedMembers.innerHTML = '';
            dom.searchResults.innerHTML = '';
            dom.userSearchInput.value = '';
            const okButtonText = dom.customPromptOk.querySelector('.btn-text');
            if (okButtonText) okButtonText.textContent = 'Invite';
            dom.customPromptOk.style.display = 'inline-block';
            dom.customPromptCancel.style.display = 'inline-block';
            showModal(dom.customPromptModal);
            dom.userSearchInput.oninput = debounce(handleUserSearch, 300);
            const onOk = () => {
                const memberIds = Array.from(document.querySelectorAll('.selected-member[data-uid]')).map(el => el.dataset.uid);
                resolve(memberIds);
                cleanup();
            };
            const onCancel = () => { reject(null); cleanup(); };
            const cleanup = () => {
                hideModal(dom.customPromptModal);
                dom.memberPicker.style.display = 'none';
                dom.userSearchInput.oninput = null;
                dom.customPromptOk.removeEventListener('click', onOk);
                dom.customPromptCancel.removeEventListener('click', onCancel);
            };
            dom.customPromptOk.addEventListener('click', onOk, { once: true });
            dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
        });
    }
    function showUserPickerModal(title, text) {
        return new Promise((resolve, reject) => {
            dom.customPromptTitle.textContent = title;
            dom.customPromptText.textContent = text;
            dom.customPromptInput.style.display = 'none';
            dom.memberPicker.style.display = 'block';
            dom.selectedMembers.innerHTML = '';
            dom.searchResults.innerHTML = '';
            dom.userSearchInput.value = '';
            dom.customPromptOk.style.display = 'none';
            dom.customPromptCancel.style.display = 'inline-block';
            showModal(dom.customPromptModal);
            dom.userSearchInput.oninput = debounce(handleUserSearch, 300);
            const originalRender = renderSearchResults;
            renderSearchResults = (users) => {
                dom.searchResults.innerHTML = users.length === 0 ? '<div class="no-results">No users found.</div>' : '';
                users.forEach(user => {
                     if (user.isCreator) {
                        const creatorEl = document.createElement('div');
                        creatorEl.className = 'search-result-item creator-item';
                        creatorEl.innerHTML = `<img src="${user.photoUrl}" class="avatar">
                            <div class="user-info">
                                <div class="user-name">${user.displayName}</div>
                                <div class="user-email">${user.email}</div>
                                <div class="user-location">${user.location}</div>
                            </div>
                            <span class="status-badge creator-badge">Creator</span>`;
                        dom.searchResults.appendChild(creatorEl);
                        return;
                    }
                    const userEl = document.createElement('div');
                    userEl.className = 'search-result-item';
                    userEl.innerHTML = `<img src="${user.photoUrl || PLACEHOLDER_IMAGE_40}" class="user-avatar"><div class="user-info"><div class="user-name">${user.displayName}</div><div class="user-email">${user.email || ''}</div></div>`;
                    userEl.onclick = () => { resolve(user); cleanup(); };
                    dom.searchResults.appendChild(userEl);
                });
            };
            const onCancel = () => { reject(null); cleanup(); };
            const cleanup = () => {
                renderSearchResults = originalRender;
                hideModal(dom.customPromptModal);
                dom.memberPicker.style.display = 'none';
                dom.userSearchInput.oninput = null;
                dom.customPromptOk.style.display = 'inline-block';
                dom.customPromptCancel.removeEventListener('click', onCancel);
            };
            dom.customPromptCancel.addEventListener('click', onCancel, { once: true });
        });
    }
    async function handleUserSearch(e) {
        const query = e.target.value.trim();
        if (query.length < 1 && query.toLowerCase() !== 'creator-of-this-app') { 
            dom.searchResults.innerHTML = ''; 
            return; 
        }
        try {
            const users = await searchUsers(query);
            renderSearchResults(users);
        } catch (error) { console.error("User search failed:", error); }
    }
    async function searchUsers(query) {
        if (query.toLowerCase() === 'creator-of-this-app') {
            return [{
                id: 'creator',
                isCreator: true,
                displayName: 'Saikumar T',
                email: 'ajskumar2005@gmail.com',
                photoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="%235865f2"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="white" font-family="sans-serif" font-weight="bold">ST</text></svg>`,
                location: 'Chennai, Tamilnadu'
            }];
        }

        const lowerCaseQuery = query.toLowerCase();
        const promises = [];
        promises.push(db.collection('users').where('searchKeys', 'array-contains', lowerCaseQuery).limit(10).get());
        if (query.includes('@')) {
            promises.push(db.collection('users').where('email', '==', query).limit(1).get());
        }
        const usersMap = new Map();
        try {
            const userDoc = await db.collection('users').doc(query).get();
            if (userDoc.exists) usersMap.set(userDoc.id, { id: userDoc.id, ...userDoc.data() });
        } catch(e) { /* Invalid ID format */ }
        const snapshots = await Promise.all(promises);
        snapshots.forEach(snapshot => snapshot.docs.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() })));
        usersMap.delete(currentUser.uid);
        return Array.from(usersMap.values());
    }
    let renderSearchResults = (users) => {
        const roomData = roomsDataCache.find(r => r.id === currentRoomId);
        const existingMembers = roomData ? roomData.participantIds : [];
        dom.searchResults.innerHTML = users.length === 0 ? '<div class="no-results">No results</div>' : '';
        users.forEach(user => {
            if (user.isCreator) {
                const creatorEl = document.createElement('div');
                creatorEl.className = 'search-result-item creator-item';
                creatorEl.innerHTML = `<img src="${user.photoUrl}" class="avatar">
                    <div class="user-info">
                        <div class="user-name">${user.displayName}</div>
                        <div class="user-email">${user.email}</div>
                        <div class="user-location">${user.location}</div>
                    </div>
                    <span class="status-badge creator-badge">Creator</span>`;
                dom.searchResults.appendChild(creatorEl);
                return;
            }

            const isMember = existingMembers.includes(user.id);
            const userEl = document.createElement('div');
            userEl.className = 'search-result-item';
            if (isMember) userEl.classList.add('disabled');
            userEl.innerHTML = `<img src="${user.photoUrl || PLACEHOLDER_IMAGE_40}" class="avatar">
                <div class="user-info">
                    <div class="user-name">${user.displayName}</div>
                    <div class="user-email">${user.email || 'ID: ' + user.id.substring(0,8)}</div>
                </div>
                ${isMember ? '<span class="status-badge">Already Member</span>' : ''}`;
            if (!isMember) {
                userEl.onclick = () => addSelectedMember(user);
            }
            dom.searchResults.appendChild(userEl);
        });
    }
    function addSelectedMember(user) {
        if (document.querySelector(`.selected-member[data-uid="${user.id}"]`)) return;
        const memberEl = document.createElement('div');
        memberEl.className = 'selected-member';
        memberEl.dataset.uid = user.id;
        memberEl.innerHTML = `${user.displayName}<button class="remove-member">×</button>`;
        memberEl.querySelector('.remove-member').onclick = () => memberEl.remove();
        dom.selectedMembers.appendChild(memberEl);
    }
    function handleChatScroll() {
        markVisibleMessagesAsRead();
        if (dom.chatMessages.scrollTop < 50 && !isFetchingMessages && lastVisibleMessage) {
            fetchMoreMessages();
        }
    }
    function handleMessageSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        currentSearchResults = [];
        currentSearchIndex = -1;
        dom.chatMessages.querySelectorAll('.search-highlight, .current-search-highlight').forEach(el => {
            el.classList.remove('search-highlight', 'current-search-highlight');
        });

        dom.chatMessages.querySelectorAll('.message-wrapper').forEach(wrapper => {
            const textEl = wrapper.querySelector('.message-text');
            if (textEl) {
                textEl.innerHTML = textEl.textContent; 
                if (searchTerm && textEl.textContent.toLowerCase().includes(searchTerm)) {
                    wrapper.style.display = 'flex';
                    currentSearchResults.push(wrapper);
                    const searchRegExp = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    textEl.innerHTML = textEl.textContent.replace(searchRegExp, (match) => `<mark>${match}</mark>`);
                } else if (searchTerm) {
                    wrapper.style.display = 'none';
                } else {
                    wrapper.style.display = 'flex';
                }
            } else if (searchTerm) {
                wrapper.style.display = 'none';
            } else {
                wrapper.style.display = 'flex';
            }
        });

        const hasResults = currentSearchResults.length > 0;
        dom.searchPrevBtn.style.display = hasResults ? 'inline-flex' : 'none';
        dom.searchNextBtn.style.display = hasResults ? 'inline-flex' : 'none';

        if (hasResults) {
            currentSearchIndex = currentSearchResults.length -1;
            navigateToSearchResult(0);
        }
    }
    function navigateToSearchResult(direction) {
        if (currentSearchResults.length === 0) return;
        
        const current = currentSearchResults[currentSearchIndex];
        current?.classList.remove('current-search-highlight');

        currentSearchIndex += direction;

        if (currentSearchIndex >= currentSearchResults.length) {
            currentSearchIndex = 0;
        }
        if (currentSearchIndex < 0) {
            currentSearchIndex = currentSearchResults.length - 1;
        }

        const next = currentSearchResults[currentSearchIndex];
        if (next) {
            next.scrollIntoView({ behavior: 'smooth', block: 'center' });
            next.classList.add('current-search-highlight');
        }
    }
    function showEditModal(messageId, currentText) {
        messageIdToEdit = messageId;
        dom.editMessageInput.value = currentText;
        showModal(dom.editMessageModal);
        dom.editMessageInput.focus();
    }
    function getFormattedDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    function scrollToBottom() { 
        if(dom.chatMessages) dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight; 
    }

    // --- PICKERS (EMOJI, STICKER, GIF) ---
    function togglePicker(pickerElement) {
        // Hide all pickers first
        [dom.emojiPicker].forEach(p => {
            if (p !== pickerElement) p.style.display = 'none';
        });

        // Toggle the target picker
        if (pickerElement) {
            const isVisible = pickerElement.style.display !== 'none';
            pickerElement.style.display = isVisible ? 'none' : 'grid';
            activePicker = isVisible ? null : pickerElement;
        } else {
            activePicker = null;
        }
    }

    function setupEmojiPicker() {
        const emojis = ['😀', '😂', '❤️', '👍', '🙏', '😊', '😍', '🤔', '🎉', '🔥', '💯', '😭', '😮', '😎', '😴', '🙄', '👋', '🥳', '🤯', '😱', '😇', '😈', '👻', '💀', '👽', '🤖', '👾', '🚀', '✨', '🌟', '💫', '💥'];
        if (!dom.emojiPicker) return;
        dom.emojiPicker.innerHTML = emojis.map(emoji => `<span>${emoji}</span>`).join('');
        
        dom.emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePicker(dom.emojiPicker);
        });

        dom.emojiPicker.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                insertTextAtCursor(dom.messageInput, e.target.textContent);
                togglePicker(null);
                dom.messageInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // --- POLLS ---
    function setupPollCreator() {
        dom.pollBtn.addEventListener('click', () => {
            dom.createPollForm.reset();
            dom.pollOptionsContainer.innerHTML = `
                <input type="text" class="poll-option-input" placeholder="선택지 1" required>
                <input type="text" class="poll-option-input" placeholder="선택지 2" required>
            `;
            showModal(dom.createPollModal);
        });

        dom.addPollOptionBtn.addEventListener('click', () => {
            if (dom.pollOptionsContainer.children.length < 10) {
                const newOption = document.createElement('input');
                newOption.type = 'text';
                newOption.className = 'poll-option-input';
                newOption.placeholder = `선택지 ${dom.pollOptionsContainer.children.length + 1}`;
                newOption.required = true;
                dom.pollOptionsContainer.appendChild(newOption);
            } else {
                showCustomAlert("Limit Reached", "You can add a maximum of 10 options.");
            }
        });

        dom.createPollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const question = document.getElementById('poll-question').value.trim();
            const options = {};
            const optionInputs = dom.pollOptionsContainer.querySelectorAll('.poll-option-input');
            
            optionInputs.forEach(input => {
                const optionText = input.value.trim();
                if (optionText) {
                    options[optionText] = { votes: [] };
                }
            });

            if (question && Object.keys(options).length >= 2) {
                const pollContent = {
                    type: 'poll',
                    text: `📊 Poll: ${question}`, // For lastMessage preview
                    question,
                    options,
                    createdBy: currentUser.uid
                };
                attemptToSend(pollContent, activeReply);
                hideModal(dom.createPollModal);
            } else {
                showCustomAlert("Invalid Poll", "Please provide a question and at least two options.");
            }
        });

        dom.createPollModal.querySelector('#create-poll-cancel-btn').addEventListener('click', () => hideModal(dom.createPollModal));
    }


    function insertTextAtCursor(input, text) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const currentText = input.value;
        const newText = currentText.substring(0, start) + text + currentText.substring(end);
        input.value = newText;
        input.focus();
        input.setSelectionRange(start + text.length, start + text.length);
    }
    
    // --- LINK PREVIEW ---
    async function generateLinkPreview(url) {
        try {
            const response = await fetch(url);
            if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
                return null;
            }
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, "text/html");

            const getMeta = (prop) => doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') || doc.querySelector(`meta[name="${prop}"]`)?.getAttribute('content');
            
            const title = getMeta('og:title') || doc.querySelector('title')?.textContent || '';
            const description = getMeta('og:description') || getMeta('description') || '';
            let image = getMeta('og:image') || '';
            const siteName = getMeta('og:site_name') || url.split('/')[2];
            
            if (image && !image.startsWith('http')) {
                image = new URL(image, url).href;
            }

            if (!title) return null;

            return { url, title, description, image, siteName };
        } catch (error) {
            console.warn(`Could not fetch link preview for ${url}:`, error);
            return null;
        }
    }
    
    // --- IMAGE LIGHTBOX ---
    function openLightbox(clickedImg) {
        lightboxGallery = Array.from(dom.chatMessages.querySelectorAll('.message-image'));
        lightboxCurrentIndex = lightboxGallery.indexOf(clickedImg);
        if (lightboxCurrentIndex === -1) return;
        
        updateLightboxContent();
        showModal(dom.lightbox);
        window.addEventListener('keydown', handleLightboxKeys);
    }
    function closeLightbox() {
        hideModal(dom.lightbox);
        window.removeEventListener('keydown', handleLightboxKeys);
    }
    function updateLightboxContent() {
        if (lightboxCurrentIndex < 0 || lightboxCurrentIndex >= lightboxGallery.length) return;
        
        const currentImg = lightboxGallery[lightboxCurrentIndex];
        dom.lightboxImage.src = currentImg.src;
        dom.lightboxSender.textContent = currentImg.dataset.senderName;
        dom.lightboxTimestamp.textContent = currentImg.dataset.timestamp;
        dom.lightboxDownload.href = currentImg.src;
        
        dom.lightboxPrev.style.display = lightboxCurrentIndex > 0 ? 'flex' : 'none';
        dom.lightboxNext.style.display = lightboxCurrentIndex < lightboxGallery.length - 1 ? 'flex' : 'none';
    }
    function showPrevImage() {
        if (lightboxCurrentIndex > 0) {
            lightboxCurrentIndex--;
            updateLightboxContent();
        }
    }
    function showNextImage() {
        if (lightboxCurrentIndex < lightboxGallery.length - 1) {
            lightboxCurrentIndex++;
            updateLightboxContent();
        }
    }
    function handleLightboxKeys(e) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    }

    // --- VOICE MESSAGES ---
    async function handleStartRecording(e) {
        e.preventDefault();
        if (isRecording) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            isRecording = true;
            audioChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            
            let startTime = Date.now();
            dom.recordingIndicator.style.display = 'flex';
            dom.messageInput.style.display = 'none';

            recordingInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                dom.recordingTimer.textContent = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
                if (elapsed >= 60) {
                    handleStopRecording(e);
                }
            }, 1000);
            
            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                clearInterval(recordingInterval);
                dom.recordingIndicator.style.display = 'none';
                dom.messageInput.style.display = 'block';

                if (audioChunks.length === 0) return;

                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const duration = Date.now() - startTime;

                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result;
                    if (base64.length > 900000) {
                        showCustomAlert("Voice Message Too Long", "The recording is too long to be sent.");
                        return;
                    }
                    attemptToSend({ voiceMessage: { dataUrl: base64, duration } }, activeReply);
                };
                reader.readAsDataURL(audioBlob);
            };

            mediaRecorder.start();

            window.addEventListener('pointerup', handleStopRecording, { once: true });
            window.addEventListener('pointermove', handleCancelRecording);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            showCustomAlert("Microphone Access Denied", "Please allow microphone access in your browser settings to send voice messages.");
        }
    }

    function handleStopRecording(e) {
        window.removeEventListener('pointermove', handleCancelRecording);
        if (!isRecording || !mediaRecorder) return;
        
        const wasCancelled = e.target.id === 'recording-cancel-text';
        if (mediaRecorder.state === "recording" && !wasCancelled) {
            mediaRecorder.stop();
        } else {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            clearInterval(recordingInterval);
            dom.recordingIndicator.style.display = 'none';
            dom.messageInput.style.display = 'block';
        }

        isRecording = false;
        mediaRecorder = null;
    }

    function handleCancelRecording(e) {
        if (!isRecording) return;
        const micButtonRect = dom.micButton.getBoundingClientRect();
        if (e.clientX < micButtonRect.left - 50 || e.clientX > micButtonRect.right + 50 ||
            e.clientY < micButtonRect.top - 50 || e.clientY > micButtonRect.bottom + 50) {
            dom.recordingTimer.textContent = 'Release to cancel';
        } else {
             dom.recordingTimer.textContent = 'Recording...';
        }
    }
    
    function toggleVoiceMessage(playBtn) {
        const player = playBtn.closest('.voice-message-player');
        const messageDiv = playBtn.closest('.message');
        const dataUrl = messageDiv.dataset.voiceUrl;
        
        let audio = messageDiv.audio;
        const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z"/></svg>`;

        if (!audio) {
            audio = new Audio(dataUrl);
            messageDiv.audio = audio;

            audio.addEventListener('timeupdate', () => {
                const progress = (audio.currentTime / audio.duration) * 100;
                player.querySelector('.voice-progress-bar').style.width = `${progress}%`;
            });
            audio.addEventListener('ended', () => {
                playBtn.innerHTML = playIcon;
                playBtn.setAttribute('aria-label', 'Play voice message');
                player.querySelector('.voice-progress-bar').style.width = '0%';
            });
        }

        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = pauseIcon;
             playBtn.setAttribute('aria-label', 'Pause voice message');
        } else {
            audio.pause();
            playBtn.innerHTML = playIcon;
            playBtn.setAttribute('aria-label', 'Play voice message');
        }
    }


    // Attach functions that are called by HTML onclick attributes to the global window object.
    window.handleReaction = handleReaction;
    window.startReply = startReply;
    window.forwardMessage = forwardMessage;
    window.deleteMessage = deleteMessage;
    window.pinMessage = pinMessage;
    window.unpinMessage = unpinMessage;
    window.showEditModal = showEditModal;
    window.scrollToMessage = scrollToMessage;
    window.handleJoinRequest = handleJoinRequest;
    window.handleInvitationResponse = handleInvitationResponse;
    window.handleVote = handleVote;

});