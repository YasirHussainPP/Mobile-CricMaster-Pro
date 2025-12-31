import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';

const TournamentSetupScreen = ({ navigation }: { navigation: any }) => {
  const [name, setName] = useState('');
  const [totalTeams, setTotalTeams] = useState('4');
  const [overs, setOvers] = useState('20');
  const [format, setFormat] = useState('league');

  const handleNext = () => {
    if (!name) return;
    // Note: You need to register 'TeamSquadEntry' in App.tsx for this to work
    navigation.navigate('TeamSquadEntry', { 
      config: { name, totalTeams: parseInt(totalTeams), overs: parseInt(overs), format } 
    });
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} // Use this for centering
    >
      <Text style={styles.title}>Create New Tournament</Text>
      
      <TextInput
        label="Tournament Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        textColor="#FFF"
        outlineColor="#334155"
        activeOutlineColor="#0DAE7A"
        style={styles.input}
        placeholder="e.g. World Cup 2025"
        
theme={{
    colors: {
      primary: '#0DAE7A',        // focused label color
      onSurfaceVariant: '#94A3B8' // unfocused label color
    }
    }}
      />

      <View style={styles.row}>
        <TextInput
          label="Total Teams"
          value={totalTeams}
          onChangeText={setTotalTeams}
          keyboardType="numeric"
          mode="outlined"
          textColor="#FFF"
          outlineColor="#334155"
          activeOutlineColor="#0DAE7A"
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          theme={{
    colors: {
      primary: '#0DAE7A',        // focused label color
      onSurfaceVariant: '#94A3B8' // unfocused label color
    }
    }}
        />
        <TextInput
          label="Overs per Match"
          value={overs}
          onChangeText={setOvers}
          keyboardType="numeric"
          mode="outlined"
          textColor="#FFF"
          outlineColor="#334155"
          activeOutlineColor="#0DAE7A"
          style={[styles.input, { flex: 1 }]}
          theme={{
    colors: {
      primary: '#0DAE7A',        // focused label color
      onSurfaceVariant: '#94A3B8' // unfocused label color
    }
    }}
        />
      </View>

      <Text style={styles.label}>Tournament Format</Text>
      <SegmentedButtons
        value={format}
        onValueChange={setFormat}
        theme={{ colors: { secondaryContainer: '#0DAE7A', onSecondaryContainer: '#000' } }}
        buttons={[
          { value: 'knockout', label: 'Knockout', labelStyle: { color: '#FFF' } },
          { value: 'league', label: 'League + Final', labelStyle: { color: '#FFF' } },
        ]}
        style={styles.segment}
      />
      
      <HelperText type="info" visible style={{ color: '#94A3B8' }}>
        {format === 'league' 
          ? "Teams play round-robin, top teams advance to Semi-Finals/Finals (ICC Style)."
          : "Direct elimination. Lose one match and the team is out."}
      </HelperText>

      <Button mode="contained" onPress={handleNext} style={styles.btn}>
        Next: Add Teams & Squads
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A' 
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1, // Ensures it centers even if content is small
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 30, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  segment: { marginBottom: 10, borderColor: '#334155' },
  input: { 
    backgroundColor: '#1E293B', 
    marginBottom: 15 
  },
  label: { color: '#FFF', fontSize: 14, marginBottom: 10, fontWeight: 'bold' },
  btn: { marginTop: 20, backgroundColor: '#0DAE7A', paddingVertical: 8 },
});

export default TournamentSetupScreen;