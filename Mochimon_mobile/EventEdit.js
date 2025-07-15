// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    window.location.href = 'Calendar.html';
});
// 保存ボタン
document.querySelector('.save-button').addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const allDay = document.getElementById('all-day-toggle').checked;
    const notify = document.getElementById('notification-toggle').checked;

    console.log({ title, allDay, notify });
    alert('保存処理をここに追加');
});
//  持ち物リスト追加ボタン
document.getElementById('add-item-button').addEventListener('click', () => {
    window.location.href = 'ListCreate.html';
});
//  終日トグル
document.getElementById('all-day-toggle').addEventListener('change', () => {
    const isAllDay = document.getElementById('all-day-toggle').checked;
    document.getElementById('start-time-box').style.display = isAllDay ? 'none' : 'inline-block';
    document.getElementById('end-time-box').style.display = isAllDay ? 'none' : 'inline-block';
});

document.getElementById('modal-back-button').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.remove('active');
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.notification-row').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('active');
    });
    document.querySelectorAll('.notification-options .form-row').forEach(row => {
        row.addEventListener('click', () => {
            row.classList.toggle('selected');
        });
    });

});