(async () => {
  'use strict';
  let projects = window.PORTFOLIO_PROJECTS;
  let profile = window.PORTFOLIO_PROFILE;
  const $ = id => document.getElementById(id);
  function renderProfile() {
    $('profile-name').textContent = profile.name;
  $('profile-title').textContent = profile.headline;
  $('profile-introduction').textContent = profile.introduction;
  $('profile-about').textContent = profile.about;
  $('profile-focus').textContent = profile.focus;
  document.title = profile.name + ' · 软件工程与研究作品集';
  document.querySelectorAll('[data-profile-name]').forEach(el => {el.firstChild.textContent = profile.name;});
  document.querySelectorAll('[data-profile-github]').forEach(el => {
    try { const url = new URL(profile.githubUrl); if (url.protocol === 'https:' && !url.username && !url.password) el.href = url.href; else el.removeAttribute('href'); }
    catch { el.removeAttribute('href'); }
  });
  }
  const art = {
    inst:'<div class="art-inst"><div class="art-source"><span>TEXT</span><span>IMAGE</span><span>FLOWCHART</span></div><span class="art-arrow">↓</span><div class="expert-box">MULTI-EXPERT LoRA<span>Text · Image · FlowChart · General</span></div><span class="art-arrow">↓</span><div class="instruction-box"><span>Definition</span><span>Emphasis & Caution</span><span>Things to Avoid</span></div><small>项目流程示意</small></div>',
    web:'<div class="art-web"><div class="mini-browser"><div class="mini-top"><i></i><i></i><i></i><span>需求与网页</span></div><div class="mini-body"><div class="mini-side"><span></span><span></span><span></span></div><div class="mini-page"><b>网页原型</b><p></p><div><i></i><i></i><i></i></div></div></div></div><div class="trace-chips"><span>需求</span><i>→</i><span>页面</span><i>→</i><span>检查</span></div><small>产物关系示意</small></div>',
    todo:'<div class="art-todo"><span class="art-kicker">任务清单</span><strong>课间</strong><div class="mini-task"><i>✓</i><span>整理课程作业</span></div><div class="mini-task"><i>○</i><span>查看待完成任务</span></div><small>日期、优先级与分类</small></div>',
    portfolio:'<div class="art-portfolio"><span class="art-kicker">个人作品集</span><strong>aszz007<span>↗</span></strong><div class="portfolio-rule"></div><p>RESEARCH<br>& PRACTICE</p></div>',
    notes:'<div class="art-planned"><span class="planned-symbol">#</span><span>Markdown笔记</span><small>编辑 / 预览 / 留存</small></div>',
    weather:'<div class="art-planned"><span class="planned-symbol">☀</span><span>城市天气</span><small>真实接口 / 三天预报</small></div>',
    imagegrab:'<div class="art-planned"><span class="planned-symbol">▧</span><span>ImageGrab</span><small>选择图片 / 下载PNG</small></div>'
  };
  const categoryLabel = category => category === 'research' ? '科研项目' : '课程作品';
  let lastTrigger = null;
  let lastProjectId = null;
  let activeCategory = 'all';
  function link(label, href, className) {
    const a = document.createElement('a'); a.textContent = `${label} ↗`; a.href = href;
    a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = className; return a;
  }
  function showDetails(project, trigger) {
    lastTrigger = trigger;
    lastProjectId = project.id;
    $('dialog-category').textContent = `${categoryLabel(project.category)} / ${project.state}`;
    $('dialog-title').textContent = `${project.title} · ${project.subtitle}`;
    $('dialog-description').textContent = project.description;
    $('dialog-tags').replaceChildren();
    project.tags.forEach(tag => { const s = document.createElement('span'); s.textContent = tag; $('dialog-tags').append(s); });
    $('dialog-points').replaceChildren();
    project.points.forEach(point => { const li = document.createElement('li'); li.textContent = point; $('dialog-points').append(li); });
    $('dialog-links').replaceChildren();
    if (project.sourceUrl) $('dialog-links').append(link('查看公开源码', project.sourceUrl, 'button button-dark'));
    if (project.demoUrl) $('dialog-links').append(link('打开本地作品', project.demoUrl, 'button button-dark'));
    if (project.liveUrl) $('dialog-links').append(link('打开正式应用',project.liveUrl,'button button-dark'));
    $('project-dialog').showModal();
  }
  function render(category = activeCategory) {
    activeCategory = category;
    const visible = projects.filter(p => category === 'all' || p.category === category);
    $('project-grid').replaceChildren();
    visible.forEach(project => {
      const fragment = $('project-card-template').content.cloneNode(true);
      const card = fragment.querySelector('.project-card'); card.dataset.project = project.id;
      const image = card.querySelector('.project-art'); image.classList.add(`art-${project.art}-wrap`); image.innerHTML = art[project.art] || art.portfolio;
      card.querySelector('.project-category').textContent = categoryLabel(project.category);
      card.querySelector('.project-state').textContent = project.state;
      card.querySelector('.project-title').textContent = project.title;
      card.querySelector('.project-summary').textContent = project.summary;
      project.tags.forEach(tag => { const s = document.createElement('span'); s.textContent = tag; card.querySelector('.project-tags').append(s); });
      const detail = card.querySelector('.detail-button'); detail.setAttribute('aria-label', `查看${project.title}详情`);
      detail.addEventListener('click', () => showDetails(project, detail));
      const open = card.querySelector('.project-open');
      if (project.sourceUrl || project.demoUrl || project.liveUrl) { open.href = project.sourceUrl || project.demoUrl || project.liveUrl; open.textContent = `${project.sourceLabel || '查看项目'} ↗`; }
      else open.remove();
      $('project-grid').append(fragment);
    });
    $('project-result').textContent = `展示 ${visible.length} 个项目`;
    document.querySelectorAll('[data-category]').forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
  }
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => render(button.dataset.category)));
  $('close-dialog').addEventListener('click', () => $('project-dialog').close());
  $('project-dialog').addEventListener('click', event => {
    if (event.target === $('project-dialog')) {
      const box = $('project-dialog').getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) $('project-dialog').close();
    }
  });
  $('project-dialog').addEventListener('close', () => {
    if (lastTrigger?.isConnected) lastTrigger.focus();
    else Array.from(document.querySelectorAll('.project-card'))
      .find(card => card.dataset.project === lastProjectId)?.querySelector('.detail-button')?.focus();
  });
  function renderContent() {
    renderProfile();
  $('count-all').textContent = String(projects.length);
  $('count-research').textContent = String(projects.filter(p => p.category === 'research').length);
  $('count-course').textContent = String(projects.filter(p => p.category === 'course').length);
    render();
  }
  // Show the bundled content immediately; a slow API must not leave the gallery empty.
  renderContent();
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 5000);
  try {
    const response = await fetch('api/content', {cache:'no-store', signal:abort.signal});
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    if (!data.profile || !Array.isArray(data.projects)) throw new Error('invalid');
    projects = data.projects; profile = data.profile;
    renderContent();
  } catch {
    $('content-notice').hidden = false;
  } finally { clearTimeout(timer); }
})();
