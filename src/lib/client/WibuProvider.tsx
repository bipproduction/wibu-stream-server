"use client";

// import { WibuPermissionProvider, WibuPushNotificationHandler } from "wibu-pkg";

// const NEXT_PUBLIC_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
export function WibuProvider() {
  return (
    <div>
      {/* <WibuPermissionProvider requiredPermissions={["notifications", "camera"]}>
        <WibuPushNotificationHandler
          NEXT_PUBLIC_VAPID_PUBLIC_KEY={NEXT_PUBLIC_VAPID_PUBLIC_KEY}
          onMessage={() => console.log("message")}
        />
      </WibuPermissionProvider> */}
    </div>
  );
}
