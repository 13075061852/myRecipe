(function () {
  const STATE_KEY = '__customSelect';

  function closeAllCustomSelects(exceptSelect) {
    document.querySelectorAll('.custom-select.open').forEach(function (wrapper) {
      if (!exceptSelect || wrapper !== exceptSelect[STATE_KEY].wrapper) {
        wrapper.classList.remove('open');
      }
    });
  }

  function getSelectedLabel(selectEl) {
    if (selectEl.selectedIndex >= 0 && selectEl.options[selectEl.selectedIndex]) {
      return selectEl.options[selectEl.selectedIndex].textContent || '';
    }
    return '';
  }

  function syncTrigger(selectEl) {
    const state = selectEl[STATE_KEY];
    if (!state) return;
    state.label.textContent = getSelectedLabel(selectEl) || '请选择';
    state.trigger.disabled = !!selectEl.disabled;
  }

  function renderOptions(selectEl) {
    const state = selectEl[STATE_KEY];
    if (!state) return;

    const panel = state.panel;
    panel.innerHTML = '';

    Array.prototype.forEach.call(selectEl.options, function (option, index) {
      const optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = 'custom-select-option' + (option.selected ? ' active' : '');
      optBtn.textContent = option.textContent || '';
      optBtn.disabled = option.disabled;
      optBtn.dataset.value = option.value;
      optBtn.addEventListener('click', function () {
        if (option.disabled) return;
        selectEl.selectedIndex = index;
        syncTrigger(selectEl);
        closeAllCustomSelects();
        selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      });
      panel.appendChild(optBtn);
    });
  }

  function setupSelect(selectEl) {
    if (!selectEl || selectEl[STATE_KEY] || selectEl.dataset.customSelect === 'off') {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    if (selectEl.closest('.login-body')) {
      wrapper.classList.add('custom-select-dark');
    }

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';

    const label = document.createElement('span');
    label.className = 'custom-select-label';
    trigger.appendChild(label);

    const panel = document.createElement('div');
    panel.className = 'custom-select-panel';

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
    selectEl.insertAdjacentElement('afterend', wrapper);
    selectEl.classList.add('native-select-hidden');

    selectEl[STATE_KEY] = { wrapper: wrapper, trigger: trigger, panel: panel, label: label };

    trigger.addEventListener('click', function () {
      if (selectEl.disabled) return;
      const isOpen = wrapper.classList.contains('open');
      closeAllCustomSelects(selectEl);
      if (!isOpen) {
        renderOptions(selectEl);
        syncTrigger(selectEl);
        wrapper.classList.add('open');
      } else {
        wrapper.classList.remove('open');
      }
    });

    selectEl.addEventListener('change', function () {
      syncTrigger(selectEl);
      renderOptions(selectEl);
    });

    syncTrigger(selectEl);
    renderOptions(selectEl);
  }

  function refreshCustomSelects(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('select').forEach(setupSelect);
    scope.querySelectorAll('select').forEach(syncTrigger);
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.custom-select')) {
      closeAllCustomSelects();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllCustomSelects();
    }
  });

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches('select')) setupSelect(node);
          if (node.querySelectorAll) refreshCustomSelects(node);
        });
      }
      if (mutation.target && mutation.target.tagName === 'SELECT') {
        syncTrigger(mutation.target);
        renderOptions(mutation.target);
      }
    });
  });

  function initCustomSelects() {
    refreshCustomSelects(document);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled'],
    });
  }

  window.refreshCustomSelects = refreshCustomSelects;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomSelects);
  } else {
    initCustomSelects();
  }
})();
