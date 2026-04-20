import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Dropdown from './Dropdown';

export default function TeamSlot({
  team,
  placeholder,
  canEdit,
  availableTeams,
  lineColor,
  onSelectTeam,
  onRemoveTeam,
}) {
  return (
    <View style={[styles.slot, lineColor ? { borderLeftColor: lineColor } : null]}>
      <View style={styles.teamInfo}>
        {team?.teamLogo ? <Image source={{ uri: team.teamLogo }} style={styles.logo} /> : null}
        <Text style={[styles.teamName, !team && styles.placeholder]} numberOfLines={1}>
          {team ? team.teamName : placeholder}
        </Text>
      </View>

      {canEdit ? (
        <View style={styles.actions}>
          <Dropdown
            buttonLabel={team ? 'Change' : 'Select'}
            title="Select Team"
            options={availableTeams}
            onSelect={onSelectTeam}
            emptyText="All teams are already selected."
          />
          {team ? (
            <TouchableOpacity style={styles.removeButton} onPress={onRemoveTeam}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE2E7',
    borderLeftColor: '#CBD5E1',
    borderLeftWidth: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
  },
  teamInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 34,
  },
  logo: {
    borderRadius: 14,
    height: 28,
    marginRight: 8,
    width: 28,
  },
  teamName: {
    color: '#101820',
    flex: 1,
    fontWeight: '700',
  },
  placeholder: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  removeText: {
    color: '#B91C1C',
    fontWeight: '700',
  },
});
