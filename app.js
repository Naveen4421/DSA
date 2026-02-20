//  STATE — Persistence & Session
// ═══════════════════════════════════════════════
let currentUser = localStorage.getItem('dsa_user') || null;
let done = {};
let notes = {};
let filterMode = 'all';

let isSignUpMode = false;
let isCloudEnabled = false;

async function initApp() {
  const overlay = document.getElementById('login-overlay');
  const authBtn = document.getElementById('auth-btn');
  const errorDiv = document.getElementById('auth-error');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const toggleText = document.querySelector('.login-toggle-text');

  // helper to show error
  const showError = (msg) => {
    errorDiv.textContent = msg;
    errorDiv.style.color = 'var(--red)';
    console.error("Auth Fail:", msg);
  };

  const showSuccess = (msg) => {
    errorDiv.textContent = msg;
    errorDiv.style.color = 'var(--green)';
  };

  const client = getSupabase();
  // DETECTION: Supabase keys must be long JWT strings starting with 'eyJ'
  isCloudEnabled = client && SUPABASE_URL && SUPABASE_ANON_KEY.startsWith('eyJ');

  if (isCloudEnabled) {
    try {
      // 1. Listen for auth changes
      client.auth.onAuthStateChange((event, session) => {
        if (session) loginUser(session.user.email, session.user.id);
      });

      // 2. Refresh session if exists
      const { data: { session } } = await client.auth.getSession();
      if (session) {
        loginUser(session.user.email, session.user.id);
        return;
      }
    } catch (e) {
      console.warn("Supabase connection or session check failed:", e);
      isCloudEnabled = false; // Fallback to local if sync fails
    }
  }

  if (!currentUser) {
    overlay.classList.remove('hidden');

    // Status Indicator
    if (!document.getElementById('cloud-status')) {
      const statusDiv = document.createElement('div');
      statusDiv.id = 'cloud-status';
      statusDiv.style = "font-size: 11px; text-align: center; margin-bottom: 20px; font-weight: 600;";
      if (isCloudEnabled) {
        statusDiv.innerHTML = '<span style="color:var(--green)">●</span> Cloud Database Connected';
      } else {
        statusDiv.innerHTML = '<span style="color:var(--red)">●</span> Invalid API Key (Local Mode Only)';
      }
      document.querySelector('.login-header').appendChild(statusDiv);
    }

    if (isCloudEnabled) {
      document.querySelector('.input-group label[for="username"]').textContent = "Email address";
      usernameInput.placeholder = "Enter your email";
    }

    // Toggle logic
    toggleText.addEventListener('click', (e) => {
      if (e.target.id === 'toggle-auth-mode') {
        e.preventDefault();
        isSignUpMode = !isSignUpMode;
        errorDiv.textContent = "";
        authBtn.textContent = isSignUpMode ? 'Create Account' : 'Login';
        toggleText.innerHTML = isSignUpMode
          ? `Already have an account? <a href="#" id="toggle-auth-mode">Login</a>`
          : `Don't have an account? <a href="#" id="toggle-auth-mode">Sign Up</a>`;
      }
    });

    authBtn.onclick = async () => {
      const userIdent = usernameInput.value.trim();
      const pass = passwordInput.value.trim();
      errorDiv.textContent = "";

      if (!userIdent || !pass) {
        showError('Please enter both email and password.');
        return;
      }

      authBtn.disabled = true;
      const originalText = authBtn.textContent;
      authBtn.textContent = isSignUpMode ? "Creating Account..." : "Logging in...";

      try {
        if (isCloudEnabled) {
          if (isSignUpMode) {
            if (pass.length < 6) throw new Error("Password must be at least 6 characters.");
            const { data, error } = await client.auth.signUp({ email: userIdent, password: pass });
            if (error) throw error;

            if (data.user && data.session) {
              loginUser(data.user.email, data.user.id);
            } else {
              showSuccess("Check your email for a confirmation link!");
              isSignUpMode = false;
              authBtn.textContent = "Login";
              toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-auth-mode">Sign Up</a>`;
            }
          } else {
            const { data, error } = await client.auth.signInWithPassword({ email: userIdent, password: pass });
            if (error) throw error;
            loginUser(data.user.email, data.user.id);
          }
        } else {
          // Local fallback
          let users = JSON.parse(localStorage.getItem('dsa_users') || '{}');
          if (isSignUpMode) {
            if (users[userIdent]) throw new Error("User already exists.");
            users[userIdent] = pass;
            localStorage.setItem('dsa_users', JSON.stringify(users));
            loginUser(userIdent);
          } else {
            if (users[userIdent] === pass) {
              loginUser(userIdent);
            } else {
              throw new Error("Invalid username or password.");
            }
          }
        }
      } catch (err) {
        showError(err.message);
        authBtn.disabled = false;
        authBtn.textContent = originalText;
      }
    }

    // Bypass Local Option
    if (isCloudEnabled && !document.getElementById('bypass-link')) {
      const bypass = document.createElement('div');
      bypass.style = "text-align:center; margin-top:15px;";
      bypass.innerHTML = `<a href="#" id="bypass-link" style="color:var(--muted); font-size:12px; text-decoration:underline;">Use Local Storage Instead</a>`;
      document.querySelector('.login-form').appendChild(bypass);
      document.getElementById('bypass-link').onclick = (e) => {
        e.preventDefault();
        isCloudEnabled = false;
        document.getElementById('cloud-status').innerHTML = '<span style="color:var(--yellow)">●</span> Static Local Mode Active';
        document.querySelector('.input-group label[for="username"]').textContent = "User Name";
        usernameInput.placeholder = "Enter your name";
      };
    }
  } else {
    finishInit();
  }
}

