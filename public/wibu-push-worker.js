// /**
//  * @typedef {import('../src/types/PushNotificationDataSend').PushNotificationDataSend} PushNotificationDataSend
//  */

const log = false;  // Ganti ke true untuk debugging
function printLog(text) {
    if (log) {
        const stack = new Error().stack;
        const lineInfo = stack.split('\n')[2];
        const match = lineInfo.match(/(\/.*:\d+:\d+)/);
        const lineNumber = match ? match[1] : 'unknown line';
        console.log(`[${lineNumber}] ==>`, text);
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
    printLog('Service Worker installing...');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    printLog('Service Worker activating...');
});

self.addEventListener('push', async function (event) {
    let title = "Default Title";
    let options = {
        body: "Default notification body",
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        image: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2',
        },
    };

    if (event.data) {
        try {
            const data = event.data.json();
            title = data.title || title;
            options.body = data.body || options.body;
            options.data = {
                ...options.data,
                ...data,
            };
            printLog(`Push event data: ${JSON.stringify(options, null, 2)}`);
        } catch (e) {
            console.error("Error parsing push event data:", e);
        }
    } else {
        console.warn("Push event has no data.");
    }

    event.waitUntil(
        (async () => {
            try {
                const eventData =  (options.data);
                const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
                let isClientFocused = false;

                for (const client of clientList) {
                    client.postMessage({
                        type: 'PUSH_RECEIVED',
                        title: eventData.title,
                        body: eventData.body,
                        variant: eventData.variant,
                        createdAt: eventData.createdAt,
                        acceptedAt: Date.now(),
                    });

                    if (client.focused) {
                        isClientFocused = true;
                        break;
                    }
                }

                const subscription = await self.registration.pushManager.getSubscription();
                const myEndpoint = subscription ? subscription.endpoint : null;

                if (myEndpoint && eventData.endpoint === myEndpoint) {
                    printLog("Notification sent to self, skipping display.");
                    return;
                }

                if (eventData.variant === 'data') {
                    printLog('Type is data, skipping display.');
                    return;
                }

                if (!isClientFocused) {
                    await self.registration.showNotification(title, options);
                } else {
                    printLog('Client is focused, notification not shown.');
                }
            } catch (err) {
                console.error("Error displaying notification:", err);
            }
        })()
    );
});

self.addEventListener('notificationclick', function (event) {
    const clickedLink = event.notification.data.link;
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(clickedLink) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(clickedLink);
            }
        }).catch(err => {
            console.error("Error handling notification click:", err);
        })
    );
});
