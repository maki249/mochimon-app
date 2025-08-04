import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, setDoc, getDocs, doc, getDoc, where, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

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

const iconBtn = document.getElementById("user-icon-btn");
let currentUser = null;

const addButton = document.getElementById("add-event-btn");
const modal = document.getElementById("template-modal");
const closeBtn = document.getElementById("close-modal");

// ＋ボタン押下時、モーダル表示
addButton.addEventListener("click", (e) => {
  e.preventDefault(); // aタグのリンクを無効化
  modal.style.display = "flex"; // ← block → flex に修正
});

// モーダル外クリックで閉じる
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ✕ボタンで閉じる（存在チェックも追加）
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

document.getElementById("create-template-btn").addEventListener("click", () => {
    const input = document.getElementById("template-name").value.trim();
    if (input) {
      // URLにテンプレート名をクエリパラメータで渡す
      location.href = `EditTemplate.html?TempName=${encodeURIComponent(input)}`;
    } else {
      alert("テンプレート名を入力してください");
    }
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

// ユーザーの認証状態が変わるたびにcurrentUserにセット
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    console.log("auth state changed:", user);
    
    //持ち物の取得
    try{
        const tempList = await getDocs(query(collection(db, user.uid), where("tag", "==", "templateList")));
        
        if(tempList.empty){
            // テンプレートリストをデータベースへ追加
            await setDoc(doc(db, user.uid, "akasan"),{
                tag: "templateList",
                title: "赤ちゃん",
                item: [
                    {
                        name: "おむつ",
                        isChecked: false
                    },
                    {
                        name: "ミルク",
                        isChecked: false
                    },
                    {
                        name: "着替え",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "foreign"),{
                tag: "templateList",
                title: "海外旅行",
                item: [
                    {
                        name: "パスポート・ビザ",
                        isChecked: false
                    },
                    {
                        name: "航空券（Eチケット）",
                        isChecked: false
                    },
                    {
                        name: "現地通貨・クレジットカード",
                        isChecked: false
                    },
                    {
                        name: "スマホ・充電器・変換プラグ",
                        isChecked: false
                    },
                    {
                        name: "常備薬・処方薬",
                        isChecked: false
                    },
                    {
                        name: "歯ブラシ・洗面用具",
                        isChecked: false
                    },
                    {
                        name: "着替え",
                        isChecked: false
                    },
                    {
                        name: "スーツケースベルト・タグ",
                        isChecked: false
                    },
                    {
                        name: "マスク・除菌シート",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "sports"),{
                tag: "templateList",
                title: "スポーツ",
                item: [
                    {
                        name: "スポーツウェア",
                        isChecked: false
                    },
                    {
                        name: "シューズ（ランニング・屋内用）",
                        isChecked: false
                    },
                    {
                        name: "飲み物",
                        isChecked: false
                    },
                    {
                        name: "タオル・汗拭きシート",
                        isChecked: false
                    },
                    {
                        name: "プロテイン",
                        isChecked: false
                    },
                    {
                        name: "着替え",
                        isChecked: false
                    },
                    {
                        name: "サポーター・テーピング",
                        isChecked: false
                    },
                    {
                        name: "スマートウォッチ・活動計",
                        isChecked: false
                    },
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "umi"),{
                tag: "templateList",
                title: "海・川・プール",
                item: [
                    {
                        name: "水着",
                        isChecked: false
                    },
                    {
                        name: "ゴーグル・浮き輪",
                        isChecked: false
                    },
                    {
                        name: "ビーチサンダル",
                        isChecked: false
                    },
                    {
                        name: "バスタオル・ラップタオル",
                        isChecked: false
                    },
                    {
                        name: "日焼け止め",
                        isChecked: false
                    },
                    {
                        name: "レジャーシート",
                        isChecked: false
                    },
                    {
                        name: "クーラーボックス・飲み物",
                        isChecked: false
                    },
                    {
                        name: "着替え",
                        isChecked: false
                    },
                    {
                        name: "防水ポーチ",
                        isChecked: false
                    },
                    {
                        name: "スマホ防水ケース",
                        isChecked: false
                    },
                    {
                        name: "海辺用のおもちゃ（バケツなど）",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "yuenti"),{
                tag: "templateList",
                title: "遊園地",
                item: [
                    {
                        name: "チケット・アプリ登録",
                        isChecked: false
                    },
                    {
                        name: "モバイルバッテリー",
                        isChecked: false
                    },
                    {
                        name: "帽子・サングラス",
                        isChecked: false
                    },
                    {
                        name: "日焼け止め",
                        isChecked: false
                    },
                    {
                        name: "動きやすい服・靴",
                        isChecked: false
                    },
                    {
                        name: "タオル・ハンカチ",
                        isChecked: false
                    },
                    {
                        name: "折りたたみ傘・ポンチョ",
                        isChecked: false
                    },
                    {
                        name: "財布・交通系ICカード",
                        isChecked: false
                    },
                    {
                        name: "飲み物・軽食",
                        isChecked: false
                    },
                    {
                        name: "グッズ用バッグ",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "maturi"),{
                tag: "templateList",
                title: "祭り",
                item: [
                    {
                        name: "浴衣・下駄",
                        isChecked: false
                    },
                    {
                        name: "財布",
                        isChecked: false
                    },
                    {
                        name: "うちわ・扇子",
                        isChecked: false
                    },
                    {
                        name: "レジャーシート",
                        isChecked: false
                    },
                    {
                        name: "虫除けスプレー",
                        isChecked: false
                    },
                    {
                        name: "カメラ・スマホ",
                        isChecked: false
                    },
                    {
                        name: "飲み物",
                        isChecked: false
                    },
                    {
                        name: "ポケットティッシュ",
                        isChecked: false
                    },
                    {
                        name: "折りたたみ椅子",
                        isChecked: false
                    },
                    {
                        name: "ゴミ袋",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "yama"),{
                tag: "templateList",
                title: "登山・ハイキング",
                item: [
                    {
                        name: "登山靴・靴下",
                        isChecked: false
                    },
                    {
                        name: "リュックサック",
                        isChecked: false
                    },
                    {
                        name: "レインウェア",
                        isChecked: false
                    },
                    {
                        name: "地図・コンパス",
                        isChecked: false
                    },
                    {
                        name: "飲み物",
                        isChecked: false
                    },
                    {
                        name: "非常食",
                        isChecked: false
                    },
                    {
                        name: "帽子・サングラス",
                        isChecked: false
                    },
                    {
                        name: "軍手・手袋",
                        isChecked: false
                    },
                    {
                        name: "タオル",
                        isChecked: false
                    },
                    {
                        name: "救急セット",
                        isChecked: false
                    },
                    {
                        name: "常備薬",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "pikuniku"),{
                tag: "templateList",
                title: "ピクニック",
                item: [
                    {
                        name: "お弁当",
                        isChecked: false
                    },
                    {
                        name: "飲み物",
                        isChecked: false
                    },
                    {
                        name: "レジャーシート",
                        isChecked: false
                    },
                    {
                        name: "クーラーバッグ",
                        isChecked: false
                    },
                    {
                        name: "紙皿・紙コップ・割り箸",
                        isChecked: false
                    },
                    {
                        name: "ウェットティッシュ",
                        isChecked: false
                    },
                    {
                        name: "ゴミ袋",
                        isChecked: false
                    },
                    {
                        name: "日傘",
                        isChecked: false
                    },
                    {
                        name: "帽子・サングラス",
                        isChecked: false
                    },
                    {
                        name: "ミニテーブル",
                        isChecked: false
                    },
                    {
                        name: "折りたたみ椅子",
                        isChecked: false
                    },
                    {
                        name: "玩具",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "kyanpu"),{
                tag: "templateList",
                title: "キャンプ",
                item: [
                    {
                        name: "テント・タープ",
                        isChecked: false
                    },
                    {
                        name: "寝袋・マット",
                        isChecked: false
                    },
                    {
                        name: "懐中電灯・ランタン",
                        isChecked: false
                    },
                    {
                        name: "調理器具",
                        isChecked: false
                    },
                    {
                        name: "クーラーボックス",
                        isChecked: false
                    },
                    {
                        name: "保冷剤",
                        isChecked: false
                    },
                    {
                        name: "虫除けスプレー",
                        isChecked: false
                    },
                    {
                        name: "レジャーシート",
                        isChecked: false
                    },
                    {
                        name: "軍手・手袋",
                        isChecked: false
                    },
                    {
                        name: "着替え",
                        isChecked: false
                    },
                    {
                        name: "タオル",
                        isChecked: false
                    },
                    {
                        name: "ゴミ袋",
                        isChecked: false
                    },
                    {
                        name: "雨具",
                        isChecked: false
                    }
                ],
                type: "default"
            })
            await setDoc(doc(db, user.uid, "onsen"),{
                tag: "templateList",
                title: "温泉",
                item: [
                    {
                        name: "タオル",
                        isChecked: false
                    },
                    {
                        name: "着替え",
                        isChecked: false
                    },
                    {
                        name: "洗顔料・シャンプー",
                        isChecked: false
                    },
                    {
                        name: "スキンケア用品",
                        isChecked: false
                    },
                    {
                        name: "ビニール袋",
                        isChecked: false
                    },
                    {
                        name: "ヘアゴム・ヘアブラシ",
                        isChecked: false
                    },
                    {
                        name: "飲み物",
                        isChecked: false
                    },
                    {
                        name: "小銭",
                        isChecked: false
                    },
                    {
                        name: "マスク・除菌シート",
                        isChecked: false
                    }
                ],
                type: "default"
            })
        }
        
        const templateList = await getDocs(query(collection(db, user.uid), where("tag", "==", "templateList")));
        console.log(templateList);

        const dashboard = document.getElementById('dashboard-list');
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
            dashboard.appendChild(card);
        });
        const header = document.getElementById('header');
        header.after(dashboard);
    }catch(error){
        console.log(error);
    }
    const tempcards = document.getElementsByClassName("card");
    for(const temp of tempcards){
        temp.addEventListener('click', (e) => {
                e.stopPropagation(); // カード本体クリック
                window.location.href = `EditTemplate.html?TempId=${temp.id}`;
        });
    }
});

document.querySelector('.header-area h1').addEventListener('click', () => {
    window.location.href = 'Home.html';
})