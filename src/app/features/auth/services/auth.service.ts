import { Injectable, signal } from '@angular/core';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    // --- État ---
    private users = signal<User[]>([
        {
            id: 1,
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date('2024-01-01'),
            name: 'superadmin',
        },
        {
            id: 2,
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
            createdAt: new Date('2024-01-02'),
            name: 'userclient',
        },
    ]);

    private currentUser = signal<User | null>(null);
    /** 🔎 Pour le header (read-only) */
    public readonly currentUser$ = this.currentUser.asReadonly();

    constructor() {
        // 🔁 Restaurer la session au démarrage
        const raw = localStorage.getItem('currentUser');
        if (raw) {
            try { this.currentUser.set(JSON.parse(raw)); } catch { /* ignore */ }
        }
    }

    // --- Utils ---
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    private persistSession(user: User | null) {
        if (user) {
            const { ...sessionUser } = user;
            localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // --- Token pour l'intercepteur ---
    getToken(): string | null {
        const user = this.currentUser();
        return user ? `mock-token-${user.id}` : null; // token factice
    }

    // --- Auth ---
    async login(credentials: LoginRequest): Promise<{ success: boolean; user?: User; error?: string }> {
        await this.delay(500);

        const user = this.users().find(
            (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) return { success: false, error: 'Email ou mot de passe incorrect' };

        this.currentUser.set(user);
        this.persistSession(user);
        return { success: true, user };
    }

    async register(userData: RegisterRequest): Promise<{ success: boolean; user?: User; error?: string }> {
        await this.delay(600);

        if (this.users().some((u) => u.email === userData.email)) {
            return { success: false, error: 'Cet email est déjà utilisé' };
        }
        if (userData.password !== userData.confirmPassword) {
            return { success: false, error: 'Les mots de passe ne correspondent pas' };
        }

        const newUser: User = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'user',
            createdAt: new Date(),
        };

        this.users.update((arr) => [...arr, newUser]);
        this.currentUser.set(newUser);
        this.persistSession(newUser);

        return { success: true, user: newUser };
    }

    async logout(): Promise<void> {
        await this.delay(200);
        this.currentUser.set(null);
        this.persistSession(null);
    }

    // --- Helpers / Admin ---
    isAuthenticated(): boolean {
        return this.currentUser() !== null;
    }
    getCurrentUser(): User | null {
        return this.currentUser();
    }
    isAdmin(): boolean {
        return this.currentUser()?.role === 'admin';
    }

    async getAllUsers(): Promise<User[]> {
        await this.delay(400);
        if (!this.isAdmin()) throw new Error('Accès non autorisé');

        return this.users().map((u) => ({ ...u, password: '***' }));
    }

    async deleteUser(userId: number): Promise<void> {
        await this.delay(200);
        const exists = this.users().some((u) => u.id === userId);
        if (!exists) throw new Error('Utilisateur non trouvé');

        this.users.update((arr) => arr.filter((u) => u.id !== userId));

        if (this.currentUser()?.id === userId) {
            await this.logout();
        }
    }
}
