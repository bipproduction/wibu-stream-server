import Peer from "peerjs";
import { v4 } from "uuid";

type ConfigOption<T extends "dev" | "prd"> = {
  headId: string;
  mode: T;
  config?: T extends "dev"
    ? { host?: string; port?: number }
    : { host?: string; port?: number };
};



export function initStream<T extends "dev" | "prd">(options: ConfigOption<T>) {
  const { headId, mode, config } = options;
  

  // Generate a unique peer ID
  const id = v4().replace(/-/g, "");
  const peerId = `wibu${headId}-${id}`;

  // Tentukan nilai default untuk host dan port
  const defaultHost = mode === "dev" ? "localhost" : "wibu-stream-server.wibudev.com";
  const defaultPort = mode === "dev" ? 3034 : 443;

  // Pilih host dan port dari config atau gunakan nilai default
  const host = config?.host ?? defaultHost;
  const port = config?.port ?? defaultPort;

  // Tentukan apakah menggunakan koneksi secure berdasarkan port
  const secure = true;
  const path = "/wibu-stream";

  // Inisialisasi PeerJS dengan konfigurasi yang dipilih
  const newPeer = new Peer(peerId, {
    host,
    port,
    secure,
    path
  });

  return newPeer;
}
