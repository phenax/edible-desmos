import { initializeCalculator } from './desmos.js';
import { handleRouteChange } from './routes.js';
import { h, text } from './dom.js';

const showGraph = (name) => {
  const $calculator = h('div', { className: 'calc', id: 'calculator' }, [])

  const { calculator } = initializeCalculator(
    name,
    $calculator,
    {
      async onSave(name, state) {
        if (!window.isManageMode) return;
        const response = await fetch(`/graphs/${name}.json`, {
          method: 'POST',
          body: JSON.stringify(state),
        })
        console.log(response.status, await response?.text())
      },
      async getState(name) {
        const response = await fetch(`/graphs/${name}.json`).catch(_ => null)
        if (!response || response.status !== 200) return null
        return response.json()
      }
    }
  );

  if (window.$calc) {
    window.$calc.destroy();
  }

  window.$calc = calculator;

  return h('div', { className: 'calc-wrapper' }, [
    h('header', { className: 'header' }, [
      h('a', { href: '/#' }, [text('EdibleGraphs')]),
      h('div', { className: 'dot' }, []),
      h('div', { className: 'header-title' }, [text(name)]),
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
      h('h1', {}, [text(`EdibleMonad's graphs`)]),
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
          h('h2', {}, [text('Manager mode')]),
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
  const graphRouteMatch = pathname.match(/^\/graphs\/([A-Za-z0-9-_]+)$/)
  if (graphRouteMatch && graphRouteMatch[1] !== 'index') {
    return showGraph(graphRouteMatch[1])
  }

  return showIndex()
})
