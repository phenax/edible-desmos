import { initializeCalculator } from './desmos.js';
import { handleRouteChange } from './routes.js';
import { h, text } from './dom.js';

const showGraph = (name) => {
  const $calculator = h('div', { className: 'calc', id: 'calculator' }, [])
  const $saveStateText = text('')
  const $saveButton = h('button',
    { className: 'save', style: 'display:none;' },
    [text('Save')])
  const $resetButton = h('button',
    { className: 'reset', style: 'display:none;' },
    [text('Reset')])

  const onUnsavedChanges = () => {
    $saveButton.style.display = 'block'
    $resetButton.style.display = 'block'
    $saveStateText.textContent = 'Unsaved changes'
  }

  const onSaving = () => {
    $saveButton.style.display = 'none'
    $resetButton.style.display = 'none'
    $saveStateText.textContent = 'Saving...'
  }

  const onReset = () => {
    $saveButton.style.display = 'none'
    $resetButton.style.display = 'none'
    $saveStateText.textContent = ''
  }

  const calc = initializeCalculator(
    name,
    $calculator,
    {
      async onChange(hasChanged) {
        if (!window.isManageMode) return;
        if (hasChanged) {
          onUnsavedChanges();
        } else {
          onReset();
        }
      },
      async onSave(name, state) {
        if (!window.isManageMode) return;
        onSaving();
        const response = await fetch(`/graphs/${name}.json`, {
          method: 'POST',
          body: JSON.stringify(state),
        })
        $saveStateText.textContent = ''
        console.log(response.status, await response?.text())
      },
      async getState(name) {
        const response = await fetch(`/graphs/${name}.json`).catch(_ => null)
        if (!response || response.status !== 200) return null
        return response.json()
      }
    }
  );

  $saveButton.onclick = () => calc.saveState();
  $resetButton.onclick = () => calc.resetState();

  window.$calc = calc;

  return h('div', { className: 'calc-wrapper' }, [
    h('header', { className: 'header' }, [
      h('div', { style: 'display: flex; gap: 0.7rem; align-items: center;' }, [
        h('a', { href: '/#' }, [text('EdibleGraphs')]),
        h('div', { className: 'dot' }, []),
        h('div', { className: 'header-title' }, [text(name)]),
      ]),
      window.isManageMode
        ? h('div', { style: 'display: flex; gap: 0.7rem; align-items: center; font-size: 0.7rem;' }, [
          $saveButton,
          $resetButton,
          $saveStateText,
        ])
        : text('')
    ]),
    $calculator,
  ])
}

const showIndex = async () => {
  const response = await fetch('/graphs/index.json').catch(_e => [])
  const indexJson = await response.json().catch(_e => null) ?? { meta: {}, order: {} }

  const toDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
    }).format(date)
  }

  const onAddGraph = (e) => {
    e?.preventDefault?.();
    window.location = '/#/graphs/' + (e?.target?.name?.value || 'graph');
  }

  return h('div', { className: 'index-wrapper' }, [
    h('div', { className: 'index' }, [
      h('h1', {}, [text(`Akshay's graphs`)]),
      h('p', {}, [
        text(`A collection of interactive demos created by me in desmos graphing calculator. `),
        text('('),
        h('a', { href: 'https://github.com/phenax/edible-desmos', target: '_blank' }, [text('github')]),
        text(')'),
      ]),
      h('ul', { className: 'graph-list' },
        indexJson.order.map(name => h('li', { className: 'graph' }, [
          h('div', {}, [
            h('a', { href: `/#/graphs/${name}`, className: 'graph-name' }, [
              text(indexJson.meta[name]?.label || name),
            ]),
            h('div', { className: 'meta' }, [
              h('span', { className: 'meta-desc' }, [text(indexJson.meta[name]?.description ?? '')]),
              h('span', { className: 'meta-date' }, indexJson.meta[name]?.updatedAt ? [
                text('Updated: '),
                text(toDate(indexJson.meta[name]?.updatedAt))
              ] : []),
            ])
          ])
        ]))
      ),
      window.isManageMode ?
        h('div', { style: 'padding-top: 2rem' }, [
          h('form', { onsubmit: onAddGraph, className: 'add-form' }, [
            h('input', { type: 'text', name: 'name', placeholder: 'Graph name' }),
            h('button', { type: 'submit' }, [text('Create graph')]),
          ])
        ])
        : h('div')
    ])
  ])
}

handleRouteChange(document.getElementById('root'), (pathname) => {
  if (window.$calc) {
    window.$calc.destroy();
  }

  const graphRouteMatch = pathname.match(/^\/graphs\/([A-Za-z0-9-_]+)$/)
  if (graphRouteMatch && graphRouteMatch[1] !== 'index') {
    return showGraph(graphRouteMatch[1])
  }

  return showIndex()
})
