import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, List, Modal, Portal, Provider, RadioButton, Text } from 'react-native-paper';
import { useMatchStore } from '../store/useMatchStore';
import { getPlayerDisplayName } from '../utils/utils';

const ScoringDash = ({ route, navigation }: any) => {
  const store = useMatchStore();
  
  // Modal States
  const [extraModal, setExtraModal] = useState<{ visible: boolean, type: 'Wide' | 'NoBall' | null }>({ visible: false, type: null });
  const [extraRuns, setExtraRuns] = useState(0);
  const [wicketModal, setWicketModal] = useState(false);
  const [overEndModal, setOverEndModal] = useState(false);
  
  // Selection States
  const [dismissalType, setDismissalType] = useState('Bowled');
  const [selectedFielder, setSelectedFielder] = useState<string>('');

  const currentStriker = store.battingPlayers[store.strikerIdx];
  const currentNonStriker = store.battingPlayers[store.nonStrikerIdx];
  const currentBowler = store.bowlers[store.currentBowlerIdx];

  // --- 1. INNINGS & OVER LOGIC ---
  useEffect(() => {
  const totalOvers = route.params?.totalOvers || 5;
  const isAllOut = store.wickets >= 10;
  const isOversFinished = store.balls >= (totalOvers * 6);

  if (isAllOut || isOversFinished) {
    handleInningsEnd();
    return;
  }

  // Improved Over End Check
  if (store.balls > 0 && store.balls % 6 === 0) {
    // If you are on the web/emulator, alerts can sometimes block state updates.
    // We use a tiny timeout to ensure the UI is ready.
    setTimeout(() => {
      setOverEndModal(true);
    }, 100);
  }
}, [store.balls, store.wickets]);

  const handleInningsEnd = () => {
    const totalOvers = route.params?.totalOvers || 5;

    if (!store.isSecondInnings) {
      Alert.alert(
        "Innings Over",
        `1st Innings: ${store.runs}/${store.wickets}. Target: ${store.runs + 1}`,
        [{
          text: "Start 2nd Innings",
          onPress: () => {
            store.setInnings(true);
            navigation.navigate('PreMatch', {
              battingTeam: route.params.bowlingTeam,
              bowlingTeam: route.params.battingTeam,
              totalOvers: totalOvers,
              isSecondInnings: true
            });
          }
        }]
      );
    } else {
      Alert.alert("Match Completed!", "Check the final scorecard.", [
        { text: "View Results", onPress: () => navigation.navigate('FullScorecard') }
      ]);
    }
  };

  // --- 2. HANDLERS ---
  const confirmExtra = () => {
    store.addBall(extraModal.type as any, extraRuns);
    setExtraModal({ visible: false, type: null });
    setExtraRuns(0);
  };

  const handleWicketConfirm = (nextBatterIdx: number) => {
    store.setDismissal(store.strikerIdx, dismissalType, selectedFielder, currentBowler?.name);
    store.addBall('Wicket', 0);
    store.setNextBatter(nextBatterIdx);
    setWicketModal(false);
    setDismissalType('Bowled');
    setSelectedFielder('');
  };

  const handleBowlerChange = (nextBowlerIdx: number) => {
    store.setNextBowler(nextBowlerIdx);
    setOverEndModal(false);
  };

  const formatOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

  return (
    <Provider>
      <View style={styles.container}>
        {/* MAIN SCORECARD */}
        <Card style={styles.glowCard}>
          <Card.Content>
            <Text style={styles.matchTitle}>{route.params.battingTeamName} Batting</Text>
            <View style={styles.mainScoreRow}>
              <Text style={styles.runsText}>{store.runs}/{store.wickets}</Text>
              <Text style={styles.oversLabel}>Overs: {formatOvers(store.balls)} / {route.params?.totalOvers}</Text>
            </View>

            <View style={styles.playerStatsRow}>
              <View>
                <Text style={styles.strikerText}>🏏 {getPlayerDisplayName(currentStriker)}: {currentStriker?.runs}({currentStriker?.balls})</Text>
                <Text style={styles.playerText}>🏃 {getPlayerDisplayName(currentNonStriker)}: {currentNonStriker?.runs}({currentNonStriker?.balls})</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.bowlerName}>{getPlayerDisplayName(currentBowler)}</Text>
                <Text style={styles.bowlerStats}>{currentBowler?.wickets}-{currentBowler?.runsConceded} ({formatOvers(currentBowler?.overs || 0)})</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* RECENT BALLS */}
        <View style={styles.logContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {store.overHistory.map((b, i) => (
              <View key={i} style={[styles.ballCircle, b.label === 'W' && { backgroundColor: '#EF4444' }]}>
                <Text style={styles.ballLabel}>{b.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* CONTROLS */}
        <View style={styles.actionSection}>
          <View style={styles.runRow}>
            {[0, 1, 2, 3, 4, 6].map(num => (
              <TouchableOpacity key={num} style={[styles.runBtn, { backgroundColor: num >= 4 ? '#1E40AF' : '#334155' }]} onPress={() => store.addBall('Legal', num)}>
                <Text style={styles.runBtnText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.extrasRow}>
            <Button mode="contained" buttonColor="#B45309" onPress={() => setExtraModal({ visible: true, type: 'Wide' })} style={styles.flexBtn}>WIDE</Button>
            <Button mode="contained" buttonColor="#B91C1C" onPress={() => setWicketModal(true)} style={styles.flexBtn}>WICKET</Button>
            <Button mode="contained" buttonColor="#1D4ED8" onPress={() => setExtraModal({ visible: true, type: 'NoBall' })} style={styles.flexBtn}>NB</Button>
          </View>

          <Button mode="outlined" textColor="#FFF" style={{ marginTop: 20, borderColor: '#334155ff' }} onPress={() => navigation.navigate('FullScorecard')}>VIEW FULL SCORECARD</Button>
        </View>

        {/* PORTALS (MODALS) */}
        <Portal>
          {/* EXTRAS MODAL */}
          <Modal visible={extraModal.visible} onDismiss={() => setExtraModal({ visible: false, type: null })} contentContainerStyle={styles.modalStyle}>
            <Text style={styles.modalTitle}>{extraModal.type} + Extras</Text>
            <View style={styles.modalRow}>
              {[0, 1, 2, 3, 4, 6].map(n => (
                <Button key={n} mode={extraRuns === n ? "contained" : "outlined"} onPress={() => setExtraRuns(n)} style={{ margin: 2 }}>{n}</Button>
              ))}
            </View>
            <Button mode="contained" style={{ marginTop: 20, backgroundColor: '#10B981' }} onPress={confirmExtra}>CONFIRM</Button>
          </Modal>

          {/* WICKET MODAL */}
          <Modal visible={wicketModal} dismissable={false} contentContainerStyle={styles.modalStyle}>
            <Text style={styles.modalTitle}>OUT! Select Dismissal</Text>
            <RadioButton.Group onValueChange={v => setDismissalType(v)} value={dismissalType}>
              <View style={styles.radioRow}>
                {['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped'].map(t => (
                  <View key={t} style={styles.radioItem}><RadioButton value={t} /><Text style={{ color: '#FFF', fontSize: 12 }}>{t}</Text></View>
                ))}
              </View>
            </RadioButton.Group>

            {(dismissalType === 'Caught' || dismissalType === 'Run Out' || dismissalType === 'Stumped') && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subLabel}>Fielder / WK:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {route.params.bowlingTeam.players.map((f: any, i: number) => (
                    <Button key={i} mode={selectedFielder === f.name ? "contained" : "outlined"} onPress={() => setSelectedFielder(f.name)} style={{ marginRight: 8 }} compact>{f.name}</Button>
                  ))}
                </ScrollView>
              </View>
            )}
            <Divider style={{ marginVertical: 10, backgroundColor: '#334155' }} />
            <Text style={styles.subLabel}>Next Batsman:</Text>
            <ScrollView style={{ maxHeight: 150 }}>
              {store.battingPlayers.map((p: any, i: number) => (
                !p.isOut && i !== store.strikerIdx && i !== store.nonStrikerIdx && (
                  <List.Item key={i} title={p.name} titleStyle={{ color: '#FFF' }} onPress={() => handleWicketConfirm(i)} left={props => <List.Icon {...props} icon="account-plus" color="#10B981" />} />
                )
              ))}
            </ScrollView>
            <Button onPress={() => setWicketModal(false)} textColor="#EF4444">CANCEL</Button>
          </Modal>

          {/* OVER END MODAL */}
          <Modal visible={overEndModal} dismissable={false} contentContainerStyle={styles.modalStyle}>
            <Text style={[styles.modalTitle, { color: '#38BDF8' }]}>OVER COMPLETED</Text>
            <Text style={styles.subLabel}>Select Bowler:</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {store.bowlers.map((b: any, i: number) => (
                <List.Item
                  key={i}
                  title={getPlayerDisplayName(b)}
                  titleStyle={{ color: '#FFF' }}
                  disabled={store.currentBowlerIdx === i}
                  style={store.currentBowlerIdx === i ? { opacity: 0.4 } : { backgroundColor: '#334155', marginVertical: 4, borderRadius: 8 }}
                  onPress={() => handleBowlerChange(i)}
                  left={props => <List.Icon {...props} icon="baseball" color="#38BDF8" />}
                />
              ))}
            </ScrollView>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 15 },
  glowCard: { backgroundColor: '#1E293B', borderRadius: 15, elevation: 8 },
  matchTitle: { color: '#38BDF8', fontSize: 12, fontWeight: 'bold' },
  mainScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginVertical: 10 },
  runsText: { color: '#FFF', fontSize: 44, fontWeight: '900' },
  oversLabel: { color: '#94A3B8', fontSize: 18 },
  playerStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
  strikerText: { color: '#10B981', fontWeight: 'bold', fontSize: 15 },
  playerText: { color: '#94A3B8', fontSize: 15 },
  bowlerName: { color: '#FFF', fontWeight: 'bold' },
  bowlerStats: { color: '#94A3B8' },
  logContainer: { marginVertical: 25 },
  ballCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  ballLabel: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  actionSection: { flex: 1, justifyContent: 'flex-end', marginBottom: 20 },
  runRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  runBtn: { width: '15%', aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  runBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  extrasRow: { flexDirection: 'row', gap: 8 },
  flexBtn: { flex: 1 },
  modalStyle: { backgroundColor: '#1E293B', padding: 25, margin: 20, borderRadius: 15 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  subLabel: { color: '#94A3B8', marginTop: 15, marginBottom: 5, fontWeight: 'bold' },
  radioRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  radioItem: { flexDirection: 'row', alignItems: 'center', width: '45%' }
});

export default ScoringDash;