/* eslint-disable react/prop-types */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from "react";
import Fuse from "fuse.js";
import Modal from "react-modal";
import PERIODIC_DATA from "/src/utils/periodic.js";

// Constants for colors
const TEXT_COLORS = {
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

const BG_COLORS = {
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

// Helper to generate gradient style for an element type.
const getGradientStyle = (elementType) => {
  const backgroundColor = BG_COLORS[elementType] || "white";
  return `repeating-linear-gradient(
    45deg,
    ${backgroundColor} 0px,
    ${backgroundColor} 2px,
    white 2px,
    white 5px
  )`;
};

// Element Component (memoized for performance)
const ElementComponent = memo(({ x, y, data, onFocusElement }) => {
  if (!Array.isArray(data)) return null;
  const element = data.find((item) => item.xpos === x && item.ypos === y);
  const elementType = element?.type || "";
  const gradientStyle = getGradientStyle(elementType);

  return (
    <div
      tabIndex={element?.number ?? -1}
      id={`element-${element ? element.number : ""}`}
      className="m-1 aspect-square h-14 w-14 border pl-1 pr-1 font-mono text-xl focus:border-2 focus:outline-none"
      style={{
        background: gradientStyle,
        color: TEXT_COLORS[elementType],
        borderColor: element ? TEXT_COLORS[elementType] : "transparent",
      }}
      onFocus={() => onFocusElement(element.number)}
    >
      <div className="flex flex-grow justify-start">
        {element?.number ?? ""}
      </div>
      <div className="flex flex-grow justify-end">{element?.symbol ?? ""}</div>
    </div>
  );
});
ElementComponent.displayName = "ElementComponent";

const PeriodicTable = ({ pdata, onSetFocus }) => {
  const columns = 18;
  const rows = 10;

  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex flex-row">
          {Array.from({ length: columns }, (_, colIndex) => (
            <ElementComponent
              key={`${colIndex}-${rowIndex}`}
              x={colIndex + 1}
              y={rowIndex + 1}
              data={pdata}
              onFocusElement={onSetFocus}
            />
          ))}
        </div>
      ))}
    </>
  );
};

const DetailRow = ({ name, value }) => {
  const [iconName, setIconName] = useState("copy");

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setIconName("check2");
    setTimeout(() => setIconName("copy"), 500);
  }, [value]);

  return (
    <span className="items-center p-1">
      <span className="mr-2 inline font-lora underline">{name}</span>
      <span className="inline font-mono">{value}</span>
      {/* Optionally, add a button/icon here that calls handleCopy */}
    </span>
  );
};

const DetailsView = ({ elementNumber, periodicData }) => {
  const element = periodicData[elementNumber - 1];
  const bgColor = BG_COLORS[element.type];
  const textColor = TEXT_COLORS[element.type];

  useEffect(() => {
    const el = document.getElementById(`element-${elementNumber}`);
    if (el) {
      el.focus();
    }
  }, [elementNumber]);

  return (
    <div
      id="details"
      className="w-25vw m-2 flex h-full flex-col rounded-lg border-2 p-3"
      style={{
        background: getGradientStyle(element.type),
        color: textColor,
        width: "25vw",
        borderColor: textColor,
      }}
    >
      <h1 className="bold flex w-full font-lora text-3xl">
        {element.name}
        <br />({element.number}, {element.symbol})
      </h1>
      <DetailRow
        name="Electron config"
        value={element.electron_configuration_semantic}
      />
      <DetailRow name="Full config" value={element.electron_configuration} />
      <DetailRow name="Group" value={element.type} />
      <DetailRow name="Atomic mass" value={element.atomic_mass} />
      <DetailRow
        name="Electronegativity"
        value={element.electronegativity_pauling ?? "N/A"}
      />
      <DetailRow
        name="Oxidation states"
        value={
          element.oxistates
            ?.map((state) => (state > 0 ? `+${state}` : state))
            .join(", ") ?? "N/A"
        }
      />
      <DetailRow
        name="Oxidation states (extended)"
        value={
          element.oxistates_extended
            ?.map((state) => (state > 0 ? `+${state}` : state))
            .join(", ") ?? "N/A"
        }
      />
      <DetailRow name="Fun fact" value={element.fun_fact} />
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(
          `${element.name} chemical element`,
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ borderColor: textColor, color: textColor }}
      >
        Search on Google
      </a>
    </div>
  );
};

const fuseOptions = {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "symbol", weight: 0.3 },
    { name: "number", weight: 0.1 },
  ],
};
// Initialize Fuse only once
const fuse = new Fuse(PERIODIC_DATA, fuseOptions);

