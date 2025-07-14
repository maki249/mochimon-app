function updateProgress() {
    const checklist = document.querySelector('.checklist');
    const items = Array.from(checklist.querySelectorAll('li'));

    const checkedItems = [];
    const uncheckedItems = [];

    items.forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
        checkedItems.push(item);
    } else {
        uncheckedItems.push(item);
    }
    });

    // 項目を未チェック → チェック済みの順に並び替え
    const sortedItems = [...uncheckedItems, ...checkedItems];

    // DOMを更新
    checklist.innerHTML = ''; // 全削除
    sortedItems.forEach(item => checklist.appendChild(item));

    // 進捗バー更新処理
    const total = sortedItems.length;
    const checkedCount = checkedItems.length;
    const percent = total === 0 ? 0 : Math.round((checkedCount / total) * 100);
    document.getElementById('progress').textContent = `${percent}%`;

    const fillBar = document.querySelector('.progress-bar-fill');
    fillBar.style.width = `${percent}%`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateProgress();

    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));

    // アイコンのトグル処理
    const icons = document.querySelectorAll('.icon i');
    icons.forEach(icon => {
    icon.addEventListener('click', () => {
        const isAdded = icon.classList.contains('fa-circle-check');
        if (isAdded) {
        icon.classList.remove('fa-circle-check');
        icon.classList.add('fa-cart-shopping');
        icon.parentElement.classList.remove('added');
        } else {
        icon.classList.remove('fa-cart-shopping');
        icon.classList.add('fa-circle-check');
        icon.parentElement.classList.add('added');
        }
    });
    });
});