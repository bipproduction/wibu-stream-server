import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, streamKey } = await req.json();
  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400
    });
  }
  const createUser = await prisma.user.upsert({
    where: {
      id: userId
    },
    create: {
      id: userId
    },
    update: {}
  });

  const createStream = await prisma.streamInstance.upsert({
    where: {
      streamId: streamKey
    },
    create: {
      streamId: streamKey,
      userId: userId
    },
    update: {}
  });

  return new Response(
    JSON.stringify({
      data: {
        user: createUser,
        stream: createStream
       }
    })
  );
}
