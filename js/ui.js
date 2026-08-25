if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(()=>{}); });
}
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  document.getElementById('btn-install').classList.remove('hidden');
});
document.getElementById('btn-install').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') document.getElementById('btn-install').classList.add('hidden');
    deferredPrompt = null;
  }
});
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const txt = document.getElementById('status-text');
  const iconWrap = document.getElementById('status-icon-wrapper');
  if(navigator.onLine) { 
    txt.textContent = "System Ready ⚡"; txt.className = "font-bold text-gray-200 text-sm tracking-wide"; 
    iconWrap.innerHTML = '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><i data-lucide="wifi" class="relative inline-flex rounded-full w-4 h-4 text-blue-400"></i>';
  }
  else { 
    txt.textContent = "Offline Mode 🛡️"; txt.className = "font-bold text-gray-400 text-sm tracking-wide"; 
    iconWrap.innerHTML = '<i data-lucide="wifi-off" class="relative inline-flex rounded-full w-4 h-4 text-gray-500"></i>';
  }
  lucide.createIcons();
}

document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-button').forEach(b => {
      b.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-violet-600', 'text-white', 'shadow-md'); 
      b.classList.add('text-gray-400', 'hover:bg-white/5');
    });
    document.getElementById(`content-${btn.dataset.tab}`).classList.remove('hidden');
    btn.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-violet-600', 'text-white', 'shadow-md'); 
    btn.classList.remove('text-gray-400', 'hover:bg-white/5');
    
    if (btn.dataset.tab === 'jadwal') renderTasks();
    if (btn.dataset.tab === 'jurnal') loadJournal();
    if (btn.dataset.tab === 'galeri') renderGallery();
    if (btn.dataset.tab === 'statistik') renderStatsTab();
  });
});

['input-date', 'input-journal-date'].forEach(id => {
  document.getElementById(id).addEventListener('change', e => { currentDate = new Date(e.target.value); updateDateUI(); renderTasks(); loadJournal(); });
});

function changeDate(days) { currentDate.setDate(currentDate.getDate() + days); updateDateUI(); renderTasks(); loadJournal(); }
document.getElementById('btn-prev-date').onclick = () => changeDate(-1);
document.getElementById('btn-next-date').onclick = () => changeDate(1);
document.getElementById('btn-prev-journal-date').onclick = () => changeDate(-1);
document.getElementById('btn-next-journal-date').onclick = () => changeDate(1);

function updateDateUI() {
  const dStr = getLocalISODate(currentDate);
  document.getElementById('input-date').value = dStr;
  document.getElementById('input-journal-date').value = dStr;
  document.getElementById('display-date').innerText = currentDate.toLocaleDateString('id-ID', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
}
