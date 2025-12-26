import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

const QuickMatchScreen = ({ navigation, route }: any) => {
  // Check if we are configuring Team A or Team B
  const isTeamB = route.params?.isTeamB || false;

  // 1. State for Team Name
  const [teamName, setTeamName] = useState(isTeamB ? "Team B" : "Team A");

  // 2. State for Players (An array of objects so we can edit names)
  const [players, setPlayers] = useState(
    Array.from({ length: 11 }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      isCaptain: false,
      isWK: false,
    }))
  );

  // Function to update a specific player's name
  const updatePlayerName = (index: number, newName: string) => {
    const updated = [...players];
    updated[index].name = newName;
    setPlayers(updated);
  };

  // Function to handle Role Selection (C and WK)
  const toggleRole = (index: number, role: 'C' | 'WK') => {
    const updated = players.map((p, i) => {
      if (role === 'C') return { ...p, isCaptain: i === index }; // Only one captain
      if (role === 'WK') return { ...p, isWK: i === index };      // Only one keeper
      return p;
    });
    setPlayers(updated);
  };
  console.log(` TotalOvers: ${route.params?.totalOvers}`);

  const handleNext = () => {
    // Extract from params correctly
    const { matchTitle, totalOvers, teamAData } = route.params ?? {};

    if (!isTeamB) {
      navigation.push('QuickMatch', {
        isTeamB: true,
        teamAData: { teamName, players },
        matchTitle: matchTitle, 
        totalOvers: totalOvers  
      });
    } else {
      navigation.navigate('Toss', {
        teamA: teamAData,
        teamB: { teamName, players },
        matchTitle: matchTitle,
        totalOvers: totalOvers
      });
    }
  };

  const isReady = players.some(p => p.isCaptain) && players.some(p => p.isWK) && teamName.length > 0;

  return (
    <ScrollView style={styles.container}>
      {/* Team Name Input */}
      <View style={styles.headerBox}>
        <Text style={styles.label}>TEAM NAME</Text>
        <TextInput
          style={styles.teamInput}
          value={teamName}
          onChangeText={setTeamName}
          placeholderTextColor="#64748b"
        />
      </View>

      <Text style={styles.sectionTitle}>CONFIGURE SQUAD (11 PLAYERS)</Text>

      <View style={styles.grid}>
        {players.map((player, index) => (
          <View key={player.id} style={[styles.playerCard, (player.isCaptain || player.isWK) && styles.activeCard]}>
            <TextInput
              style={styles.playerInput}
              value={player.name}
              onChangeText={(text) => updatePlayerName(index, text)}
            />
            <View style={styles.roleRow}>
              <TouchableOpacity onPress={() => toggleRole(index, 'C')}>
                <Text style={[styles.roleBtn, player.isCaptain && styles.roleActive]}>
                  {player.isCaptain ? "(C)" : "CAPT"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleRole(index, 'WK')}>
                <Text style={[styles.roleBtn, player.isWK && styles.roleActive]}>
                  {player.isWK ? "(WK)" : "WK"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Button
        mode="contained"
        style={styles.nextBtn}
        buttonColor="#10B981"
        disabled={!isReady}
        onPress={handleNext}
      >
        {isTeamB ? "PROCEED TO TOSS" : "NEXT: TEAM B SQUAD"}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 15 },
  headerBox: { marginBottom: 20, marginTop: 10 },
  label: { color: '#94A3B8', fontSize: 12, marginBottom: 5, fontWeight: 'bold' },
  teamInput: { backgroundColor: '#1E293B', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { color: '#FFF', fontSize: 14, marginBottom: 15, opacity: 0.7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  playerCard: { width: '48%', backgroundColor: '#1E293B', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  activeCard: { borderColor: '#10B981' },
  playerInput: { color: '#FFF', fontSize: 14, borderBottomWidth: 1, borderBottomColor: '#334155', marginBottom: 8, paddingBottom: 2 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  roleBtn: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
  roleActive: { color: '#10B981' },
  nextBtn: { marginVertical: 30, paddingVertical: 5 }
});

export default QuickMatchScreen;