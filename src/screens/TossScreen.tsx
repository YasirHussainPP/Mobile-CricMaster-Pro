import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';

const TossScreen = ({ route, navigation }: any) => {
  const { teamA, teamB } = route.params;
  const [tossStep, setTossStep] = useState<'call' | 'flipping' | 'result'>('call');
  const [tossWinner, setTossWinner] = useState<any>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = (call: 'Heads' | 'Tails') => {
    setTossStep('flipping');
    Animated.timing(flipAnim, { toValue: 10, duration: 1500, useNativeDriver: true }).start(() => {
      const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
      const winner = result === call ? teamA : teamB;
      setTossWinner(winner);
      setTossStep('result');
    });
  };

 const handleChoice = (choice: 'Bat' | 'Bowl') => {
  const isWinnerTeamA = tossWinner.teamName === teamA.teamName;
  const battingTeam = (choice === 'Bat') ? (isWinnerTeamA ? teamA : teamB) : (isWinnerTeamA ? teamB : teamA);
  const bowlingTeam = (choice === 'Bat') ? (isWinnerTeamA ? teamB : teamA) : (isWinnerTeamA ? teamA : teamB);
  navigation.navigate('PreMatch', { 
    battingTeam, 
    bowlingTeam, 
    matchTitle: route.params?.matchTitle, 
    totalOvers: route.params?.totalOvers 
  });
};

  const spin = flipAnim.interpolate({ inputRange: [0, 10], outputRange: ['0deg', '3600deg'] });

  return (
    <View style={styles.container}>
      {tossStep === 'call' && (
        <View style={styles.center}>
          <Text style={styles.title}>{teamA.teamName} Call</Text>
          <View style={styles.row}>
            <Button mode="contained" onPress={() => handleFlip('Heads')} style={styles.btn}>Heads</Button>
            <Button mode="contained" onPress={() => handleFlip('Tails')} style={styles.btn}>Tails</Button>
          </View>
        </View>
      )}
      {tossStep === 'flipping' && (
        <Animated.View style={[styles.center, { transform: [{ rotateY: spin }] }]}>
          <Avatar.Icon size={100} icon="currency-usd" style={{backgroundColor: '#FFD700'}} />
        </Animated.View>
      )}
      {tossStep === 'result' && (
        <View style={styles.center}>
          <Text style={styles.winnerText}>{tossWinner.teamName} won the toss!</Text>
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
  center: { alignItems: 'center' },
  title: { color: '#FFF', fontSize: 24, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 15 },
  btn: { backgroundColor: '#10B981', width: 120 },
  winnerText: { color: '#FFD700', fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
  choiceBtn: { backgroundColor: '#10B981', width: 120 }
});

export default TossScreen;
