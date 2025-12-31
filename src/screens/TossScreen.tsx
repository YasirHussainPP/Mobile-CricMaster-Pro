import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';

const TossScreen = ({ route, navigation }: any) => {
  // teamA and teamB now match the names passed from TournamentDashboard
  const { teamA, teamB, totalOvers, isTournament, matchData } = route.params;
  
  const [tossStep, setTossStep] = useState<'call' | 'flipping' | 'result'>('call');
  const [tossWinner, setTossWinner] = useState<any>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = (call: 'Heads' | 'Tails') => {
    setTossStep('flipping');
    Animated.timing(flipAnim, { toValue: 10, duration: 1500, useNativeDriver: true }).start(() => {
      const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
      // Logic: If result matches call, Team A wins, otherwise Team B wins
      const winner = result === call ? teamA : teamB;
      setTossWinner(winner);
      setTossStep('result');
    });
  };

  const handleChoice = (choice: 'Bat' | 'Bowl') => {
    // Determine who bats and who bowls based on the toss winner's choice
    const isWinnerTeamA = tossWinner.name === teamA.name;
    
    const battingTeam = (choice === 'Bat') 
      ? (isWinnerTeamA ? teamA : teamB) 
      : (isWinnerTeamA ? teamB : teamA);
      
    const bowlingTeam = (choice === 'Bat') 
      ? (isWinnerTeamA ? teamB : teamA) 
      : (isWinnerTeamA ? teamA : teamB);

    navigation.navigate('PreMatch', { 
      battingTeam: battingTeam, 
      bowlingTeam: bowlingTeam, 
      battingTeamName: battingTeam.name,
      bowlingTeamName: bowlingTeam.name,
      totalOvers: totalOvers,
      matchData: matchData,
      isTournament: isTournament,
    });
  };

  const spin = flipAnim.interpolate({ 
    inputRange: [0, 10], 
    outputRange: ['0deg', '3600deg'] 
  });

  return (
    <View style={styles.container}>
      {tossStep === 'call' && (
        <View style={styles.center}>
          {/* Changed .teamName to .name to match your data structure */}
          <Text style={styles.title}>{teamA?.name} Call</Text>
          console.log(` Navigating to Toss with Team A: ${teamA.name} and Team B: ${ } `);
          <View style={styles.row}>
            <Button mode="contained" onPress={() => handleFlip('Heads')} style={styles.btn}>Heads</Button>
            <Button mode="contained" onPress={() => handleFlip('Tails')} style={styles.btn}>Tails</Button>
          </View>
        </View>
      )}

      {tossStep === 'flipping' && (
        <Animated.View style={[styles.center, { transform: [{ rotateY: spin }] }]}>
          <Avatar.Icon size={100} icon="currency-usd" style={{backgroundColor: '#FFD700'}} />
          <Text style={{color: '#FFF', marginTop: 20}}>Flipping Coin...</Text>
        </Animated.View>
      )}

      {tossStep === 'result' && (
        <View style={styles.center}>
          <Text style={styles.winnerText}>{tossWinner?.name} won the toss!</Text>
          <Text style={{color: '#94A3B8', marginBottom: 20}}>Choose to Bat or Bowl first</Text>
          <View style={styles.row}>
            <Button icon="cricket" mode="contained" onPress={() => handleChoice('Bat')} style={styles.choiceBtn}>BAT</Button>
            <Button icon="baseball" mode="contained" onPress={() => handleChoice('Bowl')} style={styles.choiceBtn}>BOWL</Button>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center' },
  center: { alignItems: 'center', padding: 20 },
  title: { color: '#FFF', fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 15 },
  btn: { backgroundColor: '#38BDF8', width: 120 },
  winnerText: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  choiceBtn: { backgroundColor: '#10B981', width: 120 }
});

export default TossScreen;