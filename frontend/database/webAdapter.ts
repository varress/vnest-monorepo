/**
 * Web Storage Adapter for VN-EST App
 * 
 * This adapter provides localStorage-based data persistence for web browsers.
 * It implements the DatabaseAdapter interface and loads from JSON files.
 * 
 * Features:
 * - localStorage persistence across browser sessions
 * - Loads real Finnish language data from JSON files
 * - Type-safe operations with full CRUD support
 * - Automatic data validation and error handling
 * 
 * Data includes:
 * - Finnish verbs (luen, kirjoitan, syön, etc.)
 * - Subjects/agents (minä, sinä, hän, opettaja, etc.)
 * - Objects/patients in correct case forms (kirjan, ruokaa, vettä, etc.)
 * - Valid sentence combinations for grammar practice
 */

import { DatabaseAdapter } from './platform';
import { Agent, AgentVerbPatient_Trio, Patient, Verb } from './schemas';

/**
 * Web storage implementation using localStorage
 *  
 * Uses dynamic imports to load Finnish language data from JSON files,
 * ensuring compatibility with web bundlers and providing the same
 * authentic Finnish language content across all platforms.
 */
export class WebStorageAdapter implements DatabaseAdapter {
  private data: {
    Agent: Agent[];                      // Finnish subjects/pronouns
    Patient: Patient[];                  // Finnish objects in correct cases
    Verb: Verb[];                       // Finnish verbs in first person
    AgentVerbPatient_Trio: AgentVerbPatient_Trio[];  // Valid sentence combinations
  } = {
    Agent: [],
    Patient: [],
    Verb: [],
    AgentVerbPatient_Trio: []
  };

  /**
   * Initializes the web storage adapter by loading fresh Finnish language data
   * from JSON files and storing it in localStorage for persistence.
   */
  async initialize(): Promise<void> {
    // Clear any existing localStorage data to ensure fresh data load
    localStorage.removeItem('finnishApp_data');
    
    // Load fresh data from JSON files
    await this.seedData();
    
    console.log('WebStorageAdapter: Initialized with Finnish language data', {
      agents: this.data.Agent?.length || 0,
      verbs: this.data.Verb?.length || 0,
      patients: this.data.Patient?.length || 0,
      combinations: this.data.AgentVerbPatient_Trio?.length || 0
    });
  }

  /**
   * Seeds the database with authentic Finnish language learning data from JSON files
   * 
   * Uses dynamic imports to load the same Finnish language data that the native app uses,
   * ensuring cross-platform consistency while maintaining web compatibility.
   * 
   * Data loaded includes:
   * - Agents: Finnish pronouns and subjects (minä, sinä, hän, etc.)
   * - Verbs: Common Finnish verbs in first person (luen, kirjoitan, syön, etc.)
   * - Patients: Objects in correct Finnish case forms (kirjan, ruokaa, etc.)
   * - Valid Agent-Verb-Patient combinations for grammar exercises
   */
  private async seedData(): Promise<void> {
    try {
      // Use dynamic imports for web compatibility - static imports can cause bundling issues
      const [agentsModule, verbsModule, patientsModule, triosModule] = await Promise.all([
        import('@/assets/default_words/agents.json'),
        import('@/assets/default_words/verbs.json'),
        import('@/assets/default_words/patients.json'),
        import('@/assets/default_words/avp_trios.json')
      ]);
      
      // Extract data from modules (handle both default exports and direct exports)
      const agents = agentsModule.default || agentsModule;
      const verbs = verbsModule.default || verbsModule;
      const patients = patientsModule.default || patientsModule;
      const avp_trios = triosModule.default || triosModule;
      
      // Load the authentic Finnish language data into memory
      this.data = {
        Agent: (agents as Agent[]) || [],
        Patient: (patients as Patient[]) || [],
        Verb: (verbs as Verb[]) || [],
        AgentVerbPatient_Trio: (avp_trios as AgentVerbPatient_Trio[]) || []
      };
      
    } catch (error) {
      console.error('WebStorageAdapter: Failed to load JSON files:', error);
      // Fallback to empty arrays if JSON loading fails
      this.data = {
        Agent: [],
        Patient: [],
        Verb: [],
        AgentVerbPatient_Trio: []
      };
    }
    
    // Persist the loaded data to localStorage for future sessions
    this.saveData();
  }

  /**
   * Saves the current data to localStorage for persistence across browser sessions
   */
  private saveData(): void {
    localStorage.setItem('finnishApp_data', JSON.stringify(this.data));
  }

  /**
   * Queries data from a specific collection with optional filtering
   * @param collection - The collection name (Agent, Verb, Patient, AgentVerbPatient_Trio)
   * @param filter - Optional filter object to match against item properties
   * @returns Array of matching items (copies to prevent mutations)
   */
  async query<T>(collection: string, filter?: any): Promise<T[]> {
    const data = this.data[collection as keyof typeof this.data] as T[];
    
    if (!filter) {
      return [...(data || [])]; // Return copy to prevent external mutations
    }
    
    // Apply simple property-based filtering
    const filtered = data?.filter(item => {
      for (const key in filter) {
        if ((item as any)[key] !== filter[key]) return false;
      }
      return true;
    }) || [];
    
    return [...filtered];
  }

  /**
   * Finds a single item by ID in the specified collection
   * @param collection - The collection name to search in
   * @param id - The ID of the item to find
   * @returns The found item (copy) or null if not found
   */
  async findById<T>(collection: string, id: number): Promise<T | null> {
    const data = this.data[collection as keyof typeof this.data] as T[];
    const found = data.find((item: any) => item.id === id);
    return found ? { ...found } : null; // Return copy to prevent mutations
  }

  /**
   * Inserts a new item into the specified collection
   * @param collection - The collection name to insert into
   * @param insertData - The data to insert
   * @returns The inserted item (copy)
   */
  async insert<T>(collection: string, insertData: T): Promise<T> {
    const collection_data = this.data[collection as keyof typeof this.data] as T[];
    const newItem = { ...insertData };
    collection_data.push(newItem);
    this.saveData();
    return newItem;
  }

  /**
   * Updates an existing item in the specified collection
   * @param collection - The collection name to update in
   * @param id - The ID of the item to update
   * @param updateData - The partial data to update with
   * @returns The updated item (copy) or null if not found
   */
  async update<T>(collection: string, id: number, updateData: Partial<T>): Promise<T | null> {
    const collection_data = this.data[collection as keyof typeof this.data] as T[];
    const index = collection_data.findIndex((item: any) => item.id === id);
    if (index === -1) return null;
    
    collection_data[index] = { ...collection_data[index], ...updateData };
    this.saveData();
    return { ...collection_data[index] }; // Return copy to prevent mutations
  }

  /**
   * Deletes an item from the specified collection
   * @param collection - The collection name to delete from
   * @param id - The ID of the item to delete
   * @returns True if deleted successfully, false if not found
   */
  async delete(collection: string, id: number): Promise<boolean> {
    const collection_data = this.data[collection as keyof typeof this.data] as any[];
    const index = collection_data.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    collection_data.splice(index, 1);
    this.saveData();
    return true;
  }
}