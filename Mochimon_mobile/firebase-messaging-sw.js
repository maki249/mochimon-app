// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
  authDomain: "mochimon-base.firebaseapp.com",
  projectId: "mochimon-base",
  storageBucket: "mochimon-base.firebasestorage.app",
  messagingSenderId: "5202457046",
  appId: "1:5202457046:web:7233c6b556a7d260803477",
  measurementId: "G-GPT541EW6S"
});

const messaging = firebase.messaging();

// 通知が届いたときの処理（アプリが閉じている or 非アクティブ時）
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 背景通知受信:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png' // 任意
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
