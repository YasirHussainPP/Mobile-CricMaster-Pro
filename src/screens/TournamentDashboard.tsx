
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, DataTable, Divider, Text } from 'react-native-paper';

const TournamentDashboard = ({ route, navigation }: any) => {
  const [teams, setTeams] = useState(route.params?.teams || []);
  const [fixtures, setFixtures] = useState(route.params?.fixtures || []);
  const [champion, setChampion] = useState<any>(null);

  const loadTournamentData = async () => {
    try {
      const stored = await AsyncStorage.getItem('all_tournaments');
      if (stored) {
        const allTournaments = JSON.parse(stored);
        // Find the current tournament by name
        const current = allTournaments.find(
          (t: any) => t.tournamentName === (route.params?.tournamentName || route.params?.result?.tournamentName)
        );
        if (current) {
          setTeams(current.teams || []);
          setFixtures(current.fixtures || []);
        }
      }
    } catch (error) {
      console.error("Failed to load tournament:", error);
    }
  };

  // 2. Global Delete with Confirmation Popup
  const confirmDeleteAll = () => {
    Alert.alert(
      "Delete Tournament Data",
      "Are you sure? This will delete all completed matches, points table, and player stats for this tournament. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "DELETE ALL",
          style: "destructive",
          onPress: async () => {
            const stored = await AsyncStorage.getItem('all_tournaments');
            if (stored) {
              let all = JSON.parse(stored).filter(
                (t: any) => t.tournamentName !== route.params.tournamentName
              );
              await AsyncStorage.setItem('all_tournaments', JSON.stringify(all));
              navigation.navigate('Home');
            }
          }
        }
      ]
    );
  };

  const matchesPlayed = useMemo(() =>
    fixtures.filter((f: any) => f.status === 'completed').length,
    [fixtures]);


  useEffect(() => {
    if (teams.length === 0 && route.params?.teams) {
      setTeams(route.params.teams);
    }
    if (fixtures.length === 0 && route.params?.fixtures) {
      setFixtures(route.params.fixtures);
    }
  }, [route.params?.teams, route.params?.fixtures]);
  // --- 1. HANDLE MATCH RESULTS FROM SCORING DASH ---
  useEffect(() => {
    if (route.params?.result) {
      const { matchId, winner, loser, scoreA, ballsA, scoreB, ballsB, teamAName, playerStats } = route.params.result;

      // Prevent double-processing the same match
      if (fixtures.find((f: any) => f.id === matchId && f.status === 'completed')) return;

      const updatedFixtures = fixtures.map((f: any) =>
        f.id === matchId ? { ...f, status: 'completed', winner, scoreA, scoreB } : f
      );

      const updatedTeams = teams.map((team: any) => {
        if (team.name !== winner && team.name !== loser) return team;

        let t = { ...team };
        t.stats.played += 1;
        if (t.name === winner) {
          t.stats.won += 1;
          t.stats.points += 2;
        } else {
          t.stats.lost += 1;
        }

        // NRR Math (Using Balls to avoid NaN)
        const isTeamA = t.name === teamAName;
        t.stats.totalRunsScored += isTeamA ? scoreA : scoreB;
        t.stats.totalBallsFaced += isTeamA ? ballsA : ballsB;
        t.stats.totalRunsConceded += isTeamA ? scoreB : scoreA;
        t.stats.totalBallsBowled += isTeamA ? ballsB : ballsA;

        const rf = t.stats.totalRunsScored / (t.stats.totalBallsFaced / 6 || 1);
        const ra = t.stats.totalRunsConceded / (t.stats.totalBallsBowled / 6 || 1);
        t.stats.nrr = rf - ra;

        // Update Player Leaderboard Data
        t.players = t.players.map((p: any) => {
          const stats = playerStats.find((ps: any) => ps.name === p.name);
          if (stats) {
            return {
              ...p,
              runs: (p.runs || 0) + (stats.runs || 0),
              wickets: (p.wickets || 0) + (stats.wickets || 0),
              innings: (p.innings || 0) + 1,
              balls: (p.balls || 0) + (stats.balls || 0),
              runsConceded: (p.runsConceded || 0) + (stats.runsConceded || 0),
              oversBowled: (p.oversBowled || 0) + (stats.overs || 0)
            };
          }
          return p;
        });
        return t;
      });

      setFixtures(updatedFixtures);
      setTeams(updatedTeams);
      saveToGlobalStorage(updatedTeams, updatedFixtures);
    }
  }, [route.params?.result]);

  const saveToGlobalStorage = async (t: any, f: any) => {
    const stored = await AsyncStorage.getItem('all_tournaments');
    let all = stored ? JSON.parse(stored) : [];
    const index = all.findIndex((item: any) => item.tournamentName === route.params.tournamentName);
    if (index > -1) {
      all[index].teams = t;
      all[index].fixtures = f;
      await AsyncStorage.setItem('all_tournaments', JSON.stringify(all));
    }
  };

  const deleteTournament = async () => {
    const stored = await AsyncStorage.getItem('all_tournaments');
    if (stored) {
      let all = JSON.parse(stored).filter((t: any) => t.tournamentName !== route.params.tournamentName);
      await AsyncStorage.setItem('all_tournaments', JSON.stringify(all));
      navigation.navigate('Home');
    }
  };

  // --- 2. DATA SELECTORS ---
  const allPlayersWithTeam = useMemo(() => {
    return (teams || []).flatMap((t: any) =>
      (t.players || []).map((p: any) => ({ ...p, teamName: t.name }))
    );
  }, [teams]);

  const topBatsmen = useMemo(() => {
    return [...allPlayersWithTeam]
      .filter(p => (p.runs || 0) > 0)
      .sort((a, b) => (b.runs || 0) - (a.runs || 0))
      .slice(0, 5);
  }, [allPlayersWithTeam]);

  const topBowlers = useMemo(() => {
    return [...allPlayersWithTeam]
      .filter(p => (p.wickets || 0) > 0)
      .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
      .slice(0, 5);
  }, [allPlayersWithTeam]);

  // 4. ICC-Style Player of the Tournament (Total Impact)
  const potm = useMemo(() => {
    if (allPlayersWithTeam.length === 0) return null;
    return [...allPlayersWithTeam].sort((a, b) => {
      const scoreA = (a.runs || 0) + (a.wickets || 0) * 25;
      const scoreB = (b.runs || 0) + (b.wickets || 0) * 25;
      return scoreB - scoreA;
    })[0];
  }, [allPlayersWithTeam]);

  if (!teams || teams.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFF' }}>Loading Tournament Data...</Text>
        <Button onPress={loadTournamentData} textColor="#38BDF8">Retry Loading</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>
          {(route.params?.tournamentName || route.params?.result?.tournamentName || "Tournament Dashboard").toUpperCase()}
        </Text>

        {champion && (
          <Card style={styles.championCard}>
            <Avatar.Icon size={60} icon="trophy" color="#F59E0B" style={{ backgroundColor: 'transparent', alignSelf: 'center' }} />
            <Text style={styles.champTitle}>TOURNAMENT CHAMPIONS</Text>
            <Text style={styles.champName}>{champion.name}</Text>
          </Card>
        )}

        {/* PLAYER OF TOURNAMENT */}
        <Card style={styles.potmCard}>
          {matchesPlayed === 0 ? (
            <Text style={styles.emptyText}>Tournament Not Started - No Stats Available</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Text size={50} label={potm?.name ? potm.name[0] : '?'} style={{ backgroundColor: '#38BDF8' }} />
              <View style={{ marginLeft: 15 }}>
                <Text style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: 12 }}>PLAYER OF TOURNAMENT</Text>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>{potm?.name}</Text>
                <Text style={{ color: '#94A3B8' }}>{potm?.runs || 0} Runs • {potm?.wickets || 0} Wickets</Text>
              </View>
            </View>
          )}
        </Card>

        {/* POINTS TABLE */}
        <Text style={styles.sectionTitle}>POINTS TABLE</Text>
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={{ flex: 2 }}><Text style={styles.whiteText}>Team</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.whiteText}>P</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.whiteText}>W</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.whiteText}>NRR</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.whiteText}>Pts</Text></DataTable.Title>
            </DataTable.Header>
            {teams.sort((a: any, b: any) => b.stats.points - a.stats.points || b.stats.nrr - a.stats.nrr).map((team: any, index: number) => (
              <DataTable.Row key={index} style={{ borderBottomColor: '#334155' }}>
                <DataTable.Cell style={{ flex: 2 }}><Text style={styles.grayText}>{team.name}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.grayText}>{team.stats.played}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.grayText}>{team.stats.won}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.grayText}>{team.stats.nrr.toFixed(2) || 0}</Text></DataTable.Cell>
                <DataTable.Cell numeric><Text style={styles.whiteText}>{team.stats.points}</Text></DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card>

        {/* LEADERBOARDS (TOP 5) */}
        <View style={styles.statRowContainer}>
          <Card style={styles.miniCard}>
            <Text style={styles.miniTitle}>TOP SCORERS</Text>
            {topBatsmen.length === 0 ? <Text style={styles.emptyDash}>-</Text> : topBatsmen.map((p, i) => (
              <View key={i} style={styles.playerStatLine}>
                <View>
                  <Text style={styles.pName}>{p.name}</Text>
                  <Text style={styles.pSub}>{p.teamName.slice(0, 3)} • Inn:{p.innings || 0}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pStat}>{p.runs || 0}</Text>
                  <Text style={styles.pSub}>SR:{((p.runs / (p.balls || 1)) * 100).toFixed(0)}</Text>
                </View>
              </View>
            ))}
          </Card>

          <Card style={styles.miniCard}>
            <Text style={styles.miniTitle}>TOP BOWLERS</Text>
            {topBatsmen.map((p, i) => (
              <View key={i} style={styles.playerStatLine}>
                <View>
                  <Text style={styles.pName}>{p.name}</Text>
                  <Text style={styles.pSub}>{p.teamName?.slice(0, 3)} • Inn:{p.innings || 0}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pStat}>{p.runs || 0}</Text>
                  {/* Safe SR calculation to prevent Division by Zero/NaN */}
                  <Text style={styles.pSub}>
                    SR: {p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(0) : "0"}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* MATCH SCHEDULE */}
        <Text style={styles.sectionTitle}>MATCH SCHEDULE</Text>
        {fixtures.map((match: any) => (
          <Card key={match.id} style={styles.matchCard}>
            <View style={styles.matchRow}>
              <Text style={styles.teamNameText}>{match.teamA}</Text>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.teamNameText}>{match.teamB}</Text>
            </View>
            <Divider style={{ backgroundColor: '#334155', marginVertical: 10 }} />
            {match.status === 'completed' ? (
              <Button
                mode="outlined"
                textColor="#4ADE80"
                onPress={() => navigation.navigate('FullScorecard', { matchId: match.id, isTournament: true })}
                style={{ borderColor: '#4ADE80' }}
              >View Result</Button>
            ) : (
              <Button
                mode="contained"
                buttonColor="#38BDF8"
                onPress={() => {
                  const teamAObj = teams.find((t: any) => t.name === match.teamA);
                  const teamBObj = teams.find((t: any) => t.name === match.teamB);

                  navigation.navigate('Toss', {
                    matchData: match,
                    isTournament: true,
                    teamA: teamAObj,  // Changed from battingTeam to teamA
                    teamB: teamBObj,  // Changed from bowlingTeam to teamB
                    totalOvers: route.params.overs
                  });
                }}
              >Start Match</Button>
            )}
          </Card>
        ))}

        {champion && (
          <Button mode="contained" buttonColor="#EF4444" onPress={deleteTournament} style={{ marginVertical: 30 }}>
            DELETE TOURNAMENT DATA
          </Button>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 15 },
  header: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  sectionTitle: { color: '#38BDF8', fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  tableCard: { backgroundColor: '#1E293B', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  tableHeader: { backgroundColor: '#334155' },
  whiteText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  grayText: { color: '#94A3B8', fontSize: 13 },
  matchCard: { backgroundColor: '#1E293B', padding: 15, marginBottom: 12, borderRadius: 12 },
  matchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teamNameText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', width: '40%', textAlign: 'center' },
  vsText: { color: '#38BDF8', fontWeight: '900', fontSize: 12 },
  statRowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  miniCard: { flex: 0.48, backgroundColor: '#1E293B', padding: 12, borderRadius: 12 },
  miniTitle: { color: '#38BDF8', fontSize: 11, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  playerStatLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pName: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  pSub: { color: '#64748B', fontSize: 10 },
  pStat: { color: '#10B981', fontWeight: 'bold', fontSize: 13 },
  emptyDash: { color: '#475569', textAlign: 'center', fontSize: 20, marginVertical: 10 },
  championCard: { backgroundColor: '#1E293B', padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#F59E0B' },
  champTitle: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold' },
  champName: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  potmCard: { backgroundColor: '#1E293B', padding: 15, marginBottom: 20, borderRadius: 12 },
  emptyText: { color: '#94A3B8', textAlign: 'center', padding: 10 }
});

export default TournamentDashboard;