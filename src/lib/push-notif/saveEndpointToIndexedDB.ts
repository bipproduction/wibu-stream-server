export function saveEndpointToIndexedDB(endpoint: string) {
    const request = indexedDB.open('pushNotifications', 1);
  
    request.onupgradeneeded = function() {
      const db = request.result;
      if (!db.objectStoreNames.contains('endpoints')) {
        db.createObjectStore('endpoints', { keyPath: 'id' });
      }
    };
  
    request.onsuccess = function() {
      const db = request.result;
      const transaction = db.transaction('endpoints', 'readwrite');
      const store = transaction.objectStore('endpoints');
      store.put({ id: 'myEndpoint', endpoint: endpoint });
    };
  
    request.onerror = function() {
      console.error('Failed to store endpoint in IndexedDB:', request.error);
    };
  }
  
// wibu:1.0.81