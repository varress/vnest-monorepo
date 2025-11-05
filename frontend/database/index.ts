/**
 * Native Database Manager for VN-EST App
 * 
 * This version is automatically selected by Metro bundler for native platforms
 * (iOS/Android). It prioritizes RealmAdapter for performance but gracefully
 * falls back to WebStorageAdapter if Realm is unavailable.
 * 
 * Features:
 * - Primary: Realm database for native performance
 * - Fallback: localStorage-based persistence
 * - Automatic adapter selection
 * - Cross-platform API compatibility
 */

import { RealmAdapter } from './realmAdapter';
import { WebStorageAdapter } from './webAdapter';

/**
 * Database adapter interface for type safety
 */
interface DatabaseAdapter {
  initialize(): Promise<void>;
  query<T>(collection: string, filter?: any): Promise<T[]>;
  findById<T>(collection: string, id: number): Promise<T | null>;
  insert<T>(collection: string, data: T): Promise<T>;
  update<T>(collection: string, id: number, data: Partial<T>): Promise<T | null>;
  delete(collection: string, id: number): Promise<boolean>;
}

/**
 * Database manager that handles adapter selection for native platforms
 */
class DatabaseManager {
  private adapter: DatabaseAdapter | null = null;

  /**
   * Selects and initializes the appropriate database adapter
   * Prioritizes RealmAdapter for native performance, falls back to WebStorageAdapter
   */
  private getAdapter(): DatabaseAdapter {
    if (!this.adapter) {
      try {
        // Primary choice: RealmAdapter for native platforms
        this.adapter = new RealmAdapter();
      } catch (err) {
        // Fallback: WebStorageAdapter if Realm is unavailable
        console.warn('RealmAdapter not available, using WebStorageAdapter fallback');
        this.adapter = new WebStorageAdapter();
      }
    }
    return this.adapter;
  }

  /**
   * Initializes the selected database adapter
   */
  async initialize(): Promise<void> {
    const adapter = this.getAdapter();
    await adapter.initialize();
  }

  /**
   * Queries data from the specified collection
   */
  async query<T>(collection: string, filter?: any): Promise<T[]> {
    const adapter = this.getAdapter();
    return adapter.query<T>(collection, filter);
  }

  /**
   * Finds a single item by ID
   */
  async findById<T>(collection: string, id: number): Promise<T | null> {
    const adapter = this.getAdapter();
    return adapter.findById<T>(collection, id);
  }

  /**
   * Inserts new data into the collection
   */
  async insert<T>(collection: string, data: T): Promise<T> {
    const adapter = this.getAdapter();
    return adapter.insert<T>(collection, data);
  }

  /**
   * Updates existing data in the collection
   */
  async update<T>(collection: string, id: number, data: Partial<T>): Promise<T | null> {
    const adapter = this.getAdapter();
    return adapter.update<T>(collection, id, data);
  }

  /**
   * Deletes data from the collection
   */
  async delete(collection: string, id: number): Promise<boolean> {
    const adapter = this.getAdapter();
    return adapter.delete(collection, id);
  }
}

export const database = new DatabaseManager();
export type { DatabaseAdapter };
