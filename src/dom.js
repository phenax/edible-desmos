export const h = (el, props = {}, children = []) => {
  const $el = Object.assign(document.createElement(el), props)
  children.forEach($child => $el.appendChild($child))
  return $el
}

export const text = (text) => document.createTextNode(text)
