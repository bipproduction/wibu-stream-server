/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { apies } from "@/lib/routes";
import { Stack } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { use, useState } from "react";

export default function Page({
  params
}: {
  params: Promise<{ userid: string }>;
}) {
  const resolvedParams = use(params);
  const [listStream, setListStream] = useState<Record<string, any> | null>(
    null
  );

  useShallowEffect(() => {
    loadUserStream().then(setListStream);
  }, []);

  async function loadUserStream() {
    const res = await fetch(
      apies["/api/stream/user/stream/[userid]"]({
        userid: resolvedParams.userid
      })
    );
    const dataText = await res.text();
    if (!dataText) return console.log("no data");
    const dataJson = JSON.parse(dataText);
    return dataJson;
  }
  return (
    <Stack>
      <pre>{JSON.stringify(listStream?.data.activeStream, null, 2)}</pre>
    </Stack>
  );
}
