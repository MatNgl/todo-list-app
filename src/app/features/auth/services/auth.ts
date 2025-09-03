import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  public currentUser$ = this.currentUser.asReadonly();

  // Mock data - utilisateurs de test (→ ajout password + createdAt)
  private users: User[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      password: 'admin123',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      name: 'Normal User',
      email: 'user@example.com',
      role: 'user',
      password: 'user123',
      createdAt: new Date('2024-01-02'),
    },
  ];

  // (Tu peux garder ce mapping ou t’appuyer directement sur user.password)
  private passwords: Record<string, string> = {
    'admin@example.com': 'admin123',
    'user@example.com': 'user123',
  };

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) this.currentUser.set(JSON.parse(savedUser));
  }

  login(credentials: LoginRequest): Observable<User> {
    const user = this.users.find(u => u.email === credentials.email);
    const password = this.passwords[credentials.email];

    if (user && password === credentials.password) {
      this.setCurrentUser(user);
      return of(user).pipe(delay(500));
    }
    return throwError(() => new Error('Email ou mot de passe incorrect'));
  }

  register(userData: RegisterRequest): Observable<User> {
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      return throwError(() => new Error('Cet email est déjà utilisé'));
    }

    const newUser: User = {
      id: this.users.length + 1,
      name: userData.name,
      email: userData.email,
      role: 'user',
      password: userData.password,
      createdAt: new Date()
    };

    this.users.push(newUser);
    this.passwords[userData.email] = userData.password;
    this.setCurrentUser(newUser);

    return of(newUser).pipe(delay(500));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  getAllUsers(): Observable<User[]> {
    return of(this.users).pipe(delay(300));
  }

  deleteUser(userId: number): Observable<void> {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      return of(void 0).pipe(delay(300));
    }
    return throwError(() => new Error('Utilisateur non trouvé'));
  }

  getToken(): string | null {
    const user = this.currentUser();
    return user ? `mock-token-${user.id}` : null;
  }

  setCurrentUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}
