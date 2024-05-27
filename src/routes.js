export const handleRouteChange = ($root, getRouteElement) => {
  const render = async () => {
    const path = window.location.hash.slice(1)
    const $el = await getRouteElement(path)
    $root.innerHTML = '';
    $root.appendChild($el)
  }

  render()
  window.addEventListener('hashchange', render, false)

  return { render }
}
