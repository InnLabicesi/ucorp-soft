const calcularPuntuacion = (nivel_actual, interes, relevancia) => {
  const gap = Math.max(0, 4 - nivel_actual);
  return (gap * 0.4) + (interes * 0.3) + (relevancia * 0.3);
};

test('Algoritmo de recomendación: priorización correcta', () => {
  // Caso 1: gap alto, interés y relevancia altos
  expect(calcularPuntuacion(1, 5, 5)).toBeCloseTo(4.2);
  // Caso 2: nivel experto, sin gap
  expect(calcularPuntuacion(4, 3, 3)).toBeCloseTo(1.8);
  // Caso 3: gap medio, interés bajo
  expect(calcularPuntuacion(2, 1, 2)).toBeCloseTo(1.7);
  // Caso 4: gap bajo, interés y relevancia altos
  expect(calcularPuntuacion(3, 5, 5)).toBeCloseTo(3.4);
}); 