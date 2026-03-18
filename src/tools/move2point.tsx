import RotateCw from "lucide-solid/icons/rotate-cw";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

interface Point {
  x: number;
  y: number;
}

const DESMOS_SCRIPT_SRC =
  "https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";

let desmosScriptPromise: Promise<void> | null = null;

function loadDesmosScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.Desmos) {
    return Promise.resolve();
  }

  if (desmosScriptPromise) {
    return desmosScriptPromise;
  }

  desmosScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${DESMOS_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Desmos.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = DESMOS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Desmos."));
    document.head.append(script);
  });

  return desmosScriptPromise;
}

export function CosineViz() {
  const [boxPosition, setBoxPosition] = createSignal<Point>({ x: 300, y: 400 });
  const [boxRotation, setBoxRotation] = createSignal(0);
  const [otherPoint, setOtherPoint] = createSignal<Point>({ x: 500, y: 200 });
  const [isDraggingBox, setIsDraggingBox] = createSignal(false);
  const [isDraggingPoint, setIsDraggingPoint] = createSignal(false);
  const [isRotating, setIsRotating] = createSignal(false);
  const [dragOffset, setDragOffset] = createSignal<Point>({ x: 0, y: 0 });

  let svgRef!: SVGSVGElement;

  const normalizeAngle = (angle: number) => {
    let nextAngle = angle;
    while (nextAngle < 0) nextAngle += 360;
    while (nextAngle >= 360) nextAngle -= 360;
    return nextAngle;
  };

  const calculateAngle = () => {
    const box = boxPosition();
    const target = otherPoint();
    const angleToPoint = (Math.atan2(target.y - box.y, target.x - box.x) * 180) / Math.PI;

    const normalizedBoxRotation = normalizeAngle(boxRotation());
    const normalizedAngleToPoint = normalizeAngle(angleToPoint);

    let angleDifference = normalizedAngleToPoint - normalizedBoxRotation;
    if (angleDifference < 0) angleDifference += 360;
    if (angleDifference > 180) angleDifference = 360 - angleDifference;

    return Math.round(angleDifference * 10) / 10;
  };

  const getMousePosition = (event: MouseEvent) => {
    const rect = svgRef.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleBoxMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const mousePosition = getMousePosition(event);
    const box = boxPosition();

    setDragOffset({
      x: mousePosition.x - box.x,
      y: mousePosition.y - box.y,
    });
    setIsDraggingBox(true);
  };

  const handlePointMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const mousePosition = getMousePosition(event);
    const target = otherPoint();

    setDragOffset({
      x: mousePosition.x - target.x,
      y: mousePosition.y - target.y,
    });
    setIsDraggingPoint(true);
  };

  const handleRotateMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsRotating(true);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const mousePosition = getMousePosition(event);
    const offset = dragOffset();

    if (isDraggingBox()) {
      setBoxPosition({
        x: mousePosition.x - offset.x,
        y: mousePosition.y - offset.y,
      });
      return;
    }

    if (isDraggingPoint()) {
      setOtherPoint({
        x: mousePosition.x - offset.x,
        y: mousePosition.y - offset.y,
      });
      return;
    }

    if (isRotating()) {
      const box = boxPosition();
      const dx = mousePosition.x - box.x;
      const dy = mousePosition.y - box.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      setBoxRotation(angle);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingBox(false);
    setIsDraggingPoint(false);
    setIsRotating(false);
  };

  const lineLength = 20_000;

  const boxHeading = createMemo(() => {
    const box = boxPosition();
    const rotation = (boxRotation() * Math.PI) / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return {
      startX: box.x - cos * lineLength,
      startY: box.y - sin * lineLength,
      endX: box.x + cos * lineLength,
      endY: box.y + sin * lineLength,
      headingX: cos,
      headingY: sin,
    };
  });

  const distanceToPoint = createMemo(() => {
    const box = boxPosition();
    const target = otherPoint();
    return Math.hypot(target.x - box.x, target.y - box.y);
  });

  const pointDirection = createMemo(() => {
    const box = boxPosition();
    const target = otherPoint();
    const distance = Math.max(distanceToPoint(), 1);

    return {
      x: (target.x - box.x) / distance,
      y: (target.y - box.y) / distance,
    };
  });

  const pointLine = createMemo(() => {
    const box = boxPosition();
    const direction = pointDirection();

    return {
      startX: box.x - direction.x * lineLength,
      startY: box.y - direction.y * lineLength,
      endX: box.x + direction.x * lineLength,
      endY: box.y + direction.y * lineLength,
    };
  });

  const arc = createMemo(() => {
    const box = boxPosition();
    const target = otherPoint();
    const arcRadius = 140;
    const startAngle = (boxRotation() * Math.PI) / 180;
    const endAngle = Math.atan2(target.y - box.y, target.x - box.x);

    const startX = box.x + Math.cos(startAngle) * arcRadius;
    const startY = box.y + Math.sin(startAngle) * arcRadius;
    const endX = box.x + Math.cos(endAngle) * arcRadius;
    const endY = box.y + Math.sin(endAngle) * arcRadius;

    let angleDifference = endAngle - startAngle;
    if (angleDifference < 0) angleDifference += 2 * Math.PI;

    const path =
      angleDifference > Math.PI
        ? `M ${endX} ${endY} A ${arcRadius} ${arcRadius} 0 0 1 ${startX} ${startY}`
        : `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${endY}`;

    if (angleDifference > Math.PI) {
      angleDifference = 2 * Math.PI - angleDifference;
    }

    return { path, angleDifference };
  });

  const projectionPoint = createMemo(() => {
    const box = boxPosition();
    const heading = boxHeading();
    const projectionLength = distanceToPoint() * Math.cos((calculateAngle() * Math.PI) / 180);

    return {
      x: box.x + projectionLength * heading.headingX,
      y: box.y + projectionLength * heading.headingY,
    };
  });

  const rotateHandlePosition = createMemo(() => {
    const box = boxPosition();
    const rotation = (boxRotation() * Math.PI) / 180;
    return {
      x: box.x + Math.cos(rotation) * 40,
      y: box.y + Math.sin(rotation) * 40,
    };
  });

  return (
    <div class="mx-auto w-[800px]">
      <pre class="flex h-[18rem] flex-col rounded-none border border-black">
        <div class="my-auto">
          <p class="font-mono text-[1.5rem] text-wrap">
            angle error: <b class="text-blue-600">{calculateAngle()}°</b>
          </p>
          <p class="font-mono text-[1.5rem] text-wrap">
            <em>cosine of</em> angle error (lateral error multiplier):{" "}
            <b class="text-blue-600">
              {(Math.cos(arc().angleDifference) * 100).toFixed(0)}%
            </b>
          </p>
          <ul class="mx-auto text-sm text-muted-foreground">
            <li>Drag the (green) robot to translate it, or drag its handle to rotate it</li>
            <li>Drag the target (red) point</li>
            <li>Watch as the angle and its cosine change in real time</li>
          </ul>
        </div>
      </pre>

      <svg
        ref={svgRef}
        width="800"
        height="600"
        class="mx-auto my-auto cursor-crosshair border border-black"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <line
          x1={boxHeading().startX}
          y1={boxHeading().startY}
          x2={boxHeading().endX}
          y2={boxHeading().endY}
          stroke="#d1d5db"
          stroke-width="4"
          stroke-dasharray="10,10"
        />
        <line
          x1={boxPosition().x}
          y1={boxPosition().y}
          x2={projectionPoint().x}
          y2={projectionPoint().y}
          stroke="#1e40af"
          stroke-width="4"
        />
        <line
          x1={projectionPoint().x}
          y1={projectionPoint().y}
          x2={otherPoint().x}
          y2={otherPoint().y}
          stroke="#3b82f6"
          stroke-width="2"
        />
        <line
          x1={boxPosition().x}
          y1={boxPosition().y}
          x2={otherPoint().x}
          y2={otherPoint().y}
          stroke="#3b82f6"
          stroke-width="2"
        />
        <line
          x1={pointLine().startX}
          y1={pointLine().startY}
          x2={pointLine().endX}
          y2={pointLine().endY}
          stroke="#d1d5db"
          stroke-width="4"
          stroke-dasharray="10,10"
        />
        <path d={arc().path} fill="none" stroke="#3b82f6" stroke-width="6" />
        <polygon
          points={`${boxPosition().x},${boxPosition().y} ${projectionPoint().x},${projectionPoint().y} ${otherPoint().x},${otherPoint().y}`}
          fill="transparent"
          stroke="#5591f2"
          stroke-width="3"
        />
        <line
          x1={boxPosition().x}
          y1={boxPosition().y}
          x2={projectionPoint().x}
          y2={projectionPoint().y}
          stroke="#1e40af"
          stroke-width="5"
        />
        <g
          transform={`translate(${boxPosition().x}, ${boxPosition().y}) rotate(${boxRotation()})`}
          onMouseDown={handleBoxMouseDown}
          class="cursor-move"
        >
          <rect
            x="-40"
            y="-40"
            width="80"
            height="80"
            fill="#86efac"
            stroke="#22c55e"
            stroke-width="4"
            rx="8"
          />
        </g>
        <g
          transform={`translate(${rotateHandlePosition().x}, ${rotateHandlePosition().y})`}
          onMouseDown={handleRotateMouseDown}
          class="cursor-grab active:cursor-grabbing"
        >
          <g transform="translate(-16 -16)">
            <RotateCw size={32} class="fill-white text-blue-500" />
          </g>
        </g>
        <circle
          cx={otherPoint().x}
          cy={otherPoint().y}
          r="16"
          fill="#ef4444"
          stroke="#dc2626"
          stroke-width="4"
          class="cursor-move"
          onMouseDown={handlePointMouseDown}
        />
      </svg>
    </div>
  );
}

