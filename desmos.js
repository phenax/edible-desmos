
/**
 * @param name {string}
 * @param $root {HTMLElement}
 * @param options {object}
 */
export const initializeCalculator = (name, $root, options) => {
  const calculator = Desmos.GraphingCalculator($root, {
    authorFeatures: true,
    ...options,
  });

  const reloadState = () => {
    const state = JSON.parse(localStorage.getItem(name) ?? '""')
    if (state) {
      calculator.setDefaultState(state)
      calculator.setState(state)
    }
  }

  const saveState = () => {
    localStorage.setItem(name, JSON.stringify(calculator.getState()))
  }

  reloadState()

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault()
      saveState()
    }
  })

  // TODO: Periodic save

  return {
    calculator,
  }
}
