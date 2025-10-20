import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CheckItem, DashboardStats, Priority } from '../types';
import { COLORS } from '../constants';
import {
  filterChecks,
  getDashboardStats,
  getPriorityColor,
  getCurrencyStats,
} from '../utils/checks';
import { formatDate } from '../utils/date';
import CheckCard from '../components/CheckCard';
import {
  initializeNotificationService,
  scheduleCheckReminders,
  cancelNotifications,
} from '../services/notifications';
import {
  subscribeChecks,
  createCheck,
  deleteCheckById,
  setNotificationIds,
} from '../services/checksRepository';
import { db } from '../services/firebase';
import ConfirmDialog from '../components/ConfirmDialog';

export default function DashboardScreen() {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => void;
  }>({ visible: false });
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'today' | 'overdue' | 'upcoming' | 'completed' | 'removed'
  >('today');
  const [priority, setPriority] = useState<Priority>('medium');
  const [payee, setPayee] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [removedChecks, setRemovedChecks] = useState<any[]>([]);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    initializeNotificationService();
  }, []);

  useEffect(() => {
    loadRemovedChecks();
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
      // Fetch removed checks from Firestore
      loadRemovedChecks();
    }
  }, [selectedFilter]);

  function onChangeDate(_: any, selectedDate?: Date) {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  }

  function validateForm() {
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = 'Please enter a check title';
    const amt = parseFloat(amount);
    if (!amount.trim() || isNaN(amt) || amt <= 0)
      errors.amount = 'Please enter a valid amount';
    if (!(date instanceof Date) || isNaN(date.getTime()))
      errors.date = 'Please select a valid due date';
    if (payee?.trim() && payee?.trim().length < 2)
      errors.payee = 'Payee must be at least 2 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0 ? null : 'Please fix the errors';
  }

  async function addCheck() {
    setBtnLoading(true);
    const error = validateForm();
    if (error) {
      setBtnLoading(false);
      return;
    }
    const toCreate = {
      title: title.trim(),
      amount: parseFloat(amount),
      dueDate: date.toISOString(),
      priority,
      payee: payee?.trim() || null,
      notificationId: null as string | null,
      currency,
    };
    const newId = await createCheck(toCreate as Omit<CheckItem, 'id'>);
    if (Platform.OS !== 'web') {
      const notificationId = await scheduleCheckReminders(
        newId,
        toCreate.dueDate,
        toCreate.title,
        toCreate.priority || 'medium',
      );
      if (notificationId) await setNotificationIds(newId, notificationId);
    }
    setTitle('');
    setAmount('');
    setPayee(null);
    setDate(new Date());
    setPriority('medium');
    setFormErrors({});
    setModalVisible(false);
    setBtnLoading(false);
  }

  useEffect(() => {
    setFormErrors({});
  }, [title, amount, payee, priority, date]);

  async function deleteCheck(item: CheckItem) {
    setConfirmDialog({
      visible: true,
      title: 'Are you sure?',
      message: 'Are you sure you want to delete this check?',
      onConfirm: async () => {
        item.notificationId && (await cancelNotifications(item.notificationId));
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
    // Exclude today and paid
    return (
      due < new Date(now.getFullYear(), now.getMonth(), now.getDate()) &&
      !check.paid
    );
  });
  const completedChecks = checks.filter(check => check.paid);
  const currencyStats = getCurrencyStats(checks);

  const renderStatsCard = (
    titleText: string,
    value: string | number,
    icon: string,
    color: string,
  ) => (
    <View style={[styles.statsCard, { borderTopColor: color }]}>
      <View style={styles.statsRow}>
        <View style={[styles.statsIconWrap, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <View style={styles.statsTextWrap}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{titleText}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={
          selectedFilter === 'today'
            ? todayChecks
            : selectedFilter === 'overdue'
            ? overdueChecks
            : selectedFilter === 'completed'
            ? completedChecks
            : selectedFilter === 'removed'
            ? removedChecks
            : filteredChecks
        }
        keyExtractor={(item, index) =>
          item.id || item.docId || index.toString()
        }
        renderItem={({ item }) => (
          <View style={{ paddingInline: 20 }}>
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
                      const { db } = await import('../services/firebase');
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
                            const { updateCheck } = await import(
                              '../services/checksRepository'
                            );
                            await updateCheck(item.id, { paid: true });
                          },
                        });
                      }
                    : undefined
                }
              />
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 0 }}
        ListEmptyComponent={() =>
          selectedFilter === 'removed' ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trash" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No removed checks</Text>
              <Text style={styles.emptySubtitle}>
                Deleted checks will appear here
              </Text>
            </View>
          ) : selectedFilter === 'today' ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="sunny" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No checks due today</Text>
            </View>
          ) : selectedFilter === 'overdue' ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="warning" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No overdue checks</Text>
            </View>
          ) : selectedFilter === 'completed' ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No completed checks</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No checks found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Add your first check to get started'}
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View
              style={[
                styles.header,
              ]}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.headerTitle}>Checks Dashboard</Text>
                  <Text style={styles.headerSubtitle}>
                    Manage your payments
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

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

            <StatusBar
              barStyle="dark-content"
              backgroundColor={COLORS.background}
            />

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                {Object.entries(getCurrencyStats(checks)).map(([cur, obj]) => (
                  <View
                    key={cur}
                    style={[
                      styles.statsCard,
                      {
                        borderTopColor:
                          cur === 'USD'
                            ? '#1976D2'
                            : cur === 'JOD'
                            ? '#388e3c'
                            : '#d32f2f',
                      },
                    ]}
                  >
                    <View style={styles.statsRow}>
                      <View
                        style={[
                          styles.statsIconWrap,
                          {
                            backgroundColor:
                              (cur === 'USD'
                                ? '#1976D2'
                                : cur === 'JOD'
                                ? '#388e3c'
                                : '#d32f2f') + '20',
                          },
                        ]}
                      >
                        <Ionicons
                          name="cash"
                          size={18}
                          color={
                            cur === 'USD'
                              ? '#1976D2'
                              : cur === 'JOD'
                              ? '#388e3c'
                              : '#d32f2f'
                          }
                        />
                      </View>
                      <View style={styles.statsTextWrap}>
                        <Text style={styles.statsValue}>
                          {cur === 'USD' ? '$' : ''}
                          {obj.totalAmount.toFixed(2)}
                          {cur !== 'USD' ? ' ' + cur : ''}
                        </Text>
                        <Text style={styles.statsTitle}>
                          {cur} • {obj.count} Check{obj.count > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                {renderStatsCard(
                  'Overdue',
                  stats.overdueCount,
                  'warning',
                  COLORS.danger,
                )}
                {renderStatsCard(
                  'Upcoming',
                  stats.upcomingCount,
                  'time',
                  COLORS.warning,
                )}
                {renderStatsCard(
                  'Total Checks',
                  stats.totalChecks,
                  'list',
                  COLORS.success,
                )}
              </View>
            </View>

            {/* Search & Filters */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  placeholder="Search checks..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
              >
                {[
                  { key: 'all', label: 'All', icon: 'list' },
                  { key: 'today', label: 'Today', icon: 'sunny' },
                  { key: 'overdue', label: 'Overdue', icon: 'warning' },
                  { key: 'upcoming', label: 'Upcoming', icon: 'time' },
                  {
                    key: 'completed',
                    label: 'Completed',
                    icon: 'checkmark-done',
                  },
                  { key: 'removed', label: 'Removed', icon: 'trash' },
                ].map(filter => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      selectedFilter === (filter.key as any) &&
                        styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter(filter.key as any)}
                  >
                    <Ionicons
                      name={filter.icon as any}
                      size={16}
                      color={
                        selectedFilter === (filter.key as any) ? '#fff' : '#666'
                      }
                    />
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === (filter.key as any) &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        }
      />

      {/* Add Check Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.addFormContainer}>
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add New Check</Text>
              <TextInput
                placeholder="Check title"
                value={title}
                onChangeText={setTitle}
                style={styles.formInput}
              />
              <TextInput
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                style={styles.formInput}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Payee (to whom the check is written)"
                value={payee || ''}
                onChangeText={setPayee}
                style={styles.formInput}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    marginRight: 12,
                    fontWeight: '500',
                    color: COLORS.text,
                  }}
                >
                  Currency:
                </Text>
                {['USD', 'JOD', 'ILS'].map(cur => (
                  <TouchableOpacity
                    key={cur}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor:
                        currency === cur ? COLORS.primary : COLORS.border,
                      marginRight: 8,
                      backgroundColor:
                        currency === cur ? COLORS.primary + '22' : '#fff',
                    }}
                    onPress={() => setCurrency(cur)}
                  >
                    <Text style={{ color: COLORS.text, fontWeight: '600' }}>
                      {cur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.priorityContainer}>
                <Text style={styles.priorityLabel}>Priority:</Text>
                {['low', 'medium', 'high'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      { borderColor: getPriorityColor(p as Priority) },
                      priority === p && styles.priorityButtonActive,
                    ]}
                    onPress={() => setPriority(p as Priority)}
                  >
                    <Text style={[styles.priorityText]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => {
                  (dateInputRef?.current as any)?.showPicker?.();
                  setShowPicker(true);
                }}
                style={styles.dateButton}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  Due Date: {formatDate(date)}
                </Text>
              </TouchableOpacity>
              {Platform.OS === 'web' && (
                <input
                  ref={dateInputRef}
                  name="date"
                  type="date"
                  value={date.toISOString().substr(0, 10)}
                  onChange={(e: any) => {
                    setShowPicker(false);
                    setDate(new Date(e.target.value));
                  }}
                  style={{ visibility: 'hidden', height: 0 }}
                />
              )}
              {Platform.OS !== 'web' && showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={onChangeDate}
                />
              )}
              <View style={styles.errorView}>
                {Object.entries(formErrors).map(([key, value]) => (
                  <Text key={key} style={styles.errorLabel}>
                    {value}
                  </Text>
                ))}
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    btnLoading && styles.buttonDisabled,
                  ]}
                  onPress={addCheck}
                  disabled={btnLoading}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      btnLoading && styles.textDisabled,
                    ]}
                  >
                    Add Check
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // shift shadow downward
    shadowOpacity: 0.1,
    shadowRadius: 2, // tighter shadow for bottom-only effect
    elevation: 3, // Android shadow
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 16, color: COLORS.mutedText },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    width: '48%',
    marginBottom: 12,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statsTextWrap: { flex: 1 },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statsTitle: { fontSize: 12, color: COLORS.mutedText },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.text },
  filterContainer: { flexDirection: 'row' },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { marginLeft: 6, fontSize: 14, color: '#666', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  addFormContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  addForm: { padding: 20 },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  formInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 12,
    fontWeight: '500',
  },
  errorLabel: { fontSize: 16, color: COLORS.danger, fontWeight: '500' },
  errorView: { marginBottom: 12 },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  priorityButtonActive: {
    backgroundColor: COLORS.primary + '55',
    borderColor: COLORS.primary,
  },
  priorityText: { fontSize: 14, color: 'black', fontWeight: '500' },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dateButtonText: { marginLeft: 12, fontSize: 16, color: COLORS.text },
  formButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, color: '#666', fontWeight: '600' },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  checksContainer: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  checksList: { paddingBottom: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: { fontSize: 16, color: COLORS.mutedText },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.mutedText,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  buttonDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    color: '#999',
  },
});