function loginUser(user, cloudId = null) {
  currentUser = user;
  localStorage.setItem('dsa_user', user);
  if (cloudId) localStorage.setItem('dsa_cloud_id', cloudId);
  document.getElementById('login-overlay').classList.add('hidden');
  finishInit();
}

function finishInit() {
  const name = currentUser ? currentUser.split('@')[0] : 'User';
  document.getElementById('user-name-tag').textContent = name;
  loadUserData().then(() => {
    initTheme();
    renderTopics();
  });
}

async function loadUserData() {
  if (isCloudEnabled && localStorage.getItem('dsa_cloud_id')) {
    const cloudId = localStorage.getItem('dsa_cloud_id');
    try {
      const { data, error } = await supabaseClient.from('user_data').select('*').eq('id', cloudId).single();
      if (data) {
        done = data.done_data || {};
        notes = data.notes_data || {};
        // Sync to local as backup
        saveDone(true);
        saveNotes(true);
        return;
      }
    } catch (e) {
      console.warn("Cloud Load Failed, falling back to local:", e);
    }
  }

  // Fallback to local
  const userPrefix = currentUser ? `${currentUser}_` : '';
  done = JSON.parse(localStorage.getItem(`${userPrefix}dsa_done`) || '{}');
  notes = JSON.parse(localStorage.getItem(`${userPrefix}dsa_notes`) || '{}');

  // Migrate old true values to timestamp
  Object.keys(done).forEach(key => {
    if (done[key] === true) done[key] = Date.now();
  });
}

function saveDone(localOnly = false) {
  const userPrefix = currentUser ? `${currentUser}_` : '';
  localStorage.setItem(`${userPrefix}dsa_done`, JSON.stringify(done));
  if (!localOnly && isCloudEnabled) syncToCloud();
}

function saveNotes(localOnly = false) {
  const userPrefix = currentUser ? `${currentUser}_` : '';
  localStorage.setItem(`${userPrefix}dsa_notes`, JSON.stringify(notes));
  if (!localOnly && isCloudEnabled) syncToCloud();
}

let syncTimeout;
function syncToCloud() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    const cloudId = localStorage.getItem('dsa_cloud_id');
    if (!cloudId) return;

    try {
      const { error } = await supabaseClient.from('user_data').upsert({
        id: cloudId,
        username: currentUser,
        done_data: done,
        notes_data: notes,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) console.error("Cloud Sync Error:", error);
    } catch (e) {
      console.error("Sync Failed:", e);
    }
  }, 2000); // Debounce sync
}

