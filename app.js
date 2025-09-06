const sampleSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Svelte",
  "Node.js", "Express", "Python", "Django", "Flask", "FastAPI",
  "Go", "Rust", "Java", "Spring", "Kotlin", "Swift",
  "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis",
  "Tailwind CSS", "CSS", "HTML", "GraphQL", "REST API",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes",
  "Machine Learning", "Deep Learning", "NLP", "Data Science",
  "Figma", "UI/UX", "Product Design", "Project Management"
];

const skillIcons = {
  "JavaScript": "🟨",
  "TypeScript": "🟦",
  "React": "⚛️",
  "Next.js": "⏭️",
  "Vue": "🟢",
  "Svelte": "🟠",
  "Node.js": "🟩",
  "Express": "🧭",
  "Python": "🐍",
  "Django": "🌿",
  "Flask": "🍶",
  "FastAPI": "⚡",
  "Go": "🐹",
  "Rust": "🦀",
  "Java": "☕",
  "Spring": "🌱",
  "Kotlin": "🟪",
  "Swift": "🟧",
  "MongoDB": "🍃",
  "PostgreSQL": "🐘",
  "MySQL": "💠",
  "SQLite": "🧩",
  "Redis": "🟥",
  "Tailwind CSS": "🌬️",
  "CSS": "🎨",
  "HTML": "🧱",
  "GraphQL": "🔺",
  "REST API": "🔌",
  "AWS": "☁️",
  "GCP": "☁️",
  "Azure": "☁️",
  "Docker": "🐳",
  "Kubernetes": "☸️",
  "Machine Learning": "🧠",
  "Deep Learning": "🧬",
  "NLP": "🗣️",
  "Data Science": "📊",
  "Figma": "🎛️",
  "UI/UX": "💡",
  "Product Design": "📐",
  "Project Management": "📋"
};

function getSkillIcon(skill) {
  return skillIcons[skill] || skill[0];
}

const sampleProfiles = [
  {
    id: "p1",
    name: "Aisha Khan",
    email: "aisha@example.com",
    organization: "IIT Delhi",
    location: "Delhi, IN",
    skills: ["React", "Node.js", "Tailwind CSS", "PostgreSQL"],
    readme: "Front-end focused full-stack dev. Loves building polished UX."
  },
  {
    id: "p2",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    organization: "BITS Pilani",
    location: "Hyderabad, IN",
    skills: ["Python", "FastAPI", "MongoDB", "Docker"],
    readme: "Backend engineer with API and data modeling expertise."
  },
  {
    id: "p3",
    name: "Sara Lee",
    email: "sara@example.com",
    organization: "NUS",
    location: "Singapore",
    skills: ["Machine Learning", "NLP", "Python", "AWS"],
    readme: "ML practitioner focusing on NLP and model serving."
  }
];

const sampleTeams = [
  {
    id: "t1",
    name: "Dev Dynamos",
    lookingFor: ["React", "Tailwind CSS"],
    location: "Remote",
    description: "Frontend help for realtime collab tool.",
    members: ["Akash", "Meera"]
  },
  {
    id: "t2",
    name: "Data Sprinters",
    lookingFor: ["FastAPI", "PostgreSQL"],
    location: "Bengaluru, IN",
    description: "Need backend lead to scale APIs.",
    members: ["Liang", "Pooja", "Tom"]
  },
  {
    id: "t3",
    name: "Visioneers",
    lookingFor: ["Machine Learning", "AWS"],
    location: "Remote",
    description: "Computer vision app for accessibility.",
    members: ["Chloe"]
  }
];

// ---- API integration ----
const API_BASE = (window.API_BASE || 'http://localhost:5000');
function getToken() { try { return localStorage.getItem('hm_token') || ''; } catch { return ''; } }
function setAuth(token, user) { try { if (token) localStorage.setItem('hm_token', token); if (user) localStorage.setItem('hm_user', JSON.stringify(user)); } catch {} }
async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
  return res.json();
}

let remoteProfiles = null;
let remoteTeams = null;

async function loadRemoteData() {
  try {
    const [users, teams] = await Promise.all([
      apiFetch('/api/users').catch(() => null),
      apiFetch('/api/teams').catch(() => null),
    ]);
    if (Array.isArray(users)) {
      remoteProfiles = users.map((u) => ({
        id: u.id || u._id || u.email,
        name: u.name,
        email: u.email,
        organization: u.organization || '',
        location: u.location || 'Remote',
        skills: u.skills || [],
        readme: u.bio || ''
      }));
    }
    if (Array.isArray(teams)) {
      remoteTeams = teams.map((t) => ({
        id: t.id || t._id,
        name: t.name,
        lookingFor: t.lookingFor || [],
        location: t.location || 'Remote',
        description: t.description || '',
        members: Array.isArray(t.members) ? t.members.map(m => m.name || 'Member') : []
      }));
    }
  } catch {}
}