const calcState = {
  version: 11,
  randomSeed: "920ef7bdec58cc407472d29d5ed1d1db",
  graph: {
    viewport: {
      xmin: -9.725400457665888,
      ymin: -48.55331807780324,
      xmax: 10.274599542334112,
      ymax: 50.24668192219677,
    },
    __v12ViewportLatexStash: {
      xmin: "-9.725400457665888",
      xmax: "10.274599542334112",
      ymin: "-48.55331807780324",
      ymax: "50.24668192219677",
    },
  },
  expressions: {
    list: [
      {
        type: "text",
        id: "9",
        text: "(pose.y - target.y) * -sin(initialAngle) <=\n                              (pose.x - target.x) * cos(initialAngle) + params.earlyExitRange",
      },
      {
        type: "expression",
        id: "1",
        color: "#c74440",
        latex: "p=\\left(0,0\\right)",
        showLabel: true,
        label: "Robot",
        dragMode: "NONE",
      },
      {
        type: "expression",
        id: "2",
        color: "#2d70b3",
        latex: "t=\\left(-1.6,4.28\\right)",
        showLabel: true,
        label: "Target point",
      },
      {
        type: "expression",
        id: "4",
        color: "#6042a6",
        latex:
          "a_{1}=\\operatorname{mod}\\left(\\arctan\\left(\\frac{t.y-p.y}{t.x-p.x}\\right)+\\pi,\\pi\\right)",
      },
      {
        type: "expression",
        id: "6",
        color: "#c74440",
        latex: "a=a_{1}\\cdot\\left\\{t.y<p.y:-1,1\\right\\}",
      },
      {
        type: "expression",
        id: "3",
        color: "#388c46",
        latex: "r=\\left\\{0<\\theta<a\\right\\}",
        polarDomain: {
          min: "",
          max: "\\left\\{a\\le0:0,a\\right\\}",
        },
      },
      {
        type: "expression",
        id: "7",
        color: "#388c46",
        latex: "r=1\\left\\{a<0\\right\\}",
        polarDomain: {
          min: "-\\pi-a",
          max: "0",
        },
      },
      {
        type: "expression",
        id: "8",
        color: "#2d70b3",
        latex:
          "y=\\tan\\left(a_{1}\\right)x\\left\\{y>\\left\\{t.y<p.y:-\\infty,0\\right\\}\\right\\}\\left\\{y<\\left\\{t.y<p.y:0,\\infty\\right\\}\\right\\}",
        lineStyle: "DASHED",
      },
      {
        type: "expression",
        id: "10",
        color: "#6042a6",
        latex:
          "\\left\\{t.y<p.y:1,-1\\right\\}\\left(y-t.y\\right)\\sin\\left(a_{1}\\right)\\le\\left\\{t.y<p.y:-1,1\\right\\}\\left(x-t.x\\right)\\cos\\left(a_{1}\\right)+1",
      },
    ],
  },
  includeFunctionParametersInRandomSeed: true,
  doNotMigrateMovablePointStyle: true,
};

export function DesmosSide() {
  let ref!: HTMLDivElement;
  let calculator:
    | {
        destroy?: () => void;
        setState?: (state: typeof calcState) => void;
      }
    | undefined;
  let cancelled = false;

  onMount(() => {
    void loadDesmosScript()
      .then(() => {
        if (cancelled || !window.Desmos) {
          return;
        }

        calculator = window.Desmos.GraphingCalculator(ref, {
          expressions: false,
          lockViewport: true,
        });
        calculator.setState?.(calcState);
      })
      .catch(() => {
        // Ignore script load errors; the container will stay empty.
      });
  });

  onCleanup(() => {
    cancelled = true;
    calculator?.destroy?.();
  });

  return (
    <div
      ref={ref}
      style={{
        width: "600px",
        height: "400px",
        "margin-left": "auto",
        "margin-right": "auto",
      }}
    />
  );
}
