/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import webpush from "web-push";
import { NextResponse } from "next/server";
import { EnvServer } from "@/lib/server/EnvServer";
import prisma from "@/lib/prisma";
import WibuServerPush from "./_lib/WibuServerPush";

EnvServer.init(process.env);

const vapidKeys = {
  publicKey: EnvServer.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: EnvServer.env.VAPID_PRIVATE_KEY!
};

webpush.setVapidDetails(
  "mailto:bipproduction@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Type untuk data request
type PushData =
  | {
      body: string;
      title: string;
      link: string;
      variant: "notification";
    }
  | {
      body: Record<string, any>;
      title: string;
      link: string;
      variant: "data";
    };

// Type untuk subscription
interface SubscriptionData {
  subscription: string | null;
}

WibuServerPush.init({
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: vapidKeys.publicKey,
  VAPID_PRIVATE_KEY: vapidKeys.privateKey
});

export async function POST(req: Request) {
  try {
    const jsonData: PushData = await req.json();
    // const apa : PushData = {
    //   body: {},
    //   title: "test title",
    //   link: "https://example.com",
    //   variant: "data"
    // }

    const listSubscription: SubscriptionData[] =
      await prisma.subscription.findMany();
    const resultStatus = await WibuServerPush.sendMany({
      subscriptions: listSubscription.map((s) => JSON.parse(s.subscription!)),
      data: jsonData
    });

    // if (listSubscription.length === 0) {
    //   return NextResponse.json(
    //     { error: "No subscription found" },
    //     { status: 404 }
    //   );
    // }

    // const resultStatus = [];

    // for (const subscription of listSubscription) {
    //   if (!subscription.subscription) {
    //     console.warn("Skipping empty subscription");
    //     continue;
    //   }

    //   try {
    //     const parsedSubscription = JSON.parse(subscription.subscription);

    //     // Mengirim notifikasi dan menunggu hasilnya
    //     await webpush.sendNotification(
    //       parsedSubscription,
    //       JSON.stringify(jsonData)
    //     );

    //     // Jika sukses, tambahkan status sukses ke resultStatus
    //     resultStatus.push({
    //       subscriptionId: subscription.subscription,
    //       status: "Success"
    //     });
    //   } catch (error: any) {
    //     console.error("Failed to send notification:");

    //     // Jika gagal, tambahkan status gagal ke resultStatus
    //     resultStatus.push({
    //       subscriptionId: subscription.subscription,
    //       status: "Failed",
    //       error: error.message
    //     });
    //   }
    // }

    // Merespons dengan hasil pengiriman notifikasi
    return NextResponse.json({
      message: "Push attempt completed",
      results: resultStatus
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 }
    );
  }
}
