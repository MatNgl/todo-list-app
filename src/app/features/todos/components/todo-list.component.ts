import { Component, signal, computed, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../models/todo.model';
import { TodoService } from '../services/todo.service';
import { PriorityPipe } from '../../../shared/pipes/priority.pipe';
import { HighlightDirective } from '../../../shared/directives/highlight.directive';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PriorityPipe, HighlightDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold mb-6">Mes Todos</h2>

      <!-- 📊 Stats en temps réel (depuis le service) -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">📊 Statistiques en temps réel</h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="bg-white p-4 rounded-lg shadow">
            <h4 class="text-sm font-medium text-gray-500">Total</h4>
            <p class="text-2xl font-bold text-gray-900">{{ todoService.todoStats().total }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <h4 class="text-sm font-medium text-gray-500">Complétés</h4>
            <p class="text-2xl font-bold text-green-600">{{ todoService.todoStats().completed }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <h4 class="text-sm font-medium text-gray-500">En cours</h4>
            <p class="text-2xl font-bold text-blue-600">{{ todoService.todoStats().inProgress }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <h4 class="text-sm font-medium text-gray-500">En attente</h4>
            <p class="text-2xl font-bold text-orange-600">{{ todoService.todoStats().pending }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <h4 class="text-sm font-medium text-gray-500">Taux de complétion</h4>
            <p class="text-2xl font-bold text-purple-600">{{ todoService.todoStats().completionRate }}%</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Chargement des todos...</p>
        </div>
      } @else {

        <!-- 🔎 Recherche -->
        <div class="mb-6">
          <input
            type="text"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Rechercher dans les titres/descriptions"
            class="border p-2 rounded w-full"
          />
        </div>

        <!-- ➕ Formulaire d'ajout -->
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

        <!-- 🧱 Colonnes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- Colonne Todo -->
          <div class="bg-gray-100 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">
              À faire ({{ todosTodo().length }})
            </h3>

            @for (todo of todosTodo(); track todo.id) {
              <div class="bg-white p-4 rounded shadow mb-3" [appHighlight]="todo.priority">
                <h4 class="font-semibold">{{ todo.title }}</h4>
                @if (todo.description) {
                  <p class="text-gray-600 text-sm mt-1">{{ todo.description }}</p>
                }
                <div class="flex justify-between items-center mt-2">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full"
                        [class.bg-red-100]="todo.priority === 'high'"
                        [class.text-red-800]="todo.priority === 'high'"
                        [class.bg-yellow-100]="todo.priority === 'medium'"
                        [class.text-yellow-800]="todo.priority === 'medium'"
                        [class.bg-green-100]="todo.priority === 'low'"
                        [class.text-green-800]="todo.priority === 'low'">
                    {{ todo.priority | priority }}
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
              En cours ({{ todosInProgress().length }})
            </h3>

            @for (todo of todosInProgress(); track todo.id) {
              <div class="bg-white p-4 rounded shadow mb-3" [appHighlight]="todo.priority">
                <h4 class="font-semibold">{{ todo.title }}</h4>
                @if (todo.description) {
                  <p class="text-gray-600 text-sm mt-1">{{ todo.description }}</p>
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
              Terminé ({{ todosDone().length }})
            </h3>

            @for (todo of todosDone(); track todo.id) {
              <div class="bg-white p-4 rounded shadow mb-3 opacity-75" [appHighlight]="todo.priority">
                <h4 class="font-semibold line-through">{{ todo.title }}</h4>
                @if (todo.description) {
                  <p class="text-gray-600 text-sm mt-1 line-through">{{ todo.description }}</p>
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


export class TodoListComponent implements OnInit {
  public todoService = inject(TodoService);

  trackByTodoId(index: number, todo: Todo): number {
    return todo.id;
  }

  // état local
  loading = signal<boolean>(true);
  addingTodo = signal<boolean>(false);

  // recherche (signal)
  search = signal<string>('');

  // formulaire
  newTodo: { title: string; description: string; priority: Todo['priority'] } = {
    title: '',
    description: '',
    priority: 'medium'
  };

  private allTodos = computed<Todo[]>(() => this.todoService.todos());

  /** Filtre texte (titre/description) */
  filteredTodos = computed<Todo[]>(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.allTodos();

    return this.allTodos().filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q) ?? false)
    );
  });

  /** Listes par statut (déjà filtrées par recherche) */
  todosTodo = computed(() => this.filteredTodos().filter(t => t.status === 'todo'));
  todosInProgress = computed(() => this.filteredTodos().filter(t => t.status === 'in-progress'));
  todosDone = computed(() => this.filteredTodos().filter(t => t.status === 'done'));
  // ======================================

  async ngOnInit() {
    await this.loadTodos();
  }

  async loadTodos() {
    try {
      this.loading.set(true);
      await this.todoService.getAllTodos(); // hydrate le signal interne du service
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

        // reset form (les listes/compteurs se mettent à jour grâce aux computed)
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
      await this.loadTodos(); // si le service met déjà à jour son signal, ceci peut être optionnel
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  }

  async deleteTodo(id: number) {
    try {
      await this.todoService.deleteTodo(id);
      // pas besoin de recharger si le service met à jour son signal
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  getPriorityLabel(priority: Todo['priority']): string {
    const labels = {
      low: '🟢 Faible',
      medium: '🟡 Moyenne',
      high: '🔴 Haute'
    };
    return labels[priority];
  }

  // Méthodes utilitaires
  getTodosByStatus(status: Todo['status']): Todo[] {
    return this.todoService.getTodosByStatus(status);
  }
}