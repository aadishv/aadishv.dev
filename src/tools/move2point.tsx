import { createSignal, createMemo, onMount, onCleanup } from "solid-js";

const RotateCw = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x="-16" y="-16" class="text-blue-500 fill-white">
    <path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>
  </svg>
);

interface Point { x: number; y: number; }

export function CosineViz() {
  const [boxPosition, setBoxPosition] = createSignal<Point>({ x: 300, y: 400 });
  const [boxRotation, setBoxRotation] = createSignal(0);
  const [otherPoint, setOtherPoint] = createSignal<Point>({ x: 500, y: 200 });
  const [isDraggingBox, setIsDraggingBox] = createSignal(false);
  const [isDraggingPoint, setIsDraggingPoint] = createSignal(false);
  const [isRotating, setIsRotating] = createSignal(false);
  const [dragOffset, setDragOffset] = createSignal<Point>({ x: 0, y: 0 });

  let svgRef: SVGSVGElement | undefined;

  const getMousePosition = (e: MouseEvent) => {
    if (!svgRef) return { x: 0, y: 0 };
    const rect = svgRef.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const normalizeAngle = (angle: number) => {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  };

  const calculateAngle = createMemo(() => {
    const dx = otherPoint().x - boxPosition().x;
    const dy = otherPoint().y - boxPosition().y;
    const angleToPoint = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalizedBoxRotation = normalizeAngle(boxRotation());
    const normalizedAngleToPoint = normalizeAngle(angleToPoint);
    let angleDifference = normalizedAngleToPoint - normalizedBoxRotation;
    if (angleDifference < 0) angleDifference += 360;
    if (angleDifference > 180) angleDifference = 360 - angleDifference;
    return Math.round(angleDifference * 10) / 10;
  });

  const handleBoxMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const mousePos = getMousePosition(e);
    setDragOffset({ x: mousePos.x - boxPosition().x, y: mousePos.y - boxPosition().y });
    setIsDraggingBox(true);
  };

  const handlePointMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const mousePos = getMousePosition(e);
    setDragOffset({ x: mousePos.x - otherPoint().x, y: mousePos.y - otherPoint().y });
    setIsDraggingPoint(true);
  };

  const handleRotateMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const mousePos = getMousePosition(e);
    if (isDraggingBox()) {
      setBoxPosition({ x: mousePos.x - dragOffset().x, y: mousePos.y - dragOffset().y });
    } else if (isDraggingPoint()) {
      setOtherPoint({ x: mousePos.x - dragOffset().x, y: mousePos.y - dragOffset().y });
    } else if (isRotating()) {
      const dx = mousePos.x - boxPosition().x;
      const dy = mousePos.y - boxPosition().y;
      setBoxRotation((Math.atan2(dy, dx) * 180) / Math.PI);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingBox(false);
    setIsDraggingPoint(false);
    setIsRotating(false);
  };

  const lineLength = 20000;

  const boxHeadingEndX = () => boxPosition().x + Math.cos((boxRotation() * Math.PI) / 180) * lineLength;
  const boxHeadingEndY = () => boxPosition().y + Math.sin((boxRotation() * Math.PI) / 180) * lineLength;
  const boxHeadingStartX = () => boxPosition().x - Math.cos((boxRotation() * Math.PI) / 180) * lineLength;
  const boxHeadingStartY = () => boxPosition().y - Math.sin((boxRotation() * Math.PI) / 180) * lineLength;

  const distanceToPoint = () => Math.sqrt(Math.pow(otherPoint().x - boxPosition().x, 2) + Math.pow(otherPoint().y - boxPosition().y, 2));
  const pointDirX = () => (otherPoint().x - boxPosition().x) / distanceToPoint();
  const pointDirY = () => (otherPoint().y - boxPosition().y) / distanceToPoint();
  const pointLineEndX = () => boxPosition().x + pointDirX() * lineLength;
  const pointLineEndY = () => boxPosition().y + pointDirY() * lineLength;
  const pointLineStartX = () => boxPosition().x - pointDirX() * lineLength;
  const pointLineStartY = () => boxPosition().y - pointDirY() * lineLength;

  const arcRadius = 140;
  const startAngle = () => (boxRotation() * Math.PI) / 180;
  const endAngle = () => Math.atan2(otherPoint().y - boxPosition().y, otherPoint().x - boxPosition().x);
  const arcStartX = () => boxPosition().x + Math.cos(startAngle()) * arcRadius;
  const arcStartY = () => boxPosition().y + Math.sin(startAngle()) * arcRadius;
  const arcEndX = () => boxPosition().x + Math.cos(endAngle()) * arcRadius;
  const arcEndY = () => boxPosition().y + Math.sin(endAngle()) * arcRadius;
  const angleDiff = createMemo(() => {
    let diff = endAngle() - startAngle();
    if (diff < 0) diff += 2 * Math.PI;
    return diff;
  });
  const arcPath = () => {
    const diff = angleDiff();
    return diff > Math.PI
      ? `M ${arcEndX()} ${arcEndY()} A ${arcRadius} ${arcRadius} 0 0 1 ${arcStartX()} ${arcStartY()}`
      : `M ${arcStartX()} ${arcStartY()} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX()} ${arcEndY()}`;
  };
  const finalAngleDiff = () => {
    const diff = angleDiff();
    return diff > Math.PI ? 2 * Math.PI - diff : diff;
  };

  const projectionLength = () => distanceToPoint() * Math.cos((calculateAngle() * Math.PI) / 180);
  const headingX = () => Math.cos((boxRotation() * Math.PI) / 180);
  const headingY = () => Math.sin((boxRotation() * Math.PI) / 180);
  const projectionPoint = () => ({
    x: boxPosition().x + projectionLength() * headingX(),
    y: boxPosition().y + projectionLength() * headingY(),
  });

  return (
    <div class="w-[800px] mx-auto">
      <pre class="border-1 border-black rounded-none h-[18rem] flex flex-col">
        <div class="my-auto">
          <p class="font-mono text-wrap text-[1.5rem]">
            angle error: <b class="text-blue-600">{calculateAngle()}°</b>
          </p>
          <p class="font-mono text-wrap text-[1.5rem]">
            <em>cosine of</em> angle error (lateral error multiplier):{" "}
            <b class="text-blue-600">{(Math.cos(finalAngleDiff()) * 100).toFixed(0)}%</b>
          </p>
          <ul class="text-sm text-muted-foreground mx-auto">
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
        class="cursor-crosshair border-black border mx-auto my-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <line x1={boxHeadingStartX()} y1={boxHeadingStartY()} x2={boxHeadingEndX()} y2={boxHeadingEndY()} stroke="#d1d5db" stroke-width="4" stroke-dasharray="10,10" />
        <line x1={boxPosition().x} y1={boxPosition().y} x2={projectionPoint().x} y2={projectionPoint().y} stroke="#1e40af" stroke-width="4" />
        <line x1={projectionPoint().x} y1={projectionPoint().y} x2={otherPoint().x} y2={otherPoint().y} stroke="#3b82f6" stroke-width="2" />
        <line x1={boxPosition().x} y1={boxPosition().y} x2={otherPoint().x} y2={otherPoint().y} stroke="#3b82f6" stroke-width="2" />
        <line x1={pointLineStartX()} y1={pointLineStartY()} x2={pointLineEndX()} y2={pointLineEndY()} stroke="#d1d5db" stroke-width="4" stroke-dasharray="10,10" />
        <path d={arcPath()} fill="none" stroke="#3b82f6" stroke-width="6" />
        <polygon points={`${boxPosition().x},${boxPosition().y} ${projectionPoint().x},${projectionPoint().y} ${otherPoint().x},${otherPoint().y}`} fill="transparent" stroke="#5591f2" stroke-width="3" />
        <line x1={boxPosition().x} y1={boxPosition().y} x2={projectionPoint().x} y2={projectionPoint().y} stroke="#1e40af" stroke-width="5" />
        <g transform={`translate(${boxPosition().x}, ${boxPosition().y}) rotate(${boxRotation()})`} onMouseDown={handleBoxMouseDown} class="cursor-move">
          <rect x="-40" y="-40" width="80" height="80" fill="#86efac" stroke="#22c55e" stroke-width="4" rx="8" />
        </g>
        <g transform={`translate(${boxPosition().x + Math.cos((boxRotation() * Math.PI) / 180) * 40}, ${boxPosition().y + Math.sin((boxRotation() * Math.PI) / 180) * 40})`} onMouseDown={handleRotateMouseDown} class="cursor-grab">
          <RotateCw />
        </g>
        <circle cx={otherPoint().x} cy={otherPoint().y} r="16" fill="#ef4444" stroke="#dc2626" stroke-width="4" class="cursor-move" onMouseDown={handlePointMouseDown} />
      </svg>
    </div>
  );
}

