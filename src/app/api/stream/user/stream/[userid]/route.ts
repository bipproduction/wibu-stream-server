import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userid: string }> }
) {
  const { userid } = await params;
  const [activeStream, inActiveStream] = await Promise.all([
    prisma.streamInstance.findMany({
      where: { userId: userid, isActive: true }
    }),
    prisma.streamInstance.findMany({
      where: { userId: userid, isActive: false }
    })
  ]);

  return Response.json({ data: { activeStream, inActiveStream } });
}