async function logout() {
  if (confirm('Are you sure you want to logout?')) {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut();
    }
    localStorage.removeItem('dsa_user');
    localStorage.removeItem('dsa_cloud_id');
    location.reload();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'astro';
  changeTheme(savedTheme, false);

  const menuBtn = document.getElementById('theme-menu-btn');
  const menu = document.getElementById('theme-menu');

  if (menuBtn) {
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    };
  }

  document.addEventListener('click', () => {
    if (menu) menu.classList.add('hidden');
  });
}

function changeTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (save) localStorage.setItem('theme', theme);

  // Update charts if they exist
  if (typeof renderCharts === 'function' && document.getElementById('dashboard-overlay') && !document.getElementById('dashboard-overlay').classList.contains('hidden')) {
    renderCharts();
  }
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#F97316', '#BC8CFF', '#3FB950', '#58A6FF']
  });
}

function exportData() {
  const data = { done, notes };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentUser}_dsa_progress_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  document.getElementById('import-input').click();
}

function handleImport(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.done) done = data.done;
      if (data.notes) notes = data.notes;
      saveDone();
      saveNotes();
      location.reload();
    } catch (err) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  if (confirm('Reset all progress for the current user? This cannot be undone.')) {
    done = {};
    saveDone();
    location.reload();
  }
}

// ═══════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════
function diffClass(d) {
  return d === 'Easy' ? 'easy-badge' : d === 'Medium' ? 'medium-badge' : 'hard-badge';
}

function ringColor(pct) {
  if (pct >= 100) return '#3FB950';
  if (pct > 50) return '#58A6FF';
  return '#BC8CFF';
}

