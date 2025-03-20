import React, { useState, useRef, useEffect } from "react";
import PERIODIC_DATA from "/src/utils/periodic.js";
import Fuse from "fuse.js";
import Modal from "react-modal";

// PREGENERATION
const textColors = {
  "Alkali Metal": "#00768D",
  "Alkaline Earth Metal": "#D60024",
  "Transition Metal": "#6232EC",
  "Post-transition Metal": "#002C00",
  Metalloid: "#945801",
  "Reactive Nonmetal": "#0060F1",
  "Noble Gas": "#CD1D5F",
  Lanthanide: "#003356",
  Actinide: "#C73201",
  "Unknown Chemical Properties": "#3F3750",
};

const backgroundColors = {
  "Alkali Metal": "#D7F8FF",
  "Alkaline Earth Metal": "#FFE6E5",
  "Transition Metal": "#F3E7FE",
  "Post-transition Metal": "#D8F9E9",
  Metalloid: "#FEF8E2",
  "Reactive Nonmetal": "#E1EDFF",
  "Noble Gas": "#FFE6EA",
  Lanthanide: "#E1F3FF",
  Actinide: "#FFE7D7",
  "Unknown Chemical Properties": "#E7E7EA",
};

const ElementComponent = ({ x, y, data, setFocusElement }) => {
  if (!data || !Array.isArray(data)) return null;
  const element = data.find((item) => item.xpos === x && item.ypos === y);
  const elementType = element?.type || "";

  const backgroundGradient = `repeating-linear-gradient(
    45deg,
    ${backgroundColors[elementType]} 0px,
    ${backgroundColors[elementType]} 2px,
    white 2px,
    white 5px
  )`;

  return (
    <div
      tabIndex={element?.number ?? -1}
      id={`element-${element ? element.number : ""}`}
      className="m-1 aspect-square h-14 w-14 border pl-1 pr-1 font-mono text-xl focus:border-2 focus:outline-none"
      style={{
        background: backgroundGradient,
        color: textColors[elementType],
        borderColor:
          element == undefined ? "rgba(0,0,0,0)" : textColors[elementType],
      }}
      onFocus={() => setFocusElement(element.number)}
    >
      <div className="flex flex-grow justify-start">
        {element?.number ?? ""}
      </div>
      <div className="flex flex-grow justify-end">{element?.symbol ?? ""}</div>
    </div>
  );
};

const PeriodicTable = ({ pdata, setFocus }) => {
  const x = 18;
  const y = 10;

  return (
    <>
      {Array.from({ length: y }, (_, y) => (
        <div key={y} className="flex flex-row">
          {Array.from({ length: x }, (_, x) => (
            <ElementComponent
              key={`${x}-${y}`}
              x={x + 1}
              y={y + 1}
              data={pdata}
              setFocusElement={setFocus}
            />
          ))}
        </div>
      ))}
    </>
  );
};

const DetailRow = ({ name, value, textColor }) => {
  const [iconName, setIconName] = useState("copy");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setIconName("check2");
    setTimeout(() => setIconName("copy"), 500);
  };

  return (
    <span className="group inline-flex items-center p-1">
      <span className="mr-2 font-lora underline">{name}</span>
      <span className="font-mono">{value}</span>
    </span>
  );
};

