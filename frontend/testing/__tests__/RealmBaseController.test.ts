import { BaseController } from "@/controllers/realm_controllers/BaseController";
import { database } from "@/database";

jest.mock('@/database', () => ({
    database: {
        findById: jest.fn(),
        query:    jest.fn()
    }
}));

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
    });

    it("Call database.findById with correct values", async () => {
        (database.findById as jest.Mock).mockResolvedValue({ id: 1, name: "Test" });

        const result = await controller.getById(1);

        expect(database.findById).toHaveBeenCalledWith('test', 1);
        expect(result).toEqual({ id: 1, name: "Test" })
    });
});