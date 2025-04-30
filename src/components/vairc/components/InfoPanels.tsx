// aadishv.github.io/src/components/vairc/components/InfoPanels.tsx
import React from "react";
import type { DetectionPayload } from "../Layout";

export const JsonRenderer: React.FC<{latestDetections: DetectionPayload, serverConfig: string}> = ({latestDetections}) => (
  <div className="flex flex-col p-4 overflow-auto h-full">
   <pre className="text-sm">{JSON.stringify(latestDetections, null, 2)}</pre>
  </div>
);

export const InfoPanel: React.FC<{serverConfig: string}> = ({serverConfig}) => (
  <div className="flex flex-col p-4">
    <h3 className="text-lg font-medium mb-2">VAIRC Vision System</h3>
    <p className="mb-4">Real-time object detection and tracking interface.</p>
    <ul className="list-disc ml-5 space-y-2">
      <li>Color Feed: RGB camera view with object detections</li>
      <li>Depth Feed: Depth map camera view</li>
      <li>Raw JSON: Live detection data in JSON format</li>
      <li>Field View: Top-down view of the field</li>
    </ul>
    <div className="mt-4 pt-4 border-t border-gray-200">
      <p className="text-sm font-medium">Connected to server:</p>
      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{serverConfig}</code>
    </div>
  </div>
);
