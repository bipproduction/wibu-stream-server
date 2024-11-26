"use client";
import { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";

export default function WibuStreamSederhana() {
  const [peerId, setPeerId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [peer, setPeer] = useState<Peer | null>(null);
  
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const [call, setCall] = useState<MediaConnection | null>(null);

  // Initialize peer
  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", id => setPeerId(id));
    
    // Handle incoming calls
    newPeer.on("call", async (incomingCall) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideo.current!.srcObject = stream;
      
      incomingCall.answer(stream);
      incomingCall.on("stream", (remoteStream) => {
        remoteVideo.current!.srcObject = remoteStream;
      });
      
      setCall(incomingCall);
    });

    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  // Make a call
  const startCall = async () => {
    if (!peer || !targetId) return;
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current!.srcObject = stream;
    
    const outgoingCall = peer.call(targetId, stream);
    outgoingCall.on("stream", (remoteStream) => {
      remoteVideo.current!.srcObject = remoteStream;
    });
    
    setCall(outgoingCall);
  };

  // End call
  const endCall = () => {
    const localStream = localVideo.current?.srcObject as MediaStream;
    const remoteStream = remoteVideo.current?.srcObject as MediaStream;
    
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    localVideo.current!.srcObject = null;
    remoteVideo.current!.srcObject = null;
    
    call?.close();
    setCall(null);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <p>Your ID: {peerId}</p>
        <input
          type="text"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="Enter peer ID to call"
          className="border p-2 mr-2"
        />
        <button 
          onClick={call ? endCall : startCall}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {call ? "End Call" : "Start Call"}
        </button>
      </div>

      <div className="flex gap-4">
        <div>
          <p>Local Video</p>
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
          />
        </div>
        <div>
          <p>Remote Video</p>
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
          />
        </div>
      </div>
    </div>
  );
}