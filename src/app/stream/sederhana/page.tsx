'use client'

import { Stack, Text } from "@mantine/core";
import WibuStreamSederhana from "../penerima/_lib/WibuStreamSederhana";

export default function Page() {
  
    return <Stack>
      <Text>Stream Penerima</Text>
      <WibuStreamSederhana />
    </Stack>;
  }