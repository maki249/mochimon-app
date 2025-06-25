/*import * as List from '../database.js';
import * as Event from '../EventDataBaseOperaion.js';
List
Event*/
//キャンセル
document.querySelector('.cancel-button').addEventListener('click', () => {
    window.location.href = 'Calendar.html';
});
//保存
document.querySelector('.save-button').addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const allDay = document.getElementById('all-day-toggle').checked;
    const startDate = document.getElementById('start-date-box').value;
    
    if (!allDay) startDate += document.getElementById('start-time-box').value;
    const endDate = document.getElementById('end-date-box').value;
    if (!allDay) endDate += document.getElementById('end-time-box').value;
    const start = stringToDate(startDate, allDay)
    const end = stringToDate(endDate, allDay)

    const notify = document.getElementById('notification-toggle').checked;

    console.log({ title, allDay, notify });
    alert('どうですか？');
    Event.addEvent(title, start, end, notify);
    alert('どうですか？');
});

document.getElementById('add-item-button').addEventListener('click', () => {
    alert('持ち物追加画面に遷移します（未実装）');
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDateStr = urlParams.get("date");

    if (selectedDateStr) {
        const now = new Date();
        function roundToNextHour(date) {
            const result = new Date(date);
            result.setMinutes(0, 0, 0);
            if (date.getMinutes() > 0) {
                result.setHours(result.getHours() + 1);
            }
            return result;
        }

        const roundedNow = roundToNextHour(now);
        const startDate = new Date(selectedDateStr);
        startDate.setHours(roundedNow.getHours(), roundedNow.getMinutes(), 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        const formatDate = (date) => `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日（${['日','月','火','水','木','金','土'][date.getDay()]}）`;
        const formatTime = (date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

        document.getElementById('start-date-box').textContent = formatDate(startDate);
        document.getElementById('start-time-box').textContent = formatTime(startDate);
        document.getElementById('end-date-box').textContent = formatDate(endDate);
        document.getElementById('end-time-box').textContent = formatTime(endDate);
    }
});

document.getElementById('all-day-toggle').addEventListener('change', () => {
    const isAllDay = document.getElementById('all-day-toggle').checked;
    document.getElementById('start-time-box').style.display = isAllDay ? 'none' : 'inline-block';
    document.getElementById('end-time-box').style.display = isAllDay ? 'none' : 'inline-block';
});

function stringToDate(str, allDay){
    const parts = str.match(/\d+/g);
    if (allDay) date = new Date(parts[1], parts[2] - 1, parts[3]);
    else date = new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5]);
    return date; 
}