function getProfiles() { return remoteProfiles && remoteProfiles.length ? remoteProfiles : sampleProfiles; }
function getTeams() { return remoteTeams && remoteTeams.length ? remoteTeams : sampleTeams; }

const state = {
  tab: "teammate",
  selectedSkills: new Set(),
  locationFilter: "",
  chatContext: null,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function init() {
  // Perf: simple runtime signal for slow devices; can be overridden by localStorage
  try {
    const userPref = localStorage.getItem('hm_perf_low');
    const low = userPref === '1' || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    if (low) document.documentElement.classList.add('perf-low');
  } catch {}

  bindTabs();
  bindFilters();
  bindNavLinks();
  bindSearchPanel();
  bindTeamFinder();
  // Defer non-critical work to next frames to keep first paint smooth
  requestIdleCallbackSafe(() => renderSkills());
  setupChat();
  // Load data without blocking render
  loadRemoteData().finally(() => {
    requestAnimationFrame(() => {
      applyFilters();
      renderSuggestions();
      setupScrollReveal();
    });
  });
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Start hero typewriter after first frame
  requestAnimationFrame(() => startTypewriter());
}

function requestIdleCallbackSafe(cb) {
  if ('requestIdleCallback' in window) return window.requestIdleCallback(cb, { timeout: 300 });
  return setTimeout(cb, 0);
}

function bindTabs() {
  const tabTeammate = $("#tabTeammate");
  const tabTeam = $("#tabTeam");
  tabTeammate.addEventListener("click", () => {
    state.tab = "teammate";
    tabTeammate.classList.add("active");
    tabTeam.classList.remove("active");
    applyFilters();
  });
  tabTeam.addEventListener("click", () => {
    state.tab = "team";
    tabTeam.classList.add("active");
    tabTeammate.classList.remove("active");
    applyFilters();
  });
}

function bindFilters() {
  $("#skillSearch").addEventListener("input", renderSkills);
  $("#locationFilter").addEventListener("input", (e) => {
    state.locationFilter = e.target.value.toLowerCase();
    applyFilters();
  });
}

function bindNavLinks() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      if (hash === '#search') {
        e.preventDefault();
        showSearchPanel();
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', hash);
        return;
      }
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', hash);
      }
    });
  });
}
// ---------- Team Finder (simple localStorage demo) ----------
function bindTeamFinder() {
  const form = document.getElementById('teamFinderForm');
  const list = document.getElementById('teamFinderList');
  const empty = document.getElementById('teamFinderEmpty');
  if (!form || !list) return;

  function getEntries() {
    try { return JSON.parse(localStorage.getItem('hm_team_finder') || '[]'); } catch { return []; }
  }
  function setEntries(arr) {
    localStorage.setItem('hm_team_finder', JSON.stringify(arr));
  }
  function render() {
    const entries = getEntries();
    list.innerHTML = '';
    empty.classList.toggle('hidden', entries.length > 0);
    entries.forEach((e, i) => {
      const card = document.createElement('article');
      card.className = 'card reveal in-view';
      card.style.setProperty('--reveal-delay', `${Math.min(i * 60, 360)}ms`);
      card.innerHTML = `
        <div class="card-body">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h4 class="font-semibold">${e.name}</h4>
              <p class="text-xs text-slate-400">${e.availability || '—'}</p>
            </div>
            <span class="badge">Candidate</span>
          </div>
          <p class="mt-3 text-sm text-slate-300"><strong>Skills:</strong> ${e.skills || '—'}</p>
          ${e.interests ? `<p class="mt-2 text-sm text-slate-300"><strong>Interests:</strong> ${e.interests}</p>` : ''}
          <div class="mt-4 flex items-center justify-end gap-2">
            <button data-idx="${i}" class="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15" data-action="chat">Chat</button>
            <button data-idx="${i}" class="rounded-md bg-rose-500/20 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-500/30" data-action="delete">Remove</button>
          </div>
        </div>`;
      card.querySelector('[data-action="chat"]').addEventListener('click', () => openChat({ type: 'profile', targetId: `tf-${i}`, name: e.name }));
      card.querySelector('[data-action="delete"]').addEventListener('click', () => {
        const cur = getEntries();
        cur.splice(i, 1);
        setEntries(cur);
        render();
      });
      list.appendChild(card);
    });
  }

  // initial render
  render();

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const entry = {
      name: document.getElementById('tfName').value.trim(),
      skills: document.getElementById('tfSkills').value.trim(),
      interests: document.getElementById('tfInterests').value.trim(),
      availability: document.getElementById('tfAvailability').value,
    };
    if (!entry.name || !entry.skills) return;

    const token = getToken();
    if (token) {
      try {
        await apiFetch('/api/teams', {
          method: 'POST',
          body: JSON.stringify({
            name: entry.name,
            description: entry.interests,
            location: 'Remote',
            lookingFor: entry.skills.split(',').map(s=>s.trim()).filter(Boolean)
          })
        });
        // refresh remote teams on success
        remoteTeams = await apiFetch('/api/teams').catch(() => remoteTeams);
      } catch {
        // fallback to local entry list on failure
        const entries = getEntries(); entries.unshift(entry); setEntries(entries);
      }
    } else {
      // not logged in: keep local-only demo
      const entries = getEntries(); entries.unshift(entry); setEntries(entries);
    }

    form.reset();
    render();
    applyFilters();
    const section = document.getElementById('team-finder');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const clearBtn = document.getElementById('tfClear');
  clearBtn?.addEventListener('click', () => {
    localStorage.removeItem('hm_team_finder');
    render();
  });
}

