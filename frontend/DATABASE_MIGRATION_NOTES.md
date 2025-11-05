# Database & Service Architecture Migration Notes

**VN-EST Finnish Language Learning App**  
**Date:** October 2025  
**Purpose:** Technical architecture documentation for development team

## Overview

This file explains the major database and service architecture changes made to the VN-EST App to this stage. The app now uses a **cross-platform database abstraction layer** with **Finnish language data** and **dynamic verb progression**.

---

## New Architecture

### 1. **Cross-Platform Database System**

#### **Before:**
- Single AsyncStorage-based system
- Hardcoded placeholder data ("agent 1", "agent 2", etc.)
- Web compatibility issues

#### **After:**
- **Platform-aware database abstraction**
- **Web:** WebStorageAdapter (localStorage + dynamic JSON imports)
- **Native:** RealmAdapter with WebStorageAdapter fallback
- **Finnish language data** from JSON files

#### **Key Files:**
```
database/
├── index.ts          # Native database manager (Realm + fallback)
├── index.web.ts      # Web-only database manager (localStorage)
├── webAdapter.ts     # Web storage implementation
├── realmAdapter.ts   # Native Realm implementation
├── schemas.ts        # TypeScript interfaces
└── platform.ts      # Platform detection utilities
```

---

## Service Layer

### **DatabaseService (`services/databaseService.ts`)**

#### **Key Features:**
- **Verb-based Learning Sets:** Maps 6 learning sets to specific verbs
- **Grammar Validation:** Validates Finnish sentence combinations
- **Dynamic Progression:** Changes verb after each correct answer

#### **Set Mapping:**
```typescript
const verbIdMap = {
  1: 0, // Set 1, 2, 3, ...
  2: 1, 
  3: 2, 
  4: 3, 
  5: 4, 
  6: 5, 
};
```

#### **Key Methods:**
- `isCorrectCombination()` - Validates correct combination
- `getNextVerb()` - Cycles through verbs sequentially
- `getRandomVerb()` - Random verb selection
- `setCurrentSet()` - Changes learning focus

---

## Gameplay 

### **Dynamic Verb Progression**
**Before:** Static verb throughout exercise  
**After:** **Verb changes after each correct answer**

#### **Flow:**
1. User selects subject + object cards
2. System validates against current verb
3. ✅ **Correct:** Show feedback → Auto-advance to next verb
4. ❌ **Incorrect:** Show feedback → Retry with same verb

#### **Implementation (`app/play.tsx`):**
```typescript
const handleCorrectAnswer = async () => {
  // Move to next verb and refresh data
  await nextVerb();
  // Reset selections for the new verb
  setSelectedSubject(null);
  setSelectedObject(null);
  setFeedback(null);
};
```

---

## Cross-Platform Compatibility

### **Platform-Specific Database Loading**

#### **Web (Metro bundler selects `index.web.ts`):**
```typescript
// WebStorageAdapter with dynamic JSON imports
const [agentsModule, verbsModule] = await Promise.all([
  import('@/assets/default_words/agents.json'),
  import('@/assets/default_words/verbs.json')
]);
```

#### **Native (Metro bundler selects `index.ts`):**
```typescript
// RealmAdapter with WebStorageAdapter fallback
try {
  this.adapter = new RealmAdapter();
} catch (err) {
  this.adapter = new WebStorageAdapter();
}
```

### **Why This Approach:**
- **Web:** Avoids Realm bundling issues, uses localStorage
- **Native:** Uses Realm for performance, falls back gracefully
- **Consistent API:** Same interface across all platforms

---

## Controller Pattern

### **BaseController (`controllers/BaseController.ts`)**

#### **Smart Seeding Strategy:**
1. Initialize database adapter
2. Check if data already exists
3. **WebStorageAdapter:** Seeds during initialization (skip reload)
4. **Other adapters:** Load from JSON files if needed

#### **Controllers:**
- `AgentController` → `agents.json`
- `VerbController` → `verbs.json`
- `PatientController` → `patients.json`
- `AVPTrioController` → `avp_trios.json`

---

## Key Solutions Implemented

### **1. Web Bundling Issues**
**Problem:** Realm imports caused web build failures  
**Solution:** Platform-specific database files (`index.web.ts` vs `index.ts`)

### **2. JSON Loading in Web**
**Problem:** Static imports failed in web environment  
**Solution:** Dynamic imports with fallback handling

### **3. Data Consistency**
**Problem:** Different data between platforms  
**Solution:** Shared JSON files with platform-specific loading

### **4. Performance**
**Problem:** Excessive database reloading  
**Solution:** Smart seeding that checks existing data first

---

## UI Integration

### **New Hook: `useDatabaseWordData`**
```typescript
const {
  wordData,              // Current verb set data
  isCorrectCombination,  // Grammar validation
  nextVerb,              // Progress to next verb
  setCurrentSet          // Change learning set
} = useDatabaseWordData();
```

### **Updated Screens:**
- **`app/play.tsx`:** Dynamic verb progression
- **`app/(tabs)/progress.tsx`:** Progress tracking
- **`app/(tabs)/settings.tsx`:** Updated for new database

---

## Migration Impact

### **Improvements:**
- **Real Finnish words** instead of placeholders
- **Cross-platform compatibility** (web + native)
- **Dynamic verb progression** for better learning
- **Authentic grammar validation**
- **Clean, maintainable architecture**

### **Removed:**
- Old AsyncStorage services
- Placeholder data system
- CSV parsing (switched to JSON)
- Outdated documentation files

---

## Architecture & Design Patterns

For detailed information about the design patterns and architectural decisions used in this project, see:

📖 **[ARCHITECTURE_PATTERNS.md](./ARCHITECTURE_PATTERNS.md)**

**Key Patterns Implemented:**
- **Adapter Pattern** - Cross-platform database abstraction
- **Template Method** - Consistent controller seeding process
- **Strategy Pattern** - Runtime platform selection
- **Factory Pattern** - Metro bundler file selection
- **Repository Pattern** - Data access abstraction
- **Facade Pattern** - Simplified service interfaces
- **Observer Pattern** - React hooks for reactive UI
- **Singleton Pattern** - Single service instances

**Architecture Overview:**
- **6-Layer Architecture** from Presentation to Data
- **Cross-Platform Compatibility** with platform-specific adapters
- **Separation of Concerns** across UI, Business Logic, and Data layers
- **Clean Dependencies** following SOLID principles

---

## Development Workflow

### **Adding New Data:**
1. Update JSON files in `assets/default_words/`
2. Data automatically loads on next app restart
3. No code changes needed for new words/combinations

### **Platform Testing:**
```bash
# Web
npm start → press 'w'

# Native  
npm start → press 'a' (Android) or 'i' (iOS)
```

### **Database Debugging:**
- Console logs show data loading progress
- WebStorageAdapter logs to browser console
- RealmAdapter logs to native console
