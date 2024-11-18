export function getEndpointFromIndexedDB(): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pushNotifications', 1);

        request.onsuccess = function () {
            const db = request.result;
            const transaction = db.transaction('endpoints', 'readonly');
            const store = transaction.objectStore('endpoints');
            const getRequest = store.get('myEndpoint');

            getRequest.onsuccess = function () {
                resolve(getRequest.result ? getRequest.result.endpoint : null);
            };

            getRequest.onerror = function () {
                reject('Failed to retrieve endpoint from IndexedDB');
            };
        };

        request.onerror = function () {
            reject('Failed to open IndexedDB');
        };
    });
}