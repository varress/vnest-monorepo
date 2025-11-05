import { DatabaseAdapter } from './platform';

let Realm: any;
let realmConfig: any;

// Dynamically import Realm only on native platforms
const initializeRealm = async () => {
  if (!Realm) {
    const realmModule = await import('realm');
    Realm = realmModule.default;
    const configModule = await import('./realm');
    realmConfig = configModule.realmConfig;
  }
};

export class RealmAdapter implements DatabaseAdapter {
  private realm: any = null;

  async initialize(): Promise<void> {
    if (!this.realm) {
      await initializeRealm();
      this.realm = await Realm.open(realmConfig);
    }
  }

  async query<T>(collection: string, filter?: any): Promise<T[]> {
    await this.initialize();
    
    const results = this.realm!.objects<T>(collection);
    if (!filter) return Array.from(results);
    
    // Convert filter to Realm query string if needed
    const filterString = Object.keys(filter)
      .map(key => `${key} = $${key}`)
      .join(' AND ');
    
    const filtered = results.filtered(filterString, filter);
    return Array.from(filtered);
  }

  async findById<T>(collection: string, id: number): Promise<T | null> {
    await this.initialize();
    
    const result = this.realm!.objectForPrimaryKey<T>(collection, id as any);
    return result || null;
  }

  async insert<T>(collection: string, data: T): Promise<T> {
    await this.initialize();
    
    let result: T;
    this.realm!.write(() => {
      // Use 'modified' update mode to insert or update if primary key exists
      result = this.realm!.create(collection, data, 'modified');
    });
    return result!;
  }

  async update<T>(collection: string, id: number, updateData: Partial<T>): Promise<T | null> {
    await this.initialize();
    
    const existing = this.realm!.objectForPrimaryKey<T>(collection, id as any);
    if (!existing) return null;
    
    this.realm!.write(() => {
      Object.assign(existing, updateData);
    });
    return existing;
  }

  async delete(collection: string, id: number): Promise<boolean> {
    await this.initialize();
    
    const existing = this.realm!.objectForPrimaryKey(collection, id as any);
    if (!existing) return false;
    
    this.realm!.write(() => {
      this.realm!.delete(existing);
    });
    return true;
  }
}