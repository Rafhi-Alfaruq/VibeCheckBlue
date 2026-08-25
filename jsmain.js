// --- INIT APP ---
window.onload = async () => {
  await initDB(); 
  updateDateUI(); 
  updateOnlineStatus();
  await renderTasks(); 
  await renderGallery(); 
  
  startAlarmEngine();
  
  await checkEventReminders();
  reminderEngineInterval = setInterval(checkEventReminders, 60000);

  lucide.createIcons(); 
  console.log("Engine Fired Up 🔥");
};