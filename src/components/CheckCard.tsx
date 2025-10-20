import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CheckItem } from '../types';
import { getPriorityColor, getStatusInfo } from '../utils/checks';

type Props = {
  item: CheckItem;
  onDelete: (item: CheckItem) => void;
  onTogglePaid?: (paid: boolean) => void;
  onPress?: () => void;
};

export default function CheckCard({ item, onDelete, onTogglePaid, onPress }: Props) {
  const statusInfo = getStatusInfo(item);
  const priorityColor = getPriorityColor(item.priority || 'medium');
  const due = new Date(item.dueDate);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.checkCard}>
        <View style={styles.checkHeader}>
          <View style={styles.checkTitleContainer}>
            <Text style={styles.checkTitle}>{item.title}</Text>
            {item.payee && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{item.payee}</Text>
              </View>
            )}
          </View>
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
        </View>

        <View style={styles.checkDetails}>
          <View style={styles.rowCenter}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.amountText}>{item.currency === 'USD' ? '$' : ''}{item.amount.toFixed(2)} {item.currency !== 'USD' ? item.currency : ''}</Text>
          </View>
          <View style={styles.rowCenter}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>{due.toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.checkFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>
          {typeof item.paid === 'boolean' && onTogglePaid && (
            <TouchableOpacity style={styles.paidButton} onPress={() => onTogglePaid(!item.paid)}>
              <Ionicons name={item.paid ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={item.paid ? '#4CAF50' : '#888'} />
              <Text style={{ color: item.paid ? '#4CAF50' : '#888', marginLeft: 4 }}>{item.paid ? 'Paid' : 'Mark Paid'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.deleteButton, item.paid && { opacity: 0.4 }]}
            onPress={item.paid ? undefined : () => onDelete(item)}
            disabled={item.paid}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  checkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 8,
  },
  categoryTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  amountText: { marginLeft: 6, fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  dateText: { marginLeft: 6, fontSize: 14, color: '#666' },
  checkFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  deleteButton: { padding: 8 },
  paidButton: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
});


