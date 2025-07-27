import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
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

window.onload = function () {
    const checklists = document.querySelectorAll(".card .checklist");

    checklists.forEach(checklist => {
        const checkboxes = checklist.querySelectorAll("input[type='checkbox']");
        
        checkboxes.forEach(cb => {
            cb.addEventListener("change", async() => {
                updateCardState(checklist);
                    const itemName = cb.parentElement.textContent.trim();
                    const card = checklist.closest(".card");
                    const eventName = card.querySelector("h4").textContent;

                    const shoppingDocRef = doc(db, userId, `shoppingList_${eventName}`);
                    const shoppingDocSnap = await getDoc(shoppingDocRef);
                    if (shoppingDocSnap.exists()) {
                        const shoppingData = shoppingDocSnap.data();
                        const updatedItems = shoppingData.items.map(item => {
                            if (item.name === itemName) {
                                return { ...item, checked: cb.checked };
                            }
                            return item;
                        });

                        await setDoc(shoppingDocRef, {
                            ...shoppingData,
                            items: updatedItems
                        });
                        console.log("チェック状態を更新:", itemName, cb.checked);
                    }
            });
        });

        // 初期状態をチェック
        updateCardState(checklist);
    });
};

window.toggleChecklist = function (button) {
    const checklist = button.closest('.card').querySelector('.checklist');
    const icon = button.querySelector('i');
    const isHidden = getComputedStyle(checklist).display === "none";

    checklist.style.display = isHidden ? "block" : "none";
    icon.classList.toggle("fa-chevron-up", isHidden);
    icon.classList.toggle("fa-chevron-down", !isHidden);
};

function updateCardState(checklist) {
    const card = checklist.closest(".card");
    const checkboxes = checklist.querySelectorAll("input[type='checkbox']");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    card.classList.toggle("completed", allChecked);
}
let userId; 
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.error("ログインユーザーがいません");
        return;
    }
    userId = user.uid;
    
    const checklistContainer = document.querySelector('#shoppingListContainer');
    checklistContainer.innerHTML = ''; // 一旦クリア

    const userDocRef = collection(db, userId);
    const snapshot = await getDocs(userDocRef);

    snapshot.forEach(async (docSnap) => {
        if (docSnap.id.startsWith("shoppingList_")) {
            const data = docSnap.data();
            const items = data.items || [];
            const date = data.date || "日付不明";
            console.log(data);
        
            // const eventName = data.eventName || "不明なイベント";

            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
            <div class="card-header">
                <h3>${date}</h3>  <!-- ここにFirestoreから取った日付をセット -->
                <button class="toggle-button" onclick="toggleChecklist(this)">
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
            </div>
                <ul class="checklist">
                    ${items.map(item => `
                        <li>
                            <div class="item">
                                <input type="checkbox" ${item.checked ? 'checked' : ''}> ${item.name}
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
            checklistContainer.appendChild(card);
        }
    });
});

