import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, Text, TextInput } from 'react-native-paper';
import { useTournamentStore } from '../store/useTournamentStore';

const TeamSquadEntryScreen = ({ route, navigation }: any) => {
  const setTournament = useTournamentStore(state => state.setTournament);
  const { config } = route.params;
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  // Requirement: Default Team Name as "Team 1", "Team 2", etc.
  const [teamName, setTeamName] = useState(`Team ${currentTeamIndex + 1}`);



  // Requirement: Default player names and first player as C and WK
  const [players, setPlayers] = useState(
    Array(11).fill(null).map((_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      isC: i === 0, // Default first player as Captain
      isW: i === 0  // Default first player as Wicket Keeper
    }))
  );

  // Update team name automatically when moving to the next team
  useEffect(() => {
    setTeamName(`Team ${currentTeamIndex + 1}`);
    setPlayers(Array(11).fill(null).map((_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      isC: i === 0,
      isW: i === 0
    })));
  }, [currentTeamIndex]);

  const handlePlayerNameChange = (text: string, index: number) => {
    const newPlayers = [...players];
    newPlayers[index].name = text;
    setPlayers(newPlayers);
  };

  const toggleRole = (index: number, role: 'isC' | 'isW') => {
    const newPlayers = players.map((p, i) => {
      if (role === 'isC') return { ...p, isC: i === index };
      if (role === 'isW') return { ...p, isW: i === index };
      return p;
    });
    setPlayers(newPlayers);
  };

  // Add this helper function at the top or in a utils file
  const generateFixtures = (teams: any[]) => {
    let fixtures = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        fixtures.push({
          id: `m-${i}-${j}`,
          teamA: teams[i].name,
          teamB: teams[j].name,
          status: 'scheduled'
        });
      }
    }
    return fixtures;
  };

 const [allTeamsData, setAllTeamsData] = useState<any[]>([]);

const handleSaveTeam = () => {
  if (!teamName.trim()) return Alert.alert("Error", "Enter Team Name");

  const currentTeam = { 
    name: teamName, 
    players: players,
    stats: { played: 0, won: 0, lost: 0, nrr: 0, points: 0 } // Default stats
  };
  
  const updatedAllTeams = [...allTeamsData, currentTeam];

  if (currentTeamIndex + 1 < config.totalTeams) {
    setAllTeamsData(updatedAllTeams);
    setCurrentTeamIndex(currentTeamIndex + 1);
    // State resets for next team occur via useEffect as previously set up
  } else {
    // Generate Fixtures (Round Robin / League)
    let fixtures = [];
    for (let i = 0; i < updatedAllTeams.length; i++) {
      for (let j = i + 1; j < updatedAllTeams.length; j++) {
        fixtures.push({
          id: `match-${i}-${j}`,
          teamA: updatedAllTeams[i].name,
          teamB: updatedAllTeams[j].name,
          status: 'scheduled'
        });
      }
    }

    navigation.navigate('TournamentDashboard', { 
      tournamentName: config.name,
      // teams: updatedAllTeams,
      // fixtures: fixtures,
      overs: config.overs
    });
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Team {currentTeamIndex + 1} of {config.totalTeams}</Text>

      <TextInput
        label="Team Name"
        value={teamName}
        onChangeText={setTeamName}
        mode="outlined"
        textColor="#FFF"
        outlineColor="#597397ff"

        theme={{
          colors: {
            primary: '#0DAE7A',        // focused label color
            onSurfaceVariant: '#94A3B8' // unfocused label color
          }
        }}
        activeOutlineColor="#0DAE7A"
        placeholder="Enter Team Name"
        style={styles.teamInput}
      />

      <Card style={styles.card}>
        <View style={styles.tableHeader}>
          <Text style={[styles.hText, styles.colIdx]}>#</Text>
          <Text style={[styles.hText, styles.colName]}>Player Name</Text>
          <Text style={[styles.hText, styles.colIcon]}>C</Text>
          <Text style={[styles.hText, styles.colIcon]}>W</Text>
        </View>
        <Divider style={{ backgroundColor: '#334155' }} />

        <ScrollView style={styles.scroll}>
          {players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={[styles.indexText, styles.colIdx]}>{index + 1}</Text>
              <View style={styles.colName}>
                <TextInput
                  value={player.name}
                  onChangeText={(text) => handlePlayerNameChange(text, index)}
                  mode="flat"
                  dense
                  textColor="#FFF"
                  style={styles.nameInput}
                  underlineColor="transparent"
                />
              </View>
              <View style={styles.colIcon}>
                <IconButton
                  icon="alpha-c-circle"
                  size={20}
                  iconColor={player.isC ? "#FBBF24" : "#475569"}
                  onPress={() => toggleRole(index, 'isC')}
                />
              </View>
              <View style={styles.colIcon}>
                <IconButton
                  icon="hand-back-right"
                  size={20}
                  iconColor={player.isW ? "#38BDF8" : "#475569"}
                  onPress={() => toggleRole(index, 'isW')}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </Card>

      <Button mode="contained" onPress={handleSaveTeam} style={styles.btn}>
        {currentTeamIndex + 1 === config.totalTeams ? "Finish & Create" : "Next Team"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 15 },
  header: { color: '#38BDF8', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  teamInput: { marginBottom: 15, backgroundColor: '#1E293B' },
  card: { backgroundColor: '#1E293B', flex: 1, overflow: 'hidden' },
  scroll: { flex: 1 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#334155',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  hText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 12 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155'
  },
  // Column Alignment Logic
  colIdx: { width: 40, textAlign: 'center' },
  colName: { flex: 1, paddingHorizontal: 1 },
  colIcon: { width: 50, alignItems: 'center', paddingRight: 30, justifyContent: 'center' },

  indexText: { color: '#94A3B8', fontSize: 12 },
  nameInput: { backgroundColor: 'transparent', height: 40, fontSize: 13 },
  btn: { marginTop: 15, backgroundColor: '#38BDF8', paddingVertical: 5 }
});

export default TeamSquadEntryScreen;