'use client'

import { use } from "react";
import { WibuStream } from "./penerima/_lib/WibuStream"
import { Stack, Text } from "@mantine/core";

export default function Page({
    searchParams
  }: {
    searchParams: Promise<{ user: string; mode: string }>;
  }) {
    const { user, mode } = use(searchParams);
  
    if (!user) return <Text>please login</Text>;
    if (!mode) return <Text>mode = dev | prd</Text>;
  
    return <Stack>
      <Text>Stream Penerima</Text>
      <WibuStream searchParams={{ user, mode }} />
    </Stack>;
  }