document.addEventListener('DOMContentLoaded', () => {
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
});

// キャンセルボタン
document.querySelector('.cancel-button').addEventListener('click', () => {
    window.location.href = 'ListCreate.html';
});