function bindSearchPanel() {
  const closeBtn = document.getElementById('closeSearchPanel');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideSearchPanel();
      const home = document.getElementById('home');
      if (home) home.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', '#home');
    });
  }
}

function showSearchPanel() {
  const section = document.getElementById('search');
  if (!section) return;
  section.classList.remove('hidden');
  // Ensure tabs are bound/active and results render
  applyFilters();
  const input = document.getElementById('skillSearch');
  if (input) input.focus();
}

function hideSearchPanel() {
  const section = document.getElementById('search');
  if (!section) return;
  section.classList.add('hidden');
}

function renderSkills() {
  const list = $("#skillsList");
  const term = $("#skillSearch").value.toLowerCase();
  // Perf: reuse and build in a fragment to avoid layout thrash
  const frag = document.createDocumentFragment();
  list.textContent = "";
  sampleSkills
    .filter((s) => s.toLowerCase().includes(term))
    .slice(0, 40) // cap to 40 to keep DOM light
    .forEach((skill) => {
      const item = document.createElement("div");
      item.className = "skill-item";
      const checked = state.selectedSkills.has(skill);
      item.innerHTML = `
        <div class="skill-left">
          <div class="skill-icon" aria-hidden="true">${getSkillIcon(skill)}</div>
          <span>${skill}</span>
        </div>
        <button class="skill-check ${checked ? 'selected' : ''}" aria-label="${checked ? 'Deselect' : 'Select'} ${skill}">✓</button>
      `;
      item.querySelector('.skill-check').addEventListener("click", (e) => { e.stopPropagation(); toggleSkill(skill); });
      item.addEventListener("click", () => toggleSkill(skill));
      frag.appendChild(item);
    });
  list.appendChild(frag);
  renderSelectedChips();
}

function toggleSkill(skill) {
  if (state.selectedSkills.has(skill)) state.selectedSkills.delete(skill);
  else state.selectedSkills.add(skill);
  renderSkills();
  applyFilters();
}

