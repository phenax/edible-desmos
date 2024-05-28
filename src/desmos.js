/**
 * @param name {string}
 * @param $root {HTMLElement}
 * @param options {object}
 */
export const initializeCalculator = (name, $root, options) => {
  const calculator = Desmos.GraphingCalculator($root, {
    authorFeatures: true,
    invertedColors: true,
    pasteGraphLink: true,
  });

  const saveState = () => {
    options?.onSave?.(name, calculator.getState())
  }

  const reloadState = async (asDefault) => {
    const state = await options?.getState?.(name)
    if (state) {
      calculator.setState(state)
      if (asDefault) calculator.setDefaultState(state)
    }
  }

  reloadState(true)

  const onKeyDown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault()
      saveState()
    }
  }

  window.onkeydown = onKeyDown

  // TODO: Periodic save/save on change
  // TODO: Save indicators

  const destroy = () => {
    window.onkeydown = null
  }

  return {
    calculator,
    saveState,
    reloadState,
    destroy,
  }
}
