// LIST HARI LIBUR NASIONAL INDONESIA (CONTOH 2026/UMUM)
const liburNasional = {
  "2026-01-01": "Tahun Baru Masehi",
  "2026-02-18": "Isra Mikraj Nabi Muhammad SAW",
  "2026-03-03": "Hari Raya Nyepi",
  "2026-03-20": "Idul Fitri 1447 H",
  "2026-03-21": "Idul Fitri 1447 H",
  "2026-04-03": "Wafat Isa Al Masih",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Isa Al Masih",
  "2026-05-27": "Idul Adha 1447 H",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-16": "Tahun Baru Islam 1448 H",
  "2026-08-17": "Hari Kemerdekaan RI",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal"
};

let db;
let currentDate = new Date();
let alarmEngineInterval = null;
let reminderEngineInterval = null;
let activeVideoCountdown = null;
let currentObjectURL = null;
let chartInstance = null;
let monthlyChartInstance = null;

let calViewDate = new Date();
let eventImageBlob = null; 
let currentEditEventId = null;
let currentJournalImageBlob = null;

const catColors = { 
  'Kerja': 'text-blue-400 border-blue-500/50 bg-blue-500/10', 
  'Kesehatan': 'text-green-400 border-green-500/50 bg-green-500/10', 
  'Personal': 'text-blue-400 border-blue-500/50 bg-blue-500/10', 
  'Belajar': 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
  'Istirahat': 'text-indigo-400 border-indigo-500/50 bg-indigo-500/10'
};

function getLocalISODate(dateObj) {
  const offset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
}

async function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('ProductivityEngineDB', 2);
    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if(!database.objectStoreNames.contains('tasks')) database.createObjectStore('tasks', { keyPath: 'id' });
      if(!database.objectStoreNames.contains('journal')) database.createObjectStore('journal', { keyPath: 'id' });
      if(!database.objectStoreNames.contains('videoBlobStorage')) database.createObjectStore('videoBlobStorage', { keyPath: 'videoId' });
      if(!database.objectStoreNames.contains('events')) database.createObjectStore('events', { keyPath: 'id' });
    };
    req.onsuccess = () => { db = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

const dbAct = {
  add: (store, data) => new Promise(res => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).put(data); tx.oncomplete = res; }),
  get: (store, id) => new Promise(res => { const req = db.transaction(store).objectStore(store).get(id); req.onsuccess = () => res(req.result); }),
  getAll: (store) => new Promise(res => { const req = db.transaction(store).objectStore(store).getAll(); req.onsuccess = () => res(req.result); }),
  del: (store, id) => new Promise(res => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).delete(id); tx.oncomplete = res; })
};
