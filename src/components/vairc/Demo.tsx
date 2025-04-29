// aadishv.github.io/src/components/vairc/Demo.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Classes,
  Dialog,
  Switch
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';

type WindowComponentMap = Record<number, React.ComponentType<any>>;
type WindowTitleMap = Record<number, string>;

import {
  getLeaves,
  Mosaic,
  MosaicWindow,
  MosaicZeroState,
  createBalancedTreeFromLeaves,
  type MosaicNode,
  type MosaicBranch
} from 'react-mosaic-component';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './example.less';

export const THEMES = {
  ['Blueprint']: 'mosaic-blueprint-theme',
  ['Blueprint Dark']: classNames('mosaic-blueprint-theme'),
};

const EMPTY_ARRAY: any[] = [];

const MAX_WINDOWS = 4;

interface ExampleWindowProps {
  count: number;
  path: MosaicBranch[];
  component: React.ComponentType<any>;
  title: string;
  latestDetections: any[];
}

const ExampleWindow = ({ count, path, component: WindowComponent, title, latestDetections }: ExampleWindowProps) => {
  return (
    <MosaicWindow<number>
      path={path}
      title={title}
      additionalControls={EMPTY_ARRAY}
    >
      <WindowComponent latestDetections={latestDetections} />
    </MosaicWindow>
  );
};

interface SettingsDialogProps {
  isOpen: boolean;
  windowVisibility: Record<number, boolean>;
  windowTitles?: WindowTitleMap;
  onClose: () => void;
  onToggleWindow: (windowId: number) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  windowVisibility,
  windowTitles = {},
  onClose,
  onToggleWindow
}) => {
  return (
    <Dialog
      title="Window Settings"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className={Classes.DIALOG_BODY}>
        <h3>Toggle Window Visibility</h3>
        <div className="window-switches">
          {Array.from({ length: MAX_WINDOWS }).map((_, index) => {
            const windowId = index + 1;
            const title = windowTitles[windowId] ?? `Window ${windowId}`;
            const shouldRender = windowId <= MAX_WINDOWS && windowTitles[windowId];

            return shouldRender ? (
              <Switch
                key={windowId}
                checked={windowVisibility[windowId] || false}
                label={title}
                onChange={() => onToggleWindow(windowId)}
                large
              />
            ) : null;
          })}
        </div>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
};

interface NavbarProps {
  onOpenSettings: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  return (
    <div className={classNames("my-2 flex")}>
      <div className={classNames(Classes.NAVBAR_GROUP)}>
        <img src="https://team315.org/imgs/00001.png" alt="Paradigm Logo" className="h-full -ml-5 border-r-2" />
        <img src="https://content.vexrobotics.com/images/vexai/VAIRC-Logo-4C.png" alt="VAIRC Logo" className="h-full px-5 border-r-2" />
      </div>
      <div className={classNames(Classes.NAVBAR_GROUP)}>
        <Button
          className={classNames(Classes.BUTTON, Classes.MINIMAL, "!text-3xl font-mono !text-header2 focus:outline-none")}
          text="⚙️ Settings"
          onClick={onOpenSettings}
        />
      </div>
    </div>
  );
};

interface ExampleAppProps {
  windowComponents: WindowComponentMap;
  windowTitles?: WindowTitleMap;
}

export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
  depth?: number;
}

export interface DetectionPayload {
  stuff: Detection[];
}

export function useSSEDetections(
    url: string,
    initialValue: DetectionPayload | null = null
): DetectionPayload | null {
    const [detections, setDetections] = useState<DetectionPayload | null>(initialValue);

    useEffect(() => {
        // Ensure URL is provided before attempting connection
        if (!url) {
            console.warn('SSE URL is not provided. Skipping connection.');
            setDetections(initialValue); // Reset to initial if URL becomes invalid
            return;
        }

        console.log(`Connecting to SSE endpoint: ${url}`);
        const eventSource = new EventSource(url);

        // Handler for incoming messages
        eventSource.onmessage = (event: MessageEvent) => {
            try {
                const data: DetectionPayload = JSON.parse(event.data);
                // TODO: Add more robust validation here if needed
                //       (e.g., check if 'stuff' is an array)
                setDetections(data);
            } catch (error) {
                console.error('Failed to parse SSE data:', event.data, error);
                // Optional: Decide how to handle parse errors. Resetting or keeping old state?
                // setDetections(initialValue); // Reset to initial on error
            }
        };

        // Handler for connection errors
        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            // The browser might attempt to reconnect automatically.
            // You might want to close manually or update state to show an error.
            setDetections(initialValue); // Reset to initial on connection error
            eventSource.close(); // Close the connection on error to prevent constant retries shown in console
        };

        // Cleanup function: Close the connection when the component unmounts
        // or when the URL changes.
        return () => {
            console.log(`Closing SSE connection to: ${url}`);
            eventSource.close();
        };

    }, [url, initialValue]); // Re-run effect if the URL or initialValue changes

    return detections;
}

