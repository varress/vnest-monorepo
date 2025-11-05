# Design Patterns & Architecture Guide

**VN-EST Finnish Language Learning App**  
**Date:** October 2025  
**Purpose:** Technical architecture documentation for development team

---

## Design Patterns & Architecture

### **1. Adapter Pattern**
**Purpose:** Abstract platform-specific database implementations behind a common interface

```typescript
// Common interface
interface DatabaseAdapter {
  initialize(): Promise<void>;
  query<T>(collection: string, filter?: any): Promise<T[]>;
  // ... other CRUD operations
}

// Platform-specific implementations
class WebStorageAdapter implements DatabaseAdapter { ... }
class RealmAdapter implements DatabaseAdapter { ... }
```

**Benefits:**
- **Platform Independence:** Same API across web/native
- **Easy Testing:** Mock adapters for unit tests
- **Extensibility:** Add new storage backends easily

### **2. Template Method Pattern**
**Purpose:** Define common algorithm structure in BaseController, let subclasses customize specifics

```typescript
// Abstract base with template method
abstract class BaseController<T> {
  abstract schemaName: string;    // Customization point
  abstract jsonFileName: string; // Customization point
  
  // Template method - same algorithm for all
  async seedIfNeeded(): Promise<void> {
    // 1. Check if seeded
    // 2. Initialize database
    // 3. Load data if needed
    // 4. Insert data
  }
}

// Concrete implementations
class VerbController extends BaseController<Verb> {
  schemaName = 'Verb';      // Customize
  jsonFileName = 'verbs';   // Customize
}
```

**Benefits:**
- **Code Reuse:** Common logic in base class
- **Consistency:** Same seeding process for all data types
- **Maintainability:** Changes in one place affect all controllers

### **3. Singleton Pattern**
**Purpose:** Ensure single instance of services and controllers

```typescript
// Service singleton
class DatabaseService { ... }
export const databaseService = new DatabaseService();

// Controller singletons
export const verbController = new VerbController();
export const agentController = new AgentController();
```

**Benefits:**
- **Global Access:** Same instance throughout app
- **State Consistency:** Shared state across components
- **Resource Efficiency:** Single database connection

### **4. Strategy Pattern**
**Purpose:** Platform-specific database selection at runtime

```typescript
class DatabaseManager {
  private getAdapter(): DatabaseAdapter {
    if (isWeb) {
      return new WebStorageAdapter();  // Web strategy
    } else {
      try {
        return new RealmAdapter();     // Native strategy
      } catch {
        return new WebStorageAdapter(); // Fallback strategy
      }
    }
  }
}
```

**Benefits:**
- **Runtime Selection:** Choose strategy based on environment
- **Graceful Fallback:** Fallback to alternative if primary fails
- **Clean Separation:** Platform-specific logic isolated

### **5. Factory Pattern (Metro Bundler Integration)**
**Purpose:** Automatic platform-specific module selection

```
database/
├── index.ts      # Native factory
└── index.web.ts  # Web factory
```

**Metro bundler automatically selects:**
- **Web builds:** `index.web.ts`
- **Native builds:** `index.ts`

**Benefits:**
- **Build-time Optimization:** Only include platform-specific code
- **Zero Runtime Cost:** No platform detection overhead
- **Bundle Size:** Smaller bundles per platform

### **6. Observer Pattern (React Hooks)**
**Purpose:** Reactive data flow and state management

```typescript
// Custom hook as observer
export function useDatabaseWordData() {
  const [wordData, setWordData] = useState(null);
  
  // Observe database changes
  const refreshData = useCallback(async () => {
    const data = await databaseService.getWordDataForCurrentVerb();
    setWordData(data); // Notify observers (components)
  }, []);
  
  return { wordData, refreshData, ... };
}
```

**Benefits:**
- **Reactive UI:** Components auto-update when data changes
- **Decoupling:** Components don't directly depend on services
- **Reusability:** Same hook across multiple components

### **7. Facade Pattern**
**Purpose:** Simplified interface over complex subsystems

```typescript
// Complex subsystem
class DatabaseService {
  // Coordinates: Controllers + AVPService + Database
  async getWordDataForCurrentVerb(): Promise<DatabaseWordData> {
    const [verbs, subjects, objects] = await Promise.all([
      verbController.getAll(),      // Controller layer
      agentController.getAll(),     // Controller layer
      patientController.getAll()    // Controller layer
    ]);
    
    const currentVerb = await this.getCurrentVerb();
    const wordBundle = await avpService.GetWordsByVerbId(...); // Service layer
    
    return { verbs, subjects, objects, currentVerb, ... };
  }
}
```

