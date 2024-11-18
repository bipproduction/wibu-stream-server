import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      StreamInstance: {
        where: {
          isActive: true
        },
        select: {
          userId: true,
          streamId: true
        }
      }
    }
  });
  return new Response(JSON.stringify(users));
}

export async function POST(req: Request) {
  const { userId, streamId } = await req.json();
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
      streamId: streamId
    },
    create: {
      streamId: streamId,
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
