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
const storage = firebase.storage();

const signupForm = document.getElementById('signup-form');
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const errorDiv = document.getElementById('auth-error');

let profilePhotoFile = null;

// ✅ ADD THIS HELPER FUNCTION
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

// Photo preview handler
photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        profilePhotoFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            photoPreview.src = event.target.result;
            document.getElementById('photo-url-input').value = ''; // Clear URL if file is chosen
        };
        reader.readAsDataURL(file);
    }
});

// Sign up new user
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';

    const displayName = document.getElementById('name-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    const photoUrlInput = document.getElementById('photo-url-input').value.trim();
    const password = document.getElementById('password-input').value;
    const confirmPassword = document.getElementById('confirm-password-input').value;

    // --- Validation ---
    if (password !== confirmPassword) {
        errorDiv.textContent = "비밀번호가 일치하지 않습니다.";
        return;
    }
    if (password.length < 6) {
        errorDiv.textContent = "비밀번호는 6자 이상이어야 합니다.";
        return;
    }

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Handle Profile Photo
        let finalPhotoUrl = null;
        if (profilePhotoFile) {
            const photoRef = storage.ref(`profile_photos/${user.uid}`);
            await photoRef.put(profilePhotoFile);
            finalPhotoUrl = await photoRef.getDownloadURL();
        } else if (photoUrlInput) {
            finalPhotoUrl = photoUrlInput;
        }

        // 3. Create user document in Firestore
        const userProfileData = {
            displayName: displayName,
            displayName_lower: displayName.toLowerCase(), // ✅ ADD a lowercase field for case-insensitive search
            email: email,
            phone: phone || null,
            photoUrl: finalPhotoUrl,
            isGuest: false,
            status: 'Online',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            searchKeys: generateSearchKeys(displayName) // ✅ ADD the search keys
        };
        await db.collection('users').doc(user.uid).set(userProfileData);

        // 4. Update Firebase Auth profile
        await user.updateProfile({
            displayName: displayName,
            photoURL: finalPhotoUrl
        });

        // 5. Redirect to chat app (onAuthStateChanged will handle this)
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Signup failed:", error);
        if (error.code === 'auth/email-already-in-use') {
            errorDiv.textContent = "이미 사용 중인 이메일입니다.";
        } else {
            errorDiv.textContent = "회원가입에 실패했습니다. 다시 시도해주세요.";
        }
    }
});