window.onload = function () {
    const checklists = document.querySelectorAll(".card .checklist");

    checklists.forEach(checklist => {
        const checkboxes = checklist.querySelectorAll("input[type='checkbox']");
        
        checkboxes.forEach(cb => {
            cb.addEventListener("change", () => {
                updateCardState(checklist);
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

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('shoppingListContainer');
  const shoppingData = JSON.parse(localStorage.getItem('shoppingList')) || [];

  // グループ化：{ "2025年7月20日|旅行": [item1, item2] ... }
  const grouped = {};

  shoppingData.forEach(entry => {
    const key = `${entry.date}|${entry.eventName}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry.item);
  });

  // カードを生成
  Object.entries(grouped).forEach(([key, items]) => {
    const [date, eventName] = key.split('|');

    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <h3>${date}</h3>
      <h4>${eventName}</h4>
      <ul>
        ${items.map(item => `<li><input type="checkbox" checked> ${item}</li>`).join('')}
      </ul>
    `;

    container.appendChild(card);
  });
});

