import React, { useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

const MatchSetupScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('Weekend Trophy');
    const [overs, setOvers] = useState('5');
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    
      React.useEffect(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, []);

    return (
         
        <View style={styles.container}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Card style={[styles.card, styles.glow]}>
                <Card.Content>
                    <Text style={styles.label}>MATCH TITLE</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Final Cup" />

                    <Text style={[styles.label, { marginTop: 20 }]}>TOTAL OVERS</Text>
                    <TextInput style={styles.input} value={overs} onChangeText={setOvers} keyboardType="numeric" />
                </Card.Content>
            </Card>
            
            <Button style={styles.btn} mode="contained" onPress={() => navigation.navigate('QuickMatch', { matchTitle: title, totalOvers: parseInt(overs) })}>
                CONFIGURE SQUADS
            </Button>
            </Animated.View>
        </View>
    );

};
// Use similar styles 
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 20, justifyContent: 'center' },
    card: { backgroundColor: '#1E293B', marginVertical: 5, padding: 10 },
    input: { width: '48%', backgroundColor: '#1E293B', padding: 10,color: '#FFF', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
    label: { color: '#94A3B8', fontSize: 12, marginBottom: 5, fontWeight: 'bold' },
    btn: { marginTop: 20, backgroundColor: '#0DAE7A' },
    glow: {
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20, // For Android
  }
});

export default MatchSetupScreen;