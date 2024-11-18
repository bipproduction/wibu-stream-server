import { useOs } from "@mantine/hooks";
import { useNetwork } from "@mantine/hooks";
import { useIdle } from "@mantine/hooks";
import { useViewportSize } from "@mantine/hooks";
import { usePageLeave } from "@mantine/hooks";
import { useIsFirstRender } from "@mantine/hooks";
import { useMounted } from "@mantine/hooks";
import { useState } from "react";
export function useHandle() {
  const os = useOs();
  const networkStatus = useNetwork();
  const idle = useIdle(2000);
  const { height, width } = useViewportSize();
  const [leftsCount, setLeftsCount] = useState(0);
  usePageLeave(() => setLeftsCount((p) => p + 1));
  const firstRender = useIsFirstRender();
  const mounted = useMounted();

  return {
    os,
    networkStatus,
    idle,
    viewport: {
      height,
      width
    },
    leftsCount,
    firstRender,
    mounted
  };
}
