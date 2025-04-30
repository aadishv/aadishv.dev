// aadishv.github.io/src/components/vairc/Layout.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Mosaic,
  MosaicWindow,
  MosaicZeroState,
  createBalancedTreeFromLeaves,
  type MosaicNode,
  type MosaicBranch
} from 'react-mosaic-component';

import 'react-mosaic-component/react-mosaic-component.css';
import './app.css';

// Default server configuration
export const DEFAULT_SERVER = "192.168.86.98:5000";

// Interfaces
type WindowComponentMap = Record<number, React.ComponentType<any>>;
type WindowTitleMap = Record<number, string>;

export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
  depth?: number;
}

export interface Pose {
  x: number;
  y: number;
  theta: number;
}

export interface JetsonStats {
  cpu_temp: number;
  gpu_temp: number;
  uptime: number;
}

export interface DetectionPayload {
  stuff: Detection[];
  pose?: Pose;
  flag?: string;
  jetson?: JetsonStats;
}

interface WindowProps {
  path: MosaicBranch[];
  component: React.ComponentType<any>;
  title: string;
  latestDetections: DetectionPayload | null;
  serverConfig: string;
}

interface LayoutProps {
  windowComponents: WindowComponentMap;
  windowTitles?: WindowTitleMap;
}

// SSE Hook for detection data
export function useSSEDetections(
    server: string,
    endpoint: string = "events",
    initialValue: DetectionPayload | null = null
): DetectionPayload | null {
    const [detections, setDetections] = useState<DetectionPayload | null>(initialValue);

    useEffect(() => {
        // Skip connection if server is not provided
        if (!server) {
            console.warn('Server address is not provided. Skipping connection.');
            setDetections(initialValue);
            return;
        }

        const url = `http://${server}/${endpoint}`;
        console.log(`Connecting to SSE endpoint: ${url}`);
        const eventSource = new EventSource(url);

        // Handle incoming messages
        eventSource.onmessage = (event: MessageEvent) => {
            try {
                const data: DetectionPayload = JSON.parse(event.data);
                setDetections(data);
            } catch (error) {
                console.error('Failed to parse SSE data:', event.data, error);
            }
        };

        // Handle connection errors
        eventSource.onerror = () => {
            console.error('SSE connection error');
            setDetections(initialValue);
            eventSource.close();
        };

        // Cleanup function
        return () => {
            console.log(`Closing SSE connection to: ${url}`);
            eventSource.close();
        };
    }, [server, endpoint, initialValue]);

    return detections;
}

// Window Component
const Window = ({ path, component: WindowComponent, title, latestDetections, serverConfig }: WindowProps) => {
  return (
    <MosaicWindow<number>
      path={path}
      title={title}
      additionalControls={[]}
    >
      <WindowComponent latestDetections={latestDetections} serverConfig={serverConfig} />
    </MosaicWindow>
  );
};

// Header Component
const Header: React.FC<{ onToggleSettings: () => void }> = ({ onToggleSettings }) => {
  return (
    <div className="vairc-header">
      <div className="vairc-header-logos">
        <img src="https://team315.org/imgs/00001.png" alt="Paradigm Logo" className="logo" />
        <img src="https://content.vexrobotics.com/images/vexai/VAIRC-Logo-4C.png" alt="VAIRC Logo" className="logo" />
      </div>
      <button className="primer-button" onClick={onToggleSettings}>
        ⚙️ Settings
      </button>
    </div>
  );
};

