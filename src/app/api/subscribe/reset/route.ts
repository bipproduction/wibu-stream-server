import prisma from "@/lib/prisma";

export async function GET() {
  const reset = await prisma.user.deleteMany({
    where: {
      NOT: {
        id: {
          equals: "x"
        }
      }
    },
  });

  return new Response(JSON.stringify(reset));
}
