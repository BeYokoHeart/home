function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getAllDates() {
  return Object.keys(QUEST_BASE).sort();
}

function getNextQuestDate(todayKey) {
  return getAllDates().find(d => d > todayKey);
}

function getRandomPastQuest(todayKey) {
  const past = getAllDates().filter(d => d <= todayKey);
  const randomKey = past[Math.floor(Math.random() * past.length)];
  return QUEST_BASE[randomKey];
}

function hasPastQuests(todayKey) {
  return Object.keys(QUEST_BASE).some(date => date <= todayKey);
}

function loadDailyQuest() {
  const today = new Date();
  const todayKey = formatDate(today);

  const titleEl = document.getElementById("quest-title");
  const descEl = document.getElementById("quest-description");
  const btn = document.getElementById("randomBtn");

  const quest = QUEST_BASE[todayKey];
  const nextDate = getNextQuestDate(todayKey);

  const hasPast = hasPastQuests(todayKey);

  // 🟢 1. DZISIEJSZE ZADANIE
  if (quest) {
    titleEl.textContent = quest.title;
    descEl.textContent = quest.description;

    btn.classList.toggle("hidden", !hasPast);
    return;
  }

  // ⏳ 2. BRAK DZISIEJSZEGO → COUNTDOWN
  if (nextDate) {
    const diffDays = Math.ceil(
      (new Date(nextDate) - today) / (1000 * 60 * 60 * 24)
    );

    titleEl.textContent = "New task will appear in:";
    descEl.innerHTML = `
      <strong>${diffDays} days</strong><br>
      Date: ${nextDate}
    `;

    btn.classList.toggle("hidden", !hasPast);
    return;
  }

  // 🔴 3. BRAK PRZYSZŁYCH ZADAŃ
  titleEl.textContent =
    "We are currently working on new tasks, please be patient :)";
  descEl.textContent = "";

  // 👉 KLUCZOWE: spójna logika przycisku
  btn.classList.toggle("hidden", !hasPast);
}

// 🎲 LOSOWE ZADANIE
function showRandomQuest() {
  const today = new Date();
  const todayKey = formatDate(today);

  const quest = getRandomPastQuest(todayKey);

  document.getElementById("quest-title").textContent = quest.title;
  document.getElementById("quest-description").textContent =
    quest.description;
}

document.addEventListener("DOMContentLoaded", () => {
  loadDailyQuest();

  document
    .getElementById("randomBtn")
    .addEventListener("click", showRandomQuest);
});