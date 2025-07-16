document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.small-card');
    const useButton = document.getElementById('use-button');

    function updateButtonState() {
        const anySelected = document.querySelectorAll('.small-card.selected').length > 0;

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
});
// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    window.location.href = 'ListCreate.html';
});
// 保存ボタン
document.querySelector('.save-button').addEventListener('click', () => {
    alert('保存処理をここに追加');
});