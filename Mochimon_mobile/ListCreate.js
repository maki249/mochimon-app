document.getElementById('open-add-item-modal').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('active');
});

document.getElementById('add-item-btn').addEventListener('click', () => {
    const title = document.getElementById('item-title').value.trim();

    if (title) {
        const li = document.createElement('li');
        li.innerHTML = `
      <input type="checkbox" />
      <span>${title}</span>
    `;
        document.getElementById('checklist').appendChild(li);
        document.getElementById('item-title').value = '';
        document.getElementById('modal-overlay').classList.remove('active');
    } else {
        alert('持ち物名を入力してください');
    }
});

// モーダルを閉じる（背景タップで閉じる）
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
        document.getElementById('modal-overlay').classList.remove('active');
    }
});
// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    window.location.href = 'EventCreate.html';
});
// 保存ボタン
document.querySelector('.save-button').addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const allDay = document.getElementById('all-day-toggle').checked;
    const notify = document.getElementById('notification-toggle').checked;

    console.log({ title, allDay, notify });
    alert('保存処理をここに追加');
});