const SearchBar = ({ inputRef, onSearch }) => {
  return (
    <form onSubmit={onSearch} className="flex">
      <input
        ref={inputRef}
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

const RandomButton = ({ onClickRandom }) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickRandom}
      >
        Random
      </button>
    </div>
  );
};

const ReferenceButton = ({ onClickReference }) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickReference}
      >
        References
      </button>
    </div>
  );
};

const ModalButton = ({ onClickModal }) => {
  return (
    <div className="flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickModal}
      >
        Formula mass calculator
      </button>
    </div>
  );
};

const ReferenceModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = useMemo(
    () => [
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
      {
        name: "Transition metal charges",
        imageSrc: "/chemutils/transition_charges.avif",
        alt: "Common transition metal charges",
      },
    ],
    [],
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
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
  const elementsFound = parseFormula(formula);
  let totalMass = 0;

  for (const [symbol, count] of Object.entries(elementsFound)) {
    const elementData = PERIODIC_DATA.find((e) => e.symbol === symbol);
    if (!elementData) {
      throw new Error(`Unknown element: ${symbol}`);
    }
    totalMass += elementData.atomic_mass * count;
  }
  return totalMass.toFixed(2);
};

const MassCalculator = ({ onClose }) => {
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const calculateAndDisplayMass = useCallback(() => {
    const formula = inputRef.current.value;
    try {
      const mass = calculateMass(formula);
      outputRef.current.innerText = `${mass} g/mol`;
    } catch (error) {
      outputRef.current.innerText = error.message;
    }
  }, []);

  // We can call calculation on every change.
  return (
    <div className="rounded bg-white">
      <div className="bg-stripes-header2 relative mx-auto max-w-md bg-opacity-100 p-6 pb-4">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type the chemical formula here"
            className="border-b-2 border-header2 bg-transparent font-lora text-xl focus:border-header focus:outline-none"
            style={{ width: "56vw", marginRight: "2vw" }}
            onChange={calculateAndDisplayMass}
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

const TableContent = ({ focusElement, onSetFocusElement }) => {
  return (
    <div className="flex">
      <div className="flex-grow overflow-x-auto p-4">
        <div className="min-w-max">
          <PeriodicTable pdata={PERIODIC_DATA} onSetFocus={onSetFocusElement} />
        </div>
      </div>
      <div className="flex-shrink-0">
        <DetailsView
          elementNumber={focusElement}
          periodicData={PERIODIC_DATA}
        />
      </div>
    </div>
  );
};

export default function PeriodicTableApp() {
  const initialRandomElement =
    1 + Math.floor(Math.random() * PERIODIC_DATA.length);
  const [focusElement, setFocusElement] = useState(initialRandomElement);
  const [showMassModal, setShowMassModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const searchInputRef = useRef(null);

  const handleGlobalKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "f" || e.key === "k")) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const query = e.target.elements[0].value.trim().toLowerCase();
    const results = fuse.search(query);
    if (results.length > 0) {
      const element = results[0].item;
      const el = document.getElementById(`element-${element.number}`);
      if (el) {
        el.focus();
      }
    }
  }, []);

  const handleRandomClick = useCallback(() => {
    const randomElement = 1 + Math.floor(Math.random() * PERIODIC_DATA.length);
    setFocusElement(randomElement);
  }, []);

  const handleMassModalToggle = useCallback(() => {
    setShowMassModal((prev) => !prev);
  }, []);

  const handleReferenceModalOpen = useCallback(() => {
    setShowReferenceModal(true);
  }, []);

  return (
    <>
      <div className="flex" style={{ margin: "2vw" }}>
        <SearchBar inputRef={searchInputRef} onSearch={handleSearch} />
        <div className="flex-grow" />
        <RandomButton onClickRandom={handleRandomClick} />
        <ReferenceButton onClickReference={handleReferenceModalOpen} />
        <ModalButton onClickModal={handleMassModalToggle} />
      </div>

      <Modal
        isOpen={showMassModal}
        onRequestClose={() => setShowMassModal(false)}
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        className="modal"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
        ariaHideApp={false}
      >
        <MassCalculator onClose={() => setShowMassModal(false)} />
      </Modal>

      <ReferenceModal
        isOpen={showReferenceModal}
        onClose={() => setShowReferenceModal(false)}
      />

      <TableContent
        focusElement={focusElement}
        onSetFocusElement={setFocusElement}
      />
    </>
  );
}
