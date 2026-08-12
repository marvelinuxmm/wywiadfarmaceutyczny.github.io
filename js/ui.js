/* Pomocnicze narzędzia DOM (działa również po otwarciu przez file://). */
(function () {
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

  window.UI = { h: h };
})();
