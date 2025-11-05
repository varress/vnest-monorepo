/**
 * Web Database Manager for VN-EST App
 * 
 * This version is automatically selected by Metro bundler for web platforms.
 * It exclusively uses WebStorageAdapter to avoid Realm imports that would
 * cause bundling issues in web environments.
 * 
 * Features:
 * - localStorage-based persistence
 * - Dynamic JSON data loading
 * - Cross-platform API compatibility
 * - Web-optimized performance
 */

import { DatabaseAdapter } from './platform';
import { WebStorageAdapter } from './webAdapter';

/**
 * Database manager that provides a unified interface for web platforms
 */
class DatabaseManager {
  private adapter: DatabaseAdapter;

  constructor() {
    // Use WebStorageAdapter exclusively for web to avoid Realm bundling issues
    this.adapter = new WebStorageAdapter();
  }

  /**
   * Initializes the database adapter and loads Finnish language data
   */
  async initialize(): Promise<void> {
    await this.adapter.initialize();
  }

  /**
   * Queries data from the specified collection
   */
  async query<T>(collection: string, filter?: any): Promise<T[]> {
    return this.adapter.query<T>(collection, filter);
  }

  /**
   * Finds a single item by ID
   */
  async findById<T>(collection: string, id: number): Promise<T | null> {
    return this.adapter.findById<T>(collection, id);
  }

  /**
   * Inserts new data into the collection
   */
  async insert<T>(collection: string, data: T): Promise<T> {
    return this.adapter.insert<T>(collection, data);
  }

  /**
   * Updates existing data in the collection
   */
  async update<T>(collection: string, id: number, data: Partial<T>): Promise<T | null> {
    return this.adapter.update<T>(collection, id, data);
  }

  /**
   * Deletes data from the collection
   */
  async delete(collection: string, id: number): Promise<boolean> {
    return this.adapter.delete(collection, id);
  }
}

export const database = new DatabaseManager();
export { DatabaseAdapter } from './platform';