function renderSelectedChips() {
  const container = $("#selectedSkills");
  container.innerHTML = "";
  if (state.selectedSkills.size === 0) {
    const hint = document.createElement("p");
    hint.className = "text-xs text-slate-400";
    hint.textContent = "No skills selected";
    container.appendChild(hint);
    return;
  }
  [...state.selectedSkills].forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `${skill} <button aria-label="Remove ${skill}">✕</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      state.selectedSkills.delete(skill);
      renderSkills();
      applyFilters();
    });
    container.appendChild(chip);
  });
}

function applyFilters() {
  const resultsGrid = $("#resultsGrid");
  const emptyState = $("#emptyState");
  // Perf: avoid large innerHTML churn; reuse grid element content via textContent reset
  resultsGrid.textContent = "";

  const skills = [...state.selectedSkills];
  const hasSkills = (arr) => skills.every((s) => arr.includes(s));

  if (state.tab === "teammate") {
    const filtered = (remoteProfiles && remoteProfiles.length ? remoteProfiles : sampleProfiles).filter((p) =>
      (!state.locationFilter || p.location.toLowerCase().includes(state.locationFilter)) &&
      (skills.length === 0 || hasSkills(p.skills))
    );
    filtered.forEach((p) => resultsGrid.appendChild(renderProfileCard(p)));
    emptyState.classList.toggle("hidden", filtered.length !== 0);
  } else {
    const filtered = (remoteTeams && remoteTeams.length ? remoteTeams : sampleTeams).filter((t) =>
      (!state.locationFilter || t.location.toLowerCase().includes(state.locationFilter)) &&
      (skills.length === 0 || hasSkills(t.lookingFor))
    );
    filtered.forEach((t) => resultsGrid.appendChild(renderTeamCard(t)));
    emptyState.classList.toggle("hidden", filtered.length !== 0);
  }

  // Stagger animation for newly rendered cards if grid is visible
  try { staggerGridReveal(resultsGrid); } catch {}
}

function renderSuggestions() {
  const grid = document.getElementById('suggestionsGrid');
  if (!grid) return;
  grid.textContent = '';
  (remoteProfiles && remoteProfiles.length ? remoteProfiles : sampleProfiles).slice(0, 3).forEach((p) => grid.appendChild(renderProfileCard(p)));
}

function renderProfileCard(p) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="card-body">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-500 grid place-items-center text-slate-900">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M12 12c2.761 0 5-2.462 5-5.5S14.761 1 12 1 7 3.462 7 6.5 9.239 12 12 12zm0 2c-4.418 0-8 2.91-8 6.5 0 .828.672 1.5 1.5 1.5h13c.828 0 1.5-.672 1.5-1.5 0-3.59-3.582-6.5-8-6.5z"/>
            </svg>
          </div>
          <div>
            <h4 class="font-semibold">${p.name}</h4>
            <p class="text-xs text-slate-400">${p.organization} • ${p.location}</p>
          </div>
        </div>
        <span class="badge">Profile</span>
      </div>
      <p class="mt-3 text-sm text-slate-300">${p.readme}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        ${p.skills.map((s) => `<span class="badge">${s}</span>`).join("")}
      </div>
      <div class="mt-4 flex items-center justify-between">
        <a href="mailto:${p.email}" class="text-xs text-cyan-300 hover:underline">${p.email}</a>
        <button class="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15" data-action="chat" data-type="profile" data-id="${p.id}" data-name="${p.name}">Chat</button>
      </div>
    </div>
  `;
  card.querySelector('[data-action="chat"]').addEventListener("click", () => openChat({ type: "profile", targetId: p.id, name: p.name }));
  return card;
}

function renderTeamCard(t) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="card-body">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-semibold">${t.name}</h4>
          <p class="text-xs text-slate-400">${t.location} • ${t.members.length} member${t.members.length>1?"s":""}</p>
        </div>
        <span class="badge">Team</span>
      </div>
      <p class="mt-3 text-sm text-slate-300">${t.description}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        ${t.lookingFor.map((s) => `<span class="badge">Needs: ${s}</span>`).join("")}
      </div>
      <div class="mt-4 flex items-center justify-end">
        <button class="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15" data-action="chat" data-type="team" data-id="${t.id}" data-name="${t.name}">Chat</button>
      </div>
    </div>
  `;
  card.querySelector('[data-action="chat"]').addEventListener("click", () => openChat({ type: "team", targetId: t.id, name: t.name }));
  return card;
}

function setupChat() {
  $("#closeChat").addEventListener("click", closeChat);
  $("#sendBtn").addEventListener("click", sendMessage);
  $("#messageInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  $("#approveBtn").addEventListener("click", () => addSystemMessage("You approved this teammate."));
  $("#rejectBtn").addEventListener("click", () => addSystemMessage("You rejected this candidate."));
  $("#acceptBtn").addEventListener("click", () => addSystemMessage("You accepted the invite."));
  $("#declineBtn").addEventListener("click", () => addSystemMessage("You rejected the invite."));
}

function openChat(ctx) {
  state.chatContext = ctx;
  $("#chatWith").textContent = ctx.name;
  $("#chatSub").textContent = ctx.type === "profile" ? "Recruiter actions enabled" : "Applicant actions enabled";
  $("#recruiterActions").classList.toggle("hidden", ctx.type !== "profile");
  $("#applicantActions").classList.toggle("hidden", ctx.type !== "team");
  $("#messages").innerHTML = "";
  addSystemMessage("Conversation started. Attachments and links are supported.");
  $("#chatModal").classList.remove("hidden");
  $("#chatModal").classList.add("flex");
  // Force reflow to ensure transition plays
  void $("#chatModal").offsetHeight;
  $("#chatModal").classList.add("show");
  $("#messageInput").focus();
}

function closeChat() {
  const modal = $("#chatModal");
  modal.classList.remove("show");
  // Wait for transition to end to hide flex container to avoid jump
  setTimeout(() => { modal.classList.add("hidden"); modal.classList.remove("flex"); }, 300);
}

function sendMessage() {
  const input = $("#messageInput");
  const text = input.value.trim();
  const fileInput = $("#attachmentInput");
  if (!text && !fileInput.files.length) return;

  if (text) addChatMessage({ text, fromSelf: true });
  if (fileInput.files.length) {
    const file = fileInput.files[0];
    addChatMessage({ attachment: file.name, fromSelf: true });
    fileInput.value = "";
  }
  input.value = "";
}

function addSystemMessage(text) {
  addChatMessage({ text, fromSelf: false, system: true });
}

function addChatMessage({ text = "", attachment = null, fromSelf = false, system = false }) {
  const container = $("#messages");
  const row = document.createElement("div");
  row.className = `flex ${fromSelf ? "justify-end" : "justify-start"}`;
  const bubble = document.createElement("div");
  bubble.className = `max-w-[75%] rounded-xl px-3 py-2 text-sm ${
    system ? "bg-white/5 text-slate-300" : fromSelf ? "bg-cyan-500/20 text-cyan-100" : "bg-fuchsia-500/20 text-fuchsia-100"
  } border border-white/10`;
  if (text) {
    const maybeLink = linkify(text);
    bubble.innerHTML = maybeLink;
  }
  if (attachment) {
    const att = document.createElement("div");
    att.className = "mt-1 text-xs text-slate-300";
    att.innerHTML = `📎 ${attachment}`;
    bubble.appendChild(att);
  }
  row.appendChild(bubble);
  container.appendChild(row);
  // animate message
  bubble.classList.add('msg-pop');
  container.scrollTop = container.scrollHeight;
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" class="underline text-cyan-300">${url}</a>`);
}

