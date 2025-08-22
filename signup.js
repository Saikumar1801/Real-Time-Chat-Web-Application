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
const signupForm = document.getElementById('signup-form');
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const errorDiv = document.getElementById('auth-error');
let profilePhotoFile = null;

// --- Helper Functions ---

// Compress and convert image to Base64 data URL
function compressImage(file, quality = 0.7, maxWidth = 400) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(ctx.canvas.toDataURL('image/jpeg', quality));
            };
        };
        reader.onerror = error => reject(error);
    });
}


// Generate search keys for username prefix search
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

// Toggle password visibility
function togglePasswordVisibility(inputId, toggleButton) {
    const passwordInput = document.getElementById(inputId);
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleButton.innerHTML = isPassword 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>` 
        : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

// Check password strength and update UI
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    const strengthIndicator = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    const strengthClasses = ['', 'weak', 'fair', 'good', 'strong'];
    const strengthTexts = ['강도', '약함', '보통', '좋음', '강함'];
    
    strengthIndicator.className = 'strength-fill ' + (strengthClasses[strength] || '');
    strengthText.textContent = '비밀번호 강도: ' + (strengthTexts[strength] || '약함');
}


// --- Event Listeners ---

// Photo preview handler
document.querySelector('.photo-preview-container').addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        profilePhotoFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            photoPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
        document.getElementById('photo-url-input').value = '';
    }
});

// Password visibility toggles
document.getElementById('password-toggle-1').addEventListener('click', function () { togglePasswordVisibility('password-input', this); });
document.getElementById('password-toggle-2').addEventListener('click', function () { togglePasswordVisibility('confirm-password-input', this); });

// Live password strength check
document.getElementById('password-input').addEventListener('input', (e) => checkPasswordStrength(e.target.value));

// Main Signup Form Submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';

    // Get form values
    const displayName = document.getElementById('name-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const photoUrlInput = document.getElementById('photo-url-input').value.trim();
    const password = document.getElementById('password-input').value;
    const confirmPassword = document.getElementById('confirm-password-input').value;
    const termsAgreed = document.getElementById('terms-agreement').checked;

    // Validation
    if (password !== confirmPassword) { return errorDiv.textContent = "비밀번호가 일치하지 않습니다."; }
    if (password.length < 6) { return errorDiv.textContent = "비밀번호는 6자 이상이어야 합니다."; }
    if (!termsAgreed) { return errorDiv.textContent = "이용약관에 동의해야 합니다."; }
    if (!displayName || !email) { return errorDiv.textContent = "필수 필드를 모두 입력해주세요."; }

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Handle Profile Photo (convert to Base64)
        let finalPhotoUrl = null;
        if (profilePhotoFile) {
            finalPhotoUrl = await compressImage(profilePhotoFile);
        } else if (photoUrlInput) {
            finalPhotoUrl = photoUrlInput;
        }

        // 3. Create user document in Firestore
        const userProfileData = {
            displayName: displayName,
            displayName_lower: displayName.toLowerCase(),
            email: email,
            photoUrl: finalPhotoUrl,
            isGuest: false,
            status: 'Online',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            searchKeys: generateSearchKeys(displayName)
        };
        await db.collection('users').doc(user.uid).set(userProfileData);

        // 4. Update Firebase Auth profile (only displayName).
        // The Base64 photoURL is too long for the auth profile and is stored in Firestore instead.
        await user.updateProfile({
            displayName: displayName
        });

        // 5. Redirect to chat app
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