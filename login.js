
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
    authDomain: "mochimon-base.firebaseapp.com",
    projectId: "mochimon-base",
    storageBucket: "mochimon-base.firebasestorage.app",
    messagingSenderId: "5202457046",
    appId: "1:5202457046:web:7233c6b556a7d260803477",
    measurementId: "G-GPT541EW6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const iconBtn = document.getElementById("user-icon-btn");
let currentUser = null;

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, (user) => {
currentUser = user;
console.log("Auth state changed:", user);
});


    if (iconBtn) {
        iconBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log("Clicked. currentUser:", currentUser);
            if (currentUser) {
            console.log("認証済みなのでマイページへ遷移");
            window.location.href = "../Mypage.html";
            } else {
            console.log("未認証なのでログインへ遷移");
            window.location.href = "../Login.html";
            }
        });
    }
