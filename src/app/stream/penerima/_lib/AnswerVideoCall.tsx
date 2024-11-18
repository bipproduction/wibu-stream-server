import { ActionIcon, Loader, Stack, Text } from "@mantine/core";
import Peer, { MediaConnection } from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";

export function AnswerVideoCall({
  peerInstance
}: {
  peerInstance: Peer | null;
}) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(
    null
  );
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleClose = useCallback(() => {
    if (localMediaStream) {
      localMediaStream.getTracks().forEach((track) => track.stop());
      setLocalMediaStream(null);
    }

    if (remoteMediaStream) {
      remoteMediaStream.getTracks().forEach((track) => track.stop());
      setRemoteMediaStream(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (mediaConnection) {
      mediaConnection.close();
    }

    setMediaConnection(null);
    setIsConnecting(false);
    setError(null);
    setIsCallActive(false);
  }, [localMediaStream, remoteMediaStream, mediaConnection]);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localMediaStream) {
      localVideoRef.current.srcObject = localMediaStream;
    }
    if (remoteVideoRef.current && remoteMediaStream) {
      remoteVideoRef.current.srcObject = remoteMediaStream;
    }
  }, [localMediaStream, remoteMediaStream]);

  useEffect(() => {
    console.log("ada peer: ", peerInstance?.id);
    if (!peerInstance || !peerInstance.id) return;
    
    const handleCall = async (call: MediaConnection) => {
      setIsConnecting(true);
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        setLocalMediaStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play().catch((err) => {
            console.error("Error playing local video:", err);
            throw new Error("Gagal memutar video local");
          });
        }

        call.answer(stream);
        setMediaConnection(call);

        call.on("stream", async (remoteStream) => {
          console.log("Received remote stream:", remoteStream.id);
          setRemoteMediaStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            await remoteVideoRef.current.play().catch((err) => {
              console.error("Error playing remote video:", err);
              throw new Error("Gagal memutar video remote");
            });
          }
          setIsCallActive(true);
          setIsConnecting(false);
        });

        call.on("close", () => {
          console.log("Call closed");
          handleClose();
        });

        call.on("error", (err) => {
          console.error("Call error:", err);
          setError("Terjadi kesalahan pada panggilan");
          handleClose();
        });
      } catch (err) {
        console.error("Error answering call:", err);
        setError(
          err instanceof Error ? err.message : "Gagal menjawab panggilan"
        );
        handleClose();
      } finally {
        setIsConnecting(false);
      }
    };

    peerInstance.on("call", handleCall);

    return () => {
    //   peerInstance.off("call", handleCall);
    //   handleClose();
    };
  }, [peerInstance, handleClose]);

  if (!peerInstance) return null;

  return (
    <Stack>
      {peerInstance.id}
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}

      <Stack pos="relative" mih={400}>
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

        {isCallActive && (
          <ActionIcon
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

        {isConnecting && (
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
                Menerima panggilan...
              </Text>
            </Stack>
          </div>
        )}
      </Stack>
    </Stack>
  );
}