**Benefits:**
- **Simplified API:** One method instead of multiple service calls
- **Encapsulation:** Hide complex coordination logic
- **Consistency:** Same data structure across components

### **8. Repository Pattern**
**Purpose:** Encapsulate data access logic

```typescript
// Each controller acts as a repository
class VerbController extends BaseController<Verb> {
  async getById(id: number): Promise<Verb | null> { ... }
  async getAll(): Promise<Verb[]> { ... }
  // Abstract away database specifics
}

// Service layer uses repositories
class DatabaseService {
  async getAllVerbs(): Promise<Verb[]> {
    return await verbController.getAll(); // Use repository
  }
}
```

**Benefits:**
- **Data Access Abstraction:** Hide database implementation
- **Testability:** Mock repositories for testing
- **Consistency:** Standardized data access patterns

---

## Architectural Layers

### **Layer 1: Presentation (React Components)**
```
app/
├── play.tsx           # Game screen
├── (tabs)/
│   ├── index.tsx      # Home screen
│   ├── progress.tsx   # Progress tracking
│   └── settings.tsx   # Settings screen
└── components/game/   # Reusable UI components
```

**Responsibilities:**
- User interface rendering
- User interaction handling
- State management (local)

### **Layer 2: Hooks (Data Binding)**
```
hooks/
└── useDatabaseWordData.ts  # Data access hook
```

**Responsibilities:**
- Bridge between UI and services
- State management (shared)
- Side effect handling

### **Layer 3: Services (Business Logic)**
```
services/
├── databaseService.ts  # Main business logic
├── avpService.ts      # Grammar validation
└── wordBundle.ts      # Data structures
```

**Responsibilities:**
- Business rules implementation
- Data transformation
- Cross-controller coordination

### **Layer 4: Controllers (Data Access)**
```
controllers/
├── BaseController.ts      # Abstract base
├── VerbController.ts      # Verb data access
├── AgentController.ts     # Agent data access
├── PatientController.ts   # Patient data access
└── AVPTrioController.ts   # Combination data access
```

**Responsibilities:**
- Database interaction
- Data seeding
- CRUD operations

### **Layer 5: Database (Persistence)**
```
database/
├── index.ts           # Native database manager
├── index.web.ts       # Web database manager
├── webAdapter.ts      # Web storage implementation
├── realmAdapter.ts    # Realm implementation
└── schemas.ts         # Data models
```

**Responsibilities:**
- Platform-specific persistence
- Data storage/retrieval
- Cross-platform abstraction

### **Layer 6: Data (Static Assets)**
```
assets/default_words/
├── agents.json        # Finnish subjects
├── verbs.json         # Finnish verbs
├── patients.json      # Finnish objects
└── avp_trios.json     # Valid combinations
```

**Responsibilities:**
- Static Finnish language data
- Grammar rule definitions
- Learning content

---

## Architectural Benefits

### **Separation of Concerns**
- **UI Logic:** Separated from business logic
- **Platform Logic:** Isolated in adapters
- **Data Logic:** Centralized in controllers
- **Business Logic:** Concentrated in services

### **Testability**
- **Unit Testing:** Each layer can be tested independently
- **Mocking:** Interfaces allow easy mocking
- **Integration Testing:** Clear boundaries between layers

### **Maintainability**
- **Low Coupling:** Layers depend on abstractions, not implementations
- **High Cohesion:** Related functionality grouped together
- **Single Responsibility:** Each class/module has one reason to change

### **Scalability**
- **Horizontal:** Add new data types (controllers)
- **Vertical:** Add new platforms (adapters)
- **Feature Growth:** Add new business logic (services)

---

## Pattern Implementation Examples

### **Adding a New Data Type**
1. **Create Schema** (`database/schemas.ts`)
2. **Add JSON Data** (`assets/default_words/newtype.json`)
3. **Create Controller** (extends `BaseController`)
4. **Update Service** (add business logic methods)
5. **Create Hook** (if needed for UI integration)

### **Adding a New Platform**
1. **Create Adapter** (implements `DatabaseAdapter`)
2. **Update Database Manager** (add platform detection)
3. **Test Cross-Platform** (ensure API compatibility)

### **Adding Business Logic**
1. **Update Service** (add methods to `DatabaseService`)
2. **Update Hooks** (expose new functionality)
3. **Update Components** (use new functionality)
