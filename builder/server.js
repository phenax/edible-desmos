import { serveDir, serveFile } from 'jsr:@std/http/file-server'

const getGraphsIndex = async () => {
  return Deno.readTextFile('./graphs/index.json').then(JSON.parse)
}

const addToGraphsIndex = async (name) => {
  const indexJsonSet = new Set(await getGraphsIndex())
  indexJsonSet.add(name)
  const indexJson = JSON.stringify(Array.from(indexJsonSet), null, 2)
  await Deno.writeTextFile('./graphs/index.json', indexJson)
}

const saveGraphState = async (name, state) => {
  const jsonStr = JSON.stringify(state, null, 2)
  await Deno.writeTextFile(`./graphs/${name}.json`, jsonStr)
}

const json = (obj) => new Response(JSON.stringify(obj), {
  headers: { 'Content-Type': 'application/json' },
})

await Deno.serve({ port: 8080 }, async (request) => {
  const url = new URL(request.url)

  if (url.pathname === '/graphs/index.json') {
    const graphs = await getGraphsIndex()
    return json(graphs)
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

  if (url.pathname.match(/^\/graphs\/([A-Za-z0-9-_]+)$/)) {
    return serveFile(request, 'index.html')
  }

  return serveDir(request, { fsRoot: './', urlRoot: '' })
})
