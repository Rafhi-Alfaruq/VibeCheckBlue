// --- ENGINE: KALENDER (OVERLAY & EVENT CRUD) ---
function openCalendarModal() {
  const modal = document.getElementById('calendar-overlay');
  modal.classList.remove('hidden');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  calViewDate = new Date(currentDate); 
  renderCalendar();
}

function closeCalendarModal() {
  const modal = document.getElementById('calendar-overlay');
  modal.classList.add('hidden');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function calPrevMonth() { calViewDate.setMonth(calViewDate.getMonth() - 1); renderCalendar(); }
function calNextMonth() { calViewDate.setMonth(calViewDate.getMonth() + 1); renderCalendar(); }

async function renderCalendar() {
  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  document.getElementById('cal-month-year').innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calGrid = document.getElementById('calendar-grid');
  calGrid.innerHTML = '';

  const allTasks = await dbAct.getAll('tasks');
  const allEvents = await dbAct.getAll('events');

  for (let i = 0; i < firstDay; i++) { calGrid.innerHTML += `<div class="day-cell other-month"></div>`; }

  const todayStr = getLocalISODate(new Date());

  for (let i = 1; i <= daysInMonth; i++) {
    const loopDate = new Date(year, month, i);
    const dateStr = getLocalISODate(loopDate);
    const isToday = dateStr === todayStr;
    
    const dayTasks = allTasks.filter(t => t.date === dateStr);
    let dotsHTML = '';
    if(dayTasks.length > 0) {
      const maxDots = Math.min(dayTasks.length, 5); 
      for(let d=0; d<maxDots; d++) dotsHTML += `<div class="quest-dot"></div>`;
    }

    let badgesHTML = '';
    
    const holiday = liburNasional[dateStr];
    if (holiday) {
      badgesHTML += `<div class="event-badge bg-red-600 text-white font-black truncate border border-red-400" title="${holiday}">${holiday}</div>`;
    }

    const dayEvents = allEvents.filter(e => e.date === dateStr);
    dayEvents.forEach(e => {
      badgesHTML += `<div class="event-badge ev-${e.category}" onclick="editEventObj('${e.id}'); event.stopPropagation();">${e.title}</div>`;
    });

    calGrid.innerHTML += `
      <div class="day-cell ${isToday ? 'today' : ''}" onclick="selectDateFromCalendar('${dateStr}')">
        <div class="day-number">${i}</div>
        <div class="quest-dots">${dotsHTML}</div>
        <div class="event-badges">${badgesHTML}</div>
      </div>
    `;
  }
}

function selectDateFromCalendar(dateStr) {
  currentDate = new Date(dateStr);
  updateDateUI();
  renderTasks();
  loadJournal();
  closeCalendarModal();
}

function openAddEventModal() {
  currentEditEventId = null;
  document.getElementById('ev-id').value = '';
  document.getElementById('ev-title').value = '';
  document.getElementById('ev-date').value = getLocalISODate(calViewDate);
  document.getElementById('ev-desc').value = '';
  document.getElementById('ev-reminder').value = '0';
  document.getElementById('ev-image').value = '';
  document.getElementById('ev-preview-img').style.display = 'none';
  eventImageBlob = null;
  document.getElementById('btn-ev-delete').classList.add('hidden');
  
  const modal = document.getElementById('modal-event-form');
  modal.classList.remove('hidden');
  modal.style.display = 'flex'; 
}

function closeEventModal() { 
  const modal = document.getElementById('modal-event-form');
  modal.classList.add('hidden');
  modal.style.display = 'none';
}

async function handleEventImageUpload(file) {
  if(!file) return null;
  if(file.size > 5*1024*1024) { alert('Maksimal 5MB untuk gambar event!'); return null; }
  return new Blob([await file.arrayBuffer()], { type: file.type });
}

async function previewEvImage(e) {
  const file = e.target.files[0];
  if(file) {
    eventImageBlob = await handleEventImageUpload(file);
    if(eventImageBlob) {
      const img = document.getElementById('ev-preview-img');
      img.src = URL.createObjectURL(eventImageBlob);
      img.style.display = 'block';
    }
  }
}

async function saveEventData() {
  const title = document.getElementById('ev-title').value;
  const date = document.getElementById('ev-date').value;
  if(!title || !date) return alert('Judul dan Tanggal wajib diisi!');

  const evData = {
    id: currentEditEventId || `ev_${Date.now()}`,
    title: title,
    date: date,
    category: document.getElementById('ev-category').value,
    description: document.getElementById('ev-desc').value,
    reminderDays: parseInt(document.getElementById('ev-reminder').value),
    reminderTriggeredDate: null,
    imageBlob: eventImageBlob 
  };

  await dbAct.add('events', evData);
  closeEventModal();
  
  if(document.getElementById('calendar-overlay').style.display !== 'none') {
    renderCalendar();
  }
  renderTasks(); 
  checkEventReminders();
}

async function editEventObj(id) {
  const ev = await dbAct.get('events', id);
  if(!ev) return;
  currentEditEventId = ev.id;
  document.getElementById('ev-id').value = ev.id;
  document.getElementById('ev-title').value = ev.title;
  document.getElementById('ev-date').value = ev.date;
  document.getElementById('ev-category').value = ev.category;
  document.getElementById('ev-desc').value = ev.description;
  document.getElementById('ev-reminder').value = ev.reminderDays || 0;
  
  eventImageBlob = ev.imageBlob;
  const img = document.getElementById('ev-preview-img');
  if(ev.imageBlob) {
    img.src = URL.createObjectURL(ev.imageBlob);
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  document.getElementById('btn-ev-delete').classList.remove('hidden');
  const modal = document.getElementById('modal-event-form');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

async function deleteEvent() {
  if(!currentEditEventId) return;
  if(confirm('Hapus event ini?')) {
    await dbAct.del('events', currentEditEventId);
    closeEventModal();
    if(document.getElementById('calendar-overlay').style.display !== 'none') renderCalendar();
    renderTasks();
  }
}

// --- ENGINE: PENGINGAT EVENT (H-X NOTIFIKASI) ---
async function checkEventReminders() {
  const events = await dbAct.getAll('events');
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayIso = getLocalISODate(today);

  for(const ev of events) {
    if(!ev.reminderDays || ev.reminderDays === 0) continue; 
    if(ev.reminderTriggeredDate === todayIso) continue; 

    const evDate = new Date(ev.date);
    evDate.setHours(0,0,0,0);
    
    const diffTime = evDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === ev.reminderDays || diffDays === 0) {
      document.getElementById('rmd-title').innerText = ev.title;
      document.getElementById('rmd-desc').innerText = ev.description || 'Persiapkan dirimu, hari H hampir tiba!';
      document.getElementById('rmd-days').innerText = diffDays === 0 ? 'HARI INI! 🎉' : `H-${diffDays} MENUJU HARI H`;
      
      const imgEl = document.getElementById('rmd-img');
      if(ev.imageBlob) {
        imgEl.src = URL.createObjectURL(ev.imageBlob);
        imgEl.style.display = 'block';
      } else {
        imgEl.style.display = 'none';
      }
      
      const popup = document.getElementById('reminder-popup');
      popup.classList.remove('hidden');
      popup.style.display = 'flex';
      
      ev.reminderTriggeredDate = todayIso;
      await dbAct.add('events', ev);
      break; 
    }
  }
}

function closeReminderPopup() { 
  const popup = document.getElementById('reminder-popup');
  popup.classList.add('hidden');
  popup.style.display = 'none';
}