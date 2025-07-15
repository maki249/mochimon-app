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
