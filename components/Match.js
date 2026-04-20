import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Dropdown from './Dropdown';
import TeamSlot from './TeamSlot';

const GREEN = '#16A34A';
const RED = '#DC2626';

export default function Match({
  match,
  roundIndex,
  matchIndex,
  canEditSlots,
  availableTeamsForSlot,
  onSelectSlotTeam,
  onRemoveSlotTeam,
  onSelectWinner,
  title,
}) {
  const teamsInMatch = [match.leftTeam, match.rightTeam].filter(Boolean);
  const winnerTeam = teamsInMatch.find((team) => team.teamId === match.winnerId);
  const canPickWinner = teamsInMatch.length === 2;

  const getLineColor = (team) => {
    if (!team || !match.winnerId) return undefined;
    return team.teamId === match.winnerId ? GREEN : RED;
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.matchTitle}>{title || `Match ${matchIndex + 1}`}</Text>
          {winnerTeam ? <Text style={styles.winnerText}>Winner: {winnerTeam.teamName}</Text> : null}
        </View>

        <Dropdown
          buttonLabel="Select Winner"
          title="Select Winner"
          options={teamsInMatch}
          disabled={!canPickWinner}
          onSelect={onSelectWinner}
          emptyText="Both teams must be selected first."
        />
      </View>

      <TeamSlot
        team={match.leftTeam}
        placeholder="Team 1"
        canEdit={canEditSlots}
        availableTeams={availableTeamsForSlot('left')}
        lineColor={getLineColor(match.leftTeam)}
        onSelectTeam={(team) => onSelectSlotTeam(roundIndex, matchIndex, 'leftTeam', team)}
        onRemoveTeam={() => onRemoveSlotTeam(roundIndex, matchIndex, 'leftTeam')}
      />

      <TeamSlot
        team={match.rightTeam}
        placeholder="Team 2"
        canEdit={canEditSlots}
        availableTeams={availableTeamsForSlot('right')}
        lineColor={getLineColor(match.rightTeam)}
        onSelectTeam={(team) => onSelectSlotTeam(roundIndex, matchIndex, 'rightTeam', team)}
        onRemoveTeam={() => onRemoveSlotTeam(roundIndex, matchIndex, 'rightTeam')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DDE2E7',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    width: 220,
  },
  headerRow: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  matchTitle: {
    color: '#101820',
    fontSize: 16,
    fontWeight: '800',
  },
  winnerText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 2,
  },
});
