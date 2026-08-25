// --- ENGINE: STATISTIK & 12 BULAN MATRIKS ---
async function renderStatsTab() {
  const allTasks = await dbAct.getAll('tasks');
  let activeDaysCount = 0, perfectDaysCount = 0, totalCompletionSum = 0, peakCompletion = 0;
  const labels30 = [], data30 = [];
  
  // Hitung Data 30 Hari
  for(let i=29; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = getLocalISODate(d);
    const dayTasks = allTasks.filter(t => t.date === dateStr);
    labels30.push(d.getDate());
    
    if(dayTasks.length > 0) {
      activeDaysCount++;
      const comp = dayTasks.filter(t => t.completed).length;
      const rate = Math.round((comp / dayTasks.length) * 100);
      
      if(rate === 100) perfectDaysCount++;
      if(rate > peakCompletion) peakCompletion = rate;
      
      totalCompletionSum += rate; data30.push(rate);
    } else { data30.push(0); }
  }
  
  const avgCompletion = activeDaysCount > 0 ? Math.round(totalCompletionSum / activeDaysCount) : 0;
  
  document.getElementById('stat-avg-completion').innerText = avgCompletion + '%';
  document.getElementById('stat-perfect-days').innerText = perfectDaysCount;
  document.getElementById('stat-active-days').innerText = activeDaysCount;
  document.getElementById('stat-peak-completion').innerText = peakCompletion + '%';
  
  // Render Chart 30 Hari
  if(window.consistencyChartInstance) window.consistencyChartInstance.destroy();
  const ctx30 = document.getElementById('consistencyChart').getContext('2d');
  Chart.defaults.color = '#6b7280';
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  
  window.consistencyChartInstance = new Chart(ctx30, { 
    type: 'bar', 
    data: { labels: labels30, datasets: [{ data: data30, backgroundColor: '#4ade80', borderRadius: 4, barThickness: 8 }] }, 
    options: { responsive: true, maintainAspectRatio: false, plugins:{legend:{display:false}, tooltip:{callbacks:{label: function(c){return c.raw+'% selesai';}}}}, scales:{ y:{max:100, display:false}, x:{ grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } } } } 
  });

  // --- LOGIKA CHART 12 BULAN (TAHUN INI) ---
  const year = new Date().getFullYear();
  const monthlyData = new Array(12).fill(0);
  const monthlyTaskCount = new Array(12).fill(0);
  const monthlyCompletedCount = new Array(12).fill(0);

  // Kelompokkan data per bulan di tahun ini
  allTasks.forEach(t => {
    const tDate = new Date(t.date);
    if (tDate.getFullYear() === year) {
      const mIndex = tDate.getMonth();
      monthlyTaskCount[mIndex]++;
      if (t.completed) monthlyCompletedCount[mIndex]++;
    }
  });

  // Hitung persentase per bulan
  for (let i = 0; i < 12; i++) {
    if (monthlyTaskCount[i] > 0) {
      monthlyData[i] = Math.round((monthlyCompletedCount[i] / monthlyTaskCount[i]) * 100);
    }
  }

  // Render Chart 12 Bulan
  if(window.monthlyChartInstance) window.monthlyChartInstance.destroy();
  const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  
  window.monthlyChartInstance = new Chart(ctxMonthly, {
    type: 'bar',
    data: {
      labels: monthNames,
      datasets: [{ data: monthlyData, backgroundColor: '#10b981', borderRadius: 4, barThickness: 12 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c) { return 'Rata-rata: ' + c.raw + '%'; } } }
      },
      scales: {
        y: { max: 100, display: false },
        x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11, weight: 'bold' } } }
      }
    }
  });
}

// --- ENGINE: EXPORT PDF ---
function openBackupModal() {
  const d = new Date(); document.getElementById('export-end').value = getLocalISODate(d);
  d.setDate(d.getDate() - 7); document.getElementById('export-start').value = getLocalISODate(d);
  const modal = document.getElementById('modal-export');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function closeBackupModal() { 
  const modal = document.getElementById('modal-export');
  modal.classList.add('hidden');
  modal.style.display = 'none';
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generatePDF() {
  const start = document.getElementById('export-start').value, end = document.getElementById('export-end').value;
  const allJ = await dbAct.getAll('journal');
  const filtered = allJ.filter(j => j.date >= start && j.date <= end).sort((a,b)=>a.date.localeCompare(b.date));
  if(!filtered.length) return alert('Tidak ada catatan jurnal di tanggal tersebut.');
  
  const { jsPDF } = window.jspdf; 
  const doc = new jsPDF();
  
  doc.setFontSize(22); doc.setFont(undefined, 'bold'); doc.text("VibeCheck Logs", 105, 20, { align: "center" });
  doc.setFontSize(11); doc.setFont(undefined, 'normal'); doc.text(`Rentang: ${start} hingga ${end}`, 105, 28, { align: "center" });
  doc.line(20, 32, 190, 32);
  
  let y = 45;
  
  for (let i = 0; i < filtered.length; i++) {
    const j = filtered[i];
    if(y > 240) { doc.addPage(); y = 20; }
    
    doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.text(j.date, 20, y); y += 6;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    
    const pr = (lbl, txt) => { 
      if(!txt)return; 
      const sp = doc.splitTextToSize(`${lbl}: ${txt}`, 170); 
      doc.text(sp, 20, y); 
      y += (sp.length * 5); 
    };
    
    pr('Satu Hal Utama', j.tujuan); 
    pr('Persiapan Hambatan', j.prioritas); 
    pr('Pencapaian', j.pencapaian); 
    pr('Rasa Syukur', j.syukur);
    
    doc.setFont(undefined, 'italic'); 
    doc.text(`Level Baterai (Pagi: ${j.ePagi}/10 | Malam: ${j.eMalam}/10) | Vibe: ${j.mood}`, 20, y); 
    y += 8;

    if (j.imageBlob) {
      if (y > 210) { doc.addPage(); y = 20; }
      try {
        const base64Img = await blobToBase64(j.imageBlob);
        doc.addImage(base64Img, 'JPEG', 20, y, 80, 60); 
        y += 65; 
      } catch (err) { console.error("Gagal load gambar untuk PDF", err); }
    }
    y += 10; 
  }
  
  doc.save(`VibeCheck_Jurnal_${start}.pdf`); 
  closeBackupModal();
}
