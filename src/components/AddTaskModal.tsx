import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, Category, Priority } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'status'>) => void;
}

const initialFormState = {
  title: '',
  description: '',
  category: 'Legal' as Category,
  priority: 'Medium' as Priority,
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  preSubmissionDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().slice(0, 16),
  hasInfoSession: false,
  requiresRegistration: false,
  source: ''
};

export default function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Partial<typeof initialFormState>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Partial<typeof initialFormState> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    if (formData.preSubmissionDate && new Date(formData.preSubmissionDate) >= new Date(formData.deadline)) {
      newErrors.preSubmissionDate = 'Pre-submission date must be before deadline';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onAdd({
      ...formData,
      deadline: new Date(formData.deadline),
      preSubmissionDate: formData.preSubmissionDate ? new Date(formData.preSubmissionDate) : undefined
    });
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Task</h2>
          <button 
            onClick={onClose}
            type="button"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Legal">Legal</option>
                <option value="Administrative">Administrative</option>
                <option value="Financial">Financial</option>
                <option value="Regulatory">Regulatory</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={`w-full rounded-md shadow-sm ${
                  errors.deadline ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-submission Date
              </label>
              <input
                type="datetime-local"
                name="preSubmissionDate"
                value={formData.preSubmissionDate}
                onChange={handleChange}
                className={`w-full rounded-md shadow-sm ${
                  errors.preSubmissionDate ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.preSubmissionDate && (
                <p className="mt-1 text-sm text-red-600">{errors.preSubmissionDate}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="hasInfoSession"
                checked={formData.hasInfoSession}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Information Session</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="requiresRegistration"
                checked={formData.requiresRegistration}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Requires Registration</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                errors.source ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.source && (
              <p className="mt-1 text-sm text-red-600">{errors.source}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}