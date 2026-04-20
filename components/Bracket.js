import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Match from './Match';

const createTeams = (count) =>
  Array.from({ length: count }, (_, index) => ({
    teamId: index + 1,
    teamName: `Team ${index + 1}`,
    teamLogo: `https://via.placeholder.com/64/1D4ED8/FFFFFF?text=T${index + 1}`,
  }));

const createRounds = (teamCount) => {
  const roundCount = Math.log2(teamCount);

  return Array.from({ length: roundCount }, (_, roundIndex) => {
    const matchesInRound = teamCount / Math.pow(2, roundIndex + 1);

    return Array.from({ length: matchesInRound }, (_, matchIndex) => ({
      id: `round-${roundIndex}-match-${matchIndex}`,
      leftTeam: null,
      rightTeam: null,
      winnerId: null,
    }));
  });
};

const cloneRounds = (rounds) =>
  rounds.map((round) =>
    round.map((match) => ({
      ...match,
    })),
  );

const normalizeBracket = (nextRounds) => {
  // Bracket structure:
  // rounds[0] = first round matches
  // rounds[1] = winners from rounds[0]
  // rounds[last] = final match
  //
  // Every winner writes itself into the correct slot of the next round.
  for (let roundIndex = 0; roundIndex < nextRounds.length; roundIndex += 1) {
    nextRounds[roundIndex].forEach((match, matchIndex) => {
      const hasBothTeams = Boolean(match.leftTeam && match.rightTeam);
      const validWinner =
        hasBothTeams &&
        match.winnerId &&
        [match.leftTeam?.teamId, match.rightTeam?.teamId].includes(match.winnerId);

      if (!validWinner) {
        match.winnerId = null;
      }

      const winnerTeam =
        match.winnerId === match.leftTeam?.teamId
          ? match.leftTeam
          : match.winnerId === match.rightTeam?.teamId
            ? match.rightTeam
            : null;

      const nextRound = nextRounds[roundIndex + 1];
      if (!nextRound) return;

      const nextMatch = nextRound[Math.floor(matchIndex / 2)];
      const nextSlotKey = matchIndex % 2 === 0 ? 'leftTeam' : 'rightTeam';
      nextMatch[nextSlotKey] = winnerTeam;
    });
  }

  return nextRounds;
};

const getRoundName = (roundIndex, totalRounds) => {
  if (roundIndex === totalRounds - 1) return 'Final';
  if (roundIndex === totalRounds - 2) return 'Semifinal';
  if (roundIndex === 0) return 'Round 1';
  return `Round ${roundIndex + 1}`;
};

const getSideMatches = (round, side) => {
  const middleIndex = round.length / 2;
  const startIndex = side === 'left' ? 0 : middleIndex;
  const endIndex = side === 'left' ? middleIndex : round.length;

  return round.slice(startIndex, endIndex).map((match, index) => ({
    match,
    matchIndex: startIndex + index,
  }));
};

const getColumnSpacing = (roundIndex) => ({
  // Later rounds have fewer matches, so we push them down a little to look
  // like they are receiving winners from the previous column.
  paddingTop: roundIndex * 48,
});

const getMatchSpacing = (roundIndex) => ({
  // No connector lines are drawn; this spacing gives a clear bracket shape.
  marginBottom: 18 + roundIndex * 34,
});

