import React from 'react';
import { Filter } from 'lucide-react';
import { Category, Priority, Status } from '../types';

interface TaskFiltersProps {
  selectedCategory: Category | 'All';
  selectedPriority: Priority | 'All';
  selectedStatus: Status | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  onPriorityChange: (priority: Priority | 'All') => void;
  onStatusChange: (status: Status | 'All') => void;
}

export default function TaskFilters({
  selectedCategory,
  selectedPriority,
  selectedStatus,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
}: TaskFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Category | 'All')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Legal">Legal</option>
            <option value="Administrative">Administrative</option>
            <option value="Financial">Financial</option>
            <option value="Regulatory">Regulatory</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as Priority | 'All')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as Status | 'All')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>
    </div>
  );
}