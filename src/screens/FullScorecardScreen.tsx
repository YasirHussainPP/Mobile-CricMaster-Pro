import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Card, DataTable, IconButton, SegmentedButtons, Text } from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
import { useMatchStore } from '../store/useMatchStore';

const FullScorecardScreen = () => {
  const store = useMatchStore();
  const viewShotRef = useRef(null);
  const [activeInnings, setActiveInnings] = useState('first');

  const isFirst = activeInnings === 'first';
  const displayBatting = isFirst ? store.firstInningsBatters : store.battingPlayers;
  const displayBowling = isFirst ? store.firstInningsBowlers : store.bowlers;
  const totalExtrasCount = isFirst ? store.firstInningsExtras : store.extras;

  const getExtrasTotal = (extras: any) => {
  if (!extras) return 0;
  if (typeof extras === 'number') return extras;
  return (extras.wide || 0) + (extras.noBall || 0) + (extras.bye || 0) + (extras.legBye || 0);
};

  const createPDF = async () => {
    const htmlContent = `
      <html>
        <body style="font-family: Helvetica; padding: 20px;">
          <h1 style="text-align: center;">CricMaster Pro Match Report</h1>
          <hr/>
          <h2>1st Innings: ${store.firstInningsScore}/${store.firstInningsWickets}</h2>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;"><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr>
            ${store.firstInningsBatters.map(p => `
              <tr><td>${p.name}</td><td>${p.runs}</td><td>${p.balls}</td><td>${p.fours}</td><td>${p.sixes}</td><td>${p.balls > 0 ? ((p.runs/p.balls)*100).toFixed(1) : 0}</td></tr>
            `).join('')}
          </table>
          
          <h2>2nd Innings: ${store.runs}/${store.wickets}</h2>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;"><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr>
            ${store.battingPlayers.map(p => `
              <tr><td>${p.name}</td><td>${p.runs}</td><td>${p.balls}</td><td>${p.fours}</td><td>${p.sixes}</td><td>${p.balls > 0 ? ((p.runs/p.balls)*100).toFixed(1) : 0}</td></tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  const handleShare = async () => {
    createPDF();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Full Scorecard</Text>
        <IconButton icon="file-pdf-box" iconColor="#EF4444" size={28} onPress={createPDF} />
          {/* <IconButton icon="whatsapp" iconColor="#25D366" size={28} onPress={() => Alert.alert("Share", "Use PDF option for full report")} /> */}
      </View>

      <ScrollView style={styles.container}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.8 }} style={{ backgroundColor: '#0F172A' }}>
          <SegmentedButtons
            value={activeInnings}
            onValueChange={setActiveInnings}
            // Explicitly styling buttons to ensure text visibility
            theme={{ colors: { secondaryContainer: '#38BDF8', onSecondaryContainer: '#0F172A' }}}
            buttons={[
              { value: 'first', label: '1st Inn', labelStyle: { color: activeInnings === 'first' ? '#000' : '#FFF' } },
              { value: 'second', label: '2nd Inn', labelStyle: { color: activeInnings === 'second' ? '#000' : '#FFF' }, disabled: !store.isSecondInnings },
            ]}
            style={styles.segment}
          />

          <Card style={styles.scoreCard}>
            <Card.Content>
              <Text style={styles.totalText}>
                TOTAL: {isFirst ? store.firstInningsScore : store.runs}/{isFirst ? store.firstInningsWickets : store.wickets}
              </Text>
              <Text style={styles.extrasText}>Extras: {getExtrasTotal(totalExtrasCount)}</Text>
            </Card.Content>
          </Card>

          <Text style={styles.tableTitle}>BATTING</Text>
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 2 }}><Text style={styles.headerText}>Batter</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>R</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>B</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>4s</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>6s</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>SR</Text></DataTable.Title>
            </DataTable.Header>

            {displayBatting.map((player, index) => (
              <DataTable.Row key={index} style={{ borderBottomColor: '#334155' }}>
                <DataTable.Cell style={{ flex: 2 }}>
                  <View>
                    <Text style={styles.cellTextBold}>{player.name}</Text>
                    <Text style={styles.dismissalText}>{player.isOut ? player.dismissal : 'not out'}</Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.cellText}>{player.runs}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.cellText}>{player.balls}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.cellText}>{player.fours || 0}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.cellText}>{player.sixes || 0}</Text></DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text style={styles.cellTextHighlight}>
                    {player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0'}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>

          <Text style={[styles.tableTitle, { marginTop: 20 }]}>BOWLING</Text>
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 2 }}><Text style={styles.headerText}>Bowler</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>O</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>R</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>W</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>Eco</Text></DataTable.Title>
            </DataTable.Header>

            {displayBowling.filter(b => b.overs > 0 ).map((bowler, index) => (
              <DataTable.Row key={index} style={{ borderBottomColor: '#334155' }}>
                <DataTable.Cell style={{ flex: 2 }}>
                  <Text style={styles.cellTextBold}>{bowler.name}</Text>
                </DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.cellText}>{Math.floor(bowler.overs/6)}.{bowler.overs%6}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.cellText}>{bowler.runsConceded}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.cellText}>{bowler.wickets}</Text></DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text style={styles.cellText}>
                    {bowler.overs > 0 ? ((bowler.runsConceded / (bowler.overs/6)).toFixed(2)) : '0.00'}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ViewShot>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  segment: { marginBottom: 10, borderColor: '#334155' },
  scoreCard: { backgroundColor: '#1E293B', marginBottom: 15 },
  totalText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  extrasText: { color: '#FBBF24', fontSize: 14 },
  tableTitle: { color: '#38BDF8', fontWeight: 'bold', marginBottom: 5 },
  table: { backgroundColor: '#1E293B', borderRadius: 8 },
  headerText: { color: '#38BDF8', fontSize: 11, fontWeight: 'bold' },
  cellText: { color: '#FFF', fontSize: 10 },
  cellTextHighlight: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  cellTextBold: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  dismissalText: { color: '#94A3B8', fontSize: 9, fontStyle: 'italic' }
});

export default FullScorecardScreen;