export default function Bracket({ teamCount }) {
  const [teams, setTeams] = useState(() => createTeams(teamCount));
  const [rounds, setRounds] = useState(() => createRounds(teamCount));
  const [thirdPlaceWinnerId, setThirdPlaceWinnerId] = useState(null);

  useEffect(() => {
    setTeams(createTeams(teamCount));
    setRounds(createRounds(teamCount));
    setThirdPlaceWinnerId(null);
  }, [teamCount]);

  const selectedTeamIds = useMemo(() => {
    const ids = new Set();
    rounds[0]?.forEach((match) => {
      if (match.leftTeam) ids.add(match.leftTeam.teamId);
      if (match.rightTeam) ids.add(match.rightTeam.teamId);
    });
    return ids;
  }, [rounds]);

  const finalWinner = useMemo(() => {
    const finalMatch = rounds[rounds.length - 1]?.[0];
    if (!finalMatch?.winnerId) return null;
    return [finalMatch.leftTeam, finalMatch.rightTeam].find((team) => team?.teamId === finalMatch.winnerId);
  }, [rounds]);

  const semifinalLosers = useMemo(() => {
    const semifinalRound = rounds[rounds.length - 2] || [];
    return semifinalRound
      .map((match) => {
        if (!match.winnerId || !match.leftTeam || !match.rightTeam) return null;
        return match.winnerId === match.leftTeam.teamId ? match.rightTeam : match.leftTeam;
      })
      .filter(Boolean);
  }, [rounds]);

  const thirdPlaceWinner = semifinalLosers.find((team) => team.teamId === thirdPlaceWinnerId) || null;
  const thirdPlaceMatch = {
    id: 'third-place',
    leftTeam: semifinalLosers[0] || null,
    rightTeam: semifinalLosers[1] || null,
    winnerId: thirdPlaceWinner ? thirdPlaceWinnerId : null,
  };

  useEffect(() => {
    if (!thirdPlaceWinner) {
      setThirdPlaceWinnerId(null);
    }
  }, [thirdPlaceWinner]);

  const getAvailableTeamsForSlot = (matchIndex, slotKey) => {
    const currentTeam = rounds[0][matchIndex][slotKey];
    return teams.filter((team) => !selectedTeamIds.has(team.teamId) || team.teamId === currentTeam?.teamId);
  };

  const handleSelectSlotTeam = (roundIndex, matchIndex, slotKey, team) => {
    if (roundIndex !== 0) return;

    setRounds((currentRounds) => {
      const nextRounds = cloneRounds(currentRounds);
      nextRounds[roundIndex][matchIndex][slotKey] = team;
      nextRounds[roundIndex][matchIndex].winnerId = null;
      return normalizeBracket(nextRounds);
    });
  };

  const handleRemoveSlotTeam = (roundIndex, matchIndex, slotKey) => {
    if (roundIndex !== 0) return;

    setRounds((currentRounds) => {
      const nextRounds = cloneRounds(currentRounds);
      nextRounds[roundIndex][matchIndex][slotKey] = null;
      nextRounds[roundIndex][matchIndex].winnerId = null;
      return normalizeBracket(nextRounds);
    });
  };

  const handleSelectWinner = (roundIndex, matchIndex, team) => {
    setRounds((currentRounds) => {
      const nextRounds = cloneRounds(currentRounds);
      nextRounds[roundIndex][matchIndex].winnerId = team.teamId;
      return normalizeBracket(nextRounds);
    });
  };

  const renderMatch = ({ match, matchIndex }, roundIndex) => (
    <View key={match.id} style={getMatchSpacing(roundIndex)}>
      <Match
        match={match}
        roundIndex={roundIndex}
        matchIndex={matchIndex}
        canEditSlots={roundIndex === 0}
        availableTeamsForSlot={(side) =>
          roundIndex === 0 ? getAvailableTeamsForSlot(matchIndex, `${side}Team`) : []
        }
        onSelectSlotTeam={handleSelectSlotTeam}
        onRemoveSlotTeam={handleRemoveSlotTeam}
        onSelectWinner={(team) => handleSelectWinner(roundIndex, matchIndex, team)}
      />
    </View>
  );

  const finalRoundIndex = rounds.length - 1;
  const finalMatch = rounds[finalRoundIndex]?.[0];
  const sideRoundIndexes = rounds.map((_, index) => index).slice(0, -1);
  const leftRoundIndexes = sideRoundIndexes;
  const rightRoundIndexes = [...sideRoundIndexes].reverse();

  return (
    <View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{teamCount} Team Knockout Bracket</Text>
        <Text style={styles.summaryText}>
          Pick teams in Round 1, select each match winner, and the app moves winners forward.
        </Text>
        {finalWinner ? <Text style={styles.championText}>Champion: {finalWinner.teamName}</Text> : null}
        {thirdPlaceWinner ? <Text style={styles.thirdText}>3rd Place: {thirdPlaceWinner.teamName}</Text> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.bracketBoard}>
          {leftRoundIndexes.map((roundIndex) => {
            const round = rounds[roundIndex];
            const matches = getSideMatches(round, 'left');

            return (
              <View
                key={`left-round-${roundIndex}`}
                style={[styles.roundColumn, getColumnSpacing(roundIndex)]}
              >
                <Text style={styles.roundTitle}>{getRoundName(roundIndex, rounds.length)}</Text>
                {matches.map((matchData) => renderMatch(matchData, roundIndex))}
              </View>
            );
          })}

          <View style={styles.centerColumn}>
            <Text style={styles.roundTitle}>Final</Text>
            {finalMatch ? (
              <Match
                match={finalMatch}
                roundIndex={finalRoundIndex}
                matchIndex={0}
                canEditSlots={false}
                availableTeamsForSlot={() => []}
                onSelectSlotTeam={() => {}}
                onRemoveSlotTeam={() => {}}
                onSelectWinner={(team) => handleSelectWinner(finalRoundIndex, 0, team)}
              />
            ) : null}

            <View style={styles.thirdPlaceSection}>
              <Text style={styles.roundTitle}>3rd Place</Text>
              <Match
                match={thirdPlaceMatch}
                roundIndex={0}
                matchIndex={0}
                title="Semifinal Losers"
                canEditSlots={false}
                availableTeamsForSlot={() => []}
                onSelectSlotTeam={() => {}}
                onRemoveSlotTeam={() => {}}
                onSelectWinner={(team) => setThirdPlaceWinnerId(team.teamId)}
              />
            </View>
          </View>

          {rightRoundIndexes.map((roundIndex) => {
            const round = rounds[roundIndex];
            const matches = getSideMatches(round, 'right');

            return (
              <View
                key={`right-round-${roundIndex}`}
                style={[styles.roundColumn, getColumnSpacing(roundIndex)]}
              >
                <Text style={styles.roundTitle}>{getRoundName(roundIndex, rounds.length)}</Text>
                {matches.map((matchData) => renderMatch(matchData, roundIndex))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE2E7',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  summaryTitle: {
    color: '#101820',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryText: {
    color: '#475569',
    marginTop: 4,
  },
  championText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  thirdText: {
    color: '#D97706',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  bracketBoard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE2E7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  roundColumn: {
    marginHorizontal: 6,
    width: 230,
  },
  centerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    paddingTop: 96,
    width: 245,
  },
  thirdPlaceSection: {
    marginTop: 28,
  },
  roundTitle: {
    color: '#101820',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
});
