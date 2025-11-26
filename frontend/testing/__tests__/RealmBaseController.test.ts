// Generated using ClaudeCode. Code has been rechecked and altered.

import { databaseMock }   from "../__mocks__/databaseMock";
import { BaseController } from "@/controllers/realm_controllers/BaseController";

interface TestItem {
    id:   number;
    name: string;
}

class TestController extends BaseController<TestItem> {
    schemaName = "test"
}

describe('BaseController', () => {
    let controller: TestController;

    beforeEach(() => {
        controller = new TestController();
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('should call database.findById with correct schema name and id', async () => {
            const mockItem = { id: 1, name: "Test Item" };
            databaseMock.findById.mockResolvedValue(mockItem);

            const result = await controller.getById(1);

            expect(databaseMock.findById).toHaveBeenCalledWith('test', 1);
            expect(result).toEqual(mockItem);
        });

        it('should return null when item is not found', async () => {
            databaseMock.findById.mockResolvedValue(null);

            const result = await controller.getById(999);

            expect(databaseMock.findById).toHaveBeenCalledWith('test', 999);
            expect(result).toBeNull();
        });
    });

    describe('getAll', () => {
        it('should call database.query with correct schema name', async () => {
            const mockItems = [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" },
                { id: 3, name: "Item 3" }
            ];
            databaseMock.query.mockResolvedValue(mockItems);

            const result = await controller.getAll();

            expect(databaseMock.query).toHaveBeenCalledWith('test');
            expect(result).toEqual(mockItems);
        });

        it('should return empty array when no items exist', async () => {
            databaseMock.query.mockResolvedValue([]);

            const result = await controller.getAll();

            expect(databaseMock.query).toHaveBeenCalledWith('test');
            expect(result).toEqual([]);
        });
    });
});