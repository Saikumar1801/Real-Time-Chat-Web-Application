const firebaseConfig = {
    apiKey: "AIzaSyCkXiKhWwx_W29ZFU8mmB-eecFHt1WZCX4",
    authDomain: "chat-app-6194f.firebaseapp.com",
    projectId: "chat-app-6194f",
    storageBucket: "chat-app-6194f.appspot.com",
    messagingSenderId: "432201991680",
    appId: "1:432201991680:web:96ac04f905881f5332fae5",
    measurementId: "G-5MG6QESZ5K"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginForm = document.getElementById('login-form');
const guestForm = document.getElementById('guest-form');
const errorDiv = document.getElementById('auth-error');

let isProcessingLogin = false;

// ✅ ADD THIS HELPER FUNCTION (Same as in signup.js)
function generateSearchKeys(displayName) {
    const name = displayName.toLowerCase().trim();
    if (!name) return [];
    const keys = new Set(); // Use a Set to avoid duplicates
    const parts = name.split(' ').filter(p => p); // Split name into words
    for (const part of parts) {
        for (let i = 1; i <= part.length; i++) {
            keys.add(part.substring(0, i));
        }
    }
    return Array.from(keys);
}

// Redirect if already logged in (but not during an active login process)
auth.onAuthStateChanged(user => {
    if (user && !isProcessingLogin) {
        window.location.href = 'index.html';
    }
});

// Login with Email and Password
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    isProcessingLogin = true;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Explicitly redirect after successful login
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Login failed:", error);
        errorDiv.textContent = "이메일 또는 비밀번호가 잘못되었습니다.";
        isProcessingLogin = false; // Reset flag on error
    }
});

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

        // ✅ UPDATE guest profile data to include the new search fields
        const guestProfileData = {
            displayName: displayName,
            displayName_lower: displayName.toLowerCase(), // For case-insensitive search
            isGuest: true,
            status: 'Online',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            searchKeys: generateSearchKeys(displayName) // For prefix search
        };

        // Wait for the profile to be created before doing anything else
        await db.collection('users').doc(user.uid).set(guestProfileData);
        await user.updateProfile({ displayName: displayName });

        // Now that all data is saved, it's safe to redirect
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Guest login failed:", error);
        errorDiv.textContent = "게스트 참여에 실패했습니다. 다시 시도해주세요.";
        isProcessingLogin = false; // Reset flag on error
    }
});