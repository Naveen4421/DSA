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
  const toggleLink = document.getElementById('toggle-auth-mode');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  // Check if Supabase is configured
  isCloudEnabled = supabaseClient && SUPABASE_URL !== 'https://your-project-url.supabase.co';

  if (!currentUser) {
    overlay.classList.remove('hidden');

    if (isCloudEnabled) {
      document.querySelector('.input-group label[for="username"]').textContent = "Email";
      usernameInput.placeholder = "Enter your email";
    }

    toggleLink.onclick = (e) => {
      e.preventDefault();
      isSignUpMode = !isSignUpMode;
      authBtn.textContent = isSignUpMode ? 'Create Account' : 'Login';
      toggleLink.innerHTML = isSignUpMode ? 'Login' : 'Sign Up';
      document.querySelector('.login-toggle-text').innerHTML = isSignUpMode
        ? `Already have an account? <a href="#" id="toggle-auth-mode">Login</a>`
        : `Don't have an account? <a href="#" id="toggle-auth-mode">Sign Up</a>`;
      // Re-bind toggle click since we replaced innerHTML
      const newToggle = document.getElementById('toggle-auth-mode');
      if (newToggle) newToggle.onclick = toggleLink.onclick;
    };

    authBtn.onclick = async () => {
      const userIdent = usernameInput.value.trim();
      const pass = passwordInput.value.trim();

      if (!userIdent || !pass) {
        alert('Please fill in both fields.');
        return;
      }

      if (isCloudEnabled) {
        authBtn.disabled = true;
        authBtn.textContent = "Processing...";
        try {
          if (isSignUpMode) {
            const { data, error } = await supabaseClient.auth.signUp({
              email: userIdent,
              password: pass
            });
            if (error) throw error;

            if (data.user && data.session) {
              // Log and redirect if Auto-Confirm is ON
              loginUser(data.user.email, data.user.id);
            } else {
              alert('Sign up successful! Please check your email for a confirmation link to activate your account.');
              isSignUpMode = false;
              authBtn.textContent = "Login";
              toggleLink.click(); // Switch back to login view
            }
          } else {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
              email: userIdent,
              password: pass
            });
            if (error) throw error;
            loginUser(data.user.email, data.user.id);
          }
        } catch (err) {
          console.error("Auth Error:", err);
          alert('Error: ' + err.message);
        } finally {
          authBtn.disabled = false;
          authBtn.textContent = isSignUpMode ? 'Create Account' : 'Login';
        }
      } else {
        // Local Auth Fallback
        let users = JSON.parse(localStorage.getItem('dsa_users') || '{}');
        if (Object.keys(users).length === 0 && !localStorage.getItem('dsa_users')) {
          users['Naveen'] = '4421';
          localStorage.setItem('dsa_users', JSON.stringify(users));
        }

        if (isSignUpMode) {
          if (users[userIdent]) {
            alert('Username already exists. Please login.');
          } else {
            users[userIdent] = pass;
            localStorage.setItem('dsa_users', JSON.stringify(users));
            loginUser(userIdent);
          }
        } else {
          if (users[userIdent] && users[userIdent] === pass) {
            loginUser(userIdent);
          } else {
            alert('Invalid Username or Password.');
          }
        }
      }
    };
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
  document.getElementById('user-name-tag').textContent = currentUser.split('@')[0];
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

function logout() {
  if (confirm('Are you sure you want to logout? your progress is saved locally.')) {
    localStorage.removeItem('dsa_user');
    location.reload();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
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
              <div class="problem-name ${done[p.id] ? 'done-text' : ''}">
                <a href="${p.url}" target="_blank">${p.name}</a>
              </div>
              <span class="diff-badge ${diffClass(p.diff)}">${p.diff}</span>
              <span class="pattern-tag">${p.pattern}</span>
              <a href="${p.url}" target="_blank" class="ext-link" title="Open in LeetCode">↗</a>
              <button class="notes-toggle ${notes[p.id] ? 'active' : ''}" onclick="toggleNotes(${p.id})" title="Notes">📝</button>
            </div>
            <div class="notes-section" id="notes-${p.id}">
              <textarea class="notes-area" placeholder="Write your notes here..." oninput="updateNote(${p.id}, this.value)">${notes[p.id] || ''}</textarea>
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
