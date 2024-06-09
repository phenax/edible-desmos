import { initializeCalculator } from './desmos.js';
import { handleRouteChange } from './routes.js';
import { h, text } from './dom.js';

let graphIndex;

const loadGraphIndex = async () => {
  if (graphIndex) return graphIndex;
  const response = await fetch('/graphs/index.json').catch(_e => [])
  graphIndex = await response.json().catch(_e => null) ?? { meta: {}, order: {} }
  return graphIndex
}

const showGraph = async (name) => {
  const graphIndex = await loadGraphIndex();

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

  const graphName = graphIndex.meta[name]?.label || name;

  document.title = `${graphName} - Akshay's Desmos Graphs`;

  const forkSnippet = `Calc.setState(await fetch('https://desmos.ediblemonad.dev/graphs/${name}.json').then(r => r.json()))`;
  const $close = h('button', { onclick: () => $dialog.close(), style: 'background: transparent;' }, [text('⨯')]);
  const $dialog = h('dialog', { open: false, onclick: () => $dialog.close(), className: 'dialog' }, [
    h('div', { onclick: (e) => e.stopPropagation(), style: 'padding: 0.8rem; width: 100%; max-width: 400px; font-size: 0.9rem;' }, [
      h('div', { style: 'text-align: right;' }, [$close]),
      h('h1', {}, [text('Import into desmos')]),
      h('div', { style: 'padding: 1rem 0' }, [
        h('ul', { className: 'list' }, [
          h('li', {}, [text('Copy the snippet below.')]),
          h('li', {}, [text('Open desmos.com/calculator')]),
          h('li', {}, [text('Open up the console (F12) and paste the snippet in')]),
        ]),
        h('div', { style: 'font-size: 0.8rem; line-height: 1rem; padding: 1rem 0;' }, [
          text(`Don't do any of the previous steps if you don't trust me. You trust me, right? I would never put malware in your clipboard.`),
        ]),
        h('textarea', {
          readonly: '1',
          rows: '5',
          style: 'display: block; width: 100%;'
        }, [text(forkSnippet)]),
      ]),
    ])
  ])

  return h('div', { className: 'calc-wrapper' }, [
    h('header', { className: 'header' }, [
      h('div', { style: 'display: flex; gap: 0.6rem; align-items: center;' }, [
        h('a', { href: '/#' }, [text('Graphs')]),
        h('div', { className: 'dot' }, []),
        h('div', { className: 'header-title' }, [text(graphName)]),
      ]),
      h('div', { style: 'display: flex; gap: 0.7rem; align-items: center; font-size: 0.7rem;' },
        window.isManageMode
          ? [$saveButton, $resetButton, $saveStateText]
          : [
            h('button', { className: 'fork', onclick: () => $dialog.open ? $dialog.close() : $dialog.showModal() }, [text('Fork')]),
            $dialog,
          ]
      ),
    ]),
    $calculator,
  ])
}

const showIndex = async () => {
  const graphIndex = await loadGraphIndex();

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

  document.title = `Akshay's Desmos Graphs`;

  return h('div', { className: 'index-wrapper' }, [
    h('div', { className: 'index' }, [
      h('h1', {}, [text(`Akshay's graphs`)]),
      h('p', {}, [
        text(`A collection of creative coding demos built using desmos graphing calculator`),
      ]),
      h('ul', { className: 'graph-list' },
        graphIndex.order.map(name => h('li', { className: 'graph' }, [
          h('div', {}, [
            h('a', { href: `/#/graphs/${name}`, className: 'graph-name' }, [
              text(graphIndex.meta[name]?.label || name),
            ]),
            h('div', { className: 'meta' }, [
              h('span', { className: 'meta-desc' }, [text(graphIndex.meta[name]?.description ?? '')]),
              h('span', { className: 'meta-date' }, graphIndex.meta[name]?.updatedAt ? [
                text('Updated: '),
                text(toDate(graphIndex.meta[name]?.updatedAt))
              ] : []),
            ])
          ])
        ]))
      ),
      h('div', { style: 'padding-top: 1.5rem;' }),
      h('p', { style: 'color: #555;' }, [
        h('a', { href: 'https://github.com/phenax/edible-desmos', target: '_blank' }, [text('Source code')]),
        text(' | Built using '),
        h('a', { href: 'https://desmos.com/calculator', target: '_blank' }, [text('desmos')]),
      ]),
      h('p', { style: 'color: #555;' }, [
        text(`More of my stuff on `),
        h('a', { href: 'https://ediblemonad.dev' }, [text('ediblemonad.dev')]),
        text(' and '),
        h('a', { href: 'https://github.com/phenax', target: '_blank' }, [text('github.com/phenax')]),
      ]),
      window.isManageMode ?
        h('div', { style: 'padding-top: 2rem;' }, [
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
