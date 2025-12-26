import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, Menu, Surface, Text } from 'react-native-paper';
import { useMatchStore } from '../store/useMatchStore';
import { getPlayerDisplayName } from '../utils/utils';

const PreMatchSelection = ({ route, navigation }: any) => {
  const { battingTeam, bowlingTeam } = route.params;
  const initMatch = useMatchStore((state) => state.initMatch);

  const [visible, setVisible] = useState({ striker: false, nonStriker: false, bowler: false });
  const [selections, setSelections] = useState({ striker: 0, nonStriker: 1, bowler: 0 });




 const handleStart = () => {
  initMatch(
    battingTeam.players, 
    bowlingTeam.players, 
    selections.striker, 
    selections.nonStriker, 
    selections.bowler
  );

  navigation.navigate('ScoringDash', {
    battingTeamName: battingTeam.teamName,
    // ADD THESE TWO LINES BELOW:
    battingTeam: battingTeam, 
    bowlingTeam: bowlingTeam,
    totalOvers: route.params?.totalOvers
  });
};

  const PlayerPicker = ({ label, value, type }: { label: string; value: number; type: 'striker' | 'nonStriker' | 'bowler' }) => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Menu
        visible={visible[type]}
        onDismiss={() => setVisible({ ...visible, [type]: false })}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setVisible({ ...visible, [type]: true })}
            style={styles.dropdownBtn}
            icon="chevron-down"
          >
            {type === 'bowler'
              ? bowlingTeam.players[value]?.name
              : battingTeam.players[value]?.name}
          </Button>
        }
      >
        {/* CRITICAL FIX: Map through the correct squad */}
        {(type === 'bowler' ? bowlingTeam : battingTeam).players.map((p: any, i: number) => (
          <Menu.Item
            key={i}
            onPress={() => {
              setSelections({ ...selections, [type]: i });
              setVisible({ ...visible, [type]: false });
            }}
            title={getPlayerDisplayName(p)}
          />
        ))}
      </Menu>
    </View>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <Text style={styles.header}>MATCH READY</Text>
        <Divider style={styles.divider} />

        <PlayerPicker label="STRIKER" value={selections.striker} type="striker" />
        <PlayerPicker label="NON-STRIKER" value={selections.nonStriker} type="nonStriker" />
        <PlayerPicker label="OPENING BOWLER" value={selections.bowler} type="bowler" />

        <Button
          mode="contained"
          onPress={handleStart}
          style={styles.startBtn}
          labelStyle={{ fontWeight: 'bold' }}
        >
          START LIVE MATCH
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20, justifyContent: 'center' },
  card: { backgroundColor: '#1E293B', padding: 25, borderRadius: 15 },
  header: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  pickerContainer: { marginBottom: 20 },
  pickerLabel: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  dropdownBtn: { borderColor: '#334155', borderRadius: 8, backgroundColor: '#0F172A' },
  startBtn: { marginTop: 10, paddingVertical: 8, backgroundColor: '#10B981' },
  divider: { backgroundColor: '#334155', marginBottom: 25 }
});

export default PreMatchSelection;