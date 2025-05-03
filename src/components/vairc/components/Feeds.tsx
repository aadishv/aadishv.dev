// aadishv.github.io/src/components/vairc/components/Feeds.tsx
import React from "react";
import DetectionCanvas from "./DetectionCanvas";
import { type DetectionPayload } from "../Layout";

// Define our window components for the layout
export const ColorFeed: React.FC<{latestDetections: DetectionPayload, serverConfig: string}> = ({latestDetections, serverConfig}) => (
  <div className="w-full h-full flex items-center justify-center">
    <DetectionCanvas
      detections={latestDetections}
      serverConfig={serverConfig}
      imageEndpoint="color.mjpg"
      originalImageWidth={640}
      originalImageHeight={480}
      className="h-full"
    />
  </div>
);

export const DepthFeed: React.FC<{latestDetections: DetectionPayload, serverConfig: string}> = ({latestDetections, serverConfig}) => (
  <div className="w-full h-full flex items-center justify-center">
    <DetectionCanvas
      detections={latestDetections}
      serverConfig={serverConfig}
      imageEndpoint="depth.mjpg"
      originalImageWidth={640}
      originalImageHeight={480}
      className="h-full"
    />
  </div>
);