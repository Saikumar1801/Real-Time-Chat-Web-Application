importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

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

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});