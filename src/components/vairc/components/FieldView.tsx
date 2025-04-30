// aadishv.github.io/src/components/vairc/components/FieldView.tsx
import React, { useEffect, useRef, useState } from "react";
import type { DetectionPayload, Pose } from "../Layout";

// Field View Panel Component
const FieldView: React.FC<{latestDetections: DetectionPayload | null, serverConfig: string}> = ({latestDetections}) => {
  // References for drawing
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastInterpolationTimeRef = useRef<number | null>(null);

  // Field constants
  const FIELD_SIZE_INCHES = 144; // 12ft x 12ft
  const ROBOT_SIZE_INCHES = 18;  // 18in x 18in
  const INTERPOLATION_DURATION = 250; // Duration in ms for smooth animation

  // Store previous pose for interpolation
  const [prevPose, setPrevPose] = useState<Pose | null>(null);
  const [animatedPose, setAnimatedPose] = useState<Pose | null>(null);

  // Effect to handle pose updates and setup interpolation
  useEffect(() => {
    if (latestDetections?.pose) {
      // When a new pose arrives, store previous and update animated pose
      setPrevPose(prev => {
        // If no previous pose, use the current pose directly
        if (!prev) {
          setAnimatedPose(latestDetections.pose);
          return latestDetections.pose;
        }

        // If the pose has changed drastically, don't interpolate
        const distanceMoved = Math.sqrt(
          Math.pow(prev.x - latestDetections.pose.x, 2) +
          Math.pow(prev.y - latestDetections.pose.y, 2)
        );
        const rotationDelta = Math.abs(
          Math.atan2(Math.sin(latestDetections.pose.theta - prev.theta), Math.cos(latestDetections.pose.theta - prev.theta))
        );

        // If too much change, jump directly to new pose without interpolation
        if (distanceMoved > 30 || rotationDelta > Math.PI / 2) {
          setAnimatedPose(latestDetections.pose);
          return latestDetections.pose;
        }

        // Otherwise, start interpolation from current animated position
        lastInterpolationTimeRef.current = performance.now();
        return animatedPose || prev;
      });
    }
  }, [latestDetections?.pose]);

  // Animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;

    if (!canvas || !image || !container) return;

    // Function to draw the field and robot
    const drawField = (pose: Pose | null) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get the actual displayed dimensions of the image
      const imageRect = image.getBoundingClientRect();

      // Set canvas size to exactly match the image's displayed dimensions
      canvas.width = imageRect.width;
      canvas.height = imageRect.height;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If we have pose data, draw the robot
      if (pose) {
        const { x, y, theta } = pose;

        // Calculate the center of the field in canvas coordinates
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Calculate pixels per inch, ensuring we use a square field area
        // This ensures our coordinate system remains perfectly square
        const fieldDimension = Math.min(canvas.width, canvas.height);
        const pixelsPerInch = fieldDimension / FIELD_SIZE_INCHES;

        // Calculate the offset to center the square field in the possibly rectangular canvas
        const fieldOffsetX = (canvas.width - fieldDimension) / 2;
        const fieldOffsetY = (canvas.height - fieldDimension) / 2;

        // Fixed robot size in pixels - keep it reasonable regardless of field size
        const robotSizePixels = Math.max(20, ROBOT_SIZE_INCHES * pixelsPerInch);

        // Convert robot position from field coordinates to canvas pixels
        // Include the field offset to ensure the robot appears within the square field area
        // Field coordinates: (0,0) is center, +x is right, +y is up
        // Canvas coordinates: (0,0) is top-left, +x is right, +y is down
        const robotX = centerX + (x * pixelsPerInch);
        const robotY = centerY - (y * pixelsPerInch); // Negate Y as field coordinates go up but canvas goes down

        // Calculate the corners of a perfect square
        const halfSize = robotSizePixels / 2;

        // Define the corners of a square centered at the origin (before rotation)
        const corners = [
          { x: -halfSize, y: -halfSize }, // Top-left
          { x: halfSize, y: -halfSize },  // Top-right
          { x: halfSize, y: halfSize },   // Bottom-right
          { x: -halfSize, y: halfSize }   // Bottom-left
        ];

        // Rotate each corner by theta and translate to robot position
        const rotatedCorners = corners.map(corner => {
          // Apply rotation matrix
          const cosTheta = Math.cos(theta);
          const sinTheta = Math.sin(theta);

          const rotatedX = corner.x * cosTheta - corner.y * sinTheta;
          const rotatedY = corner.x * sinTheta + corner.y * cosTheta;

          // Translate to robot position
          return {
            x: robotX + rotatedX,
            y: robotY + rotatedY
          };
        });

        // Draw the robot as a filled polygon
        ctx.fillStyle = 'rgba(128, 128, 128, 0.7)';
        ctx.beginPath();
        ctx.moveTo(rotatedCorners[0].x, rotatedCorners[0].y);
        for (let i = 1; i < rotatedCorners.length; i++) {
          ctx.lineTo(rotatedCorners[i].x, rotatedCorners[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rotatedCorners[0].x, rotatedCorners[0].y);
        for (let i = 1; i < rotatedCorners.length; i++) {
          ctx.lineTo(rotatedCorners[i].x, rotatedCorners[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Calculate the position for the direction indicator triangle
        // Triangle at the front of the robot (between corners 0 and 1)
        const frontMiddleX = (rotatedCorners[0].x + rotatedCorners[1].x) / 2;
        const frontMiddleY = (rotatedCorners[0].y + rotatedCorners[1].y) / 2;

        // Direction of the front edge (perpendicular to it, pointing outward)
        const frontDirX = -(rotatedCorners[1].y - rotatedCorners[0].y) / Math.sqrt(Math.pow(rotatedCorners[1].x - rotatedCorners[0].x, 2) + Math.pow(rotatedCorners[1].y - rotatedCorners[0].y, 2));
        const frontDirY = (rotatedCorners[1].x - rotatedCorners[0].x) / Math.sqrt(Math.pow(rotatedCorners[1].x - rotatedCorners[0].x, 2) + Math.pow(rotatedCorners[1].y - rotatedCorners[0].y, 2));

        // Calculate the three points of the direction indicator triangle
        const trianglePoint1 = {
          x: frontMiddleX + frontDirX * (halfSize * 0.4),
          y: frontMiddleY + frontDirY * (halfSize * 0.4)
        };

        const trianglePoint2 = {
          x: frontMiddleX - frontDirY * (halfSize * 0.3),
          y: frontMiddleY + frontDirX * (halfSize * 0.3)
        };

        const trianglePoint3 = {
          x: frontMiddleX + frontDirY * (halfSize * 0.3),
          y: frontMiddleY - frontDirX * (halfSize * 0.3)
        };

        // Draw direction indicator triangle
        ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
        ctx.beginPath();
        ctx.moveTo(trianglePoint1.x, trianglePoint1.y);
        ctx.lineTo(trianglePoint2.x, trianglePoint2.y);
        ctx.lineTo(trianglePoint3.x, trianglePoint3.y);
        ctx.closePath();
        ctx.fill();
      }
    };

    // Animation loop function
    const animateAndDraw = (timestamp: number) => {
      if (!prevPose || !latestDetections?.pose) {
        // If no pose data, just draw with current animatedPose (or null)
        drawField(animatedPose);
        animationFrameRef.current = requestAnimationFrame(animateAndDraw);
        return;
      }

      const startTime = lastInterpolationTimeRef.current;
      if (!startTime) {
        // No interpolation in progress
        drawField(animatedPose || latestDetections.pose);
        animationFrameRef.current = requestAnimationFrame(animateAndDraw);
        return;
      }

      // Calculate interpolation progress
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / INTERPOLATION_DURATION);

      // Linear interpolation between previous and target pose
      const targetPose = latestDetections.pose;

      // Calculate the shortest angle for theta interpolation
      // This avoids issues when crossing the 0/2π boundary
      let deltaTheta = targetPose.theta - prevPose.theta;
      deltaTheta = Math.atan2(Math.sin(deltaTheta), Math.cos(deltaTheta)); // Get shortest angle

      // Interpolate position and orientation
      const interpolatedPose = {
        x: prevPose.x + (targetPose.x - prevPose.x) * progress,
        y: prevPose.y + (targetPose.y - prevPose.y) * progress,
        theta: prevPose.theta + deltaTheta * progress
      };

      // Update the animated pose state
      setAnimatedPose(interpolatedPose);

      // Draw with interpolated pose
      drawField(interpolatedPose);

      // Continue animation if not finished
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateAndDraw);
      } else {
        // Animation complete, reset interpolation time
        lastInterpolationTimeRef.current = null;
        animationFrameRef.current = requestAnimationFrame(animateAndDraw);
      }
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateAndDraw);

    // Draw when image loads
    image.onload = () => {
      if (animatedPose) drawField(animatedPose);
    };

    // Draw immediately if image is already loaded
    if (image.complete && animatedPose) {
      drawField(animatedPose);
    }

    // Redraw on window resize
    const handleResize = debounce(() => {
      if (animatedPose) drawField(animatedPose);
    }, 100);

    window.addEventListener('resize', handleResize);

    // Cleanup animation loop on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prevPose, latestDetections, animatedPose, FIELD_SIZE_INCHES, ROBOT_SIZE_INCHES, INTERPOLATION_DURATION]);

  // Simple debounce function for resize
  const debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-100 p-2 border-b border-gray-200 text-sm font-medium text-gray-700 flex justify-between items-center">
        <span>VEX High Stakes Field</span>
      </div>
      <div className="flex-1 relative overflow-hidden bg-white" ref={containerRef}>
        {/* Field image */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            {/* Image container */}
            <img
              ref={imageRef}
              src={"/vairc/field.jpeg"}
              alt="VEX Field View"
              className="block object-contain"
            />

            {/* Canvas overlay with same dimensions as image */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldView;
