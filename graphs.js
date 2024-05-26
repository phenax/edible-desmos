import { initializeCalculator } from './desmos.js';

const { calculator } = initializeCalculator(
  'my-graph',
  document.getElementById('calculator'),
  { graphDescription: 'Hello world' }
);

window.$calc = calculator;

