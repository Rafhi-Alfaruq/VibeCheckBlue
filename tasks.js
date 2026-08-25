// --- ENGINE: TUGAS & AUTO-TEMPLATE ---
async function renderTasks() {
  const dateStr = getLocalISODate(currentDate);
  const todayStr = getLocalISODate(new Date());
  let allTasks = await dbAct.getAll('tasks');
  let dayTasks = allTasks.filter(t => t.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));

  // SMART AUTO-TEMPLATE
  if (dayTasks.length === 0 && allTasks.length > 0) {
    const uniqueDates = [...new Set(allTasks.map(t => t.date))].sort().reverse();
    let sourceDate = uniqueDates.find(d => d < dateStr) || uniqueDates[0]; 
    
    const tasksToCopy = allTasks.filter(t => t.date === sourceDate);
    if (tasksToCopy.length > 0) {
      for (const t of tasksToCopy) {
        await dbAct.add('tasks', {
          ...t,
          id: `t_${Date.now()}_${Math.random()}`,
          date: dateStr,
          completed: false,
          alarmTriggered: false
        });
      }
      allTasks = await dbAct.getAll('tasks');
      dayTasks = allTasks.filter(t => t.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
    }
  }

  const container = document.getElementById('task-list-container');
  container.innerHTML = dayTasks.length ? '' : '<div class="glass-card rounded-3xl p-8 text-center text-gray-500 font-bold border-dashed border-2 border-gray-700">Tidak ada jadwal sama sekali. Ambil nafas sejenak! 🛌</div>';
  
  let comp = 0;
  dayTasks.forEach(t => {
    if(t.completed) comp++;
    const hasAlarm = !!t.videoId;
    const alarmActive = hasAlarm && !t.alarmTriggered && !t.completed && dateStr === todayStr;
    const colorCls = catColors[t.category] || 'text-gray-400 border-gray-500/50 bg-gray-500/10';
    
    container.innerHTML += `
      <div class="bg-[#1a1f2e] p-4 rounded-xl border border-white/5 flex items-center gap-4 transition-all hover:bg-[#202638] group shadow-sm relative overflow-hidden">
        ${alarmActive ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>' : ''}
        
        <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask('${t.id}', this.checked)" class="task-cb ml-2" />
        
        <div class="flex-1 overflow-hidden">
          <p class="font-bold text-[15px] ${t.completed ? 'line-through text-gray-500' : 'text-gray-200'} flex items-center gap-2 truncate">
            ${t.title} 
            ${alarmActive ? '<span class="text-blue-400 text-[10px] animate-pulse border border-blue-500/50 px-2 rounded-full uppercase tracking-wider">Hype</span>' : ''}
            ${hasAlarm && t.alarmTriggered ? '<i data-lucide="check" class="w-3 h-3 text-gray-500"></i>' : ''}
          </p>
          <div class="flex items-center gap-3 mt-1.5">
            <span class="text-xs font-semibold text-gray-400">${t.time}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${colorCls}">${t.category}</span>
          </div>
        </div>
        
        <button onclick="deleteTask('${t.id}')" class="p-2 text-red-400 hover:text-red-300 opacity-70 hover:opacity-100 transition-opacity">
          <i data-lucide="trash-2" class="w-5 h-5"></i>
        </button>
      </div>`;
  });
  lucide.createIcons();
  document.getElementById('stat-total').innerText = dayTasks.length;
  document.getElementById('stat-completed').innerText = comp;
  
  renderChart(allTasks);
  
  renderDailyBanner(dateStr);
}

