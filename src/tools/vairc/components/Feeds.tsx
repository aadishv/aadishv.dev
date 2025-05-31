// aadishv.github.io/src/components/vairc/components/Feeds.tsx
import React, { useRef, useEffect, useState } from "react";
import DetectionCanvas from "./DetectionCanvas";
import { type DetectionPayload } from "../Layout";
import { ensureValidPayload } from "../utils/validation";

interface FeedProps {
  latestDetections: DetectionPayload;
  serverConfig: string;
  replayData?: {
    colorImageUrl?: string;
    depthImageUrl?: string;
  };
}

// Define our window components for the layout
export const ColorFeed: React.FC<FeedProps> = ({latestDetections, serverConfig, replayData}) => {
  console.log('ColorFeed render:', { replayData: !!replayData, serverConfig });
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <DetectionCanvas
        detections={ensureValidPayload(latestDetections)}
        serverConfig={serverConfig}
        imageUrl={replayData ? replayData.colorImageUrl : undefined}
        imageEndpoint={replayData ? undefined : "color.mjpg"}
        originalImageWidth={640}
        originalImageHeight={480}
        className="h-full"
        hideWhenNoUrl={false}
      />
    </div>
  );
};

export const DepthFeed: React.FC<FeedProps> = ({latestDetections, serverConfig, replayData}) => {
  console.log('DepthFeed render:', { replayData: !!replayData, serverConfig });
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <DetectionCanvas
        detections={ensureValidPayload(latestDetections)}
        serverConfig={serverConfig}
        imageUrl={replayData ? replayData.depthImageUrl : undefined}
        imageEndpoint={replayData ? undefined : "depth.mjpg"}
        originalImageWidth={640}
        originalImageHeight={480}
        className="h-full"
        hideWhenNoUrl={false}
      />
    </div>
  );
};