const DetailsView = ({ elementNumber, periodicData }) => {
  console.log(elementNumber);
  const element = periodicData[elementNumber - 1];
  const bg = backgroundColors[element.type];
  const textColor = textColors[element.type];

  React.useEffect(() => {
    document.getElementById(`element-${elementNumber}`).focus();
  }, [elementNumber]);

  return (
    <div
      id="details"
      className="w-25vw m-2 flex h-full flex-col rounded-lg border-2 p-3"
      style={{
        background: `repeating-linear-gradient(
          45deg,
          ${bg} 0px,
          ${bg} 2px,
          white 2px,
          white 5px
        )`,
        color: textColor,
        width: "25vw",
        borderColor: textColors[element.type],
      }}
    >
      <h1 className="bold flex w-full font-lora text-3xl">
        {element.name}
        <br />({element.number}, {element.symbol})
      </h1>

      <DetailRow
        name="Electron config"
        value={element.electron_configuration_semantic}
        textColor={textColor}
      />
      <DetailRow
        name="Full config"
        value={element.electron_configuration}
        textColor={textColor}
      />
      <DetailRow name="Group" value={element.type} textColor={textColor} />
      <DetailRow
        name="Atomic mass"
        value={element.atomic_mass}
        textColor={textColor}
      />
      <DetailRow
        name="Electronegativity"
        value={element.electronegativity_pauling ?? "N/A"}
        textColor={textColor}
      />
      <DetailRow
        name="Fun fact"
        value={element.fun_fact}
        textColor={textColor}
      />
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(element.name + " chemical element")}`}
        target="_blank"
        rel="noopener noreferrer"
        className=""
        style={{ borderColor: textColor, color: textColor }}
      >
        Search on Google
      </a>
    </div>
  );
};

// Initialize Fuse.js search outside component for better performance
const fuseOptions = {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "symbol", weight: 0.3 },
    { name: "number", weight: 0.1 },
  ],
};
const fuse = new Fuse(PERIODIC_DATA, fuseOptions);

// Search component
const SearchBar = ({ searchRef, onSearch }) => {
  return (
    <form onSubmit={onSearch} className="flex">
      <input
        ref={searchRef}
        type="text"
        placeholder="Search... (Cmd+F)"
        className="border-b-2 border-header2 font-mono text-xl focus:border-header focus:outline-none"
        style={{ width: "56vw", marginRight: "2vw" }}
      />
      <button type="submit" className="sr-only">
        Submit
      </button>
    </form>
  );
};

// Random element button component
const RandomButton = ({ handleClick }) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={handleClick}
      >
        Random
      </button>
    </div>
  );
};

const ReferenceButton = ({ handleClick }) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={handleClick}
      >
        References
      </button>
    </div>
  );
};
const ReferenceModal = ({ showModal, setShowModal }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    {
      name: "Aufbau Principle",
      imageSrc: "/chemutils/aufbau.jpg",
      alt: "Aufbau Principle",
    },
    {
      name: "Bonding",
      imageSrc: "/chemutils/bonding.avif",
      alt: "Chemical Bonding",
    },
    {
      name: "Solubility",
      imageSrc: "/chemutils/solubility.webp",
      alt: "Solubility Rules",
    },
  ];

  return (
    <Modal
      isOpen={showModal}
      onRequestClose={() => setShowModal(false)}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className="modal"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      ariaHideApp={false}
    >
      <div className="rounded-lg bg-white">
        <div
          className="bg-stripes-header2 rounded-lg p-6"
          style={{ width: "80vw", height: "80vh", maxWidth: "1200px" }}
        >
          <div className="mb-4 flex font-mono">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                className={`mr-4 h-8 border-b-2 px-2 text-xl ${
                  activeTab === index
                    ? "border-header text-header"
                    : "border-header2 hover:border-header"
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="h-[calc(80vh-140px)] overflow-auto">
            <img
              src={tabs[activeTab].imageSrc}
              alt={tabs[activeTab].alt}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
const ModalButton = ({ handleClick }) => {
  return (
    <div className="flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={handleClick}
      >
        Formula mass calculator
      </button>
    </div>
  );
};

const parseFormula = (formula) => {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  const elements = {};
  let match;

  while ((match = regex.exec(formula)) !== null) {
    const [, element, count] = match;
    elements[element] =
      (elements[element] || 0) + (count ? parseInt(count) : 1);
  }

  return elements;
};

const calculateMass = (formula) => {
  const elements = parseFormula(formula);
  let totalMass = 0;
  console.log(elements);
  for (const [element, count] of Object.entries(elements)) {
    const elementData = PERIODIC_DATA.find((e) => e.symbol === element);
    if (!elementData) {
      throw new Error(`Unknown element: ${element}`);
    }
    totalMass += elementData.atomic_mass * count;
  }

  return totalMass.toFixed(2);
};

const MassCalculator = ({ setShowModal }) => {
  const searchRef = useRef(null);
  const outputRef = useRef(null);
  const onSearch = (event) => {
    event.preventDefault();
    const query = searchRef.current.value;
    try {
      const mass = calculateMass(query);
      outputRef.current.innerText = `${mass} g/mol`;
    } catch (error) {
      outputRef.current.innerText = error.message;
    }
  };

  return (
    <div className="rounded bg-white">
      <div className="bg-stripes-header2 relative mx-auto max-w-md bg-opacity-100 p-6 pb-4">
        <div className="flex">
          <input
            ref={searchRef}
            type="text"
            placeholder="Type the chemical formula here"
            className="border-b-2 border-header2 bg-transparent font-lora text-xl focus:border-header focus:outline-none"
            style={{ width: "56vw", marginRight: "2vw" }}
            onChange={(e) => onSearch(e)}
          />
        </div>
        <div
          ref={outputRef}
          className="m-2 mt-4 text-center font-mono text-xl"
        ></div>
      </div>
    </div>
  );
};

// Main content component
const TableContent = ({ focusElement, setFocusElement }) => {
  return (
    <div className="flex">
      <div className="flex-grow overflow-x-auto p-4">
        <div className="min-w-max">
          <PeriodicTable pdata={PERIODIC_DATA} setFocus={setFocusElement} />
        </div>
      </div>
      <div className="flex-shrink-0">
        <DetailsView
          elementNumber={focusElement}
          periodicData={PERIODIC_DATA}
          style={{ width: "25vw" }}
        />
      </div>
    </div>
  );
};

// Main app component
export default function PeriodicTableApp() {
  const randomElementIndex =
    1 + Math.floor(Math.random() * PERIODIC_DATA.length);
  const [focusElement, setFocusElement] = useState(randomElementIndex);
  const [showModal, setShowModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log(e.key);
      // Check for Cmd+F (metaKey for Mac) or Cmd+K
      if ((e.metaKey || e.ctrlKey) && (e.key === "f" || e.key === "k")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);
  useEffect(() => {
    const handleModalEscapeKey = (e) => {
      if (showModal && e.key === "Escape") {
        setShowModal(false);
      }
    };

    document.addEventListener("keydown", handleModalEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleModalEscapeKey);
    };
  }, [showModal]);

  const handleSearch = (e) => {
    e.preventDefault();
    const targetv = e.target.elements[0].value;
    const trimmedQ = targetv.trim().toLowerCase();
    const sortedElements = fuse.search(trimmedQ);
    var element = sortedElements[0];
    document.getElementById(`element-${element.item.number}`).focus();
  };

  const handleRandomClick = () => {
    const newRandomElement =
      1 + Math.floor(Math.random() * PERIODIC_DATA.length);
    setFocusElement(newRandomElement);
  };
  const handleModalClick = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <div className="flex" style={{ margin: "2vw" }}>
        <SearchBar searchRef={searchRef} onSearch={handleSearch} />
        <div className="flex-grow" />
        <RandomButton handleClick={handleRandomClick} />
        <ReferenceButton handleClick={() => setShowRefModal(true)} />
        <ModalButton handleClick={handleModalClick} />
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className="modal"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
        ariaHideApp={false}
      >
        <MassCalculator setShowModal={setShowModal} />
      </Modal>

      <ReferenceModal showModal={showRefModal} setShowModal={setShowRefModal} />

      <TableContent
        focusElement={focusElement}
        setFocusElement={setFocusElement}
      />
    </>
  );
}
