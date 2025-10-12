import User from "../domain/entities/User";

export class FakeDatabase {
    private static instance: FakeDatabase | null = null;

    public users: User[] = [];

    private constructor() {}

    static getInstance() {
        if (this.instance === null) {
            this.instance = new FakeDatabase();
        }

        return this.instance;
    }
}
