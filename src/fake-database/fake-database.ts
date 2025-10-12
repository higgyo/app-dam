import User from "../domain/entities/User";

export class FakeDatabase {
    private instance: FakeDatabase | null = null;

    public users: User[] = [];

    private constructor() {}

    getInstance() {
        if (this.instance === null) {
            this.instance = new FakeDatabase();
        }

        return this.instance;
    }
}
