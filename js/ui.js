/* Pomocnicze narzędzia DOM (działa również po otwarciu przez file://). */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  function h(tag, props, children) {
    const el = document.createElement(tag);
    if (props) {
      for (const k of Object.keys(props)) {
        const v = props[k];
        if (v === undefined || v === null) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else el.setAttribute(k, v);
      }
    }
    if (children != null) {
      if (Array.isArray(children)) {
        const flat = [];
        (function push(c) {
          if (c == null) return;
          if (Array.isArray(c)) c.forEach(push);
          else flat.push(c);
        })(children);
        flat.forEach(function (c) {
          if (typeof c === 'string' || typeof c === 'number') {
            el.appendChild(document.createTextNode(String(c)));
          } else {
            el.appendChild(c);
          }
        });
      } else if (typeof children === 'string' || typeof children === 'number') {
        el.textContent = children;
      } else if (children.nodeType) {
        el.appendChild(children);
      }
    }
    return el;
  }

  /* Wspólne pomoce formularzy — używane przez wszystkie zakładki (jeden wzorzec zamiast kopii). */

  function radio(name, value, label, dataState) {
    return h('label', { class: 'radio' }, [
      h('input', { type: 'radio', name: name, value: value, 'data-state': dataState || name }),
      h('span', { text: label })
    ]);
  }

  function checkbox(path, id, label) {
    return h('label', { class: 'checkbox' }, [
      h('input', { type: 'checkbox', 'data-state': path + '.' + id }),
      h('span', { text: label })
    ]);
  }

  function nrsField(dataState, labelText, id, hint) {
    return h('div', { class: 'field' }, [
      h('label', { class: 'ctl' }, [labelText]),
      h('input', { type: 'number', id: id, min: '0', max: '10', step: '1', 'data-state': dataState }),
      h('div', { class: 'hint', text: hint || '0–10' })
    ]);
  }

  /* Synchronizacja pól [data-state] ze stanem (po przełączeniu zakładki lub imporcie). */
  function sync(root) {
    root.querySelectorAll('[data-state]').forEach(function (inp) {
      const v = G.State.getPath(inp.getAttribute('data-state'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.type === 'radio') inp.checked = (inp.value === v);
      else inp.value = (v == null) ? '' : v;
    });
  }

  /* Obsługa zdarzenia input/change dla zwykłych pól [data-state]. */
  function handleStateInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
  }

  window.UI = { h: h, radio: radio, checkbox: checkbox, nrsField: nrsField, sync: sync, handleStateInput: handleStateInput };
})();