const calcState = {
  version: 11,
  randomSeed: "920ef7bdec58cc407472d29d5ed1d1db",
  graph: { viewport: { xmin: -9.725400457665888, ymin: -48.55331807780324, xmax: 10.274599542334112, ymax: 50.24668192219677 }, __v12ViewportLatexStash: { xmin: "-9.725400457665888", xmax: "10.274599542334112", ymin: "-48.55331807780324", ymax: "50.24668192219677" } },
  expressions: { list: [{ type: "text", id: "9", text: "(pose.y - target.y) * -sin(initialAngle) <=\n                              (pose.x - target.x) * cos(initialAngle) + params.earlyExitRange" }, { type: "expression", id: "1", color: "#c74440", latex: "p=\\left(0,0\\right)", showLabel: true, label: "Robot", dragMode: "NONE" }, { type: "expression", id: "2", color: "#2d70b3", latex: "t=\\left(-1.6,4.28\\right)", showLabel: true, label: "Target point" }, { type: "expression", id: "4", color: "#6042a6", latex: "a_{1}=\\operatorname{mod}\\left(\\arctan\\left(\\frac{t.y-p.y}{t.x-p.x}\\right)+\\pi,\\pi\\right)" }, { type: "expression", id: "6", color: "#c74440", latex: "a=a_{1}\\cdot\\left\\{t.y<p.y:-1,1\\right\\}" }, { type: "expression", id: "3", color: "#388c46", latex: "r=\\left\\{0<\\theta<a\\right\\}", polarDomain: { min: "", max: "\\left\\{a\\le0:0,a\\right\\}" } }, { type: "expression", id: "7", color: "#388c46", latex: "r=1\\left\\{a<0\\right\\}", polarDomain: { min: "-\\pi-a", max: "0" } }, { type: "expression", id: "8", color: "#2d70b3", latex: "y=\\tan\\left(a_{1}\\right)x\\left\\{y>\\left\\{t.y<p.y:-\\infty,0\\right\\}\\right\\}\\left\\{y<\\left\\{t.y<p.y:0,\\infty\\right\\}\\right\\}", lineStyle: "DASHED" }, { type: "expression", id: "10", color: "#6042a6", latex: "\\left\\{t.y<p.y:1,-1\\right\\}\\left(y-t.y\\right)\\sin\\left(a_{1}\\right)\\le\\left\\{t.y<p.y:-1,1\\right\\}\\left(x-t.x\\right)\\cos\\left(a_{1}\\right)+1" }] },
  includeFunctionParametersInRandomSeed: true,
  doNotMigrateMovablePointStyle: true,
};

export function DesmosSide() {
  let ref: HTMLDivElement | undefined;
  let calculator: any;

  onMount(() => {
    if (!ref) return;
    const init = () => {
      const Desmos = (window as any).Desmos;
      if (!Desmos) return;
      calculator = Desmos.GraphingCalculator(ref, { expressions: false, lockViewport: true });
      calculator.setState(calcState);
    };
    if ((window as any).Desmos) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
      script.onload = init;
      document.head.appendChild(script);
    }
  });

  onCleanup(() => {
    if (calculator?.destroy) calculator.destroy();
  });

  return <div ref={ref} style={{ width: "600px", height: "400px", "margin-left": "auto", "margin-right": "auto" }} />;
}
