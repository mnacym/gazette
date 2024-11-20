import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { Task } from '../types';

export function useGazetteTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      enableNetwork(db).catch(console.error);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      disableNetwork(db).catch(console.error);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('deadline'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          const taskList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              deadline: data.deadline?.toDate() || new Date(),
              preSubmissionDate: data.preSubmissionDate?.toDate() || null,
            } as Task;
          });
          setTasks(taskList);
          setError(null);
        } catch (err) {
          console.error('Error processing tasks:', err);
          setError('Failed to process tasks data. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        const errorMessage = !isOnline 
          ? 'You are currently offline. Some features may be limited.'
          : 'Failed to load tasks. Please check your connection and try again.';
        setError(errorMessage);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOnline]);

  const refreshGazette = useCallback(async () => {
    if (!isOnline) {
      setError('Cannot refresh gazette while offline');
      return 0;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchGazette = httpsCallable<void, { newEntries: number }>(
        functions, 
        'fetchGazetteData'
      );
      const result = await fetchGazette();
      return result.data.newEntries;
    } catch (err: any) {
      console.error('Error refreshing gazette:', err);
      const errorMessage = err.code === 'functions/internal'
        ? 'Server error. Please try again later.'
        : 'Failed to refresh gazette data. Please try again.';
      setError(errorMessage);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'status'>) => {
    if (!isOnline) {
      setError('Cannot add tasks while offline');
      throw new Error('Offline');
    }

    try {
      setError(null);
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...task,
        status: 'Pending',
        createdAt: serverTimestamp(),
        deadline: task.deadline,
        preSubmissionDate: task.preSubmissionDate || null
      });
      return { id: docRef.id, ...task, status: 'Pending' as const };
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
      throw err;
    }
  }, [isOnline]);

  const updateTaskStatus = useCallback(async (id: string, status: Task['status']) => {
    if (!isOnline) {
      setError('Cannot update tasks while offline');
      throw new Error('Offline');
    }

    try {
      setError(null);
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, { 
        status,
        updatedAt: serverTimestamp()
      });
      return { id, status };
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task status. Please try again.');
      throw err;
    }
  }, [isOnline]);

  const deleteTask = useCallback(async (id: string) => {
    if (!isOnline) {
      setError('Cannot delete tasks while offline');
      throw new Error('Offline');
    }

    try {
      setError(null);
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
      throw err;
    }
  }, [isOnline]);

  return {
    tasks,
    loading,
    error,
    isOnline,
    addTask,
    updateTaskStatus,
    deleteTask,
    refreshGazette,
  };
}