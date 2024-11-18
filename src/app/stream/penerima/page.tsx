"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Page.tsx

import { apies } from "@/lib/routes";
import { Card, Flex, Group, Stack, Text } from "@mantine/core";
import { Prisma } from "@prisma/client";
import Peer from "peerjs";
import { useCallback, useEffect, useState } from "react";
import { MdAccountCircle } from "react-icons/md";
import { WibuStreamProvider } from "wibu-pkg";
import { CreateVideoCall } from "./_lib/CreateVideoCall";

export default function Page() {
  return (
    <Stack>
      <WibuStreamProvider headId="5678" mode="dev">
        {(peer) => <ContactContainer peerInstance={peer} debug />}
      </WibuStreamProvider>
    </Stack>
  );
}

function ContactContainer({
  peerInstance,
  debug = false
}: {
  peerInstance: Peer | null;
  debug?: boolean;
}) {
  const [listUserStream, setListUserStream] = useState<
    | Prisma.UserGetPayload<{
        select: {
          id: true;
          StreamInstance: {
            where: {
              isActive: true;
            };
            select: {
              streamId: true;
              userId: true;
            };
          };
        };
      }>[]
    | null
  >(null);
  const loadUserStream = useCallback(async () => {
    const res = await fetch(apies["/api/stream/user"], {
      method: "GET"
    });

    const dataText = await res.text();
    if (!res.ok) {
      if (debug) console.log(dataText);
      return [];
    }
    const dataJson = JSON.parse(dataText);
    return dataJson;
  }, [debug]);

  useEffect(() => {
    loadUserStream().then(setListUserStream);
  }, [loadUserStream]);

  if (!listUserStream) return <div>Loading...</div>;
  if (!peerInstance || !peerInstance.id) return <div>Loading...</div>;
  return (
    <Stack p={"md"}>
      <Card>
        <Flex gap={"md"} align={"center"}>
          <MdAccountCircle size={24} />
          {peerInstance?.id.split("-")[0]}
        </Flex>
      </Card>
      {listUserStream
        .filter((v) => v.id !== peerInstance?.id.split("-")[0])
        .map((v, k) => (
          <Stack key={k}>
            <Stack p={"md"}>
              <Flex gap={"md"} align={"center"}>
                <MdAccountCircle size={24} />
                <Text>{v.id}</Text>
              </Flex>
              <Group>
                {v.StreamInstance.map((v, k) => (
                  <CreateVideoCall
                    key={k}
                    peerInstance={peerInstance!}
                    streamId={`${v.userId}-${v.streamId}`}
                  />
                ))}
              </Group>
            </Stack>
          </Stack>
        ))}
    </Stack>
  );
}
