import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const id = body.endpoint.split("/send/").pop();

  const upsert = await prisma.subscription.upsert({
    where: {
      id
    },
    create: {
      id,
      subscription: JSON.stringify(body)
    },
    update: {
      subscription: JSON.stringify(body)
    }
  });

  return new Response(JSON.stringify(upsert));
}

export async function GET() {
  const subs = await prisma.subscription.findMany();
  return new Response(JSON.stringify(subs));
}
