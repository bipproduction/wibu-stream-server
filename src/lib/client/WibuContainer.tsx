"use client";
import { WibuPermissionProvider, WibuPushNotificationHandler } from "wibu-pkg";

export function WibuContainer() {
  return (
    <div>
      <WibuPermissionProvider
        requiredPermissions={["notifications", "camera", "microphone"]}
      >
        <WibuPushNotificationHandler
          NEXT_PUBLIC_VAPID_PUBLIC_KEY={
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          }
          onMessage={() => console.log("message")}
        />
      </WibuPermissionProvider>
    </div>
  );
}