// --- ENGINE: TAMPILAN BANNER EVENT HARIAN (DI BAWAH TUGAS) ---
async function renderDailyBanner(dateStr) {
  const bannerContainer = document.getElementById('daily-event-banner');
  bannerContainer.innerHTML = '';
  let hasEvent = false;

  // 1. Cek Libur Nasional
  const holidayName = liburNasional[dateStr];
  if (holidayName) {
    hasEvent = true;
    bannerContainer.innerHTML += `
      <div class="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-6 mb-4 shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50 flex items-center gap-5 transform transition-all hover:scale-[1.01]">
        <div class="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"><i data-lucide="flag" class="w-8 h-8 text-white"></i></div>
        <div>
          <p class="text-red-200 text-[10px] font-black tracking-widest uppercase mb-1">Peringatan / Libur Nasional</p>
          <h3 class="text-2xl font-black text-white leading-tight">${holidayName}</h3>
        </div>
      </div>
    `;
  }

  // 2. Cek Event Custom dari Kalender (IndexedDB)
  const allEvents = await dbAct.getAll('events');
  const dayEvents = allEvents.filter(e => e.date === dateStr);
  
  for(const ev of dayEvents) {
    hasEvent = true;
    let imgHTML = '';
    if(ev.imageBlob) {
      const imgUrl = URL.createObjectURL(ev.imageBlob);
      imgHTML = `<img src="${imgUrl}" class="w-full h-56 object-cover rounded-2xl mb-5 border border-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.3)]">`;
    }
    
    bannerContainer.innerHTML += `
      <div class="bg-[#151923] rounded-3xl p-6 mb-4 border-l-4 border-l-blue-500 shadow-xl border-y border-r border-white/5 relative overflow-hidden transition-all hover:-translate-y-1">
        ${imgHTML}
        <p class="text-blue-400 text-[10px] font-black tracking-widest uppercase mb-2 flex items-center gap-2"><i data-lucide="calendar-star" class="w-4 h-4"></i> Event Khusus Anda</p>
        <h3 class="text-2xl font-black text-white mb-2">${ev.title}</h3>
        ${ev.description ? `<p class="text-gray-400 text-sm font-medium mb-5 bg-black/30 p-4 rounded-xl border border-white/5">${ev.description}</p>` : ''}
        <button onclick="editEventObj('${ev.id}')" class="bg-white/10 hover:bg-blue-500/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2 w-full sm:w-auto"><i data-lucide="pencil" class="w-4 h-4"></i> Edit / Hapus Event</button>
      </div>
    `;
  }

  bannerContainer.style.display = hasEvent ? 'block' : 'none';
  lucide.createIcons();
}

async function toggleTask(id, isC) { const t = await dbAct.get('tasks', id); t.completed = isC; await dbAct.add('tasks', t); renderTasks(); }
async function deleteTask(id) { if(confirm('Hapus tugas ini?')) { await dbAct.del('tasks', id); renderTasks(); } }

function toggleVideoOptions() {
  const show = document.getElementById('t-use-video').checked;
  document.getElementById('t-video-section').style.display = show ? 'flex' : 'none';
  if(show) updateVideoDropdown();
}

async function updateVideoDropdown() {
  const vids = await dbAct.getAll('videoBlobStorage');
  document.getElementById('t-video-id').innerHTML = '<option value="">-- Pilih dari Vault --</option>' + vids.map(v => `<option value="${v.videoId}">🎬 ${v.fileName}</option>`).join('');
}

async function saveNewTask() {
  const title = document.getElementById('t-title').value, time = document.getElementById('t-time').value;
  if(!title || !time) return alert('Nama dan Waktu tugas harus diisi!');
  const useV = document.getElementById('t-use-video').checked, vId = useV ? document.getElementById('t-video-id').value : null;
  if(useV && !vId) return alert('Pilih video untuk alarm hype!');

  await dbAct.add('tasks', {
    id: `t_${Date.now()}`, title, time, category: document.getElementById('t-category').value, date: getLocalISODate(currentDate),
    completed: false, videoId: vId, duration: useV ? parseInt(document.getElementById('t-duration').value) : null, alarmTriggered: false
  });
  document.getElementById('t-title').value = ''; renderTasks();
}

function renderChart(allTasks) {
  const labels = [], data = [];
  for(let i=29; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dT = allTasks.filter(t => t.date === getLocalISODate(d));
    labels.push(d.getDate()); data.push(dT.length ? Math.round((dT.filter(t=>t.completed).length / dT.length)*100) : 0);
  }
  if(chartInstance) chartInstance.destroy();
  const ctx = document.getElementById('perfChart').getContext('2d');
  Chart.defaults.color = '#6b7280';
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  chartInstance = new Chart(ctx, { 
    type: 'line', 
    data: { 
      labels, 
      datasets: [{ 
        data, 
        borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', 
        fill: true, tension: 0.3, borderWidth: 2, 
        pointRadius: 3, pointBackgroundColor: '#8b5cf6', pointBorderColor: '#09090b', pointBorderWidth: 1 
      }] 
    }, 
    options: { 
      responsive: true, maintainAspectRatio: false, 
      plugins:{legend:{display:false}, tooltip:{callbacks:{label: function(c){return c.raw+'% selesai';}}}}, 
      scales:{y:{max:100, display:false}, x:{display:false}} 
    } 
  });
}