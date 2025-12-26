import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, DataTable, Text } from 'react-native-paper';
import { useMatchStore } from '../store/useMatchStore';
import { getPlayerDisplayName } from '../utils/utils';

const FullScorecard = () => {
  const store = useMatchStore();
  const [inning, setInning] = useState(1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>FULL SCORECARD</Text>
        <Button mode="contained" compact style={styles.inningBadge}>INNINGS {inning}</Button>
      </View>

      {/* BATTING TABLE */}
      <Text style={styles.sectionHeader}>BATTING - {inning === 1 ? 'TEAM 1' : 'TEAM 2'}</Text>
      <DataTable style={styles.table}>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title textStyle={styles.headerText}>BATSMAN</DataTable.Title>
          <DataTable.Title textStyle={styles.headerText}>STATUS</DataTable.Title>
          <DataTable.Title numeric textStyle={styles.headerText}>R</DataTable.Title>
          <DataTable.Title numeric textStyle={styles.headerText}>B</DataTable.Title>
          <DataTable.Title numeric textStyle={styles.headerText}>SR</DataTable.Title>
        </DataTable.Header>

        {store.battingPlayers.map((player, i) => (
          <DataTable.Row key={i} style={styles.rowBorder}>
            <DataTable.Cell textStyle={styles.playerName}>{getPlayerDisplayName(player)}</DataTable.Cell>
            <DataTable.Cell textStyle={styles.statusText}>
              {player.isOut ? player.dismissal : (i === store.strikerIdx || i === store.nonStrikerIdx ? 'batting' : '')}
            </DataTable.Cell>
            <DataTable.Cell numeric textStyle={styles.scoreText}>{player.runs}</DataTable.Cell>
            <DataTable.Cell numeric textStyle={styles.statText}>{player.balls}</DataTable.Cell>
            <DataTable.Cell numeric textStyle={styles.srText}>
              {player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0'}
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      {/* EXTRAS SUMMARY */}
      <View style={styles.extrasBox}>
        <Text style={styles.extrasLabel}>EXTRAS</Text>
        <Text style={styles.extrasValue}>
          {store.runs - store.battingPlayers.reduce((sum, p) => sum + p.runs, 0)} 
          (Wd {store.extras.wide}, Nb {store.extras.noBall}, B {store.extras.bye}, Lb {store.extras.legBye})
        </Text>
      </View>

      {/* BOWLING TABLE */}
      <Text style={[styles.sectionHeader, { marginTop: 30 }]}>BOWLING</Text>
      <DataTable style={styles.table}>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title textStyle={styles.headerText}>BOWLER</DataTable.Title>
          <DataTable.Title numeric textStyle={styles.headerText}>O</DataTable.Title>
          <DataTable.Title numeric textStyle={styles.headerText}>R</DataTable.Title>
          <DataTable.Title numeric textStyle={styles.headerText}>W</DataTable.Title>
          <DataTable.Title numeric textStyle={styles.headerText}>ECON</DataTable.Title>
        </DataTable.Header>

        {store.bowlers.map((bowler, i) => (
          <DataTable.Row key={i} style={styles.rowBorder}>
            <DataTable.Cell textStyle={styles.playerName}>{bowler.name}</DataTable.Cell>
            <DataTable.Cell numeric textStyle={styles.statText}>
              {Math.floor(bowler.overs / 6)}.{bowler.overs % 6}
            </DataTable.Cell>
            <DataTable.Cell numeric textStyle={styles.statText}>{bowler.runsConceded}</DataTable.Cell>
            <DataTable.Cell numeric textStyle={styles.scoreText}>{bowler.wickets}</DataTable.Cell>
            <DataTable.Cell numeric textStyle={styles.statText}>
              {bowler.overs > 0 ? ((bowler.runsConceded / (bowler.overs / 6))).toFixed(2) : '0.00'}
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  inningBadge: { backgroundColor: '#10B981', borderRadius: 5 },
  sectionHeader: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  table: { backgroundColor: '#1E293B', borderRadius: 10, overflow: 'hidden' },
  tableHeader: { backgroundColor: '#2D3748', borderBottomWidth: 0 },
  headerText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  rowBorder: { borderBottomColor: '#2D3748', borderBottomWidth: 1 },
  playerName: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  statusText: { color: '#94A3B8', fontSize: 11, fontStyle: 'italic' },
  scoreText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  statText: { color: '#94A3B8' },
  srText: { color: '#10B981', fontWeight: 'bold' },
  extrasBox: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#161E2E', marginTop: 1 },
  extrasLabel: { color: '#94A3B8', fontWeight: 'bold' },
  extrasValue: { color: '#FFF', fontWeight: 'bold' }
});

export default FullScorecard;