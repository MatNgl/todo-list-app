import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// chemins corrects depuis features/admin
import { AuthService } from '../auth/services/auth.service';
import { TodoService } from '../todos/services/todo.service';

import { User } from '../auth/models/user.model';
import { Todo } from '../todos/models/todo.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Interface d'Administration</h1>
        <p class="text-gray-600 mt-2">Gérez les utilisateurs et les tickets</p>
      </div>

      <!-- Navigation Admin -->
      <div class="mb-8">
        <nav class="flex space-x-4">
          <button
            (click)="activeTab.set('users')"
            [class.bg-blue-600]="activeTab() === 'users'"
            [class.text-white]="activeTab() === 'users'"
            [class.text-gray-700]="activeTab() !== 'users'"
            class="px-4 py-2 rounded-md font-medium hover:bg-blue-700 hover:text-white transition-colors"
          >
            Utilisateurs
          </button>
          <button
            (click)="activeTab.set('tickets')"
            [class.bg-blue-600]="activeTab() === 'tickets'"
            [class.text-white]="activeTab() === 'tickets'"
            [class.text-gray-700]="activeTab() !== 'tickets'"
            class="px-4 py-2 rounded-md font-medium hover:bg-blue-700 hover:text-white transition-colors"
          >
            Tickets
          </button>
        </nav>
      </div>

      <!-- Onglet Utilisateurs -->
      @if (activeTab() === 'users') {
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h2>
          </div>
          <div class="p-6">
            @if (users().length > 0) {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    @for (user of users(); track user.id) {
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                              <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span class="text-sm font-medium text-gray-700">{{ user.name.charAt(0).toUpperCase() }}</span>
                              </div>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                              <div class="text-sm text-gray-500">{{ user.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            [class.bg-red-100]="user.role === 'admin'"
                            [class.text-red-800]="user.role === 'admin'"
                            [class.bg-green-100]="user.role === 'user'"
                            [class.text-green-800]="user.role === 'user'"
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ user.role | titlecase }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          @if (user.role !== 'admin') {
                            <button (click)="deleteUser(user.id)" class="text-red-600 hover:text-red-900">
                              Supprimer
                            </button>
                          } @else {
                            <span class="text-gray-400">Admin protégé</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-gray-500 text-center py-8">Aucun utilisateur trouvé</p>
            }
          </div>
        </div>
      }

      <!-- Onglet Tickets -->
      @if (activeTab() === 'tickets') {
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Gestion des Tickets</h2>
          </div>
          <div class="p-6">
            @if (todos().length > 0) {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigné à</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    @for (todo of todos(); track todo.id) {
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">{{ todo.title }}</div>
                          @if (todo.description) { <div class="text-sm text-gray-500">{{ todo.description }}</div> }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            [class.bg-yellow-100]="todo.status === 'todo'"
                            [class.text-yellow-800]="todo.status === 'todo'"
                            [class.bg-blue-100]="todo.status === 'in-progress'"
                            [class.text-blue-800]="todo.status === 'in-progress'"
                            [class.bg-green-100]="todo.status === 'done'"
                            [class.text-green-800]="todo.status === 'done'"
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ todo.status | titlecase }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            [class.bg-red-100]="todo.priority === 'high'"
                            [class.text-red-800]="todo.priority === 'high'"
                            [class.bg-yellow-100]="todo.priority === 'medium'"
                            [class.text-yellow-800]="todo.priority === 'medium'"
                            [class.bg-green-100]="todo.priority === 'low'"
                            [class.text-green-800]="todo.priority === 'low'"
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ todo.priority | titlecase }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ todo.assignedTo || 'Non assigné' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button (click)="deleteTodo(todo.id)" class="text-red-600 hover:text-red-900 mr-3">Supprimer</button>
                          <button (click)="assignTodo(todo)" class="text-blue-600 hover:text-blue-900">Assigner</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-gray-500 text-center py-8">Aucun ticket trouvé</p>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private todoService = inject(TodoService);
  private router = inject(Router);

  activeTab = signal<'users' | 'tickets'>('users');
  users = signal<User[]>([]);
  todos = signal<Todo[]>([]);

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      this.router.navigate(['/todos']);
      return;
    }
    this.loadUsers();
    this.loadTodos();
  }

  async loadUsers() {
    try {
      const list: User[] = await this.authService.getAllUsers(); // Promise<User[]>
      this.users.set(list);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  }

  async loadTodos() {
    try {
      const list: Todo[] = await this.todoService.getAllTodos(); // Promise<Todo[]>
      this.todos.set(list);
    } catch (err) {
      console.error('Erreur lors du chargement des tickets:', err);
    }
  }

  async deleteUser(userId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await this.authService.deleteUser(userId); // Promise<void> (à ajouter si absent)
      await this.loadUsers();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  }

  async deleteTodo(todoId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) return;
    try {
      await this.todoService.deleteTodo(todoId); // Promise<void | boolean>
      await this.loadTodos();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  }

  assignTodo(todo: Todo) {
    console.warn('Assigner le ticket:', todo);
  }
}