export const MosaicApp: React.FC<ExampleAppProps> = ({ windowComponents, windowTitles = {} }) => {
  const [currentNode, setCurrentNode] = useState<MosaicNode<number> | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const latestDetections = useSSEDetections("http://192.168.86.98:5000/events", null);

  const initialVisibility: Record<number, boolean> = {};
  const componentKeys = Object.keys(windowComponents).map(Number).sort((a, b) => a - b);

  for (let i = 1; i <= MAX_WINDOWS; i++) {
      initialVisibility[i] = false;
  }

  let visibleCount = 0;
  for (const id of componentKeys) {
    if (id <= MAX_WINDOWS && visibleCount < 2) {
       initialVisibility[id] = true;
       visibleCount++;
    }
  }

  const [windowVisibility, setWindowVisibility] = useState<Record<number, boolean>>(initialVisibility);

  const updateNodeStructure = useCallback(() => {
    const visibleWindows = Object.entries(windowVisibility)
      .filter(([_, isVisible]) => isVisible)
      .map(([idStr]) => parseInt(idStr))
      .filter(id => id in windowComponents);


    if (visibleWindows.length === 0) {
      setCurrentNode(null);
      return;
    }

    const newNode = createBalancedTreeFromLeaves(visibleWindows);
    setCurrentNode(newNode);
  }, [windowVisibility, windowComponents]);

  const toggleWindowVisibility = useCallback((windowId: number) => {
    if (windowId in windowComponents) {
        setWindowVisibility(prevState => ({
        ...prevState,
        [windowId]: !prevState[windowId]
        }));
    }
  }, [windowComponents]);

  const toggleSettings = useCallback(() => {
    setIsSettingsOpen(prevState => !prevState);
  }, []);

  const createNewWindow = useCallback(() => {
    const availableComponentIds = Object.keys(windowComponents).map(Number);
    for (const id of availableComponentIds.sort((a, b) => a - b)) {
       if (id <= MAX_WINDOWS && !windowVisibility[id]) {
         toggleWindowVisibility(id);
         return id;
       }
    }
    return null;
  }, [windowVisibility, toggleWindowVisibility, windowComponents]);

  useEffect(() => {
    updateNodeStructure();
  }, [windowVisibility, updateNodeStructure]);

  return (
    <React.StrictMode>
      <div className="react-mosaic-example-app">
        <Navbar onOpenSettings={toggleSettings} />

        <SettingsDialog
          isOpen={isSettingsOpen}
          windowVisibility={windowVisibility}
          windowTitles={windowTitles}
          onClose={toggleSettings}
          onToggleWindow={toggleWindowVisibility}
        />

        <Mosaic<number>
          renderTile={(id, path) => {
            const WindowComponent = windowComponents[id];
            const title = windowTitles[id] ?? `Window ${id}`;
            return WindowComponent ? (
              <ExampleWindow
                count={id}
                path={path}
                component={WindowComponent}
                title={title}
                latestDetections={latestDetections}
              />
            ) : (
              <MosaicWindow path={path} title={`Unknown Window ${id}`}>
                <div>Component not found for ID {id}</div>
              </MosaicWindow>
            );
          }}
          zeroStateView={<MosaicZeroState createNode={createNewWindow} />}
          value={currentNode}
          onChange={setCurrentNode}
          className={THEMES['Blueprint']}
          blueprintNamespace="bp4"
        />
      </div>
    </React.StrictMode>
  );
};
