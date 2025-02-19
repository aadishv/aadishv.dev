function truncateString(str, maxLength) {
  return str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...';
}

const createElementDisplay = (element) => {
  if (!element) {
    return '<div class="w-16 h-16 text-2xl invisible rounded-lg font-mono border"></div>';
  }

  return `
    <div class="w-16 h-16 text-2xl rounded-lg font-mono border"
      style="background-color: ${backgroundColors[element.type]}; color: ${textColors[element.type]}; border-color: ${textColors[element.type]}"
    >
      <div class="flex justify-start pl-2 pr-2"><h1>${element.number}</h1></div>
      <div class="flex justify-end pl-2 pr-2"><h1>${element.symbol}</h1></div>
    </div>
  `;
};

const createElementName = (element) => {
  if (!element) return '';

  const textSize =
    element.name.length <= 7
      ? 'text-sm'
      : element.name.length <= 11
        ? 'text-xs'
        : 'text-xxs';

  return `
    <div class="flex justify-center font-mono ${textSize} w-16">
      <h1>${element.name}</h1>
    </div>
  `;
};

const createElement = (x, y, data) => {
  const element = data.find((item) => item.xpos === x && item.ypos === y);
  const elementType = element?.type || '';

  return `
  <div class="flex flex-row w-22 p-0 pb-5 pl-0 pt-0 pr-0 justify-center style="color: ${textColors[elementType]}">
    <div class="w-16 h-16 flex flex-col p-0 pb-4 pt-4 ml-3">
      ${createElementDisplay(element)}
      ${createElementName(element)}
    </div>
  </div>`;
};

const textColors = {
  'Alkali Metal': '#00768D',
  'Alkaline Earth Metal': '#D60024',
  'Transition Metal': '#6232EC',
  'Post-transition Metal': '#002C00',
  Metalloid: '#945801',
  'Reactive Nonmetal': '#0060F1',
  'Noble Gas': '#CD1D5F',
  Lanthanide: '#003356',
  Actinide: '#C73201',
  'Unknown Chemical Properties': '#3F3750',
};

const backgroundColors = {
  'Alkali Metal': '#D7F8FF',
  'Alkaline Earth Metal': '#FFE6E5',
  'Transition Metal': '#F3E7FE',
  'Post-transition Metal': '#D8F9E9',
  Metalloid: '#FEF8E2',
  'Reactive Nonmetal': '#E1EDFF',
  'Noble Gas': '#FFE6EA',
  Lanthanide: '#E1F3FF',
  Actinide: '#FFE7D7',
  'Unknown Chemical Properties': '#E7E7EA',
};

(async function () {
  const response = await fetch(
    'https://gist.githubusercontent.com/aadishv/8e146859aa985767b50aeffdffb1630a/raw/e02725b8584cb5d77be6cf571241e1789793117e/periodic.json'
  );
  const pdata = await response.json();

  const maxPos = pdata.reduce(
    (acc, item) => ({
      x: Math.max(acc.x, item.xpos),
      y: Math.max(acc.y, item.ypos),
    }),
    {x: 1, y: 1}
  );

  const html = Array.from({length: maxPos.y}, (_, y) => {
    const row = Array.from({length: maxPos.x}, (_, x) =>
      createElement(x + 1, y + 1, pdata)
    ).join('');

    return `<div class="flex flex-row">${row}</div>`;
  }).join('');

  document.getElementsByClassName('elements')[0].innerHTML = html;
})();
