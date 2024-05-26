Deno.serve({ port: 8080 }, async (request) => {
    const url = new URL(request.url)

    if (url.pathname === '/') {
        const data = await Deno.readFile('./index.html')
        return new Response(data, {
            headers: { 'Content-Type': 'text/html' },
            status: 200,
        })
    }

    if (request.method === 'POST' && url.pathname.startsWith('/graph/')) {
        return new Response('Hello World!')
    }

    if (request.method === 'POST' && url.pathname.startsWith('/graph/')) {
        return new Response('Hello World!')
    }

    return new Response('', {
        headers: { 'Content-Type': 'text/html' },
        status: 404,
    })
})
