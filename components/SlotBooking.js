import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DAYS_IN_APRIL = Array.from({ length: 30 }, (_, index) => index + 1);
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const TOTAL_SUB_SLOTS = 3;

const buildInitialSlots = () => {
  const slotsByDate = {};

  DAYS_IN_APRIL.forEach((day) => {
    slotsByDate[day] = {};
    HOURS.forEach((hour) => {
      // Deterministic dummy availability from 0 to 3 remaining sub-slots.
      slotsByDate[day][hour] = {
        remaining: (day + hour) % (TOTAL_SUB_SLOTS + 1),
        blocked: false,
      };
    });
  });

  return slotsByDate;
};

const formatHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

export default function SlotBooking() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [slotsByDate, setSlotsByDate] = useState(buildInitialSlots);

  const slotsForSelectedDate = useMemo(
    () =>
      HOURS.map((hour) => ({
        hour,
        ...slotsByDate[selectedDay][hour],
      })),
    [selectedDay, slotsByDate],
  );

  const toggleBlocked = (hour) => {
    setSlotsByDate((current) => ({
      ...current,
      [selectedDay]: {
        ...current[selectedDay],
        [hour]: {
          ...current[selectedDay][hour],
          blocked: !current[selectedDay][hour].blocked,
        },
      },
    }));
  };

  const bookSlot = (slot) => {
    const available = slot.remaining > 0 && !slot.blocked;

    // In user view, tapping an available slot books one of the 3 sub-slots.
    if (isAdmin || !available) return;

    setSlotsByDate((current) => ({
      ...current,
      [selectedDay]: {
        ...current[selectedDay],
        [slot.hour]: {
          ...current[selectedDay][slot.hour],
          remaining: current[selectedDay][slot.hour].remaining - 1,
        },
      },
    }));
  };

  const renderSlot = ({ item }) => {
    const available = item.remaining > 0 && !item.blocked;

    return (
      <TouchableOpacity
        activeOpacity={!isAdmin && available ? 0.75 : 1}
        onPress={() => bookSlot(item)}
        style={[styles.slotCard, available ? styles.availableSlot : styles.unavailableSlot]}
      >
        <View>
          <Text style={styles.slotTime}>{formatHour(item.hour)}</Text>
          {!isAdmin ? (
            <Text style={styles.userInfo}>{available ? 'Tap to book' : 'Unavailable'}</Text>
          ) : null}
          {isAdmin ? (
            <>
              <Text style={styles.adminInfo}>Remaining sub-slots: {item.remaining}</Text>
              <Text style={styles.adminInfo}>Status: {item.blocked ? 'Blocked' : 'Unblocked'}</Text>
            </>
          ) : null}
        </View>

        {isAdmin ? (
          <TouchableOpacity style={styles.blockButton} onPress={() => toggleBlocked(item.hour)}>
            <Text style={styles.blockButtonText}>{item.blocked ? 'Unblock' : 'Block'}</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>April Slot Booking</Text>
        <TouchableOpacity style={styles.modeButton} onPress={() => setIsAdmin((value) => !value)}>
          <Text style={styles.modeButtonText}>{isAdmin ? 'Admin View' : 'User View'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={DAYS_IN_APRIL}
        keyExtractor={(day) => String(day)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.dateButton, selectedDay === item && styles.selectedDateButton]}
            onPress={() => setSelectedDay(item)}
          >
            <Text style={[styles.dateText, selectedDay === item && styles.selectedDateText]}>
              Apr {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={slotsForSelectedDate}
        keyExtractor={(item) => String(item.hour)}
        renderItem={renderSlot}
        contentContainerStyle={styles.slotList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#101820',
    fontSize: 22,
    fontWeight: '800',
  },
  modeButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dateList: {
    gap: 8,
    paddingBottom: 12,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  selectedDateButton: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  dateText: {
    color: '#334155',
    fontWeight: '700',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  slotList: {
    paddingBottom: 24,
  },
  slotCard: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 14,
  },
  availableSlot: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    borderWidth: 1,
  },
  unavailableSlot: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  slotTime: {
    color: '#101820',
    fontSize: 16,
    fontWeight: '800',
  },
  adminInfo: {
    color: '#334155',
    marginTop: 4,
  },
  userInfo: {
    color: '#334155',
    marginTop: 4,
  },
  blockButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  blockButtonText: {
    color: '#101820',
    fontWeight: '800',
  },
});
