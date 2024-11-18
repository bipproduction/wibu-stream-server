/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActionIcon, Card, Flex, Loader, Stack, Text } from "@mantine/core";
import Peer, { MediaConnection } from "peerjs";
import { useCallback, useRef, useState } from "react";
import { MdClose, MdVideoCall } from "react-icons/md";

interface CallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mediaConnection: MediaConnection | null;
  isConnecting: boolean;
  isCallActive: boolean;
}

const initialCallState: CallState = {
  localStream: null,
  remoteStream: null,
  mediaConnection: null,
  isConnecting: false,
  isCallActive: false
};

export function CreateVideoCall({
  peerInstance,
  streamId
}: {
  peerInstance: Peer;
  streamId: string;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [callState, setCallState] = useState<CallState>(initialCallState);

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

  const setupVideoElement = async (
    videoRef: HTMLVideoElement | null,
    stream: MediaStream
  ): Promise<void> => {
    if (!videoRef) return;

    try {
      videoRef.srcObject = stream;
      await videoRef.play();
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error playing video:", err);
        throw err;
      }
    }
  };

  const streamingVideoAudioStart = useCallback(
    async (targetStreamId: string) => {
      if (callState.isConnecting || callState.isCallActive) return;

      setCallState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null
      }));

      try {
        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        // Setup local video first
        await setupVideoElement(localVideoRef.current, stream);

        // Update state with local stream
        setCallState((prev) => ({
          ...prev,
          localStream: stream
        }));

        // Initiate call
        const call = peerInstance.call(targetStreamId, stream);

        if (!call) {
          throw new Error("Failed to initiate call");
        }

        // Set media connection in state
        setCallState((prev) => ({
          ...prev,
          mediaConnection: call
        }));

        // Handle remote stream
        call.on("stream", async (remoteStream) => {
          console.log("Received remote stream");
          try {
            await setupVideoElement(remoteVideoRef.current, remoteStream);

            setCallState((prev) => ({
              ...prev,
              remoteStream,
              isConnecting: false,
              isCallActive: true
            }));
          } catch (error) {
            console.error("Error setting up remote video:", error);
            setCallState((prev) => ({
              ...prev,
              error: "Failed to display remote video",
              isConnecting: false
            }));
          }
        });

        call.on("close", async () => {
          console.log("Call was closed");
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
      } catch (error) {
        console.error("Error in streamingVideoAudioStart:", error);
        setCallState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to start video call",
          isConnecting: false
        }));
        closeButtonRef.current?.click();
      }
    },
    [peerInstance, callState.isConnecting, callState.isCallActive]
  );

  return (
    <Card>
      <Stack>
        <Text size="sm">Stream ID: {streamId}</Text>
        <Flex gap="sm">
          <ActionIcon
            onClick={() => streamingVideoAudioStart(streamId)}
            disabled={callState.isConnecting || callState.isCallActive}
            color={callState.isConnecting ? "gray" : "blue"}
            variant="filled"
          >
            <MdVideoCall size={20} />
          </ActionIcon>
          <ActionIcon
            ref={closeButtonRef}
            onClick={handleClose}
            color="red"
            variant="filled"
            disabled={!callState.isCallActive}
          >
            <MdClose size={20} />
          </ActionIcon>
        </Flex>

        <Stack
          pos="relative"
          mih={400}
          display={callState.isCallActive ? "block" : "none"}
        >
          <video
            ref={remoteVideoRef}
            autoPlay
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

          {callState.isConnecting && (
            <div
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
                  Connecting...
                </Text>
              </Stack>
            </div>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

