/* eslint-disable @typescript-eslint/no-unused-vars */
import Peer, { DataConnection, PeerConnectOption } from "peerjs";

interface WibuStreamConfig {
  host: string;
  port: number;
  debug?: boolean;
  path?: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  onConnectionStateChange?: (state: "disconnected" | "connecting" | "connected") => void;
}

interface WibuStreamInstance {
  getId: () => string | null;
  getState: () => string;
  destroy: () => Promise<void>;
  connect: (remotePeerId: string, options?: PeerConnectOption) => DataConnection | null;
  onConnection: (callback: (conn: DataConnection) => void) => void;
}

export function createWibuStream(user: string, config: WibuStreamConfig): WibuStreamInstance {
  if (!user) throw new Error("User parameter is required");

  let peerInstance: Peer | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  let isDestroyed = false;
  let connectionState: "disconnected" | "connecting" | "connected" = "disconnected";

  const fullConfig = {
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
    path: "/wibu-stream",
    ...config
  };

  const setConnectionState = (state: "disconnected" | "connecting" | "connected"): void => {
    connectionState = state;
    fullConfig.onConnectionStateChange?.(state);
  };

  const generateUserId = (): string => {
    const randomId = Math.random().toString(36).substring(2);
    return `wibu_${user}_${randomId}`.replace(/\s+/g, '_');
  };

  const cleanup = async (): Promise<void> => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (peerInstance) {
      peerInstance.removeAllListeners();
      peerInstance.destroy();
      peerInstance = null;
    }
  };

  const handleConnectionError = async (error: Error): Promise<void> => {
    console.error("PeerJS error:", error);
    await attemptReconnect();
  };

  const handleDisconnect = async (): Promise<void> => {
    console.log("Peer disconnected");
    setConnectionState("disconnected");
    await attemptReconnect();
  };

  const handleClose = async (): Promise<void> => {
    console.log("Peer connection closed");
    setConnectionState("disconnected");
    await attemptReconnect();
  };

  const setupEventListeners = (): void => {
    if (!peerInstance) return;

    peerInstance.on("open", (id) => {
      console.log("Peer connected with ID:", id);
      setConnectionState("connected");
      reconnectAttempts = 0;
    });

    peerInstance.on("error", handleConnectionError);
    peerInstance.on("disconnected", handleDisconnect);
    peerInstance.on("close", handleClose);
  };

  const attemptReconnect = async (): Promise<void> => {
    if (isDestroyed || connectionState === "connecting") {
      return;
    }

    if (reconnectAttempts >= (fullConfig.maxReconnectAttempts || 5)) {
      console.error("Max reconnection attempts reached");
      await destroy();
      return;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(async () => {
      try {
        reconnectAttempts++;
        console.log(`Reconnection attempt ${reconnectAttempts}`);
        await init();
      } catch (error) {
        console.error("Reconnection failed:", error);
      }
    }, fullConfig.reconnectDelay || 3000);
  };

  const init = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (isDestroyed) {
      throw new Error("WibuStream instance has been destroyed");
    }

    await cleanup();

    try {
      setConnectionState("connecting");
      
      if (!peerInstance) {
        const storageKey = `wibu-stream-user-${user}`;
        let localUser = localStorage.getItem(storageKey);
        
        if (!localUser) {
          localUser = generateUserId();
          localStorage.setItem(storageKey, localUser);
        }

        peerInstance = new Peer(localUser, {
          host: fullConfig.host,
          port: fullConfig.port,
          secure: true,
          debug: fullConfig.debug ? 3 : 0,
          path: fullConfig.path,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun.cloudflare.com:3478" }
            ]
          }
        });
      }

      setupEventListeners();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        const handleOpen = (id: string) => {
          clearTimeout(timeout);
          setConnectionState("connected");
          reconnectAttempts = 0;
          resolve();
        };

        const handleError = (error: Error) => {
          clearTimeout(timeout);
          peerInstance?.off('open', handleOpen);
          reject(error);
        };

        peerInstance?.once("open", handleOpen);
        peerInstance?.once("error", handleError);
      });
    } catch (error) {
      console.error("Failed to initialize peer:", error);
      throw error;
    }
  };

  const destroy = async (): Promise<void> => {
    isDestroyed = true;
    await cleanup();
    setConnectionState("disconnected");
    console.log("WibuStream instance destroyed");
  };

  const connect = (remotePeerId: string, options?: PeerConnectOption): DataConnection | null => {
    if (!peerInstance || connectionState !== "connected") {
      console.error("Cannot connect: Peer instance not ready");
      return null;
    }
    
    try {
      const connection = peerInstance.connect(remotePeerId, {
        serialization: "json",
        reliable: true,
        ...options
      });
      
      connection.on('error', (error) => {
        console.error('Connection error:', error);
        handleConnectionError(error);
      });
      
      return connection;
    } catch (error) {
      console.error('Failed to create connection:', error);
      return null;
    }
  };

  const onConnection = (callback: (conn: DataConnection) => void): void => {
    if (!peerInstance) {
      console.error("Cannot listen for connections: Peer instance not ready");
      return;
    }
    peerInstance.on("connection", callback);
  };

  // Start initialization if in browser environment
  if (typeof window !== 'undefined') {
    setTimeout(() => init(), 0);
  }

  // Return public interface
  return {
    getId: () => peerInstance?.id || null,
    getState: () => connectionState,
    destroy,
    connect,
    onConnection
  };
}