/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client/extension";
import dotenv from "dotenv";
import fs from "fs";
import minimist from "minimist";
import path from "path";
import { IClient, PeerServer } from "peer";

// Load environment variables
dotenv.config();

// Type definitions for configuration
interface ServerConfig {
  port: number;
  path: string;
  ssl?: {
    key: string;
    cert: string;
  };
}

interface SSLPaths {
  KEY_PATH: string;
  CERT_PATH: string;
}

// Parse command line arguments and environment variables
const args = minimist(process.argv.slice(2));
const PORT = args.port || args.p || process.env.PEER_SERVER_PORT || 3034;
const isDevelopment = process.env.PEER_SERVER_NODE_ENV === "development";

// SSL configuration
const SSL_CONFIG: SSLPaths = {
  KEY_PATH: path.resolve("certificates/localhost-key.pem"),
  CERT_PATH: path.resolve("certificates/localhost.pem")
};

// Validate SSL files in development mode
function validateSSLFiles(): boolean {
  if (isDevelopment) {
    try {
      fs.accessSync(SSL_CONFIG.KEY_PATH);
      fs.accessSync(SSL_CONFIG.CERT_PATH);
      return true;
    } catch (error) {
      console.error("SSL certificate files not found:", error);
      return false;
    }
  }
  return true;
}

// Configure server options
function getServerConfig(): ServerConfig {
  const config: ServerConfig = {
    port: Number(PORT),
    path: "/wibu-stream"
  };

  if (isDevelopment && validateSSLFiles()) {
    config.ssl = {
      key: fs.readFileSync(SSL_CONFIG.KEY_PATH, "utf8"),
      cert: fs.readFileSync(SSL_CONFIG.CERT_PATH, "utf8")
    };
  }

  return config;
}

// Main function to start Peer Server
function startPeerServer(): void {
  try {
    const peerServerOptions = getServerConfig();
    const peerServer = PeerServer(peerServerOptions);

    peerServer.get("/", (req, res) => {
      res.send("Hello from Peer Server!");
    });

    // Event handlers
    peerServer.on("connection", (client) => {
      // console.log("Client connected to Peer Server:", client.getId());
      updateStatus({ prisma, client, isActive: true });
    });

    peerServer.on("disconnect", async (client) => {
      // console.log("Client disconnected from Peer Server:", client.getId());
      await updateStatus({ prisma, client, isActive: false });
    });

    peerServer.on("message", async (client, data) => {
      // console.log("Received message from client:", client.getId(), data);
      await updateStatus({ prisma, client, isActive: true });
    });

    peerServer.on("error", (error) => {
      console.error("Peer Server error:", error);
    });

    // Graceful shutdown handling
    process.on("SIGINT", () => {
      console.log("\nShutting down Peer Server...");
      // Instead of using close(), we'll exit the process
      // The OS will clean up the port binding
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\nReceived SIGTERM. Shutting down Peer Server...");
      process.exit(0);
    });

    console.log(
      `🚀 Peer Server running on ${
        isDevelopment ? "https" : "http"
      }://localhost:${PORT}/wibu-stream`
    );
  } catch (error) {
    console.error("Failed to start Peer Server:", error);
    process.exit(1);
  }
}

// Start the server
startPeerServer();

async function updateStatus(params: {
  prisma: PrismaClient;
  client: IClient;
  isActive: boolean;
}) {
  const { client, isActive, prisma } = params;
  const [userId, streamId] = client.getId().split("-");
  if (!userId.startsWith("wibu")) return;
  const upd = await prisma.streamInstance.upsert({
    where: {
      streamId: streamId
    },
    create: {
      streamId: streamId,
      userId: userId,
      isActive: isActive
    },
    update: {
      isActive: isActive
    }
  });

  console.table(upd);
}

export {};
