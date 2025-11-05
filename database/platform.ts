import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = !isWeb;

// Platform-specific database interface
export interface DatabaseAdapter {
  initialize(): Promise<void>;
  query<T>(collection: string, filter?: any): Promise<T[]>;
  findById<T>(collection: string, id: number): Promise<T | null>;
  insert<T>(collection: string, data: T): Promise<T>;
  update<T>(collection: string, id: number, data: Partial<T>): Promise<T | null>;
  delete(collection: string, id: number): Promise<boolean>;
}