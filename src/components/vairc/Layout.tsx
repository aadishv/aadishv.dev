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
  fx?: number;
  fy?: number;
  fz?: number;
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
  /** Optional flag to ignore mixed content errors (for testing) */
  debugIgnoreMixedContent?: boolean;
}

// SSE Hook for detection data
export function useSSEDetections(
    server: string,
    endpoint: string = "events",
    initialValue: DetectionPayload | null = null,
    debugIgnoreMixedContent: boolean = false
): { detections: DetectionPayload | null, connectionError: boolean } {
    const [detections, setDetections] = useState<DetectionPayload | null>(initialValue);
    const [connectionError, setConnectionError] = useState<boolean>(false);

    useEffect(() => {
        // Skip connection if server is not provided
        if (!server) {
            console.warn('Server address is not provided. Skipping connection.');
            setDetections(initialValue);
            return;
        }

        // Always use HTTP protocol since the Flask server is HTTP-only
        // This will work in HTTP contexts, and we'll handle the error in HTTPS contexts
        const url = `http://${server}/${endpoint}`;
        console.log(`Attempting to connect to SSE endpoint: ${url}`);

        let eventSource: EventSource;

        try {
            eventSource = new EventSource(url);
        } catch (error) {
            console.error('Failed to create EventSource:', error);
            setConnectionError(true);
            setDetections(initialValue);
            return;
        }

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
        eventSource.onerror = (error) => {
            console.error('SSE connection error', error);
            setConnectionError(true);
            setDetections(initialValue);
            eventSource.close();
        };

        // Cleanup function
        return () => {
            console.log(`Closing SSE connection to: ${url}`);
            eventSource.close();
        };
    }, [server, endpoint, initialValue]);

    return { detections, connectionError };
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
const Header: React.FC<{
  onToggleSettings: () => void,
  connectionError: boolean,
  serverConfig: string
}> = ({ onToggleSettings, connectionError, serverConfig }) => {
  // Function to reload the page
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="vairc-header bg-white">
      <div className="vairc-header-logos h-20">
        <img
          src="https://yt3.googleusercontent.com/yxrKYF6JiG2fHeHk7UBWZ3H14E72kyqzOF60vKaDhc7a2stmH9zA9SJSYGDXP6RZEizQRahIhrc=s160-c-k-c0x00ffffff-no-rj"
          alt="Paradigm Logo"
          className="logo"
          style={{mixBlendMode: 'multiply'}}
        />
        <img src="https://recf.org/wp-content/uploads/2024/10/VEX-AI-Robotics-Competition-Element-Sidebar.png" alt="VAIRC Logo" className="logo" />
      </div>

      {/* Connection error warning */}
      {connectionError && (
        <div className="flex-grow mx-4 flex items-center">
          <div className="border border-gray-300 bg-gray-50 p-2 flex items-center justify-between w-full rounded-md">
            <div className="flex items-center">
              <div className="mr-2 text-gray-700 flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">
                Connection error: Cannot connect to server at <code className="bg-gray-100 px-1 py-0.5 rounded border border-gray-200 text-xs font-mono">{serverConfig}</code>
              </span>
            </div>
            <button
              onClick={handleReload}
              className="primer-button primer-button-small ml-4 flex items-center"
            >
              <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload
            </button>
          </div>
        </div>
      )}

      <button
        className="primer-button !text-2xl"
        onClick={onToggleSettings}
      >
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
export const Layout: React.FC<LayoutProps> = ({
  windowComponents,
  windowTitles = {},
  debugIgnoreMixedContent = false
}) => {
  const [currentNode, setCurrentNode] = useState<MosaicNode<number> | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverConfig, setServerConfig] = useState<string>(() => {
    // Try to load server config from localStorage
    const savedConfig = localStorage.getItem(SERVER_CONFIG_KEY);
    return savedConfig || DEFAULT_SERVER;
  });

  const { detections: latestDetections, connectionError } = useSSEDetections(
    serverConfig,
    "events",
    null,
    debugIgnoreMixedContent
  );

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

  // Mixed content warning component
  const MixedContentWarning = () => {
    // Only show in https contexts when there's a connection error
    const isHttps = window.location.protocol === 'https:';
    if (!connectionError || !isHttps || debugIgnoreMixedContent) return null;

    // Function to handle switching to HTTP version
    const switchToHttp = () => {
      const currentUrl = window.location.href;
      const httpUrl = currentUrl.replace('https://', 'http://');
      window.location.href = httpUrl;
    };

    // Function to reload the page
    const reloadPage = () => {
      window.location.reload();
    };

    return (
      <div className="bg-amber-50 border-amber-200 border-b px-4 py-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-amber-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-amber-800">
              <strong className="font-bold">Mixed Content Warning:</strong> Cannot connect to HTTP server from HTTPS page.
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Your browser is blocking connections to the HTTP server because this page is loaded over HTTPS. To fix this:
            </p>
            <div className="mt-2 mb-1">
              <ul className="ml-4 list-disc text-sm text-amber-700 space-y-1">
                <li>Open this page with HTTP instead of HTTPS</li>
                <li>In Chrome, click the shield icon in the address bar and allow insecure content</li>
                <li>Set up a secure proxy for your server</li>
              </ul>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={switchToHttp}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded text-sm font-medium"
              >
                Switch to HTTP Version
              </button>
              <button
                onClick={reloadPage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vairc-layout">
      <Header
        onToggleSettings={toggleSettings}
        connectionError={connectionError}
        serverConfig={serverConfig}
      />

      {/* Show mixed content warning if needed */}
      <MixedContentWarning />

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
