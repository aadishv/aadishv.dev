import React, { memo } from "react";
import {
  type ElementType,
  type ElementTypeString,
  TEXT_COLORS,
  getGradientStyle,
} from "./Utils";

interface ElementComponentProps {
  x: number;
  y: number;
  data: ElementType[];
  onFocusElement: (elementNumber: number) => void;
}

// Element Component (memoized for performance)
const ElementComponent = memo(
  ({ x, y, data, onFocusElement }: ElementComponentProps) => {
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
          color: TEXT_COLORS[elementType as ElementTypeString],
          borderColor: element
            ? TEXT_COLORS[elementType as ElementTypeString]
            : "transparent",
        }}
        onFocus={() => element && onFocusElement(element.number)}
      >
        <div className="flex flex-grow justify-start">
          {element?.number ?? ""}
        </div>
        <div className="flex flex-grow justify-end">
          {element?.symbol ?? ""}
        </div>
      </div>
    );
  },
);
ElementComponent.displayName = "ElementComponent";

export default ElementComponent;
