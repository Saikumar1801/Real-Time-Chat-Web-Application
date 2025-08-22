// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkXiKhWwx_W29ZFU8mmB-eecFHt1WZCX4",
    authDomain: "chat-app-6194f.firebaseapp.com",
    projectId: "chat-app-6194f",
    appId: "1:432201991680:web:96ac04f905881f5332fae5",
    measurementId: "G-5MG6QESZ5K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginForm = document.getElementById('login-form');
const guestForm = document.getElementById('guest-form');
const errorDiv = document.getElementById('auth-error');
const passwordInput = document.getElementById('login-password');
const passwordToggle = document.getElementById('password-toggle');

let isProcessingLogin = false;

// Redirect if already logged in
auth.onAuthStateChanged(user => {
    if (user && !isProcessingLogin) {
        window.location.href = 'index.html';
    }
});

// Password visibility toggle
passwordToggle.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggle.innerHTML = isPassword 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>` 
        : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
});


// Login with Email and Password
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    isProcessingLogin = true;

    const email = document.getElementById('login-email').value;
    const password = passwordInput.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Successful login is handled by onAuthStateChanged
    } catch (error) {
        console.error("Login failed:", error);
        errorDiv.textContent = "이메일 또는 비밀번호가 잘못되었습니다.";
        isProcessingLogin = false;
    }
});


// Helper function to generate search prefixes
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


// Join as Guest
guestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const displayName = document.getElementById('guest-name').value.trim();

    if (displayName.length < 2) {
        errorDiv.textContent = "이름은 2자 이상이어야 합니다.";
        return;
    }

    isProcessingLogin = true;

    try {
        const userCredential = await auth.signInAnonymously();
        const user = userCredential.user;

        const guestProfileData = {
            displayName: displayName,
            displayName_lower: displayName.toLowerCase(),
            isGuest: true,
            status: 'Online',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            searchKeys: generateSearchKeys(displayName)
        };

        await db.collection('users').doc(user.uid).set(guestProfileData);
        await user.updateProfile({ displayName: displayName });
        // Successful login is handled by onAuthStateChanged
    } catch (error) {
        console.error("Guest login failed:", error);
        errorDiv.textContent = "게스트 참여에 실패했습니다. 다시 시도해주세요.";
        isProcessingLogin = false;
    }
});