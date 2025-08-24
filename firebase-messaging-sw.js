// Scripts for Firebase service
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkXiKhWwx_W29ZFU8mmB-eecFHt1WZCX4",
    authDomain: "chat-app-6194f.firebaseapp.com",
    projectId: "chat-app-6194f",
    appId: "1:432201991680:web:96ac04f905881f5332fae5",
    measurementId: "G-5MG6QESZ5K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png' // You should place an icon file in your public directory
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
