// --- ENGINE: JURNAL HARIAN (DENGAN FOTO) ---
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if(e.target.disabled) return;
    document.querySelectorAll('.mood-btn').forEach(b => { b.classList.remove('bg-violet-500/20', 'border-violet-500', 'text-white'); b.classList.add('border-gray-700', 'text-gray-400'); });
    btn.classList.add('bg-violet-500/20', 'border-violet-500', 'text-white'); btn.classList.remove('border-gray-700', 'text-gray-400');
    document.getElementById('j-mood').value = btn.dataset.mood;
  });
});

async function handleJournalPhoto(e) {
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 5*1024*1024) return alert('Maksimal foto 5MB ya! ✋');
  
  currentJournalImageBlob = new Blob([await file.arrayBuffer()], { type: file.type });
  const imgUrl = URL.createObjectURL(currentJournalImageBlob);
  document.getElementById('j-photo-preview').src = imgUrl;
  document.getElementById('j-photo-preview-container').classList.remove('hidden');
}

function removeJournalPhoto() {
  currentJournalImageBlob = null;
  document.getElementById('j-photo-input').value = '';
  document.getElementById('j-photo-preview-container').classList.add('hidden');
}

async function loadJournal() {
  const dStr = getLocalISODate(currentDate), today = getLocalISODate(new Date());
  const isToday = (dStr === today);
  const data = await dbAct.get('journal', dStr) || {};

  document.getElementById('j-tujuan').value = data.tujuan || '';
  document.getElementById('j-prioritas').value = data.prioritas || '';
  document.getElementById('j-energi-pagi').value = data.ePagi || 5; document.getElementById('val-energi-pagi').innerText = (data.ePagi || 5)+'/10';
  document.getElementById('j-pencapaian').value = data.pencapaian || '';
  document.getElementById('j-syukur').value = data.syukur || '';
  document.getElementById('j-energi-malam').value = data.eMalam || 5; document.getElementById('val-energi-malam').innerText = (data.eMalam || 5)+'/10';
  
  const savedMood = data.mood || '';
  document.getElementById('j-mood').value = savedMood;
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.remove('bg-violet-500/20', 'border-violet-500', 'text-white'); b.classList.add('border-gray-700', 'text-gray-400');
    if(b.dataset.mood === savedMood) { b.classList.add('bg-violet-500/20', 'border-violet-500', 'text-white'); b.classList.remove('border-gray-700', 'text-gray-400'); }
  });

  if(data.imageBlob) {
    currentJournalImageBlob = data.imageBlob;
    document.getElementById('j-photo-preview').src = URL.createObjectURL(currentJournalImageBlob);
    document.getElementById('j-photo-preview-container').classList.remove('hidden');
  } else {
    removeJournalPhoto();
  }

  document.getElementById('journal-readonly-warning').style.display = isToday ? 'none' : 'flex';
  document.getElementById('btn-save-journal').style.display = isToday ? 'flex' : 'none';
  document.querySelectorAll('.j-input').forEach(el => { el.disabled = !isToday; el.style.opacity = isToday ? '1' : '0.4'; el.style.cursor = isToday ? 'auto' : 'not-allowed'; });

  const allJ = await dbAct.getAll('journal');
  document.getElementById('j-stat-total').innerText = allJ.length;
  document.getElementById('j-stat-month').innerText = allJ.filter(j => j.date.startsWith(today.substring(0,7))).length;
  let streak = 0, cd = new Date();
  while(true) {
    const cStr = getLocalISODate(cd);
    if(allJ.find(j => j.date === cStr)) { streak++; cd.setDate(cd.getDate()-1); }
    else if(cStr === today) { cd.setDate(cd.getDate()-1); } else break;
  }
  document.getElementById('j-stat-streak').innerText = streak;
}

async function saveJournalLogic() {
  await dbAct.add('journal', {
    id: getLocalISODate(currentDate), date: getLocalISODate(currentDate),
    tujuan: document.getElementById('j-tujuan').value, prioritas: document.getElementById('j-prioritas').value, ePagi: document.getElementById('j-energi-pagi').value,
    pencapaian: document.getElementById('j-pencapaian').value, syukur: document.getElementById('j-syukur').value, eMalam: document.getElementById('j-energi-malam').value, mood: document.getElementById('j-mood').value,
    imageBlob: currentJournalImageBlob
  });
  alert('Vibes dan memori terkunci! 🔒✨'); loadJournal();
}