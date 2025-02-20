function truncateString(str, maxLength) {
  return str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...';
}

const createElementDisplay = (element, large) => {
  if (!element) {
    return '<div class="w-16 h-16 text-2xl invisible rounded-lg font-mono border"></div>';
  }

  return `
    <div
      class="${large ? 'w-32 h-32 text-6xl rounded-2xl' : 'w-16 h-16 text-xl rounded-xl'} font-mono border${large ? '-2' : ''}"
      style="background-color: ${backgroundColors[element.type]}; color: ${textColors[element.type]}; border-color: ${textColors[element.type]}"
    >
      <div class="flex justify-start pl-1 pr-1"><h1>${element.number}</h1></div>
      <div class="flex justify-end pl-1 pr-1"><h1>${element.symbol}</h1></div>
    </div>
  `;
};

const createElementName = (element) => {
  if (!element) return '';

  const textSize = element.name.length <= 7 ? 'text-sm' : 'text-sm';

  return `
    <div class="flex justify-center text-condensed font-mono ${textSize} w-16">
      <h1>${element.name + '&nbsp;'}</h1>
    </div>
  `;
};

const createElement = (x, y, data) => {
  const element = data.find((item) => item.xpos === x && item.ypos === y);
  const elementType = element?.type || '';

  /* NOTE: We add "relative" to the container so the absolute detail view
           positions relative to this element. */
  return `
  <div id="element-${element == null ? '' : element.number}" class="flex relative">
    <div class="flex flex-row w-22 p-0 pb-5 pl-0 pt-0 pr-0 justify-center" style="color: ${textColors[elementType]}">
      <div class="w-16 h-16 flex flex-col p-0 pb-4 pt-4 ml-3">
        ${createElementDisplay(element, false)}
        ${createElementName(element)}
      </div>
    </div>
    <!-- The detail view container -->
    <div tabindex="-1">
      ${element == undefined ? '' : createDetailView(element)}
    </div>
  </div>
`;
};

const createDetailView = (element) => {
  const generateDetail = (name, value) => {
    return `
    <span class="inline-flex items-center p-1">
      <span class="border font-bold rounded-md px-2 py-1 text-sm font-sans" style="border-color: ${textColors[element.type]}">${name}</span>
      <span class="border rounded-md px-2 py-1 text-sm ml-1" style="border-color: rgba(0,0,0,0)">${value}</span>
    </span>
    `;
  };

  let bg = backgroundColors[element.type];
  let textColor = textColors[element.type];
  let reverseCSS = `top: 50%;
  right: calc(100% + 10px);`;
  console.log(element.ypos);
  return `
  <div class="absolute flex flex-col justify-center font-mono p-10 w-80 rounded-3xl"
       style="background-color: ${bg}; color: ${textColor};
       ${element.xpos > 9 ? reverseCSS : ''}
              z-index: 10000000;
              transform: translateY(${element.ypos < 3 ? '0%' : element.ypos > 7 ? '-100%' : '-50%'});
              ">
    <div class="flex justify-center">
      <h1 class="p-4 text-3xl bold">${element.name} (${element.number}, ${element.symbol})</h1>
    </div>
    <div class="flex flex-col justify-center">
        ${generateDetail('Electron config', element.electron_configuration_semantic)}
        ${generateDetail('Full config', element.electron_configuration)}
        ${generateDetail('Group', element.type)}
        ${generateDetail('Atomic mass', element.atomic_mass)}
        ${generateDetail('Electronegativity', element.electronegativity_pauling)}
        ${generateDetail('Fun fact', element.fun_fact)}
    </div>
  </div>
  `;
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

const clearDetails = () => {
  for (var i = 1; i <= 118; i++) {
    var t = document.getElementById(`element-${i}`);
    t = t.children[1];
    t.className = `invisible`;
  }
};

const fetchPeriodicData = async () => {
  const response = await fetch(
    'https://gist.githubusercontent.com/aadishv/8e146859aa985767b50aeffdffb1630a/raw/e02725b8584cb5d77be6cf571241e1789793117e/periodic.json'
  );
  return await response.json();
};

const getMaxPositions = (pdata) =>
  pdata.reduce(
    (acc, item) => ({
      x: Math.max(acc.x, item.xpos),
      y: Math.max(acc.y, item.ypos),
    }),
    {x: 1, y: 1}
  );

const renderPeriodicTable = (pdata) => {
  const {x: maxX, y: maxY} = getMaxPositions(pdata);
  const html = Array.from({length: maxY}, (_, y) => {
    const row = Array.from({length: maxX}, (_, x) =>
      createElement(x + 1, y + 1, pdata)
    ).join('');
    return `<div class="flex flex-row">${row}</div>`;
  }).join('');
  return html;
};

const setupValueChangeListener = (pdata) => {
  document
    .getElementById('table-show-value')
    .addEventListener('sl-change', (e) => {
      var targetv = e.target.value;
      for (var i = 1; i <= 118; i++) {
        var element = document.getElementById(`element-${i}`);
        var item = pdata.find((item) => item.number === i);
        var val = targetv == 'name' ? item.name : item.atomic_mass.toFixed(2);
        element.children[0].children[0].children[1].innerHTML = `${val}&nbsp;`;
      }
    });
};

const attachElementClickListeners = () => {
  for (var i = 1; i <= 118; i++) {
    var element = document.getElementById(`element-${i}`);
    element.addEventListener(
      'click',
      ((el) => (e) => {
        var t = el.children[1];
        console.log(t.className === 'invisible', Date());
        if (t.className == '') {
          t.className = 'invisible';
        } else {
          clearDetails();
          t.className = '';
          t.parentElement.focus();
          // clear details when loses focus
          t.parentElement.addEventListener('blur', () => clearDetails());
        }
      })(element)
    );
  }
};

const main = async () => {
  const pdata = await fetchPeriodicData();
  console.log(pdata[7]);
  const tableHTML = renderPeriodicTable(pdata);
  document.getElementsByClassName('elements')[0].innerHTML = tableHTML;
  setupValueChangeListener(pdata);
  clearDetails();
  attachElementClickListeners();
};
main();
