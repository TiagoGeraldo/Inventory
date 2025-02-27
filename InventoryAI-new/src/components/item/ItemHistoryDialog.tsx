import { ScrollView, StyleSheet, View } from 'react-native';
import { Dialog, Text, Button, Divider } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ItemHistory } from '../../types';
import { itemHistoryService } from '../../services/item/itemHistoryService';

interface ItemHistoryDialogProps {
  visible: boolean;
  onDismiss: () => void;
  itemId: string;
  itemName: string;
}

export function ItemHistoryDialog({ visible, onDismiss, itemId, itemName }: ItemHistoryDialogProps) {
  const [history, setHistory] = useState<ItemHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible, itemId]);

  const loadHistory = async () => {
    try {
      const data = await itemHistoryService.getItemHistory(itemId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title>History - {itemName}</Dialog.Title>
      <Dialog.Content>
        <ScrollView style={styles.scrollView}>
          {history.map((entry, index) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.header}>
                <Text variant="titleMedium">
                  {entry.action_type === 'create' ? 'Created' :
                   entry.action_type === 'update' ? 'Updated' : 'Deleted'}
                </Text>
                <Text variant="bodySmall">{formatDate(entry.created_at)}</Text>
              </View>
              <View style={styles.details}>
                <Text>
                  Quantity: {entry.previous_quantity} → {entry.new_quantity}
                  {entry.quantity_change > 0 ? ` (+${entry.quantity_change})` : 
                   entry.quantity_change < 0 ? ` (${entry.quantity_change})` : ''}
                </Text>
                {entry.notes && <Text style={styles.notes}>{entry.notes}</Text>}
              </View>
              {index < history.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
          {history.length === 0 && (
            <Text style={styles.emptyText}>No history available</Text>
          )}
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Close</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  scrollView: {
    maxHeight: 400,
  },
  historyItem: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  details: {
    marginLeft: 8,
  },
  notes: {
    fontStyle: 'italic',
    marginTop: 4,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  divider: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
}); 