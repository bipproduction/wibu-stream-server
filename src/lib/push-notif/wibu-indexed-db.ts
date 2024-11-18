export class WibuIndexedDB {
  private static dbName: string = "myDatabase";
  private static storeName: string = "myStore";
  private static db: IDBDatabase | null = null;

  private static initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) return resolve(this.db);

      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(
          `Failed to open IndexedDB: ${
            (event.target as IDBOpenDBRequest).error
          }`
        );
      };
    });
  }

  public static async setItem<T>(key: string, value: T): Promise<T> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(value);
      request.onerror = (event) =>
        reject(`Failed to set item: ${(event.target as IDBRequest).error}`);
    });
  }

  public static async getItem<T>(key: string): Promise<T | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve((request.result as T) ?? null);
      request.onerror = (event) =>
        reject(`Failed to get item: ${(event.target as IDBRequest).error}`);
    });
  }

  public static async removeItem(key: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = (event) =>
        reject(`Failed to remove item: ${(event.target as IDBRequest).error}`);
    });
  }

  public static async clear(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = (event) =>
        reject(`Failed to clear store: ${(event.target as IDBRequest).error}`);
    });
  }
}
