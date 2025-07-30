import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyChPt5NDvgd4okxbUQalZtrS7w6Tm30fgg",
    authDomain: "mochimon-base.firebaseapp.com",
    projectId: "mochimon-base",
    storageBucket: "mochimon-base.firebasestorage.app",
    messagingSenderId: "5202457046",
    appId: "1:5202457046:web:7233c6b556a7d260803477",
    measurementId: "G-GPT541EW6S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId; 

function updateCardState(checklist) {
    const card = checklist.closest(".card");
    const checkboxes = checklist.querySelectorAll("input[type='checkbox']");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    card.classList.toggle("completed", allChecked);
}

window.toggleChecklist = function (button) {
    const checklist = button.closest('.card').querySelector('.checklist');
    const icon = button.querySelector('i');
    const isHidden = getComputedStyle(checklist).display === "none";

    checklist.style.display = isHidden ? "block" : "none";
    icon.classList.toggle("fa-chevron-up", isHidden);
    icon.classList.toggle("fa-chevron-down", !isHidden);
};

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.error("ログインユーザーがいません");
        return;
    }
    userId = user.uid;
    
    const checklistContainer = document.querySelector('#shoppingListContainer');
    checklistContainer.innerHTML = ''; // 一旦クリア

    // Firestore の userId コレクション内を取得
    const userDocRef = collection(db, userId);
    const snapshot = await getDocs(userDocRef);

    snapshot.forEach(async (docSnap) => {
        if (docSnap.id.startsWith("shoppingList_")) {
            const data = docSnap.data();
            const items = data.items || [];
            const date = data.date || "日付不明";
            const eventName = data.eventName || docSnap.id.replace("shoppingList_", ""); // イベント名確保

            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.eventName = eventName;  // data属性として保持

            card.innerHTML = `
                <div class="card-header">
                    <h3>${date}</h3>
                    <h4 style="display:none;">${eventName}</h4>
                    <button class="toggle-button" onclick="toggleChecklist(this)">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                </div>
                <ul class="checklist">
                    ${items.map((item, index) => `
                        <li>
                            <div class="item">
                                <input type="checkbox" data-index="${index}" ${item.checked ? 'checked' : ''}> ${item.name}
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;

            checklistContainer.appendChild(card);

            // チェックボックスのイベント登録
            const checklist = card.querySelector('.checklist');
            const checkboxes = checklist.querySelectorAll("input[type='checkbox']");

            checkboxes.forEach(cb => {
                cb.addEventListener("change", async () => {
                    const index = parseInt(cb.dataset.index);
                    const updatedItems = items.map((item, i) =>
                        i === index ? { ...item, checked: cb.checked } : item
                    );

                    const shoppingDocRef = doc(db, userId, docSnap.id);
                    await setDoc(shoppingDocRef, {
                        ...data,
                        items: updatedItems
                    });

                    console.log("チェック状態を保存:", updatedItems[index].name, cb.checked);
                    updateCardState(checklist);
                });
            });

            updateCardState(checklist);
        }
    });
});

window.onload = function () {
    // このonload内は空でもOK。チェックボックスイベント登録は上のonAuthStateChanged内で行うため
};

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
