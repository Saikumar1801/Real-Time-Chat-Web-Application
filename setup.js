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

const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const errorDiv = document.getElementById('setup-error');

let currentUser = null;

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        if (user.displayName) {
            window.location.href = 'index.html';
        }
    } else {
        auth.signInAnonymously().catch(error => {
            console.error("익명 로그인 실패:", error);
            errorDiv.textContent = "서버에 연결할 수 없습니다. 페이지를 새로고침 해주세요.";
        });
    }
});

// FIXED: Separate Firestore and Auth updates
nameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = nameInput.value.trim();

    if (!displayName || !currentUser) return;
    
    try {
        // Update Firestore
        await db.collection('users').doc(currentUser.uid).set({ 
            displayName: displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Update Auth profile
        await currentUser.updateProfile({ displayName });
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error("프로필 업데이트 오류:", error);
        errorDiv.textContent = "이름 저장 실패. 다시 시도해주세요.";
    }
});