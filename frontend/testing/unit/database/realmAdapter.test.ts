// Generated using ClaudeCode. Code has been rechecked and altered.
// I do not understand, how to properly test this file with unit tests. Will rely on integration tests.

import { RealmAdapter } from "@/database/realmAdapter";

describe('RealmAdapter', () => {
    let adapter: RealmAdapter;

    beforeEach(() => {
        adapter = new RealmAdapter();
    });

    it('should be instantiable', () => {
        expect(adapter).toBeInstanceOf(RealmAdapter);
    });

    it('should have initialize method', () => {
        expect(typeof adapter.initialize).toBe('function');
    });

    it('should have query method', () => {
        expect(typeof adapter.query).toBe('function');
    });

    it('should have findById method', () => {
        expect(typeof adapter.findById).toBe('function');
    });

    it('should have insert method', () => {
        expect(typeof adapter.insert).toBe('function');
    });

    it('should have update method', () => {
        expect(typeof adapter.update).toBe('function');
    });

    it('should have delete method', () => {
        expect(typeof adapter.delete).toBe('function');
    });
});
