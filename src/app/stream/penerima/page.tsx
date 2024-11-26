"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Page.tsx

import { Stack, Text } from "@mantine/core";
import { use } from "react";


import { WibuStream } from "./_lib/WibuStream";

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

// function ContactContainer({
//   peerInstance,
//   debug = false
// }: {
//   peerInstance: Peer | null;
//   debug?: boolean;
// }) {
//   const [listUserStream, setListUserStream] = useState<
//     | Prisma.UserGetPayload<{
//         select: {
//           id: true;
//           StreamInstance: {
//             where: {
//               isActive: true;
//             };
//             select: {
//               streamId: true;
//               userId: true;
//             };
//           };
//         };
//       }>[]
//     | null
//   >(null);
//   const loadUserStream = useCallback(async () => {
//     const res = await fetch(apies["/api/stream/user"], {
//       method: "GET"
//     });

//     const dataText = await res.text();
//     if (!res.ok) {
//       if (debug) console.log(dataText);
//       return [];
//     }
//     const dataJson = JSON.parse(dataText);
//     return dataJson;
//   }, [debug]);

//   useEffect(() => {
//     loadUserStream().then(setListUserStream);
//   }, [loadUserStream]);

//   async function onReset() {
//     fetch(apies["/api/subscribe/reset"]).then((res) => {
//       loadUserStream().then(setListUserStream);
//       alert(res.statusText);
//     });
//   }

//   if (!listUserStream) return <div>Loading...</div>;
//   if (!peerInstance || !peerInstance.id) return <div>Loading...</div>;
//   return (
//     <Stack p={"md"}>
//       <Card>
//         <Flex gap={"md"} align={"center"} justify={"space-between"}>
//           <Flex gap={"md"} align={"center"}>
//             <MdAccountCircle size={24} />
//             {peerInstance?.id.split("-")[0]}
//           </Flex>
//           <ActionIcon onClick={onReset}>
//             <MdRestore />
//           </ActionIcon>
//         </Flex>
//       </Card>
//       {listUserStream
//         .filter((v) => v.id !== peerInstance?.id.split("-")[0])
//         .map((v, k) => (
//           <Stack key={k}>
//             <Stack p={"md"}>
//               <Flex gap={"md"} align={"center"}>
//                 <MdAccountCircle size={24} />
//                 <Text>{v.id}</Text>
//               </Flex>
//               <Group>
//                 {v.StreamInstance.map((v, k) => (
//                   <CreateVideoCall
//                     key={k}
//                     peerInstance={peerInstance!}
//                     streamId={`${v.userId}-${v.streamId}`}
//                   />
//                 ))}
//               </Group>
//             </Stack>
//           </Stack>
//         ))}
//     </Stack>
//   );
// }
