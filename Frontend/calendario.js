document.addEventListener("DOMContentLoaded", () => {
    const monthYear = document.getElementById("monthYear");
    const calendarBody = document.getElementById("calendarBody");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
  
    let currentDate = new Date();
  
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
  
        monthYear.textContent = `${months[month]} ${year}`;
  
        const firstDay = new Date(year, month, 1);
        const startDay = (firstDay.getDay() + 6) % 7;
        const lastDay = new Date(year, month + 1, 0).getDate();
  
        calendarBody.innerHTML = "";
        let row = document.createElement("tr");
  
        for (let i = 0; i < startDay; i++) {
            row.appendChild(document.createElement("td"));
        }
  
        for (let day = 1; day <= lastDay; day++) {
            if (row.children.length === 7) {
                calendarBody.appendChild(row);
                row = document.createElement("tr");
            }
  
            let cell = document.createElement("td");
            cell.textContent = day;
  
            let today = new Date();
            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                cell.classList.add("today");
            }
  
            row.appendChild(cell);
        }
  
        while (row.children.length < 7) {
            row.appendChild(document.createElement("td"));
        }
        calendarBody.appendChild(row);
    }
  
    prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
  
    nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
  
    renderCalendar(currentDate);
  });
  