document.addEventListener("DOMContentLoaded", init);

// ---------- Scroll reveal ----------
function setupScrollReveal() {
  // Mark reveal targets
  try {
    const hero = document.querySelector('#home > div.text-center');
    if (hero) hero.classList.add('reveal');
    const suggestionCards = document.getElementById('suggestionsGrid');
  const results = document.getElementById('resultsGrid');
  if (results) results.classList.add('reveal');
  const sections = [document.getElementById('search'), document.getElementById('about'), document.getElementById('features'), document.getElementById('team-finder'), suggestionCards, results];
    sections.filter(Boolean).forEach((el) => el.classList.add('reveal'));
  } catch {}

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const t = entry.target;
        t.classList.add('in-view');
        // Stagger children if it's a grid of cards
        if (t.id === 'suggestionsGrid' || t.id === 'resultsGrid') {
          // Perf: limit staggering to first 12 children
          const kids = Array.prototype.slice.call(t.children, 0, 12);
          kids.forEach((child, i) => {
            child.style.setProperty('--reveal-delay', `${Math.min(i * 60, 360)}ms`);
            child.classList.add('reveal', 'in-view');
          });
        }
        io.unobserve(t);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

function staggerGridReveal(grid) {
  if (!grid) return;
  const rect = grid.getBoundingClientRect();
  const inViewport = rect.top < (window.innerHeight || document.documentElement.clientHeight);
  if (!inViewport) return; // IO will handle when it enters
  [...grid.children].forEach((child, i) => {
    child.style.setProperty('--reveal-delay', `${Math.min(i * 60, 360)}ms`);
    child.classList.add('reveal', 'in-view');
  });
}

// ---------- Typewriter ----------
function startTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    'Find your perfect hackathon partner.',
    'Hack together. Build smarter. Win bigger.',
    'Collaboration starts here.',
    'From lone coder to winning team – with HackMate.'
  ];
  const perfLow = document.documentElement.classList.contains('perf-low');
  const typeDelay = perfLow ? 18 : 28; // ms per char
  const holdDelay = 1400; // pause on full line
  const eraseDelay = perfLow ? 14 : 20;
  let pi = 0, i = 0, dir = 1; // dir: 1 typing, -1 deleting

  function step() {
    const text = phrases[pi];
    if (dir === 1) {
      i++;
      el.textContent = text.slice(0, i);
      if (i === text.length) {
        setTimeout(() => { dir = -1; step(); }, holdDelay);
      } else {
        setTimeout(step, typeDelay);
      }
    } else {
      i--;
      el.textContent = text.slice(0, Math.max(i, 0));
      if (i <= 0) {
        dir = 1; pi = (pi + 1) % phrases.length;
        setTimeout(step, typeDelay);
      } else {
        setTimeout(step, eraseDelay);
      }
    }
  }
  // Initial seed
  el.textContent = phrases[0];
  i = phrases[0].length;
  setTimeout(() => { dir = -1; step(); }, holdDelay);
}