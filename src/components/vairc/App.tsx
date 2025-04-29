// aadishv.github.io/src/components/vairc/App.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MosaicApp, type DetectionPayload, type Detection } from "./Demo";

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './app.css';

interface DetectionCanvasProps {
  /** The object containing detection data, or null if none */
  detections: DetectionPayload | null;
  /** URL for the MJPEG image stream */
  imageUrl: string | null; // Allow null to hide image/canvas
  /** The native width of the image source used for detections */
  originalImageWidth: number;
  /** The native height of the image source used for detections */
  originalImageHeight: number;
  /** Optional Tailwind classes for the container */
  className?: string;
  /** Optional flag to hide the component if no image URL is provided */
  hideWhenNoUrl?: boolean;
}

const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  detections,
  imageUrl,
  originalImageWidth,
  originalImageHeight,
  className = '',
  hideWhenNoUrl = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  // State to hold the actual displayed dimensions of the image
  const [displayedDims, setDisplayedDims] = useState<{ width: number; height: number } | null>(null);

  // --- Helper Function to get Color ---
  const getDetectionColor = (className: string): string => {
    switch (className?.toLowerCase()) {
      case 'blue':
        return '#0000FF'; // Blue
      case 'goal':
        return '#FFD700'; // Gold
      case 'red':
        return '#FF0000'; // Red
      case 'bot':
        return '#000000'; // Black
      default:
        return '#FF00FF'; // Default Magenta for unknown
    }
  };

  // --- Debounced Resize Handler ---
  // Simple debounce to avoid spamming dimension updates on resize
  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      return (...args: Parameters<F>): void => {
          if (timeoutId !== null) {
              clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => func(...args), waitFor);
      };
  };

  // --- Function to Update Displayed Dimensions ---
  const updateDimensions = useCallback(() => {
    if (imageRef.current) {
      // Use clientWidth/clientHeight as they reflect the rendered size
      const width = imageRef.current.clientWidth;
      const height = imageRef.current.clientHeight;
      if (width > 0 && height > 0) {
           // Only update if dimensions actually changed to prevent infinite loops
          if (!displayedDims || displayedDims.width !== width || displayedDims.height !== height) {
             setDisplayedDims({ width, height });
          }
      } else {
          // Reset if image is not visible or has no size
          if (displayedDims !== null) {
              setDisplayedDims(null);
          }
      }
    } else {
        if (displayedDims !== null) {
            setDisplayedDims(null);
        }
    }
  }, [displayedDims]); // Include displayedDims to prevent loop if state update logic depends on previous state

  // Debounced version for resize events
  const debouncedUpdateDimensions = useCallback(debounce(updateDimensions, 150), [updateDimensions]);


  // --- Effect for Image Loading and Resizing ---
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    // Update dimensions when image loads
    imageElement.addEventListener('load', updateDimensions);
    // Add resize listener to handle container/window resizing
    window.addEventListener('resize', debouncedUpdateDimensions);
    // Initial check in case image is already loaded/cached
    updateDimensions();


    // Cleanup listeners
    return () => {
      imageElement.removeEventListener('load', updateDimensions);
      window.removeEventListener('resize', debouncedUpdateDimensions);
    };
  }, [updateDimensions, debouncedUpdateDimensions]); // Re-run if update functions change


  // --- Effect for Drawing on Canvas ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    // Ensure we have everything needed to draw
    if (!canvas || !ctx || !detections || !displayedDims || !originalImageWidth || !originalImageHeight || originalImageWidth <= 0 || originalImageHeight <= 0) {
        // Clear canvas if conditions aren't met
        if (canvas && ctx && displayedDims) {
            // Set canvas drawing size explicitly
             canvas.width = displayedDims.width;
             canvas.height = displayedDims.height;
             ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else if (canvas && ctx) {
            // Fallback clear if dimensions unknown
             ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
    }

    // Set canvas drawing buffer size MUST match displayed size for 1:1 pixel mapping
    canvas.width = displayedDims.width;
    canvas.height = displayedDims.height;

    // --- Scaling ---
    const scaleX = displayedDims.width / originalImageWidth;
    const scaleY = displayedDims.height / originalImageHeight;

    // --- Clear Canvas ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Drawing Settings ---
    ctx.lineWidth = 2;
    ctx.font = "16px \"Zed Mono\", monospace";
    ctx.textBaseline = "bottom";

    // --- Draw each detection ---
    detections.stuff.forEach((d: Detection) => {
      // Calculate scaled top-left corner (x0, y0) and dimensions
      const boxWidth = d.width * scaleX;
      const boxHeight = d.height * scaleY;
      // Adjust for center coordinates coming from payload
      const x0 = (d.x - d.width / 2) * scaleX;
      const y0 = (d.y - d.height / 2) * scaleY;

      const color = getDetectionColor(d.class);

      // Draw rectangle
      ctx.strokeStyle = color;
      ctx.strokeRect(x0, y0, boxWidth, boxHeight);
      ctx.strokeStyle = "white";
      ctx.strokeRect(x0+2, y0+2, boxWidth-4, boxHeight-4);

      // Prepare label text
      let label = `${d.class} ${d.confidence.toFixed(2)}`;
      if (d.depth !== undefined && d.depth !== null && d.depth >= 0) {
        label += ` d=${d.depth.toFixed(2)}m`;
      }

      // Calculate text dimensions and position
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      // Estimate height (consistent way needed, depends on font)
      const textHeight = 17; // Approx height for 12px font
      const padding = 4;

      // Position text above box, handle top edge collision
      let textBgY = y0 - textHeight - padding; // Y position for background rectangle top
      let textY = y0 - padding / 2; // Y position for text baseline

      // If text goes off the top edge, position it below the box instead
      if (textBgY < 0) {
        textBgY = y0 + boxHeight + padding / 2;
        textY = textBgY + textHeight + padding / 2;
      }

      const textX = x0 + padding / 2 - 2;
      const textBgX = x0 - 2;

      // Draw background rectangle for text
      ctx.fillStyle = color;
      ctx.fillRect(
        textBgX,
        textBgY,
        textWidth + padding,
        textHeight + padding
      );

      // Draw label text
      ctx.fillStyle = '#FFFFFF'; // White text
      ctx.fillText(label, textX, textY);
    });

  }, [detections, displayedDims, originalImageWidth, originalImageHeight]); // Re-draw when these change


  // --- Render Logic ---
  // Hide component completely if no imageUrl is provided and hideWhenNoUrl is true
  if (!imageUrl && hideWhenNoUrl) {
      return null;
  }

  return (
    // Relative container for absolute positioning of canvas
    <div className={`relative w-full overflow-hidden ${className}`}>
      {imageUrl ? (
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Live stream"
          // Tailwind classes for the image - adjust as needed
          className="block w-full h-auto bg-gray-200" // Use h-auto for intrinsic aspect ratio
          // Add error handling if needed: onError={() => console.error('Failed to load image stream')}
        />
      ) : (
        // Optional: Placeholder when imageUrl is null but component shouldn't be hidden
        <div className="w-full aspect-video bg-gray-300 flex items-center justify-center text-gray-500">
            No Image Stream
        </div>
      )}
      {/* Canvas overlays the image */}
      <canvas
        ref={canvasRef}
        // Tailwind classes for the canvas
        className="absolute top-0 left-0 w-full h-full pointer-events-none" // Ensure it covers the image exactly
      />
    </div>
  );
};

