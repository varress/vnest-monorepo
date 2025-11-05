import { getRealm } from "@/database/realm";
import { IBaseController } from "../interfaces/IBaseController";

/**
 * Base controller for data management
 * 
 * Provides common functionality for all data controllers including:
 * - CRUD operations with type safety
 * 
 * Each concrete controller specifies its schema name.
 */
export abstract class BaseController<T> implements IBaseController<T> {
    abstract schemaName: string;   // Database collection/table name

    getRandomElements<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Retrieves a single item by ID
     * @param id - The ID of the item to retrieve
     * @returns The item or null if not found
     */
    async getById(id: number): Promise<T | null> {
        const realm = await getRealm();
        const obj =   realm.objectForPrimaryKey<T>(this.schemaName, id as any);
        return obj ?? null;
    }

    /**
     * Retrieves all items in this collection
     * @returns Array of all items in the collection
     */
    async getAll(): Promise<T[]> {
        const realm = await getRealm();
        return realm.objects<T>(this.schemaName).map(obj => ({ ...obj }));
    }
}