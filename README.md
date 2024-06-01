# edible-desmos
My personal desmos graph manager and collection of my graphs.

([desmos.ediblemonad.dev](https://desmos.ediblemonad.dev))


### Instructions

To manage your own graphs with this,

- Fork this repository
- Remove my stuff
- Run `deno task dev` to run the manage server
- Visit `localhost:3141`
- Use the input to create a new graph (or just visit `localhost:3141/#/graphs/<your-graph-name>`)
- Hitting `<C-S>` will save the graph state to the repository and record it in `graphs/index.json`
- To edit the description of a graph, edit `graphs/index.json`

This is a simple tool with no build system. All the js is served as is. So it can be hosted statically as is and also hosted dynamically as the manage server using deno.
