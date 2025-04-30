// aadishv.github.io/src/components/vairc/components/DetectionCanvas.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SERVER, type DetectionPayload, type Detection } from "../Layout";
import { getDetectionColor } from "../utils/colors";

interface DetectionCanvasProps {
  /** The object containing detection data, or null if none */
  detections: DetectionPayload | null;
  /** URL for the MJPEG image stream */
  imageUrl?: string | null; // Allow null to hide image/canvas
  /** Optional server configuration (host:port) */
  serverConfig?: string;
  /** Optional endpoint for the image stream */
  imageEndpoint?: string;
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
  imageUrl = null,
  serverConfig = DEFAULT_SERVER,
  imageEndpoint,
  originalImageWidth,
  originalImageHeight,
  className = '',
  hideWhenNoUrl = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  // State to hold the actual displayed dimensions of the image
  const [displayedDims, setDisplayedDims] = useState<{ width: number; height: number; left?: number; top?: number } | null>(null);
  // State to control whether bounding boxes should be shown (with localStorage persistence)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(() => {
    // Try to load preference from localStorage
    const savedPreference = localStorage.getItem('vairc-show-bounding-boxes');
    return savedPreference === null ? true : savedPreference === 'true';
  });

  // Construct the final image URL from server configuration if not explicitly provided
  const effectiveImageUrl = imageUrl || (imageEndpoint ? `http://${serverConfig}/${imageEndpoint}` : null);

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
      const img = imageRef.current;
      const container = img.parentElement;
      if (!container) return;

      // Get container dimensions
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate dimensions that maintain aspect ratio
      const imgNaturalRatio = img.naturalWidth / img.naturalHeight;
      const containerRatio = containerWidth / containerHeight;

      let width, height;

      // Calculate the actual displayed image size accounting for object-contain
      if (imgNaturalRatio > containerRatio) {
        // Image is wider than container (relative to their heights)
        width = containerWidth;
        height = containerWidth / imgNaturalRatio;
      } else {
        // Image is taller than container (relative to their widths)
        height = containerHeight;
        width = containerHeight * imgNaturalRatio;
      }

      // Calculate position for centering
      const left = (containerWidth - width) / 2;
      const top = (containerHeight - height) / 2;

      if (width > 0 && height > 0) {
        // Only update if dimensions actually changed
        if (!displayedDims ||
            displayedDims.width !== width ||
            displayedDims.height !== height) {
          setDisplayedDims({
            width,
            height,
            left,
            top
          });
        }
      } else {
        // Reset if image has no size
        if (displayedDims !== null) {
          setDisplayedDims(null);
        }
      }
    } else {
      if (displayedDims !== null) {
        setDisplayedDims(null);
      }
    }
  }, [displayedDims]); // Include displayedDims to prevent loop

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
    // Observer to detect changes in the image size
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(imageElement);

    // Initial check in case image is already loaded/cached
    updateDimensions();

    // Cleanup listeners
    return () => {
      imageElement.removeEventListener('load', updateDimensions);
      window.removeEventListener('resize', debouncedUpdateDimensions);
      resizeObserver.disconnect();
    };
  }, [updateDimensions, debouncedUpdateDimensions]); // Re-run if update functions change


  // --- Effect for Drawing on Canvas ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    // Ensure we have everything needed to draw
    if (!canvas || !ctx || !detections || !displayedDims || !originalImageWidth || !originalImageHeight || originalImageWidth <= 0 || originalImageHeight <= 0) {
        // Clear canvas if conditions aren't met
        if (canvas && ctx) {
            // Clear the entire canvas
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
    }

    // Set canvas size to match container
    const containerWidth = canvas.offsetWidth;
    const containerHeight = canvas.offsetHeight;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear the entire canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If bounding boxes are disabled, don't draw anything
    if (!showBoundingBoxes) {
      return;
    }

    // Position and size based on calculated display dimensions
    const { width, height, left = 0, top = 0 } = displayedDims;

    // --- Scaling ---
    const scaleX = width / originalImageWidth;
    const scaleY = height / originalImageHeight;

    // --- Drawing Settings ---
    ctx.lineWidth = 2;
    ctx.font = "16px \"Zed Mono\", monospace";
    ctx.textBaseline = "bottom";

    // --- Draw each detection ---
    detections.stuff.forEach((d: Detection) => {
      // Calculate scaled top-left corner (x0, y0) and dimensions
      const boxWidth = d.width * scaleX;
      const boxHeight = d.height * scaleY;
      // Adjust for center coordinates coming from payload and add offset for letterboxing
      const x0 = (d.x - d.width / 2) * scaleX + (left || 0);
      const y0 = (d.y - d.height / 2) * scaleY + (top || 0);

      const color = getDetectionColor(d.class);

      // Draw rectangle
      ctx.strokeStyle = color;
      ctx.strokeRect(x0, y0, boxWidth, boxHeight);
      ctx.strokeStyle = "white";
      ctx.strokeRect(x0+1, y0+1, boxWidth-2, boxHeight-2);

      // Prepare label text
      let label = `${d.class} ${d.confidence.toFixed(2)}`;
      if (d.depth !== undefined && d.depth !== null && d.depth >= 0) {
        label += ` d=${d.depth.toFixed(2)}m`;
      }

      // Calculate text dimensions and position
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      // Estimate height (consistent way needed, depends on font)
      const textHeight = 12; // Approx height for 12px font
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

  }, [detections, displayedDims, originalImageWidth, originalImageHeight, showBoundingBoxes]); // Re-draw when these change


  // --- Render Logic ---
  // Hide component completely if no effectiveImageUrl is provided and hideWhenNoUrl is true
  if (!effectiveImageUrl && hideWhenNoUrl) {
      return null;
  }

  return (
    // Relative container for absolute positioning of canvas
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        {effectiveImageUrl ? (
          <img
            ref={imageRef}
            src={effectiveImageUrl}
            alt="Live stream"
            className="object-contain w-full h-full max-h-full"
            onLoad={() => updateDimensions()}
            // Add error handling if needed
            onError={() => console.error('Failed to load image stream')}
          />
        ) : (
          // Optional: Placeholder when imageUrl is null but component shouldn't be hidden
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
            No Image Stream
          </div>
        )}
      </div>

      {/* Canvas overlays the entire container */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Bounding box toggle control */}
      <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-75 rounded border border-gray-200 px-2 py-1 flex items-center shadow-sm">
        <label className="flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showBoundingBoxes}
            onChange={() => {
              const newValue = !showBoundingBoxes;
              setShowBoundingBoxes(newValue);
              // Save preference to localStorage
              try {
                localStorage.setItem('vairc-show-bounding-boxes', String(newValue));
              } catch (error) {
                console.warn('Failed to save bounding box preference to localStorage:', error);
              }
            }}
            className="sr-only"
          />
          <span className={`inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${showBoundingBoxes ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${showBoundingBoxes ? 'translate-x-5' : 'translate-x-1'}`}></span>
          </span>
          <span className="ml-2 text-xs font-medium text-gray-800">
            {showBoundingBoxes ? 'Boxes On' : 'Boxes Off'}
          </span>
        </label>
      </div>
    </div>
  );
};

export default DetectionCanvas;