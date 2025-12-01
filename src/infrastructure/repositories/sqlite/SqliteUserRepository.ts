import User from "../../../domain/entities/User";
import Email from "../../../domain/value-objects/Email";
import Password from "../../../domain/value-objects/Password";
import { getDatabase } from "../../database";
import { UserRow } from "../../database/schema";

export class SqliteUserRepository {
    async saveUser(user: User): Promise<void> {
        const db = await getDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO users (id, name, email, latitude, longitude, updated_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [
                user.id,
                user.name,
                user.email.value,
                user.location?.latitude ?? null,
                user.location?.longitude ?? null,
            ]
        );
    }

    async findById(id: string): Promise<User | null> {
        const db = await getDatabase();

        const row = await db.getFirstAsync<UserRow>(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );

        if (!row) {
            return null;
        }

        return this.mapRowToUser(row);
    }

    async findByEmail(email: string): Promise<User | null> {
        const db = await getDatabase();

        const row = await db.getFirstAsync<UserRow>(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );

        if (!row) {
            return null;
        }

        return this.mapRowToUser(row);
    }

    async deleteUser(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM users WHERE id = ?`, [id]);
    }

    async updateUser(user: User): Promise<void> {
        const db = await getDatabase();

        await db.runAsync(
            `UPDATE users SET name = ?, email = ?, latitude = ?, longitude = ?, updated_at = datetime('now')
             WHERE id = ?`,
            [
                user.name,
                user.email.value,
                user.location?.latitude ?? null,
                user.location?.longitude ?? null,
                user.id,
            ]
        );
    }

    async getAllUsers(): Promise<User[]> {
        const db = await getDatabase();

        const rows = await db.getAllAsync<UserRow>(`SELECT * FROM users`);

        return rows.map((row) => this.mapRowToUser(row));
    }

    async clearAll(): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM users`);
    }

    private mapRowToUser(row: UserRow): User {
        // Note: We don't store passwords locally for security reasons
        // Using a placeholder password that won't be used for authentication
        return User.create({
            id: row.id,
            name: row.name,
            email: row.email,
            password: "CachedUser#123", // Placeholder, not used for auth
            latitude: row.latitude ?? undefined,
            longitude: row.longitude ?? undefined,
        });
    }
}
