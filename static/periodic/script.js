const textColors = {
  'Alkali Metal': '#00768D',
  'Alkaline Earth Metal': '#D60024',
  'Transition Metal': '#6232EC',
  'Post-transition Metal': '#002C00',
  'Metalloid': '#945801',
  'Reactive Nonmetal': '#0060F1',
  'Noble Gas': '#CD1D5F',
  'Lanthanide': '#003356',
  'Actinide': '#C73201',
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
    <span class="inline-flex items-center p-1 group">
      <span class="border font-bold rounded-md px-2 py-1 text-sm font-sans" style="border-color: ${textColors[element.type]}">${name}</span>
      <span class="border rounded-md px-2 py-1 text-sm ml-1 relative flex items-center" style="border-color: rgba(0,0,0,0)">
        ${value}
        <sl-icon-button 
          name="copy" 
          label="Copy value"
          class="opacity-0 group-hover:opacity-100 transition-opacity ml-1 !w-4 !h-4 !p-0 flex items-center"
          data-copy-value="${value}"
          style="color: ${textColors[element.type]}; --sl-input-height-small: 1rem;"
        ></sl-icon-button>
      </span>
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

  // Add copy functionality to the new buttons
  document.querySelectorAll('[data-copy-value]').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.getAttribute('data-copy-value');
      await navigator.clipboard.writeText(value);
      
      // Change to check icon temporarily
      const originalIcon = button.getAttribute('name');
      button.setAttribute('name', 'check2');
      
      // Reset after 500ms
      setTimeout(() => {
        button.setAttribute('name', originalIcon);
      }, 500);
    });
  });
};

const updateTable = async () => {
  const response = await fetch(
    'https://gist.githubusercontent.com/aadishv/c6cb2d008f2573a1c259726bba7bbfad/raw/a52ca4ae9ed817b38db267f36ac7c4511ea69092/created.html'
  );
  document.getElementsByClassName('elements')[0].outerHTML = await response.text();
  console.log(document.getElementsByClassName('elements')[0].outerHTML);
};

const fetchPeriodicData = async () => {
  const response = await fetch(
    'https://gist.githubusercontent.com/aadishv/8e146859aa985767b50aeffdffb1630a/raw/e02725b8584cb5d77be6cf571241e1789793117e/periodic.json'
  );
  return await response.json();
};

const attachListeners = (pdata, fuse) => {
  // Add keyboard shortcut listeners
  document.addEventListener('keydown', (e) => {
    // Check for cmd+f or cmd+k
    if ((e.key === 'f' || e.key === 'k') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault(); // Prevent default browser behavior
      document.getElementById('search').focus();
    }
  });

  // Formula Mass Calculator
  const calculatorBtn = document.getElementById('calculator-btn');
  const calculatorModal = document.getElementById('calculator-modal');
  const formulaInput = document.getElementById('formula-input');
  const resultDiv = document.getElementById('formula-result');
  const randomBtn = document.getElementById('random-btn');

  calculatorBtn.addEventListener('click', () => calculatorModal.show());
  
  // Random element selection
  const selectRandomElement = () => {
    const randomElementNumber = 1 + Math.floor(Math.random() * pdata.length);
    document.getElementById(`element-${randomElementNumber}`).focus();
  };

  randomBtn.addEventListener('click', selectRandomElement);

  const parseFormula = (formula) => {
    const regex = /([A-Z][a-z]?)(\d*)/g;
    const elements = {};
    let match;

    while ((match = regex.exec(formula)) !== null) {
      const [, element, count] = match;
      elements[element] = (elements[element] || 0) + (count ? parseInt(count) : 1);
    }

    return elements;
  };

  const calculateMass = (formula) => {
    const elements = parseFormula(formula);
    let totalMass = 0;

    for (const [element, count] of Object.entries(elements)) {
      const elementData = pdata.find(e => e.symbol === element);
      if (!elementData) {
        throw new Error(`Unknown element: ${element}`);
      }
      totalMass += elementData.atomic_mass * count;
    }

    return totalMass;
  };

  const updateResult = () => {
    const formula = formulaInput.value.trim();
    if (!formula) {
      resultDiv.innerHTML = '';
      return;
    }

    try {
      const mass = calculateMass(formula);
      const massText = `${mass.toFixed(2)} g/mol`;
      resultDiv.innerHTML = `
        <sl-alert variant="success" open class="relative group">
          <div class="flex items-center">
            Molar mass of ${formula}: ${massText}
            <sl-icon-button 
              name="copy" 
              label="Copy value"
              class="opacity-0 group-hover:opacity-100 transition-opacity ml-1 !w-4 !h-4 !p-0 flex items-center"
              data-copy-value="${massText}"
              style="--sl-input-height-small: 1rem;"
            ></sl-icon-button>
          </div>
        </sl-alert>
      `;

      // Add copy functionality to the new button
      const copyBtn = resultDiv.querySelector('[data-copy-value]');
      copyBtn.addEventListener('click', async () => {
        const value = copyBtn.getAttribute('data-copy-value');
        await navigator.clipboard.writeText(value);
        
        // Change to check icon temporarily
        copyBtn.setAttribute('name', 'check2');
        
        // Reset after 500ms
        setTimeout(() => {
          copyBtn.setAttribute('name', 'copy');
        }, 500);
      });
    } catch (error) {
      resultDiv.innerHTML = `
        <sl-alert variant="danger" open>
          ${error.message}
        </sl-alert>
      `;
    }
  };

  formulaInput.addEventListener('sl-input', updateResult);

  // Clear the input when modal is opened
  calculatorModal.addEventListener('sl-show', () => {
    formulaInput.value = '';
    resultDiv.innerHTML = '';
  });

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
  await updateTable();
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