// Define some example components for the windows
const ColorFeed: React.FC<{latestDetections: DetectionPayload}> = ({latestDetections}) => (
  <DetectionCanvas
    detections={latestDetections}
    imageUrl="http://192.168.86.98:5000/color.mjpg"
    originalImageWidth={640}
    originalImageHeight={480}
  />
);

const DepthFeed: React.FC<{latestDetections: DetectionPayload}> = ({latestDetections}) => (
  <DetectionCanvas
    detections={latestDetections}
    imageUrl="http://192.168.86.98:5000/depth.mjpg"
    originalImageWidth={640}
    originalImageHeight={480}
  />
);
const ComponentThree: React.FC = () => (
  <div style={{ padding: '20px', background: 'lightgoldenrodyellow' }}>
    <h2>Component Three</h2>
    <p>Another component.</p>
  </div>
);

const ComponentFour: React.FC = () => (
  <div style={{ padding: '20px', background: 'lightgoldenrodyellow' }}>
    <h2>Component Four</h2>
    <p>Another component.</p>
  </div>
);


// Create the map of window IDs to components
const windowComponents = {
  1: ColorFeed,
  2: DepthFeed,
  3: ComponentThree,
  4: ComponentFour,
  // Add more components as needed, up to MAX_WINDOWS defined in Demo.tsx
};

// Create the map of window IDs to titles
const windowTitles = {
  1: "Color feed",
  2: "Depth feed",
  3: "Input Area",
  4: "Info Panel"
  // Ensure titles match the component IDs
};

export default function VAIRCApp() {
  console.log("VAIRCApp loaded")
  // Pass the components and titles maps to ExampleApp
  return <MosaicApp windowComponents={windowComponents} windowTitles={windowTitles} />;
}
