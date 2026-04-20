import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Dropdown({
  buttonLabel,
  title,
  options,
  onSelect,
  disabled = false,
  emptyText = 'No options available',
}) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (option) => {
    onSelect(option);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={[styles.trigger, disabled && styles.disabledTrigger]}
      >
        <Text style={[styles.triggerText, disabled && styles.disabledText]}>{buttonLabel}</Text>
      </TouchableOpacity>

      <Modal animationType="fade" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.teamId)}
              ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                  {item.teamLogo ? <Image source={{ uri: item.teamLogo }} style={styles.logo} /> : null}
                  <Text style={styles.optionText}>{item.teamName}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    backgroundColor: '#E0ECFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  disabledTrigger: {
    backgroundColor: '#E2E8F0',
  },
  triggerText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  disabledText: {
    color: '#64748B',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    maxHeight: '70%',
    padding: 14,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
  },
  title: {
    color: '#101820',
    fontSize: 18,
    fontWeight: '700',
  },
  closeText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  option: {
    alignItems: 'center',
    borderBottomColor: '#EEF2F7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 10,
  },
  logo: {
    borderRadius: 16,
    height: 32,
    marginRight: 10,
    width: 32,
  },
  optionText: {
    color: '#101820',
    fontSize: 16,
  },
  emptyText: {
    color: '#64748B',
    padding: 16,
    textAlign: 'center',
  },
});