function renderTopics(query = '') {
  const container = document.getElementById('main-container');
  // Remove old topic cards
  document.querySelectorAll('.topic-card').forEach(e => e.remove());
  // Remove banner only on search
  const banner = container.querySelector('.banner');

  let totalAll = 0, solvedAll = 0;

  TOPICS.forEach(topic => {
    let allProblems = topic.weeks.flatMap(w => w.problems);
    let total = allProblems.length;
    let solved = allProblems.filter(p => done[p.id]).length;
    totalAll += total;
    solvedAll += solved;
    let pct = total ? Math.round(solved / total * 100) : 0;
    const circum = 2 * Math.PI * 18;
    const offset = circum - (pct / 100) * circum;

    const card = document.createElement('div');
    card.className = 'topic-card';
    card.id = 'card-' + topic.id;

    // Filter problems
    let weeksHTML = '';
    topic.weeks.forEach(week => {
      let filtered = week.problems.filter(p => {
        const matchDiff = filterMode === 'all' || p.diff === filterMode;
        const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.pattern.toLowerCase().includes(query.toLowerCase());
        return matchDiff && matchQuery;
      });
      if (!filtered.length) return;
      weeksHTML += `<div class="week-group">
        <div class="week-label">${week.label}</div>
        ${filtered.map(p => `
          <div class="problem-wrapper" id="wrapper-${p.id}">
            <div class="problem-row" id="row-${p.id}">
              <div class="check-box ${done[p.id] ? 'done' : ''}" onclick="toggleDone(${p.id}, '${topic.id}')"></div>
                <button class="star-btn ${localStorage.getItem('star_' + p.id) ? 'active' : ''}" onclick="toggleStar(${p.id}, this)" title="Star for Revision">⭐</button>
                <div class="problem-name ${done[p.id] ? 'done-text' : ''}">
                  <a href="${p.url}" target="_blank">${p.name}</a>
                </div>
                <button class="timer-btn" id="timer-btn-${p.id}" onclick="toggleTimer(${p.id})">⏱️ Start</button>
                <span class="diff-badge ${diffClass(p.diff)}">${p.diff}</span>
                <span class="pattern-tag">${p.pattern}</span>
                <a href="${p.url}" target="_blank" class="ext-link" title="Open in LeetCode">↗</a>
                <button class="notes-toggle ${notes[p.id] ? 'active' : ''}" onclick="toggleNotes(${p.id})" title="Notes">📝</button>
              </div>
            <div class="notes-section" id="notes-${p.id}">
              <div class="notes-toolbar">
                <button onclick="insertCodeSnippet(${p.id})">{"code"}</button>
                <button onclick="toggleNotes(${p.id})">Close</button>
              </div>
              <textarea class="notes-area" id="textarea-${p.id}" placeholder="Write your notes here... (Supports code snippets)" oninput="updateNote(${p.id}, this.value)">${notes[p.id] || ''}</textarea>
            </div>
          </div>`).join('')}
      </div>`;
    });

    if (!weeksHTML && (filterMode !== 'all' || query)) return;

    card.innerHTML = `
      <div class="topic-header" onclick="toggleCard('${topic.id}')">
        <div class="topic-left">
          <div class="topic-icon" style="background:${topic.bg}">${topic.icon}</div>
          <div>
            <div class="topic-title">${topic.title}</div>
            <div class="topic-meta">
              <span>${topic.desc}</span>
              <span style="color:${topic.color};font-weight:600">${solved}/${total} solved</span>
            </div>
          </div>
        </div>
        <div class="topic-right">
          <div class="topic-progress-ring">
            <svg class="ring-svg" width="52" height="52" viewBox="0 0 52 52">
              <circle class="ring-bg" cx="26" cy="26" r="18"/>
              <circle class="ring-fill" cx="26" cy="26" r="18"
                stroke="${ringColor(pct)}"
                stroke-dasharray="${circum}"
                stroke-dashoffset="${offset}"/>
            </svg>
            <div class="ring-text">${pct}%</div>
          </div>
          <span class="chevron">▾</span>
        </div>
      </div>
      <div class="problems-table">${weeksHTML || '<div style="padding:20px 24px;color:var(--muted);font-size:14px">No problems match filter.</div>'}</div>
    `;

    container.appendChild(card);
  });

  // Update global stats
  document.getElementById('solved-count').textContent = solvedAll;
  document.getElementById('total-count').textContent = totalAll;
  if (document.getElementById('banner-count')) {
    document.getElementById('banner-count').textContent = totalAll;
  }
  const pct = totalAll ? Math.round(solvedAll / totalAll * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  updateStreak();
}

function toggleCard(id) {
  const card = document.getElementById('card-' + id);
  card.classList.toggle('open');
}

function toggleNotes(pid) {
  const notesEl = document.getElementById(`notes-${pid}`);
  notesEl.classList.toggle('open');
  const btn = document.querySelector(`#row-${pid} .notes-toggle`);
  if (notesEl.classList.contains('open')) {
    notesEl.querySelector('textarea').focus();
  }
}

function updateNote(pid, val) {
  if (!val.trim()) {
    delete notes[pid];
  } else {
    notes[pid] = val;
  }
  saveNotes();
  const btn = document.querySelector(`#row-${pid} .notes-toggle`);
  if (btn) btn.classList.toggle('active', !!notes[pid]);
}

function toggleDone(pid, topicId) {
  if (done[pid]) {
    delete done[pid];
  } else {
    done[pid] = Date.now();
  }
  saveDone();
  updateStreak();
  // Update checkbox and name
  const box = document.querySelector(`#row-${pid} .check-box`);
  const name = document.querySelector(`#row-${pid} .problem-name`);
  if (box) box.classList.toggle('done', !!done[pid]);
  if (name) name.classList.toggle('done-text', !!done[pid]);
  // Update topic ring
  updateTopicRing(topicId);
  // Update global
  const totalProblems = TOPICS.flatMap(t => t.weeks.flatMap(w => w.problems)).length;
  const solved = Object.keys(done).length;
  document.getElementById('solved-count').textContent = solved;
  const pct = Math.round(solved / totalProblems * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';

  // Check for topic completion
  checkTopicCompletion(topicId);
}

function checkTopicCompletion(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  const allProblems = topic.weeks.flatMap(w => w.problems);
  const solvedCount = allProblems.filter(p => done[p.id]).length;
  if (solvedCount === allProblems.length && solvedCount > 0) {
    fireConfetti();
  }
}

function updateTopicRing(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return;
  const allProblems = topic.weeks.flatMap(w => w.problems);
  const total = allProblems.length;
  const solved = allProblems.filter(p => done[p.id]).length;
  const pct = Math.round(solved / total * 100);
  const circum = 2 * Math.PI * 18;
  const offset = circum - (pct / 100) * circum;
  const card = document.getElementById('card-' + topicId);
  if (!card) return;
  const fill = card.querySelector('.ring-fill');
  const text = card.querySelector('.ring-text');
  const meta = card.querySelector('.topic-meta span:last-child');
  if (fill) { fill.setAttribute('stroke-dashoffset', offset); fill.setAttribute('stroke', ringColor(pct)); }
  if (text) text.textContent = pct + '%';
  if (meta) meta.textContent = `${solved}/${total} solved`;
}

function filterDiff(mode, btn) {
  filterMode = mode;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const query = document.querySelector('.search-input').value;
  renderTopics(query);
}

function searchProblems(query) {
  renderTopics(query);
}

// ── Streak tracker (simple daily) ──
// ── Streak tracker (consecutive days based on timestamps) ──
function updateStreak() {
  const doneTimestamps = Object.values(done);
  if (doneTimestamps.length === 0) {
    document.getElementById('streak-count').textContent = '0🔥';
    return;
  }

  const days = [...new Set(doneTimestamps.map(t => new Date(t).toDateString()))]
    .map(d => new Date(d).getTime())
    .sort((a, b) => b - a); // Newest first

  const today = new Date(new Date().toDateString()).getTime();
  const yesterday = today - 86400000;

  // If no activity today or yesterday, streak is broken
  if (days[0] < yesterday) {
    document.getElementById('streak-count').textContent = '0🔥';
    return;
  }

  let streak = 0;
  let currentRef = days[0]; // Start from latest active day

  // Count backwards from currentRef
  for (let i = 0; i < days.length; i++) {
    if (days[i] === currentRef) {
      streak++;
      currentRef -= 86400000;
    } else {
      break;
    }
  }

  document.getElementById('streak-count').textContent = streak + '🔥';
}

// INIT
initApp();

// ═══════════════════════════════════════════════
//  DASHBOARD & ANALYTICS
// ═══════════════════════════════════════════════
let heatmapChart, pieChart, radarChart;

function toggleDashboard() {
  const overlay = document.getElementById('dashboard-overlay');
  overlay.classList.toggle('hidden');
  if (!overlay.classList.contains('hidden')) {
    renderCharts();
  }
}

function renderCharts() {
  renderHeatmap();
  renderPieChart();
  renderRadarChart();
}

function renderHeatmap() {
  const data = [];
  const today = new Date();

  // Last 6 months activity
  const doneTimestamps = Object.values(done);
  const doneDates = doneTimestamps.map(t => new Date(t).toDateString());

  // Group by week/day for heatmap
  const weeks = [];
  for (let i = 0; i < 24; i++) { // 24 weeks
    const weekData = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(today.getDate() - (i * 7 + d));
      const count = doneDates.filter(dd => dd === date.toDateString()).length;
      weekData.push({ x: date.toLocaleDateString('en-US', { weekday: 'short' }), y: count });
    }
    weeks.push({ name: 'W' + (24 - i), data: weekData });
  }

  const options = {
    series: weeks,
    chart: { height: 280, type: 'heatmap', toolbar: { show: false } },
    dataLabels: { enabled: false },
    colors: ["#3FB950"],
    xaxis: { type: 'category' },
    theme: { mode: document.documentElement.getAttribute('data-theme') || 'dark' }
  };

  if (heatmapChart) heatmapChart.destroy();
  heatmapChart = new ApexCharts(document.querySelector("#heatmap-chart"), options);
  heatmapChart.render();
}

function renderPieChart() {
  const solved = TOPICS.flatMap(t => t.weeks.flatMap(w => w.problems)).filter(p => done[p.id]);
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  solved.forEach(p => counts[p.diff]++);

  const options = {
    series: [counts.Easy, counts.Medium, counts.Hard],
    labels: ['Easy', 'Medium', 'Hard'],
    chart: { type: 'donut', height: 350 },
    colors: ['#3FB950', '#D29922', '#F85149'],
    legend: { position: 'bottom', labels: { colors: '#7D8590' } },
    theme: { mode: document.documentElement.getAttribute('data-theme') || 'dark' }
  };

  if (pieChart) pieChart.destroy();
  pieChart = new ApexCharts(document.querySelector("#pie-chart"), options);
  pieChart.render();
}

function renderRadarChart() {
  const labels = TOPICS.map(t => t.title);
  const data = TOPICS.map(topic => {
    const problems = topic.weeks.flatMap(w => w.problems);
    const solved = problems.filter(p => done[p.id]).length;
    return Math.round((solved / problems.length) * 100);
  });

  const options = {
    series: [{ name: 'Mastery %', data: data }],
    chart: { height: 350, type: 'radar', toolbar: { show: false } },
    xaxis: { categories: labels, labels: { style: { colors: Array(labels.length).fill('#7D8590') } } },
    colors: ['#BC8CFF'],
    theme: { mode: document.documentElement.getAttribute('data-theme') || 'dark' }
  };

  if (radarChart) radarChart.destroy();
  radarChart = new ApexCharts(document.querySelector("#radar-chart"), options);
  radarChart.render();
}

// ═══════════════════════════════════════════════
//  PRODUCTIVITY TOOLS (TIMER)
// ═══════════════════════════════════════════════
let activeTimers = {};

function toggleTimer(pid) {
  const btn = document.getElementById('timer-btn-' + pid);
  if (activeTimers[pid]) {
    // Stop
    clearInterval(activeTimers[pid].interval);
    const timeSpent = Math.floor((Date.now() - activeTimers[pid].start) / 1000);
    const mins = Math.floor(timeSpent / 60);
    const secs = timeSpent % 60;
    const timeStr = `[${mins}m ${secs}s]`;

    // Add to notes
    const textarea = document.querySelector(`#notes-${pid} textarea`);
    textarea.value += (textarea.value ? '\n' : '') + '⏱️ Session: ' + timeStr;
    updateNote(pid, textarea.value);

    delete activeTimers[pid];
    btn.textContent = '⏱️ Start';
    btn.classList.remove('active');
  } else {
    // Start
    activeTimers[pid] = { start: Date.now(), interval: setInterval(() => updateTimerBtn(pid), 1000) };
    btn.classList.add('active');
  }
}

function updateTimerBtn(pid) {
  const btn = document.getElementById('timer-btn-' + pid);
  if (!activeTimers[pid]) return;
  const elapsed = Math.floor((Date.now() - activeTimers[pid].start) / 1000);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  btn.textContent = `${m}:${s < 10 ? '0' : ''}${s} ⏹️`;
}

// ═══════════════════════════════════════════════
//  MOCK INTERVIEW MODE
// ═══════════════════════════════════════════════
function startMockInterview() {
  const allUnsolved = TOPICS.flatMap(t => t.weeks.flatMap(w => w.problems)).filter(p => !done[p.id]);
  const easy = allUnsolved.filter(p => p.diff === 'Easy');
  const medium = allUnsolved.filter(p => p.diff === 'Medium');
  const hard = allUnsolved.filter(p => p.diff === 'Hard');

  if (easy.length === 0 || medium.length === 0 || hard.length === 0) {
    alert("Not enough unsolved problems for a full mock! (Need 1 Easy, 1 Medium, 1 Hard)");
    return;
  }

  const selection = [
    easy[Math.floor(Math.random() * easy.length)],
    medium[Math.floor(Math.random() * medium.length)],
    hard[Math.floor(Math.random() * hard.length)]
  ];

  const names = selection.map(p => p.name).join('\n• ');
  if (confirm("🚀 Your Mock Interview Session:\n\n• " + names + "\n\nReady to start? (This will expand these topics)")) {
    selection.forEach(p => {
      // Find parent topic
      const topic = TOPICS.find(t => t.weeks.some(w => w.problems.some(pr => pr.id === p.id)));
      const card = document.getElementById('card-' + topic.id);
      if (card) card.classList.add('open');
      // Scroll to first one
      if (p.id === selection[0].id) {
        document.getElementById('wrapper-' + p.id).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Start timers for all? Maybe just highlighting.
      document.getElementById('row-' + p.id).style.border = '2px solid var(--orange)';
      setTimeout(() => { document.getElementById('row-' + p.id).style.border = 'none'; }, 10000);
    });
  }
}


function toggleStar(pid, btn) {
  const key = 'star_' + pid;
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    btn.classList.remove('active');
  } else {
    localStorage.setItem(key, 'true');
    btn.classList.add('active');
  }
}

// ═══════════════════════════════════════════════
//  POMODORO TIMER
// ═══════════════════════════════════════════════
let pomodoroInterval;
let timeLeft = 25 * 60;
let isRunning = false;

function initPomodoro() {
  const headerRight = document.querySelector('.header-right');
  const pomoWrap = document.createElement('div');
  pomoWrap.className = 'pomodoro-wrap';
  pomoWrap.innerHTML = `
    <span id="pomo-display">25:00</span>
    <button id="pomo-toggle" onclick="togglePomodoro()">▶️</button>
  `;
  headerRight.insertBefore(pomoWrap, headerRight.firstChild);
}

function togglePomodoro() {
  const btn = document.getElementById('pomo-toggle');
  isRunning = !isRunning;
  if (isRunning) {
    btn.textContent = '⏹️';
    pomodoroInterval = setInterval(() => {
      timeLeft--;
      updatePomoDisplay();
      if (timeLeft <= 0) {
        clearInterval(pomodoroInterval);
        alert("Time's up! Take a break.");
        timeLeft = 25 * 60;
        isRunning = false;
        btn.textContent = '▶️';
        updatePomoDisplay();
      }
    }, 1000);
  } else {
    btn.textContent = '▶️';
    clearInterval(pomodoroInterval);
  }
}

function updatePomoDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById('pomo-display').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}

