import { create } from 'zustand';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserQuestion } from '@/types';

interface QuestionStore {
  questions: UserQuestion[];
  userQuestions: UserQuestion[];
  isLoading: boolean;
  unsubscribers: (() => void)[];

  fetchAllQuestions: () => void;
  fetchUserQuestions: (userId: string) => void;
  askQuestion: (question: Omit<UserQuestion, 'id' | 'createdAt' | 'status' | 'answer' | 'answeredBy' | 'answeredAt'>) => Promise<void>;
  answerQuestion: (questionId: string, answer: string, answeredBy: string, answeredByName: string) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  getPendingQuestions: () => UserQuestion[];
  getAnsweredQuestions: () => UserQuestion[];
  getUserPendingQuestions: (userId: string) => UserQuestion[];
  getUserAnsweredQuestions: (userId: string) => UserQuestion[];
  cleanup: () => void;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  userQuestions: [],
  isLoading: false,
  unsubscribers: [],

  fetchAllQuestions: () => {
    set({ isLoading: true });
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const questions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserQuestion[];
      set({ questions, isLoading: false });
    });
    set((state) => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  fetchUserQuestions: (userId: string) => {
    const q = query(
      collection(db, 'questions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const userQuestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserQuestion[];
      set({ userQuestions });
    });
    set((state) => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  askQuestion: async (question) => {
    await addDoc(collection(db, 'questions'), {
      ...question,
      status: 'pending',
      createdAt: serverTimestamp(),
      isPublic: true,
    });
  },

  answerQuestion: async (questionId, answer, answeredBy, answeredByName) => {
    const ref = doc(db, 'questions', questionId);
    await updateDoc(ref, {
      answer,
      answeredBy,
      answeredByName,
      status: 'answered',
      answeredAt: serverTimestamp(),
    });
  },

  deleteQuestion: async (questionId: string) => {
    await deleteDoc(doc(db, 'questions', questionId));
  },

  getPendingQuestions: () => {
    return get().questions.filter((q) => q.status === 'pending');
  },

  getAnsweredQuestions: () => {
    return get().questions.filter((q) => q.status === 'answered');
  },

  getUserPendingQuestions: (userId: string) => {
    return get().userQuestions.filter((q) => q.userId === userId && q.status === 'pending');
  },

  getUserAnsweredQuestions: (userId: string) => {
    return get().userQuestions.filter((q) => q.userId === userId && q.status === 'answered');
  },

  cleanup: () => {
    get().unsubscribers.forEach((unsub) => unsub());
    set({ unsubscribers: [], questions: [], userQuestions: [] });
  },
}));