// Settings Modal
interface SettingsModalProps {
  isOpen: boolean;
  windowVisibility: Record<number, boolean>;
  windowTitles?: WindowTitleMap;
  serverConfig: string;
  onClose: () => void;
  onToggle: (windowId: number) => void;
  onServerConfigChange: (config: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  windowVisibility,
  windowTitles = {},
  serverConfig,
  onClose,
  onToggle,
  onServerConfigChange
}) => {
  if (!isOpen) return null;

  const windowCount = Object.keys(windowVisibility).length;
  const [tempServerConfig, setTempServerConfig] = useState(serverConfig);

  // Handle server config input change
  const handleServerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempServerConfig(e.target.value);
  };

  // Apply server config when user clicks "Apply"
  const handleApplyServerConfig = () => {
    onServerConfigChange(tempServerConfig);
  };

  // Reset to current value
  const handleResetServerConfig = () => {
    setTempServerConfig(serverConfig);
  };

  // Initialize tempServerConfig when the modal opens or serverConfig changes
  useEffect(() => {
    setTempServerConfig(serverConfig);
  }, [serverConfig, isOpen]);

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button className="settings-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="settings-modal-body">
          {/* Server Configuration Section */}
          <div className="settings-section">
            <h3>Server Configuration</h3>
            <div className="server-config-input">
              <label htmlFor="server-config">Server Host:Port</label>
              <div className="server-input-group">
                <input
                  type="text"
                  id="server-config"
                  value={tempServerConfig}
                  onChange={handleServerInputChange}
                  placeholder="host:port"
                  className="server-input"
                />
                <button
                  className="primer-button primer-button-small"
                  onClick={handleApplyServerConfig}
                >
                  Apply
                </button>
                <button
                  className="primer-button primer-button-small"
                  onClick={handleResetServerConfig}
                >
                  Reset
                </button>
              </div>
              <div className="server-config-hint">
                Example: 192.168.86.98:5000
              </div>
            </div>
          </div>

          {/* Window Visibility Section */}
          <div className="settings-section">
            <h3>Toggle Window Visibility</h3>
            <div className="window-switches">
              {Array.from({ length: windowCount }).map((_, index) => {
                const windowId = index + 1;
                const title = windowTitles[windowId] ?? `Window ${windowId}`;
                const shouldRender = windowTitles[windowId] !== undefined;

                return shouldRender ? (
                  <label key={windowId} className="primer-toggle">
                    <input
                      type="checkbox"
                      checked={windowVisibility[windowId] || false}
                      onChange={() => onToggle(windowId)}
                    />
                    <span className="primer-toggle-track">
                      <span className="primer-toggle-thumb"></span>
                    </span>
                    <span className="primer-toggle-label">{title}</span>
                  </label>
                ) : null;
              })}
            </div>
          </div>
        </div>
        <div className="settings-modal-footer">
          <button className="primer-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Constants for localStorage keys
const LAYOUT_STORAGE_KEY = 'vairc-mosaic-layout';
const VISIBILITY_STORAGE_KEY = 'vairc-window-visibility';
const SERVER_CONFIG_KEY = 'vairc-server-config';

