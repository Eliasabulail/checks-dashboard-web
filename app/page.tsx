'use client';

import React, { useEffect, useState } from 'react';
import { CheckItem, DashboardStats } from '../src/types';
import { COLORS } from '../src/constants';
import {
  filterChecks,
  getDashboardStats,
} from '../src/utils/checks';
import CheckCard from '../src/components/CheckCard';
import ConfirmDialog from '../src/components/ConfirmDialog';
import StatsCard from '../src/components/StatsCard';
import CurrencyStats from '../src/components/CurrencyStats';
import SearchAndFilters from '../src/components/SearchAndFilters';
import AddCheckModal from '../src/components/AddCheckModal';
import EmptyState from '../src/components/EmptyState';
import PWAInstallPrompt from '../src/components/PWAInstallPrompt';
import {
  subscribeChecks,
  deleteCheckById,
  updateCheck,
} from '../src/services/checksRepository';
import { db } from '../src/services/firebase';
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  List
} from 'lucide-react';

export default function DashboardScreen() {
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => void;
  }>({ visible: false });
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'today' | 'overdue' | 'upcoming' | 'completed' | 'removed'
  >('today');
  const [modalVisible, setModalVisible] = useState(false);
  const [removedChecks, setRemovedChecks] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeChecks(items => {
      setChecks(items);
      setLoading(false);
    });
    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch {}
    };
  }, []);

  const loadRemovedChecks = () => {
    import('firebase/firestore').then(
      ({ collection, getDocs, query, orderBy }) => {
        const removedChecksQuery = query(
          collection(db, 'removed_checks'),
          orderBy('removedAt', 'desc'),
        );
        getDocs(removedChecksQuery).then(snap => {
          const items = snap.docs.map(d => ({
            ...(d.data() as any),
            docId: d.id,
          }));
          setRemovedChecks(items);
        });
      },
    );
  };

  useEffect(() => {
    if (selectedFilter === 'removed') {
      loadRemovedChecks();
    }
  }, [selectedFilter]);

  const handleModalSuccess = () => {
    setModalVisible(false);
  };

  async function deleteCheck(item: CheckItem) {
    setConfirmDialog({
      visible: true,
      title: 'Are you sure?',
      message: 'Are you sure you want to delete this check?',
      onConfirm: async () => {
        await deleteCheckById(item.id);
      },
    });
  }

  const stats: DashboardStats = getDashboardStats(checks);
  const filteredChecks = filterChecks(checks, searchQuery, selectedFilter);
  const todayChecks = checks.filter(check => {
    const due = new Date(check.dueDate);
    const now = new Date();
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate() &&
      !check.paid
    );
  });
  const overdueChecks = checks.filter(check => {
    const due = new Date(check.dueDate);
    const now = new Date();
    return (
      due < new Date(now.getFullYear(), now.getMonth(), now.getDate()) &&
      !check.paid
    );
  });
  const completedChecks = checks.filter(check => check.paid);

  const currentData = selectedFilter === 'today'
    ? todayChecks
    : selectedFilter === 'overdue'
    ? overdueChecks
    : selectedFilter === 'completed'
    ? completedChecks
    : selectedFilter === 'removed'
    ? removedChecks
    : filteredChecks;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-5 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Checks Dashboard</h1>
              <p className="text-base text-gray-500">Manage your payments</p>
            </div>
            <button
              className="bg-primary hover:bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors"
              onClick={() => setModalVisible(true)}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onCancel={() => setConfirmDialog({ visible: false })}
        onConfirm={async () => {
          if (confirmDialog.onConfirm) {
            await confirmDialog.onConfirm();
          }
          setConfirmDialog({ visible: false });
        }}
      />

      <div className="px-5 py-4">
      <div className="grid grid-cols-2 gap-2 mb-4">

        {/* Currency Stats */}
        <CurrencyStats checks={checks} />
        
        {/* Other Stats */}
          <StatsCard
            title="Overdue"
            value={stats.overdueCount}
            icon={<AlertTriangle className="w-4 h-4" style={{ color: COLORS.danger }} />}
            color={COLORS.danger}
          />
          <StatsCard
            title="Upcoming"
            value={stats.upcomingCount}
            icon={<Clock className="w-4 h-4" style={{ color: COLORS.warning }} />}
            color={COLORS.warning}
          />
          <StatsCard
            title="Total Checks"
            value={stats.totalChecks}
            icon={<List className="w-4 h-4" style={{ color: COLORS.success }} />}
            color={COLORS.success}
          />
        </div>

        {/* Search & Filters */}
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />

        {/* Checks List */}
        <div className="space-y-3">
          {currentData.length === 0 ? (
            <EmptyState filter={selectedFilter} searchQuery={searchQuery} />
          ) : (
            currentData.map((item, index) => (
              <div key={item.id || item.docId || index}>
                {selectedFilter === 'removed' ? (
                  <CheckCard
                    key={item.id || item.docId}
                    item={item}
                    onDelete={() => {}}
                    onPress={async () => {
                      setConfirmDialog({
                        visible: true,
                        title: 'Restore Check',
                        message: 'Are you sure you want to restore this check?',
                        onConfirm: async () => {
                          const { setDoc, deleteDoc, doc } = await import(
                            'firebase/firestore'
                          );
                          const { db } = await import('../src/services/firebase');
                          const {
                            removedAt,
                            originalId: id,
                            ...restoredCheck
                          } = item;
                          await setDoc(doc(db, 'checks', id), {
                            ...restoredCheck,
                            id,
                          });
                          await deleteDoc(doc(db, 'removed_checks', item.docId));
                          loadRemovedChecks();
                        },
                      });
                    }}
                  />
                ) : (
                  <CheckCard
                    item={item}
                    onDelete={deleteCheck}
                    onPress={
                      selectedFilter === 'today'
                        ? () => {
                            setConfirmDialog({
                              visible: true,
                              title: 'Mark as Complete',
                              message:
                                'Are you sure you want to mark this check as complete?',
                              onConfirm: async () => {
                                await updateCheck(item.id, { paid: true });
                              },
                            });
                          }
                        : undefined
                    }
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Check Modal */}
      <AddCheckModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
