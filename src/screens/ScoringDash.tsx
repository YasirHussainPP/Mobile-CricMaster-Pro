import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, Modal, Portal, Provider, RadioButton, Text } from 'react-native-paper';
import { useMatchStore } from '../store/useMatchStore';
import { getPlayerDisplayName } from '../utils/utils';

const ScoringDash = ({ route, navigation }: any) => {
  const store = useMatchStore();
  // History Stack for Undo
  const [history, setHistory] = useState<any[]>([]);

  const saveHistory = useCallback(() => {
    // Snapshot current state
    const snapshot = JSON.parse(JSON.stringify({
      runs: store.runs,
      wickets: store.wickets,
      balls: store.balls,
      strikerIdx: store.strikerIdx,
      nonStrikerIdx: store.nonStrikerIdx,
      currentBowlerIdx: store.currentBowlerIdx,
      overHistory: store.overHistory,
      battingPlayers: store.battingPlayers,
      bowlers: store.bowlers,
      isSecondInnings: store.isSecondInnings,
      firstInningsScore: store.firstInningsScore
    }));
    setHistory(prev => [...prev, snapshot].slice(-10));
  }, [store]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];

    // IMPORTANT: useMatchStore.setState is the correct way to revert Zustand
    useMatchStore.setState(lastState);
    setHistory(prev => prev.slice(0, -1));
  };

  // Modal States
  const [extraModal, setExtraModal] = useState<{ visible: boolean, type: 'Wide' | 'NoBall' | null }>({ visible: false, type: null });
  const [extraRuns, setExtraRuns] = useState(0);
  const [wicketModal, setWicketModal] = useState(false);
  const [overEndModal, setOverEndModal] = useState(false);
  const [fielderMenuVisible, setFielderMenuVisible] = useState(false);
  const [matchEndModal, setMatchEndModal] = useState(false);

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
    const targetChased = store.isSecondInnings && store.runs > store.firstInningsScore;
    const isOverJustFinished = store.balls > 0 &&
      store.balls % 6 === 0 &&
      store.overHistory.length > 0 &&
      !['WD', 'NB'].includes(store.overHistory[store.overHistory.length - 1].label);


    if (isOversFinished || isAllOut || targetChased) {
      handleInningsEnd();
      return;
    }
    // --- Place this inside the ScoringDash component, above the return ---


    // Improved Over End Check
    if (store.balls > 0 && store.balls % 6 === 0) {
      setTimeout(() => {
        setOverEndModal(true);
      }, 100);
    }
  }, [store.balls, store.wickets, store.runs]);

  const handleAddBall = (type: 'Legal' | 'Wide' | 'NoBall' | 'Wicket', runs: number) => {
    saveHistory();
    store.addBall(type, runs);
  };


  const handleInningsEnd = () => {
    setMatchEndModal(true);
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
  const getMatchResult = () => {
    const target = store.firstInningsScore + 1;
    const secondInningsRuns = store.runs;

    if (secondInningsRuns >= target) {
      return `${route.params.battingTeamName} won by ${10 - store.wickets} wickets`;
    } else if (store.balls >= (route.params.totalOvers * 6) || store.wickets >= 10) {
      return `${route.params.bowlingTeam.name} won by ${store.firstInningsScore - store.runs} runs`;
    }
    return "Match in Progress";
  };

  // Inside handleFinishMatch in ScoringDash.tsx
  const handleFinishMatch = () => {
    // 1. Determine winner name safely
    const teamAName = route.params.teamA?.name || "Team A";
    const teamBName = route.params.teamB?.name || "Team B";

    // If 2nd innings score > target, batting team wins. Else bowling team wins.
    const winner = store.runs > store.firstInningsScore ? teamAName : teamBName;
    const loser = winner === teamAName ? teamBName : teamAName;

    const result = {
      matchId: route.params.matchData.id,
      winner: winner,
      loser: loser,
      scoreA: store.isSecondInnings ? store.firstInningsScore : store.runs,
      ballsA: route.params.totalOvers * 6, // 1st innings balls
      scoreB: store.isSecondInnings ? store.runs : 0,
      ballsB: store.balls, // 2nd innings balls
      teamAName: teamAName,
      playerStats: [...store.battingPlayers, ...store.bowlers],
      // FIX: Pass the tournament name back so the header doesn't crash
      tournamentName: route.params.tournamentName
    };

    navigation.navigate('TournamentDashboard', { result });
  };

  const getPlayerOfTheMatch = () => {

    const allPlayers = [
      ...route.params.battingTeam.players,
      ...route.params.bowlingTeam.players
    ];
    const performanceList = allPlayers.map(player => {
      const bStat = store.battingPlayers.find(p => p.name === player.name);
      const bowlStat = store.bowlers.find(b => b.name === player.name);

      let impactScore = 0;
      if (bStat) {
        impactScore += (bStat.runs || 0);

        const sr = bStat.balls > 0 ? (bStat.runs / bStat.balls) * 100 : 0;
        if (sr > 150) impactScore += 10;

        if (bStat.runs >= 50) impactScore += 25;
        if (bStat.runs >= 100) impactScore += 50;
      }


      if (bowlStat) {
        impactScore += (bowlStat.wickets || 0) * 25;

        const totalBalls = (Math.floor(bowlStat.overs || 0) * 6) + ((bowlStat.overs || 0) % 1 * 10);
        const economy = totalBalls >= 6 ? (bowlStat.runsConceded / (totalBalls / 6)) : 10;

        if (totalBalls >= 6 && economy < 6) impactScore += 15;

        if (bowlStat.wickets >= 3) impactScore += 20;
      }

      return { name: player.name, totalScore: impactScore };
    });

    const topPerformer = performanceList.reduce((prev, current) =>
      (prev.totalScore > current.totalScore) ? prev : current
    );

    return topPerformer.name;
  };
  const getRequiredRunRate = () => {
    const runsNeeded = (store.firstInningsScore + 1) - store.runs;
    const totalBalls = route.params.totalOvers * 6;
    const ballsRemaining = totalBalls - store.balls;

    if (ballsRemaining <= 0) return "0.00";

    // (Runs Needed / Balls Remaining) * 6 gives the rate per over
    const rrr = (runsNeeded / ballsRemaining) * 6;
    return rrr.toFixed(2);
  };

  const getCurrentRunRate = () => {
    if (store.balls === 0) return "0.00";
    return ((store.runs / store.balls) * 6).toFixed(2);
  };
  const formatOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.matchTitle}>
              {(route.params.battingTeamName || "MATCH").toUpperCase()}
            </Text>
            <Text style={styles.crrText}>CRR: {(store.balls === 0 ? 0 : (store.runs / store.balls) * 6).toFixed(2)}</Text>
          </View>
          <Button mode="outlined" textColor="#F87171" onPress={handleUndo} disabled={history.length === 0}>Undo↪</Button>
          <IconButton icon="undo-variant" iconColor="#F87171" onPress={handleUndo}  />
        </View>
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
          {store.isSecondInnings && (
            <View style={styles.targetContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.targetText}>TARGET: {store.firstInningsScore + 1}</Text>
                <View style={styles.rrrBadge}>
                  <Text style={styles.rrrText}>RRR: {getRequiredRunRate()}</Text>
                </View>
              </View>

              <Text style={styles.needText}>
                Need {(store.firstInningsScore + 1) - store.runs} runs in {(route.params.totalOvers * 6) - store.balls} balls
              </Text>

              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={styles.crrText}>CRR: {getCurrentRunRate()}</Text>
              </View>
            </View>
          )}
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
                <Button
                  mode="outlined"
                  onPress={() => setFielderMenuVisible(true)}
                  textColor="#FFF"
                  style={{ borderColor: '#38BDF8' }}
                >
                  {selectedFielder || "Select Fielder"}
                </Button>

                <Portal>
                  <Modal
                    visible={fielderMenuVisible}
                    onDismiss={() => setFielderMenuVisible(false)}
                    contentContainerStyle={styles.modalStyle}
                  >
                    <Text style={styles.modalTitle}>Select Fielder</Text>
                    <ScrollView style={{ maxHeight: 300 }}>
                      {route.params.bowlingTeam.players.map((f: any, i: number) => (
                        <List.Item
                          key={i}
                          title={f.name}
                          titleStyle={{ color: '#FFF' }}
                          onPress={() => {
                            setSelectedFielder(f.name);
                            setFielderMenuVisible(false);
                          }}
                          left={props => <List.Icon {...props} icon="hand-back-right" color="#38BDF8" />}
                        />
                      ))}
                    </ScrollView>
                    <Button onPress={() => setFielderMenuVisible(false)}>Close</Button>
                  </Modal>
                </Portal>
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
          {/* Match END MODAL */}
          <Modal visible={matchEndModal} dismissable={false} contentContainerStyle={styles.modalStyle}>
            {!store.isSecondInnings ? (
              // FIRST INNINGS END UI
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.modalTitle}>Innings Completed</Text>
                <Text style={[styles.runsText, { fontSize: 30 }]}>
                  {store.runs}/{store.wickets}
                </Text>
                <Text style={styles.subLabel}>Target: {store.runs + 1} runs</Text>

                <Button
                  mode="contained"
                  style={{ marginTop: 20, backgroundColor: '#10B981', width: '100%' }}
                  onPress={() => {
                    const totalOvers = route.params?.totalOvers || 5;
                    store.setInnings(true);
                    setMatchEndModal(false);
                    navigation.navigate('PreMatch', {
                      battingTeam: route.params.bowlingTeam,
                      bowlingTeam: route.params.battingTeam,
                      totalOvers: totalOvers,
                      isSecondInnings: true
                    });
                  }}
                >
                  START SECOND INNINGS
                </Button>
              </View>
            ) : (
              // MATCH COMPLETED UI
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.modalTitle, { color: '#F59E0B' }]}>🏆 MATCH FINISHED</Text>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginVertical: 10 }}>
                  {getMatchResult()}
                </Text>

                <View style={{ backgroundColor: '#334155', padding: 15, borderRadius: 10, width: '100%', marginVertical: 10 }}>
                  <Text style={{ color: '#94A3B8', textAlign: 'center' }}>Player of the Match</Text>
                  <Text style={{ color: '#38BDF8', fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
                    🌟 {getPlayerOfTheMatch()}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  style={{ marginTop: 10, width: '100%' }}
                  onPress={() => navigation.navigate('FullScorecard')}
                >
                  VIEW FULL SCORECARD
                </Button>

                {/* <Button
                  mode="contained"
                  buttonColor="#10B981" // Green button for saving
                  style={{ marginTop: 10, width: '100%' }}
                  onPress={handleFinishMatch}
                >
                  SAVE & RETURN TO DASHBOARD
                </Button> */}
              </View>
            )}
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
  radioItem: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  targetContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)', // Light yellow transparent bg
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24', // Solid yellow accent
  },
  targetText: {
    color: '#FBBF24', // Yellow color
    fontWeight: 'bold',
    fontSize: 18,
  },

  rrrBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rrrText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  needText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500'
  },
  crrText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ScoringDash;