import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../models/todo.model';
import { TodoService } from '../services/todo.service';
import { HighlightDirective } from '../../../shared/directives/highlight.directive';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightDirective],
  template: `
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold mb-6">Mes Todos</h2>

      <!-- Recherche -->
      <div class="mb-6">
        <input
          type="text"
          [(ngModel)]="search"
          placeholder="Rechercher dans les titres/descriptions"
          class="border p-2 rounded w-full"
        />
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Chargement des todos...</p>
        </div>
      } @else {
        <!-- Formulaire d'ajout -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 class="text-xl font-semibold mb-4">Ajouter une tâche</h3>
          <form (ngSubmit)="addTodo()" #todoForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                [(ngModel)]="newTodo.title"
                name="title"
                placeholder="Titre de la tâche"
                class="border p-2 rounded"
                required>

              <input
                type="text"
                [(ngModel)]="newTodo.description"
                name="description"
                placeholder="Description (optionnel)"
                class="border p-2 rounded">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                [(ngModel)]="newTodo.priority"
                name="priority"
                class="border p-2 rounded">
                <option value="low">Basse priorité</option>
                <option value="medium">Priorité moyenne</option>
                <option value="high">Haute priorité</option>
              </select>

              <button
                type="submit"
                [disabled]="!todoForm.form.valid || addingTodo()"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                @if (addingTodo()) {
                  <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Ajout en cours...
                } @else {
                  Ajouter
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Liste des todos -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Colonne Todo -->
          <div class="bg-gray-100 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">
              À faire ({{ getTodosByStatus('todo').length }})
            </h3>
            @for (todo of getTodosByStatus('todo'); track todo.id) {
              <div class="bg-white p-4 rounded shadow mb-3">
                <h4 class="font-semibold">
                  <span [appHighlight]="search">{{ todo.title }}</span>
                </h4>
                @if (todo.description) {
                  <p class="text-gray-600 text-sm mt-1">
                    <span [appHighlight]="search">{{ todo.description }}</span>
                  </p>
                }
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs px-2 py-1 rounded"
                        [ngClass]="{
                          'bg-red-100 text-red-800': todo.priority === 'high',
                          'bg-yellow-100 text-yellow-800': todo.priority === 'medium',
                          'bg-green-100 text-green-800': todo.priority === 'low'
                        }">
                    {{ todo.priority | titlecase }}
                  </span>
                  <button
                    (click)="updateStatus(todo.id, 'in-progress')"
                    class="text-blue-600 hover:text-blue-800">
                    Commencer
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Colonne In Progress -->
          <div class="bg-gray-100 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4 text-blue-700">
              En cours ({{ getTodosByStatus('in-progress').length }})
            </h3>
            @for (todo of getTodosByStatus('in-progress'); track todo.id) {
              <div class="bg-white p-4 rounded shadow mb-3">
                <h4 class="font-semibold">
                  <span [appHighlight]="search">{{ todo.title }}</span>
                </h4>
                @if (todo.description) {
                  <p class="text-gray-600 text-sm mt-1">
                    <span [appHighlight]="search">{{ todo.description }}</span>
                  </p>
                }
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs px-2 py-1 rounded"
                        [ngClass]="{
                          'bg-red-100 text-red-800': todo.priority === 'high',
                          'bg-yellow-100 text-yellow-800': todo.priority === 'medium',
                          'bg-green-100 text-green-800': todo.priority === 'low'
                        }">
                    {{ todo.priority | titlecase }}
                  </span>
                  <button
                    (click)="updateStatus(todo.id, 'done')"
                    class="text-green-600 hover:text-green-800">
                    Terminer
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Colonne Done -->
          <div class="bg-gray-100 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4 text-green-700">
              Terminé ({{ getTodosByStatus('done').length }})
            </h3>
            @for (todo of getTodosByStatus('done'); track todo.id) {
              <div class="bg-white p-4 rounded shadow mb-3 opacity-75">
                <h4 class="font-semibold line-through">
                  <span [appHighlight]="search">{{ todo.title }}</span>
                </h4>
                @if (todo.description) {
                  <p class="text-gray-600 text-sm mt-1 line-through">
                    <span [appHighlight]="search">{{ todo.description }}</span>
                  </p>
                }
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    {{ todo.priority | titlecase }}
                  </span>
                  <button
                    (click)="deleteTodo(todo.id)"
                    class="text-red-600 hover:text-red-800">
                    Supprimer
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ListComponent implements OnInit {
  private todoService = inject(TodoService);

  todos = signal<Todo[]>([]);
  loading = signal(true);
  addingTodo = signal(false);
  search = '';

  newTodo = {
    title: '',
    description: '',
    priority: 'medium' as const
  };

  async ngOnInit() {
    await this.loadTodos();
  }

  async loadTodos() {
    try {
      this.loading.set(true);
      const todos = await this.todoService.getAllTodos();
      this.todos.set(todos);
    } catch (error) {
      console.error('Erreur lors du chargement des todos:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async addTodo() {
    if (this.newTodo.title.trim()) {
      try {
        this.addingTodo.set(true);
        await this.todoService.createTodo({
          title: this.newTodo.title,
          description: this.newTodo.description,
          priority: this.newTodo.priority
        });
        await this.loadTodos();
        this.newTodo.title = '';
        this.newTodo.description = '';
      } catch (error) {
        console.error('Erreur lors de l\'ajout du todo:', error);
      } finally {
        this.addingTodo.set(false);
      }
    }
  }

  async updateStatus(id: number, status: Todo['status']) {
    try {
      await this.todoService.updateTodo(id, { status });
      await this.loadTodos();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  }

  async deleteTodo(id: number) {
    try {
      await this.todoService.deleteTodo(id);
      await this.loadTodos();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  getTodosByStatus(status: Todo['status']): Todo[] {
    return this.todos().filter(todo => todo.status === status);
  }
}
