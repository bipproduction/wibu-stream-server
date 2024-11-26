/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  Stack,
  Text,
  TextInput
} from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import Peer, { MediaConnection } from "peerjs";
import { useRef, useState } from "react";
import { v4 } from "uuid";

function handleClose({
  localStream,
  remoteStream,
  mediaConnection,
  localVideoRef,
  remoteVideoRef,
  setMediaConnection
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mediaConnection: MediaConnection | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  setMediaConnection: React.Dispatch<
    React.SetStateAction<MediaConnection | null>
  >;
}) {
  try {
    console.log("Stop stream");
    localVideoRef.current?.pause();
    localVideoRef.current!.srcObject = null;
    remoteVideoRef.current?.pause();
    remoteVideoRef.current!.srcObject = null;

    remoteStream?.getTracks().forEach((track) => track.stop());
    localStream?.getTracks().forEach((track) => track.stop());
    mediaConnection?.close();
    setMediaConnection(null);
  } catch (error) {
    console.log("has no stream");
  }
}

function VideoDisplay({
  localVideoRef,
  remoteVideoRef,
  variant
}: {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  variant: "call" | "answer";
}) {
  return (
    <Flex align={"center"} gap={"md"} wrap={"wrap"}>
      <Box pos={"relative"} bg={"red"}>
        <Text>Remote Stream</Text>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={variant === "answer"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </Box>

      <Box pos={"relative"} bg={"blue"}>
        <Text>Local Stream</Text>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted={variant === "call"}
          style={{
            width: "100%",
            borderRadius: "8px",
            objectFit: "cover"
          }}
        />
      </Box>
    </Flex>
  );
}

function CloseButton({
  closeButtonRef,
  localStream,
  remoteStream,
  mediaConnection,
  localVideoRef,
  remoteVideoRef,
  setMediaConnection
}: {
  closeButtonRef: React.RefObject<HTMLButtonElement>;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mediaConnection: MediaConnection | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  setMediaConnection: React.Dispatch<
    React.SetStateAction<MediaConnection | null>
  >;
}) {
  return (
    <Button
      ref={closeButtonRef}
      onClick={() =>
        handleClose({
          localStream,
          remoteStream,
          mediaConnection,
          localVideoRef,
          remoteVideoRef,
          setMediaConnection
        })
      }
    >
      Close
    </Button>
  );
}

export function WibuStream({
  searchParams
}: {
  searchParams: { user: string | null; mode: string | null };
}) {
  const { user, mode } = searchParams;

  const [streamId, setStreamId] = useState<string | null>(null);
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);

  useShallowEffect(() => {
    let peer: Peer | null;
    if (typeof window === "undefined") return;
    if (!peerInstance) {
      const randomId = v4().replace(/-/g, "");
      const id = `wibu${user}-${randomId}`;
      const currentId = localStorage.getItem(`wibu-stream-id1-${user}`) ?? id;

      const host =
        !mode || mode === "dev"
          ? "localhost"
          : "wibu-stream-server.wibudev.com";
      const port = !mode || mode === "dev" ? 3034 : 443;
      peer = new Peer(currentId, {
        host,
        port,
        path: "/wibu-stream"
      });

      peer.on("open", (id) => {
        setStreamId(id);
        localStorage.setItem(`wibu-stream-id1-${user}`, id);
      });

      setPeerInstance(peer);
    }
    return () => {
      if (peer) {
        peer.destroy();
        setPeerInstance(null);
      }
    };
  }, []);

  return (
    <Stack p={"md"}>
      <Text>Stream ID: {streamId}</Text>
      <AnswerCall peerInstance={peerInstance!} />
      <CreateCall peerInstance={peerInstance!} />
    </Stack>
  );
}

function AnswerCall({ peerInstance }: { peerInstance: Peer | null }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);

  useShallowEffect(() => {
    if (!peerInstance) {
      return console.log("Peer instance not ready");
    }
    console.log("Listening for calls");
    peerInstance.on("call", (call) => {
      setMediaConnection(call);
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true
        })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            setTimeout(() => {
              localVideoRef.current?.play().catch((err) => {
                console.error("Error playing local video:", err);
                throw new Error("Gagal memutar video local");
              });
            }, 1000);
          }
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              setTimeout(() => {
                remoteVideoRef.current?.play().catch((err) => {
                  console.error("Error playing remote video:", err);
                  throw new Error("Gagal memutar video remote");
                });
              }, 1000);
            }
          });
          call.on("close", () => {
            closeButtonRef.current?.click();
          });
        });
    });

    return () => {
      peerInstance.off("call");
    };
  }, [peerInstance]);

  if (!peerInstance) return null;
  return (
    <Card suppressHydrationWarning display={mediaConnection ? "block" : "none"}>
      <Stack>
        <CloseButton
          localStream={localStream}
          remoteStream={remoteStream}
          mediaConnection={mediaConnection}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          setMediaConnection={setMediaConnection}
          closeButtonRef={closeButtonRef}
        />
        <VideoDisplay
          variant={"answer"}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
        />
      </Stack>
    </Card>
  );
}

function CreateCall({ peerInstance }: { peerInstance: Peer | null }) {
  const [formState, setFormState] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);

  const onCall = async () => {
    if (!formState) return console.error("Form state not ready");
    if (!peerInstance) return console.error("Peer instance not ready");

    localStorage.setItem("wibu-stream-id_local-target-id", formState);
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true
      })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setTimeout(() => {
            localVideoRef.current?.play().catch((err) => {
              console.error("Error playing local video:", err);
              throw new Error("Gagal memutar video local");
            });
          }, 1000);
        }

        const call = peerInstance.call(formState, stream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            setTimeout(() => {
              remoteVideoRef.current?.play().catch((err) => {
                console.error("Error playing remote video:", err);
                throw new Error("Gagal memutar video remote");
              });
            }, 1000);
          }
        });
        call.on("close", () => {
          closeButtonRef.current?.click();
        });
        setMediaConnection(call);
      });
  };

  useShallowEffect(() => {
    const localTargetId = localStorage.getItem(
      "wibu-stream-id_local-target-id"
    );

    if (localTargetId) {
      setFormState(localTargetId);
    }
  }, []);

  return (
    <Card>
      <Stack suppressHydrationWarning>
        <Group>
          <Stack>
            <TextInput
              label={formState}
              value={formState ?? ""}
              onChange={(e) => setFormState(e.target.value)}
            />
            <Button onClick={() => onCall()}>Call</Button>
            <CloseButton
              localStream={localStream}
              remoteStream={remoteStream}
              mediaConnection={mediaConnection}
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              setMediaConnection={setMediaConnection}
              closeButtonRef={closeButtonRef}
            />
          </Stack>
        </Group>
        <VideoDisplay
          variant={"call"}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
        />
      </Stack>
    </Card>
  );
}
