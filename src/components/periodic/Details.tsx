import React, { useState, useCallback, useEffect } from "react";
import {
  type ElementType,
  type ElementTypeString,
  BG_COLORS,
  TEXT_COLORS,
  getGradientStyle,
} from "./Utils";

interface DetailRowProps {
  name: string;
  value: string | number;
}

const DetailRow = ({ name, value }: DetailRowProps) => {
  const [iconName, setIconName] = useState<string>("copy");

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(String(value));
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

interface DetailsViewProps {
  elementNumber: number;
  periodicData: ElementType[];
}

const DetailsView = ({ elementNumber, periodicData }: DetailsViewProps) => {
  const element = periodicData[elementNumber - 1];
  const bgColor = BG_COLORS[element.type as ElementTypeString];
  const textColor = TEXT_COLORS[element.type as ElementTypeString];

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

export default DetailsView;
