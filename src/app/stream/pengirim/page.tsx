/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ActionIcon, Box, Loader, Stack, Text } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import Peer, { MediaConnection } from "peerjs";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { WibuStreamProvider } from "wibu-pkg";

interface CallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mediaConnection: MediaConnection | null;
  isConnecting: boolean;
  isCallActive: boolean;
  error: string | null;
}

const initialCallState: CallState = {
  localStream: null,
  remoteStream: null,
  mediaConnection: null,
  isConnecting: false,
  isCallActive: false,
  error: null
};

const playVideo = async (
  videoElement: HTMLVideoElement | null,
  stream: MediaStream
) => {
  if (!videoElement) return;

  try {
    videoElement.srcObject = stream;
    // Tunggu sampai video element siap
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => resolve(true);
    });
    await videoElement.play();
  } catch (error) {
    console.error("Error playing video:", error);
    throw new Error("Failed to play video stream");
  }
};

export default function Page({searchParams}: {searchParams: Promise<{user: string, mode: string}>}) {
  const {user, mode} = use(searchParams);
  if (!user) return <Text>please login</Text>;
  if (!mode) return <Text>mode = dev | prd</Text>;

  const host = mode === "dev" ? "localhost" : "wibu-stream-server.wibudev.com";
  const port = mode === "dev" ? 3034 : 443;
  return (
    <Stack>
      <WibuStreamProvider
        headId={user}
        config={{
          host,
          port
        }}
      >
        {(peer) => <StreamContainer peerInstance={peer} />}
      </WibuStreamProvider>
    </Stack>
  );
}

function StreamContainer({ peerInstance }: { peerInstance: Peer | null }) {
  const [callState, setCallState] = useState<CallState>(initialCallState);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(async () => {
    try {
      console.log("Stop stream");
      localVideoRef.current?.pause();
      localVideoRef.current!.srcObject = null;
      remoteVideoRef.current?.pause();
      remoteVideoRef.current!.srcObject = null;
      callState.remoteStream?.getTracks().forEach((track) => track.stop());
      callState.localStream?.getTracks().forEach((track) => track.stop());
      callState.mediaConnection?.close();
      setCallState(initialCallState);
    } catch (error) {
      console.log("has no stream");
    }
  }, [callState]);

  const handleIncomingCall = useCallback(async (call: MediaConnection) => {
    setCallState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Set local stream first
      await playVideo(localVideoRef.current, stream);

      // Answer call with stream
      call.answer(stream);

      // Handle incoming stream
      call.on("stream", async (remoteStream) => {
        try {
          await playVideo(remoteVideoRef.current, remoteStream);

          setCallState((prev) => ({
            ...prev,
            localStream: stream,
            remoteStream,
            mediaConnection: call,
            isCallActive: true,
            isConnecting: false
          }));
        } catch (error) {
          console.error("Error handling remote stream:", error);
          setCallState((prev) => ({
            ...prev,
            error: "Failed to display remote video",
            isConnecting: false
          }));
          closeButtonRef.current?.click();
        }
      });

      call.on("close", () => {
        console.log("Call closed");
        closeButtonRef.current?.click();
      });

      call.on("error", (err) => {
        console.error("Call error:", err);
        setCallState((prev) => ({
          ...prev,
          error: "An error occurred during the call",
          isConnecting: false
        }));
        closeButtonRef.current?.click();
      });
    } catch (err) {
      console.error("Error handling incoming call:", err);
      setCallState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to establish call",
        isConnecting: false
      }));
      closeButtonRef.current?.click();
    }
  }, []);
  useEffect(() => {
    if (peerInstance) {
      peerInstance.on("open", (peerId) => {
        console.log("Peer ID:", peerId);
      });
      peerInstance.on("call", handleIncomingCall);
    }

    return () => {
      if (peerInstance) {
        peerInstance.off("call", handleIncomingCall);
      }
    };
  }, [peerInstance, handleIncomingCall]);

  return (
    <Stack display={"none"}>
      <Box pos="relative" mih={400}>
        <video
          ref={remoteVideoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            objectFit: "cover"
          }}
        />

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "30%",
            position: "absolute",
            bottom: "10px",
            right: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            objectFit: "cover"
          }}
        />

        {callState.isCallActive && (
          <ActionIcon
            ref={closeButtonRef}
            color="red"
            variant="filled"
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 10
            }}
          >
            <MdClose size={20} />
          </ActionIcon>
        )}

        {callState.isConnecting && (
          <Box
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: "8px"
            }}
          >
            <Stack align="center" gap="xs">
              <Loader color="white" size="md" />
              <Text c="white" size="sm">
                Incoming call...
              </Text>
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