initPomodoro();


function insertCodeSnippet(pid) {
  const textarea = document.getElementById('textarea-' + pid);
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const snippet = '```cpp\n// Your code here\n\n```';
  textarea.value = text.substring(0, start) + snippet + text.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + 10, start + 25);
  updateNote(pid, textarea.value);
}


async function toggleLeaderboard() {
  const overlay = document.getElementById('leaderboard-overlay');
  overlay.classList.toggle('hidden');
  if (!overlay.classList.contains('hidden')) {
    fetchLeaderboard();
  }
}

async function fetchLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const client = getSupabase();
  if (!client) {
    list.innerHTML = '<p style="padding:20px; text-align:center;">Connect to cloud to see rankings.</p>';
    return;
  }

  try {
    const { data, error } = await client
      .from('user_data')
      .select('username, done_data')
      .order('updated_at', { ascending: false }) // Just for now, we'll sort by count in JS
      .limit(50);

    if (error) throw error;

    // Process and sort by solved count
    const rankings = data.map(u => ({
      name: u.username ? u.username.split('@')[0] : 'Anonymous',
      solved: Object.keys(u.done_data || {}).length,
      isMe: u.username === currentUser
    })).sort((a,b) => b.solved - a.solved).slice(0, 10);

    list.innerHTML = rankings.map((u, i) => `
      <div class="leader-item ${u.isMe ? 'me' : ''}">
        <div class="leader-rank">#${i+1}</div>
        <div class="leader-name">${u.name} ${u.isMe ? ' (You)' : ''}</div>
        <div class="leader-score">${u.solved} solved</div>
      </div>
    `).join('');

  } catch (e) {
    list.innerHTML = '<p style="padding:20px; text-align:center; color:var(--red)">Failed to load rankings.</p>';
  }
}
