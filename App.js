import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Bracket from './components/Bracket';
import SlotBooking from './components/SlotBooking';

const DEFAULT_TEAM_COUNT = '8';

export default function App() {
  const [activeFeature, setActiveFeature] = useState('bracket');
  const [teamCountInput, setTeamCountInput] = useState(DEFAULT_TEAM_COUNT);
  const [teamCount, setTeamCount] = useState(Number(DEFAULT_TEAM_COUNT));

  const isValidPowerOfTwo = useMemo(() => {
    const value = Number(teamCountInput);
    return value >= 2 && Number.isInteger(value) && (value & (value - 1)) === 0;
  }, [teamCountInput]);

  const handleGenerate = () => {
    if (isValidPowerOfTwo) {
      setTeamCount(Number(teamCountInput));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournament + Slot Booking</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeFeature === 'bracket' && styles.activeTab]}
            onPress={() => setActiveFeature('bracket')}
          >
            <Text style={[styles.tabText, activeFeature === 'bracket' && styles.activeTabText]}>
              Bracket
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeFeature === 'slots' && styles.activeTab]}
            onPress={() => setActiveFeature('slots')}
          >
            <Text style={[styles.tabText, activeFeature === 'slots' && styles.activeTabText]}>
              Slots
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeFeature === 'bracket' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.controls}>
            <Text style={styles.label}>Number of teams</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={teamCountInput}
                onChangeText={setTeamCountInput}
                keyboardType="number-pad"
                style={styles.input}
                placeholder="8, 16, 32..."
              />
              <TouchableOpacity
                style={[styles.button, !isValidPowerOfTwo && styles.disabledButton]}
                onPress={handleGenerate}
                disabled={!isValidPowerOfTwo}
              >
                <Text style={styles.buttonText}>Generate</Text>
              </TouchableOpacity>
            </View>
            {!isValidPowerOfTwo && (
              <Text style={styles.errorText}>Enter a valid power of 2, for example 8 or 16.</Text>
            )}
          </View>

          <Bracket teamCount={teamCount} />
        </ScrollView>
      ) : (
        <SlotBooking />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#DDE2E7',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: '#101820',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  tabText: {
    color: '#334155',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  controls: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#101820',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#B91C1C',
    marginTop: 8,
  },
});
