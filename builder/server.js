import { serveDir } from 'jsr:@std/http/file-server'

const getGraphsIndex = async () => {
  const raw = await Deno.readTextFile('./graphs/index.json').catch((_) => null)
  const indexData = raw && JSON.parse(raw)
  return Object.assign({ meta: {}, order: [] }, indexData ?? {})
}

const addToGraphsIndex = async (name) => {
  let indexJsonSet = await getGraphsIndex()
  indexJsonSet.order = indexJsonSet.order.filter((n) => n !== name)
  indexJsonSet.order.unshift(name)
  indexJsonSet.meta[name] = {
    description: '',
    ...indexJsonSet.meta[name],
    updatedAt: new Date(),
  }
  const indexJson = JSON.stringify(indexJsonSet, null, 2)
  await Deno.writeTextFile('./graphs/index.json', indexJson)
}

const saveGraphState = async (name, state) => {
  const jsonStr = JSON.stringify(state, null, 2)
  await Deno.writeTextFile(`./graphs/${name}.json`, jsonStr)
}

const json = (obj, options) =>
  new Response(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

const renderTemplate = async (file) => {
  const html = await Deno.readTextFile(file)
  return html.replaceAll('{{server_script}}', 'text/javascript')
}

await Deno.serve({ port: 3141 }, async (request) => {
  const url = new URL(request.url)

  if (['/graphs/index.json', '/graphs/index'].includes(url.pathname)) {
    return json(await getGraphsIndex())
  }

  const graphRouteJsonMatch = url.pathname.match(/^\/graphs\/([A-Za-z0-9-_]+)\.json$/)
  if (graphRouteJsonMatch) {
    const [_, name] = graphRouteJsonMatch

    if (request.method === 'POST') {
      await saveGraphState(name, await request.json())
      await addToGraphsIndex(name)
      return json({ name, saved: true })
    }
  }

  if (
    ['/', '/index.html'].includes(url.pathname) ||
    url.pathname.match(/^\/graphs\/([A-Za-z0-9-_]+)$/)
  ) {
    const html = await renderTemplate('index.html')
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return serveDir(request, { fsRoot: './', urlRoot: '' })
})
