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
    decimalToFraction: false,
    ...options.desmosSettings,
  });
  let defaultState = null
  let isReady = false
  let isReset = false

  const saveState = async () => {
    const state = calculator.getState()
    await options?.onSave?.(name, state)
    calculator.setDefaultState(state)
    defaultState = state
  }

  const reloadState = async () => {
    const state = await options?.getState?.(name)
    if (state) {
      calculator.setState(state)
      calculator.setDefaultState(state)
      defaultState = state
      isReady = true
    }
  }

  const resetState = () => {
    calculator.setState(defaultState)
    calculator.setDefaultState(defaultState)
  }

  const onKeyDown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault()
      saveState()
    } else if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      resetState()
    }
  }

  const onStateChange = async () => {
    const state = calculator.getState()
    let hasChanged =
      state !== defaultState ||
      JSON.stringify(state) !== JSON.stringify(defaultState)

    if (isReset) hasChanged = false

    if (isReady)
      await options?.onChange?.(hasChanged, state, defaultState)
  }

  const destroy = () => {
    window.removeEventListener('keydown', onKeyDown)
    calculator.unobserveAll()
    calculator.destroy()
  }

  // Initialize state
  reloadState()

  window.addEventListener('keydown', onKeyDown, false)
  calculator.observeEvent('change', onStateChange)

  return {
    calculator,
    saveState,
    reloadState,
    destroy,
    resetState,
  }
}
