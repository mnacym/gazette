import React from 'react';
import { Clock, AlertCircle, CheckCircle2, ArrowUpCircle, Calendar, Users, Info } from 'lucide-react';
import { Task } from '../types';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: Task['status']) => void;
}

const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800',
};

const statusIcons = {
  Pending: Clock,
  'In Progress': ArrowUpCircle,
  Completed: CheckCircle2,
  Overdue: AlertCircle,
};

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const StatusIcon = statusIcons[task.status];
  const isOverdue = isPast(new Date(task.deadline)) && task.status !== 'Completed';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{task.description}</p>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            Due: {format(new Date(task.deadline), 'PPP')}
          </span>
        </div>

        {task.preSubmissionDate && (
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Pre-submission: {format(new Date(task.preSubmissionDate), 'PPP')}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500">
          <StatusIcon className="w-4 h-4 mr-2" />
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="flex space-x-4 mt-2">
          {task.hasInfoSession && (
            <div className="flex items-center text-sm text-blue-600">
              <Info className="w-4 h-4 mr-1" />
              <span>Info Session</span>
            </div>
          )}
          {task.requiresRegistration && (
            <div className="flex items-center text-sm text-purple-600">
              <Users className="w-4 h-4 mr-1" />
              <span>Registration Required</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          Source: {task.source}
        </span>
      </div>
    </div>
  );
}