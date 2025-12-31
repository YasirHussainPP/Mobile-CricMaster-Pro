import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Card, Divider, Menu, Paragraph, Text, Title } from 'react-native-paper';

const HomeScreen = ({ navigation }: any) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  // State for Saved Data
  const [savedTournaments, setSavedTournaments] = useState<any[]>([]);
  const [savedQuickMatches, setSavedQuickMatches] = useState<any[]>([]);

  // Menu Visibility States
  const [tournamentMenuVisible, setTournamentMenuVisible] = useState(false);
  const [quickMatchMenuVisible, setQuickMatchMenuVisible] = useState(false);

  // Load data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const tournamentData = await AsyncStorage.getItem('all_tournaments');
          const quickMatchData = await AsyncStorage.getItem('all_quick_matches');
          
          if (tournamentData) setSavedTournaments(JSON.parse(tournamentData));
          if (quickMatchData) setSavedQuickMatches(JSON.parse(quickMatchData));
        } catch (e) {
          console.error("Failed to load local storage", e);
        }
      };
      loadData();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handlers
  const handleSelectTournament = (tournament: any) => {
    setTournamentMenuVisible(false);
    navigation.navigate('TournamentDashboard', tournament);
  };

  const handleSelectQuickMatch = (match: any) => {
    setQuickMatchMenuVisible(false);
    // Adjust navigation based on your quick match storage structure
    navigation.navigate('FullScorecard', { matchData: match });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={styles.header}>CRICMASTER PRO</Text>
          <Text style={styles.subHeader}>Select your management mode</Text>

          {/* CHAMPIONSHIP SECTION */}
          <Menu
            visible={tournamentMenuVisible}
            onDismiss={() => setTournamentMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setTournamentMenuVisible(true)}>
                <Card style={[styles.card, styles.glow]}>
                  <Card.Content>
                    <Title style={styles.whiteText}>CHAMPIONSHIP</Title>
                    <Paragraph style={styles.grayText}>
                      {savedTournaments.length > 0 
                        ? `${savedTournaments.length} Active Tournaments found.` 
                        : "Multiple teams, league tables, and full automation."}
                    </Paragraph>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item 
              // onPress={() => { setTournamentMenuVisible(false); navigation.navigate('TournamentSetup'); }} 
              onPress={() => Alert.alert("Coming soon")}
              title="Coming soon" 
              //leadingIcon="plus"
              titleStyle={{ color: '#10B981', fontWeight: 'bold' }}
            />
            {/* {savedTournaments.length > 0 && <Divider style={styles.divider} />}
            {savedTournaments.map((t, index) => (
              <Menu.Item 
                key={index} 
                onPress={() => handleSelectTournament(t)} 
                title={t.tournamentName} 
                titleStyle={{ color: '#FFF' }}
              />
            ))} */}
          </Menu>

          {/* QUICK MATCH SECTION */}
          <Menu
            visible={quickMatchMenuVisible}
            onDismiss={() => setQuickMatchMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setQuickMatchMenuVisible(true)}>
                <Card style={[styles.card, styles.glow]}>
                  <Card.Content>
                    <Title style={styles.whiteText}>QUICK MATCH</Title>
                    <Paragraph style={styles.grayText}>
                      One-off exhibition game between two teams.
                    </Paragraph>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item 
              onPress={() => { setQuickMatchMenuVisible(false); navigation.navigate('MatchSetup'); }} 
              title="Start New Match" 
              leadingIcon="cricket"
              titleStyle={{ color: '#38BDF8', fontWeight: 'bold' }}
            />
            {savedQuickMatches.length > 0 && <Divider style={styles.divider} />}
            {savedQuickMatches.map((m, index) => (
              <Menu.Item 
                key={index} 
                onPress={() => handleSelectQuickMatch(m)} 
                title={`${m.teamA} vs ${m.teamB}`} 
                titleStyle={{ color: '#FFF' }}
              />
            ))}
          </Menu>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 300, 
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: { color: '#FFF', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  subHeader: { color: '#94A3B8', textAlign: 'center', marginBottom: 40 },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  grayText: { color: '#94A3B8' },
  glow: {
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  menuContent: {
    backgroundColor: '#1E293B',
    marginTop: 80, // Offset to show below card
    borderWidth: 1,
    borderColor: '#334155',
  },
  divider: {
    backgroundColor: '#334155',
    marginVertical: 4
  }
});

export default HomeScreen;