// Main Layout Component
export const Layout: React.FC<LayoutProps> = ({ windowComponents, windowTitles = {} }) => {
  const [currentNode, setCurrentNode] = useState<MosaicNode<number> | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverConfig, setServerConfig] = useState<string>(() => {
    // Try to load server config from localStorage
    const savedConfig = localStorage.getItem(SERVER_CONFIG_KEY);
    return savedConfig || DEFAULT_SERVER;
  });

  const latestDetections = useSSEDetections(serverConfig, "events", null);

  const [windowVisibility, setWindowVisibility] = useState<Record<number, boolean>>(() => {
    // Try to load visibility state from localStorage
    try {
      const savedVisibility = localStorage.getItem(VISIBILITY_STORAGE_KEY);
      if (savedVisibility) {
        const parsed = JSON.parse(savedVisibility);
        // Validate the parsed data
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load window visibility from localStorage:', error);
    }

    // Fall back to default initialization if no saved state or error
    const initialVisibility: Record<number, boolean> = {};
    const componentKeys = Object.keys(windowComponents).map(Number).sort((a, b) => a - b);

    // Initialize all windows to hidden
    for (let i = 1; i <= componentKeys.length; i++) {
        initialVisibility[i] = false;
    }

    // Show the first window by default
    let visibleCount = 0;
    for (const id of componentKeys) {
      if (visibleCount < 1) {
         initialVisibility[id] = true;
         visibleCount++;
      }
    }
    return initialVisibility;
  });

  // Try to restore layout from localStorage on component mount
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) {
        const layout = JSON.parse(savedLayout);
        if (layout) {
          setCurrentNode(layout);
          console.log('Restored layout from localStorage');
        }
      }
    } catch (error) {
      console.warn('Failed to load layout from localStorage:', error);
    }
  }, []);

  // Update the mosaic layout when window visibility changes
  const updateNodeStructure = useCallback(() => {
    const visibleWindows = Object.entries(windowVisibility)
      .filter(([, isVisible]) => isVisible)
      .map(([idStr]) => parseInt(idStr))
      .filter(id => windowComponents[id]);

    const newNode = visibleWindows.length === 0 ? null : createBalancedTreeFromLeaves(visibleWindows);
    setCurrentNode(newNode);

    // Save visibility state to localStorage
    try {
      localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(windowVisibility));
    } catch (error) {
      console.warn('Failed to save window visibility to localStorage:', error);
    }
  }, [windowVisibility, windowComponents]);

  // Toggle window visibility
  const toggleWindowVisibility = useCallback((windowId: number) => {
    if (windowComponents[windowId]) {
      setWindowVisibility(prevState => {
        const newState = {
          ...prevState,
          [windowId]: !prevState[windowId]
        };

        // Save to localStorage immediately
        try {
          localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(newState));
        } catch (error) {
          console.warn('Failed to save window visibility to localStorage:', error);
        }

        return newState;
      });
    }
  }, [windowComponents]);

  // Toggle settings modal
  const toggleSettings = useCallback(() => {
    setIsSettingsOpen(open => !open);
  }, []);

  // Update server configuration
  const handleServerConfigChange = useCallback((newConfig: string) => {
    setServerConfig(newConfig);

    // Save server config to localStorage
    try {
      localStorage.setItem(SERVER_CONFIG_KEY, newConfig);
    } catch (error) {
      console.warn('Failed to save server config to localStorage:', error);
    }

    console.log(`Server configuration updated to: ${newConfig}`);
  }, []);

  // Create a new window from the zero state
  const createNewWindow = useCallback(() => {
    const availableComponentIds = Object.keys(windowComponents).map(Number);
    for (const id of availableComponentIds.sort((a, b) => a - b)) {
      if (!windowVisibility[id]) {
        toggleWindowVisibility(id);
        return id;
      }
    }
    return null;
  }, [windowVisibility, toggleWindowVisibility, windowComponents]);

  // Save layout to localStorage when it changes
  const handleLayoutChange = useCallback((newNode: MosaicNode<number> | null) => {
    setCurrentNode(newNode);

    // Save to localStorage
    try {
      if (newNode) {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newNode));
      } else {
        // If layout is null, remove from localStorage
        localStorage.removeItem(LAYOUT_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save layout to localStorage:', error);
    }
  }, []);

  // Update node structure when visibility changes
  useEffect(() => {
    updateNodeStructure();
  }, [windowVisibility, updateNodeStructure]);

  return (
    <div className="vairc-layout">
      <Header onToggleSettings={toggleSettings} />

      <SettingsModal
        isOpen={isSettingsOpen}
        windowVisibility={windowVisibility}
        windowTitles={windowTitles}
        serverConfig={serverConfig}
        onClose={toggleSettings}
        onToggle={toggleWindowVisibility}
        onServerConfigChange={handleServerConfigChange}
      />

      <div className="vairc-mosaic-container">
        <Mosaic<number>
          renderTile={(id, path) => {
            const WindowComponent = windowComponents[id];
            const title = windowTitles[id] ?? `Window ${id}`;
            return WindowComponent ? (
              <Window
                path={path}
                component={WindowComponent}
                title={title}
                latestDetections={latestDetections}
                serverConfig={serverConfig}
              />
            ) : (
              <MosaicWindow path={path} title={`Unknown Window ${id}`}>
                <div>Component not found for ID {id}</div>
              </MosaicWindow>
            );
          }}
          zeroStateView={<MosaicZeroState createNode={createNewWindow} />}
          value={currentNode}
          onChange={handleLayoutChange}
        />
      </div>
    </div>
  );
};
