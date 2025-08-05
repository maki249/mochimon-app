// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, addDoc, updateDoc, deleteDoc, collection, doc, getDocs, query, where} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
const params = new URLSearchParams(window.location.search);
const eventId = params.get("eventId");
const date = params.get("date");


// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
    
    //持ち物の取得
    try{        
        const templateList = await getDocs(query(collection(db, user.uid), where("tag", "==", "templateList")));
        console.log(templateList);

        const originTemp = document.getElementById('dashboard-origin');
        const defaultTemp = document.getElementById('dashboard-default');
        templateList.forEach(temp => {
            const card = document.createElement('div');
            card.setAttribute('class', 'card');
            card.setAttribute('id', temp.id);
                
                const title = document.createElement('h2');
                title.textContent = temp.data().title;
                card.appendChild(title);
                
                const content = document.createElement('div');
                content.setAttribute('class', 'card-content');
                    
                    const icon = document.createElement('div');
                    icon.setAttribute('class', 'icon-wrapper');

                        const iconImage = document.createElement('img');
                        if(temp.data().type === 'default'){
                            iconImage.setAttribute('src', 'tempIcon/' + temp.id + '.svg');
                        }else{
                            iconImage.setAttribute('src', 'tempIcon/zisaku.svg');
                        }
                        iconImage.setAttribute('alt', 'アイコン');
                        iconImage.setAttribute('class', 'card-icon');
                    icon.appendChild(iconImage);

                    content.appendChild(icon);

                    const itemList = document.createElement('ul');
                    itemList.setAttribute('class', 'checklist');
                        if(temp.data().item.length > 0){
                            for(const item of temp.data().item){
                                const li = document.createElement('li');
                                li.innerHTML = `
                                    <label><input type="checkbox" disabled> ${item.name}</label>
                                `
                                itemList.appendChild(li); 
                            }
                        }else{
                            const li = document.createElement('li');
                            li.textContent = '※テンプレートリストが空です';
                            itemList.appendChild(li);
                        }
                    
                    content.appendChild(itemList);
                card.appendChild(content);
            if(temp.data().type === 'default'){
                defaultTemp.appendChild(card);
            }else{
                originTemp.appendChild(card);
            }
        });
        originTemp.style.display = 'block';
        defaultTemp.style.display = 'block';
    }catch(error){
        console.log(error);
    }
        
    const cards = document.querySelectorAll('.card');  // ← 修正

    const useButton = document.getElementById('use-button');

    function updateButtonState() {
        const anySelected = document.querySelectorAll('.card.selected').length > 0;  // ← 修正
        if (anySelected) {
            useButton.classList.add('active');
        } else {
            useButton.classList.remove('active');
        }
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            updateButtonState();
        });
    });

    
    // 保存ボタン
    useButton.addEventListener('click', () => {
        const itemArray = JSON.parse(localStorage.getItem('item')) || [];
        const addItemArray = [];
        cards.forEach(card => {
            if (card.classList.contains('selected')) {
                const names = card.querySelectorAll('label');
                names.forEach(name => {
                    if(!itemArray.includes(name.textContent)){
                        if(!addItemArray.includes(name.textContent)){
                            addItemArray.push(name.textContent);
                        }
                    }
                })
            }
        })
        localStorage.setItem('addItem', JSON.stringify(addItemArray));
        if(!eventId){
            window.location.href = `ListCreate.html?date=${date}`;
        }else{
            window.location.href = `ListCreate.html?eventId=${eventId}`;
        }
    });

    // キャンセルボタン
    document.querySelector('.cancel-button').addEventListener('click', () => {
        localStorage.removeItem('addItem');
        if(!eventId){
            window.location.href = `ListCreate.html?date=${date}`;
        }else{
            window.location.href = `ListCreate.html?eventId=${eventId}`;
        }
    });
});