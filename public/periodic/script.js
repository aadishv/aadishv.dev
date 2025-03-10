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

const setDetailsView = (n, pdata) => {
  const element = pdata[n - 1];
  document.getElementById(`element-${n}`).focus();
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
  const html = `
    <div
      id="details"
      class="w-5/24 m-4 border-2 rounded-xl flex flex-col justify-center font-mono p-3 flex-grow"
      style="
      background-color: ${bg};
      color: ${textColor};
      "
    >
    <h1 class="text-3xl flex w-full bold">${element.name}<br>(${element.number}, ${element.symbol})</h1>
    ${generateDetail('Electron config', element.electron_configuration_semantic)}
    ${generateDetail('Full config', element.electron_configuration)}
    ${generateDetail('Group', element.type)}
    ${generateDetail('Atomic mass', element.atomic_mass)}
    ${generateDetail('Electronegativity', element.electronegativity_pauling)}
    ${generateDetail('Fun fact', element.fun_fact)}
    <button 
      onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(element.name + ' chemical element')}', '_blank')"
      class="mt-4 px-4 py-2 rounded-md border font-bold font-sans cursor-pointer transition-all duration-200"
      style="border-color: ${textColor}; color: ${textColor};"
    >
      Search on Google
    </button>
    </div>
  `;
  document.getElementById('details').outerHTML = html;
};

const fetchPeriodicData = async () => {
  const response = await fetch(
    'https://gist.githubusercontent.com/aadishv/8e146859aa985767b50aeffdffb1630a/raw/e02725b8584cb5d77be6cf571241e1789793117e/periodic.json'
  );
  return await response.json();
};

const attachListeners = (pdata, fuse) => {
  document.getElementById('search').addEventListener('sl-change', (e) => {
    var targetv = e.target.value;
    const trimmedQ = targetv.trim().toLowerCase();
    const sortedElements = fuse.search(trimmedQ);
    var element = sortedElements[0];
    console.log(
      element.item.name,
      element.item.number,
      Array.from(document.getElementsByClassName('aadish-element')).map(
        (i) => i.parentElement.parentElement.parentElement.id
      )
    );
    document.getElementById(`element-${element.item.number}`).focus();
  });

  const layout = document.getElementById('layout');
  for (var i = 1; i <= 118; i++) {
    var el = document.getElementById(`element-${i}`);
    el.addEventListener(
      'focusin',
      ((element) => (e) => {
        setDetailsView(element, pdata);
      })(i)
    );
  }
};

const main = async () => {
  const pdata = await fetchPeriodicData();
  console.log(pdata[7]);

  const fuseOptions = {
    keys: [
      {name: 'name', weight: 0.7},
      {name: 'symbol', weight: 0.3},
      {name: 'number', weight: 0.1},
    ],
  };
  const fuse = new Fuse(pdata, fuseOptions);
  const randomElementIndex = 1 + Math.floor(Math.random() * pdata.length);
  attachListeners(pdata, fuse);
  setDetailsView(randomElementIndex + 1, pdata);
};
main();
