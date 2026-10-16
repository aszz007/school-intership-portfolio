(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const form = $('content-form');
  const field = name => form.elements.namedItem(name);
  let state, current = 0, dirty = false, busy = false;
  const profileFields = ['name','headline','introduction','about','focus','githubUrl'];
  const projectFields = ['id','category','title','state','subtitle','summary','description','sourceUrl','liveUrl','tags','points','status','art'];
  const notice = (text, error = false) => { $('message').textContent = text; $('message').classList.toggle('error', error); };
  async function api(path, options = {}) {
    const uncertainSave = '保存结果暂未确认，输入已保留。请先重新加载核对网站内容，再决定是否重试。';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('../api/' + path, {...options, signal:controller.signal, cache:'no-store', headers:{'Content-Type':'application/json', ...options.headers}});
      let data;
      try { data = await response.json(); }
      catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error(options.method === 'PUT' ? uncertainSave : '服务器响应异常，请稍后重试。');
      }
      if (!response.ok) throw Object.assign(new Error(data.error || '操作失败，请重试'), {status:response.status});
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) {
        throw new Error(options.method === 'PUT'
          ? uncertainSave
          : '连接服务器失败或超时，请检查网络后重试。');
      }
      throw error;
    } finally { clearTimeout(timer); }
  }
  const markDirty = () => { dirty = true; $('save-state').textContent = '有未发布的修改'; };
  function retainProject() {
    if (!state.projects[current]) return;
    projectFields.forEach(key => {
      let value = field('p-' + key).value;
      if (['tags','points'].includes(key)) value = value.split('\n').map(x => x.trim()).filter(Boolean);
      state.projects[current][key] = value;
    });
  }
  function renderProject() {
    const project = state.projects[current];
    $('project-editor').hidden = !project;
    // Disabled empty fields do not prevent saving a website with no projects.
    projectFields.forEach(key => { field('p-' + key).disabled = !project || busy; });
    $('project-list').replaceChildren();
    state.projects.forEach((project, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = project.title;
      button.setAttribute('aria-current', String(index === current)); button.disabled = busy;
      button.addEventListener('click', () => { retainProject(); current = index; renderProject(); });
      $('project-list').append(button);
    });
    if (project) projectFields.forEach(key => { const value = project[key] || ''; field('p-' + key).value = Array.isArray(value) ? value.join('\n') : value; });
  }
  async function load() {
    state = await api('content'); current = 0; dirty = false;
    profileFields.forEach(key => { field(key).value = state.profile[key]; });
    renderProject(); $('save-state').textContent = '已与网站同步';
    $('login-panel').hidden = true; $('editor').hidden = false;
  }
  function lock(value) {
    busy = value;
    form.querySelectorAll('input,textarea,select,button').forEach(el => { el.disabled = value; });
    $('logout').disabled = value;
    if (!value) renderProject();
  }
  $('login-form').addEventListener('submit', async event => {
    event.preventDefault(); $('login-button').disabled = true; notice('正在登录…');
    try {
      await api('login', {method:'POST', body:JSON.stringify({password:$('password').value})}); $('password').value = '';
      if (dirty && state) {
        $('login-panel').hidden = true; $('editor').hidden = false;
        notice('已重新登录，未发布的修改已保留，请再次保存。');
      } else { await load(); notice(''); }
    }
    catch (error) { notice(error.message, true); }
    finally { $('login-button').disabled = false; }
  });
  form.addEventListener('input', markDirty);
  form.addEventListener('change', markDirty);
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    retainProject(); profileFields.forEach(key => {state.profile[key] = field(key).value;});
    lock(true); notice('正在保存…');
    try {
      state = await api('content', {method:'PUT', body:JSON.stringify(state)}); dirty = false;
      $('save-state').textContent = '修改已发布'; notice('已保存，公开页面刷新后即可看到修改。');
    } catch (error) {
      notice(error.message, true);
      if (error.status === 401) { $('editor').hidden = true; $('login-panel').hidden = false; }
    } finally { lock(false); }
  });
  $('add-project').addEventListener('click', () => {
    if (state.projects.length >= 30) return notice('最多保留30个项目。', true);
    retainProject(); state.projects.push({id:'project-' + Date.now().toString(36), category:'course', art:'portfolio',title:'新作品',subtitle:'',state:'进行中',summary:'',description:'',tags:[],points:[],status:'',sourceUrl:'',liveUrl:''});
    current = state.projects.length - 1; markDirty(); renderProject(); field('p-title').focus();
  });
  $('delete-project').addEventListener('click', () => {
    if (!confirm('从网站中移除此作品？点击“保存并发布”后生效。')) return;
    state.projects.splice(current, 1); current = Math.max(0, current - 1); markDirty(); renderProject();
  });
  $('reload').addEventListener('click', async () => {
    if (busy) return;
    if (dirty && !confirm('放弃未发布的修改，重新加载网站内容？')) return;
    lock(true); notice('正在重新加载…');
    try { await load(); notice('已重新加载'); }
    catch (error) { notice(error.message, true); }
    finally { lock(false); }
  });
  $('logout').addEventListener('click', async () => {
    if (dirty && !confirm('有未发布的修改，仍要退出？')) return;
    try { await api('logout', {method:'POST', body:'{}'}); dirty = false; $('editor').hidden = true; $('login-panel').hidden = false; notice('已退出登录'); }
    catch (error) { notice(error.message, true); }
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  api('session').then(async session => { if (session.authenticated) await load(); }).catch(error => notice(error.message, true));
})();
