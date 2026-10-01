const graph = document.querySelector('#studyGraph');
const toolButtons = document.querySelectorAll('[data-highlight]');

function clearGraphHighlight() {
  graph.querySelectorAll('.is-highlight').forEach((element) => element.classList.remove('is-highlight'));
  graph.querySelector('.graph-degree-labels').classList.remove('is-visible');
}

toolButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toolButtons.forEach((item) => item.classList.toggle('is-selected', item === button));
    clearGraphHighlight();
    const mode = button.dataset.highlight;
    if (mode === 'edges') graph.querySelectorAll('.graph-edges line').forEach((edge) => edge.classList.add('is-highlight'));
    if (mode === 'vertices') graph.querySelectorAll('.graph-vertex').forEach((vertex) => vertex.classList.add('is-highlight'));
    if (mode === 'degree') graph.querySelector('.graph-degree-labels').classList.add('is-visible');
  });
});

const matrices = {
  adjacency: {
    title: 'Adjacency matrix',
    explain: '行列都是顶点，单元格表示两个顶点之间的边数。',
    rule: 'Aᵢⱼ = edge count between vᵢ and vⱼ',
    headers: ['p', 'q', 'r', 's'],
    values: [[0, 1, 1, 1], [1, 0, 1, 0], [1, 1, 0, 1], [1, 0, 1, 0]],
  },
  incidence: {
    title: 'Incidence matrix',
    explain: '行是顶点，列是边。1 表示这个顶点接触这条边。',
    rule: 'Iᵢⱼ = 1 if vᵢ is incident with eⱼ',
    headers: ['e₁', 'e₂', 'e₃', 'e₄', 'e₅'],
    values: [[1, 1, 0, 0, 1], [1, 0, 1, 0, 0], [0, 0, 1, 1, 1], [0, 1, 0, 1, 0]],
  },
};

function renderMatrix(type = 'adjacency') {
  const data = matrices[type];
  document.querySelector('#matrixTitle').textContent = data.title;
  document.querySelector('#matrixExplain').textContent = data.explain;
  document.querySelector('#matrixRule').textContent = data.rule;
  const table = document.createElement('table');
  table.className = 'matrix-table';
  table.innerHTML = `<thead><tr><th></th>${data.headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>`;
  const body = document.createElement('tbody');
  const rowLabels = type === 'adjacency' ? data.headers : ['p', 'q', 'r', 's'];
  data.values.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${rowLabels[rowIndex]}</th>${row.map((value, colIndex) => `<td class="${type === 'adjacency' && rowIndex === colIndex ? 'diagonal' : ''}" tabindex="0" data-row="${rowIndex}" data-col="${colIndex}">${value}</td>`).join('')}`;
    body.appendChild(tr);
  });
  table.appendChild(body);
  const wrap = document.querySelector('#matrixTable');
  wrap.replaceChildren(table);
  wrap.querySelectorAll('td').forEach((cell) => {
    const toggle = () => cell.classList.toggle('is-highlight');
    cell.addEventListener('click', toggle);
    cell.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
  });
}

document.querySelectorAll('.matrix-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.matrix-tab').forEach((item) => {
      item.classList.toggle('is-active', item === tab);
      item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
    });
    renderMatrix(tab.dataset.matrix);
  });
});
document.querySelector('#matrixReset').addEventListener('click', () => document.querySelectorAll('.matrix-table td.is-highlight').forEach((cell) => cell.classList.remove('is-highlight')));
renderMatrix();

function updateEuler() {
  const connected = document.querySelector('#eulerConnected').checked;
  const even = document.querySelector('#eulerEven').checked;
  const good = connected && even;
  const badge = document.querySelector('#eulerBadge');
  badge.textContent = good ? 'YES' : 'NO';
  badge.className = `result-badge ${good ? 'is-good' : 'is-bad'}`;
  document.querySelector('#eulerMessage').textContent = good ? '满足两个条件：这是 Eulerian graph。' : '至少一个条件不满足：不能由 Euler 定理判定为 Eulerian。';
}
document.querySelectorAll('#eulerConnected, #eulerEven').forEach((input) => input.addEventListener('change', updateEuler));

function updateHamilton() {
  const n = Number(document.querySelector('#hamN').value);
  const minDegree = Number(document.querySelector('#hamMinDegree').value);
  const pairSum = Number(document.querySelector('#hamPairSum').value);
  const dirac = n >= 3 && minDegree >= n / 2;
  const ore = n >= 3 && pairSum >= n;
  const badge = document.querySelector('#hamiltonBadge');
  badge.textContent = dirac || ore ? 'YES' : 'CHECK';
  badge.className = `result-badge ${dirac || ore ? 'is-good' : 'is-warn'}`;
  const message = dirac ? `Dirac：${minDegree} ≥ ${n}/2，满足充分条件。` : ore ? `Ore：非相邻顶点度数和 ${pairSum} ≥ ${n}，满足充分条件。` : '当前输入未触发 Dirac/Ore，仍需尝试构造 Hamiltonian cycle。';
  document.querySelector('#hamiltonMessage').textContent = message;
}
document.querySelectorAll('#hamN, #hamMinDegree, #hamPairSum').forEach((input) => input.addEventListener('input', updateHamilton));

document.querySelectorAll('.reveal-button').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.quiz-card');
    const open = card.classList.toggle('is-revealed');
    card.querySelector('.quiz-answer').textContent = button.dataset.answer;
    button.firstChild.textContent = open ? '收起答案 ' : '显示答案 ';
  });
});

const navLinks = [...document.querySelectorAll('.nav-link')];
const anchors = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const active = navLinks.find((link) => link.getAttribute('href') === `#${entry.target.id}`);
      navLinks.forEach((link) => link.classList.toggle('is-active', link === active));
    }
  });
}, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
anchors.forEach((anchor) => anchor && observer.observe(anchor));

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
  document.querySelector('#progressValue').textContent = `${progress}%`;
  document.querySelector('#progressBar').style.width = `${progress}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();
