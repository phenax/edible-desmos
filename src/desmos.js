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

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault()
      saveState()
    }
  })

  // TODO: Periodic save/save on change

  return {
    calculator,
    saveState,
    reloadState,
  }
}
