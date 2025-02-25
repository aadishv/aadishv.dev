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

const createElement = (x, y, data) => {
  const element = data.find((item) => item.xpos === x && item.ypos === y);
  const elementType = element?.type || '';

  return `
    <div
      tabindex="${element?.number ?? -1}"
      id="element-${element ? element.number : ''}"
      class="flex flex-col font-mono pl-1 pr-1 rounded-xl border focus:border-2"
      style="
        font-size: calc(0.27 * (19 / 24) * 100vw / 18);
        width: calc(0.9 * (19 / 24) * 100vw / 18);
        height: calc(0.8 * (19 / 24) * 100vw / 18);
        margin: calc(0.1 * (19 / 24) * 100vw / 18);
        color: ${textColors[elementType]};
        background-color: ${backgroundColors[elementType]};
        border-color: ${element == undefined ? 'rgba(0,0,0,0)' : textColors[elementType]};
      "
    >
      <div class="flex flex-grow justify-start">${element?.number ?? ''}</div>
      <div class="flex flex-grow justify-end">${element?.symbol ?? ''}</div>
    </div>
  `;
};

const fetchPeriodicData = async () => {
  const response = await fetch(
    'https://gist.githubusercontent.com/aadishv/8e146859aa985767b50aeffdffb1630a/raw/e02725b8584cb5d77be6cf571241e1789793117e/periodic.json'
  );
  return await response.json();
};

const renderPeriodicTable = (pdata) => {
  const x = 18;
  const y = 10;
  const html = Array.from({length: y}, (_, y) => {
    const row = Array.from({length: x}, (_, x) =>
      createElement(x + 1, y + 1, pdata)
    ).join('');
    return `<div class="flex flex-row">${row}</div>`;
  }).join('');
  return html;
};

const main = async () => {
  const pdata = await fetchPeriodicData();
  console.log(renderPeriodicTable(pdata));
};
main();
