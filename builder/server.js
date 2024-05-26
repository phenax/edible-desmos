import { serveDir, serveFile } from 'jsr:@std/http/file-server'

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

const json = (obj) =>
  new Response(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' },
  })

await Deno.serve({ port: 8080 }, async (request) => {
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

  if (url.pathname.match(/^\/graphs\/([A-Za-z0-9-_]+)$/)) {
    return serveFile(request, 'index.html')
  }

  return serveDir(request, { fsRoot: './', urlRoot: '' })
})
