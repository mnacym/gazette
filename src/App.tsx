import React, { useState } from 'react';
import { PlusCircle, Newspaper, RefreshCcw } from 'lucide-react';
import { Category, Priority, Status } from './types';
import TaskCard from './components/TaskCard';
import TaskFilters from './components/TaskFilters';
import AddTaskModal from './components/AddTaskModal';
import LoadingSpinner from './components/LoadingSpinner';
import { useGazetteTasks } from './hooks/useGazetteTasks';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'All'>('All');

  const {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    refreshGazette,
  } = useGazetteTasks();

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = selectedCategory === 'All' || task.category === selectedCategory;
    const priorityMatch = selectedPriority === 'All' || task.priority === selectedPriority;
    const statusMatch = selectedStatus === 'All' || task.status === selectedStatus;
    return categoryMatch && priorityMatch && statusMatch;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Tasks</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Newspaper className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gazette Task Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshGazette}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Gazette</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskFilters
          selectedCategory={selectedCategory}
          selectedPriority={selectedPriority}
          selectedStatus={selectedStatus}
          onCategoryChange={setSelectedCategory}
          onPriorityChange={setSelectedPriority}
          onStatusChange={setSelectedStatus}
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
              />
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  No tasks found. Add a new task or refresh gazette data to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
      />
    </div>
  );
}