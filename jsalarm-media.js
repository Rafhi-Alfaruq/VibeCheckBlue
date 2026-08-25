// --- ENGINE: GALERI VIDEO ---
async function handleVideoUpload(e) {
  const file = e.target.files[0]; if(!file) return;
  if(file.size > 50*1024*1024) return alert('Maksimal 50MB per video!');
  document.getElementById('upload-status').style.display = 'block';
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  await dbAct.add('videoBlobStorage', { videoId: `v_${Date.now()}`, fileName: file.name, blob });
  document.getElementById('upload-status').style.display = 'none'; e.target.value = ''; renderGallery();
}

async function renderGallery() {
  const vids = await dbAct.getAll('videoBlobStorage');
  const grid = document.getElementById('video-gallery-grid');
  grid.innerHTML = vids.length ? '' : '<div class="col-span-full glass-card p-10 rounded-3xl text-center text-gray-500 font-bold border-dashed border-2 border-gray-700">Vault kosong. Upload edit motivasimu di sini! 🎬</div>';
  vids.forEach(v => {
    grid.innerHTML += `<div class="bg-black/40 p-5 rounded-[24px] border border-white/5 flex flex-col gap-4 group transition-all hover:border-blue-500/50 hover:bg-black/60"><div class="flex items-center gap-3"><div class="p-2.5 bg-blue-500/20 rounded-xl"><i data-lucide="clapperboard" class="w-5 h-5 text-blue-400"></i></div><span class="text-sm font-bold truncate flex-1 text-gray-200">${v.fileName}</span></div><button onclick="delVid('${v.videoId}')" class="text-gray-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 p-2.5 rounded-xl text-xs font-bold transition-all w-full flex justify-center items-center gap-2"><i data-lucide="trash-2" class="w-4 h-4"></i> HAPUS</button></div>`;
  });
  lucide.createIcons();
}

async function delVid(id) { if(confirm('Hapus video ini dari vault?')) { await dbAct.del('videoBlobStorage', id); renderGallery(); updateVideoDropdown(); } }

// --- ENGINE: ALARM LOOP ---
function startAlarmEngine() {
  if(alarmEngineInterval) clearInterval(alarmEngineInterval);
  alarmEngineInterval = setInterval(async () => {
    if(!document.getElementById('toggle-master-alarm').checked) return;
    const now = new Date(), todayStr = getLocalISODate(now);
    const tasks = await dbAct.getAll('tasks');
    const pending = tasks.filter(t => t.date === todayStr && !t.completed && t.videoId && !t.alarmTriggered);
    
    for(const t of pending) {
      const [tH, tM] = t.time.split(':').map(Number);
      if (now.getHours() > tH || (now.getHours() === tH && now.getMinutes() >= tM)) await executeAlarm(t);
    }
  }, 10000);
}

async function executeAlarm(t) {
  t.alarmTriggered = true; await dbAct.add('tasks', t); renderTasks();
  const vData = await dbAct.get('videoBlobStorage', t.videoId); if(!vData) return;
  currentObjectURL = URL.createObjectURL(vData.blob);
  
  document.getElementById('alarm-title').innerText = t.title;
  document.getElementById('video-player-container').innerHTML = `<video src="${currentObjectURL}" autoplay loop class="w-full h-full object-cover"></video>`;
  
  const alarmModal = document.getElementById('floating-alarm');
  alarmModal.classList.remove('hidden');
  alarmModal.style.display = 'flex';
  
  let tl = t.duration; document.getElementById('alarm-countdown').innerText = tl;
  if(activeVideoCountdown) clearInterval(activeVideoCountdown);
  activeVideoCountdown = setInterval(() => {
    tl--; document.getElementById('alarm-countdown').innerText = tl;
    if(tl <= 0) stopAlarmEarly();
  }, 1000);
}

function stopAlarmEarly() {
  clearInterval(activeVideoCountdown);
  const alarmModal = document.getElementById('floating-alarm');
  alarmModal.classList.add('hidden');
  alarmModal.style.display = 'none';
  document.getElementById('video-player-container').innerHTML = '';
  if(currentObjectURL) { URL.revokeObjectURL(currentObjectURL); currentObjectURL = null; }
}