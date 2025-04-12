import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';





const Tab = createBottomTabNavigator();
const moods = ['😀', '🙂', '😐', '😔', '😢'];

const JournalScreen = () => {
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const loadEntries = async () => {
      const data = await AsyncStorage.getItem('journalEntries');
      if (data) setEntries(JSON.parse(data));
    };
    loadEntries();
  }, []);

  const saveEntry = async () => {
    if (!entry || !selectedMood) return;
    const newEntry = {
      text: entry,
      mood: selectedMood,
      date: new Date().toISOString().split('T')[0],
    };
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    setEntry('');
    setSelectedMood(null);
  };

  const deleteEntry = async (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    await AsyncStorage.setItem('journalEntries', JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Journal Entry</Text>
      <TextInput
        style={styles.input}
        placeholder="Write something..."
        value={entry}
        onChangeText={setEntry}
      />
      <View style={styles.moodContainer}>
        {moods.map((m) => (
          <TouchableOpacity key={m} onPress={() => setSelectedMood(m)}>
            <Text style={[styles.mood, selectedMood === m && styles.selectedMood]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Save Entry" onPress={saveEntry} />
      <FlatList
        data={entries}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.entry}>
            <Text>{item.date} - {item.mood}</Text>
            <Text>{item.text}</Text>
            <Button title="Delete" onPress={() => deleteEntry(index)} />
          </View>
        )}
      />
    </View>
  );
};

const DashboardScreen = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const loadEntries = async () => {
      const data = await AsyncStorage.getItem('journalEntries');
      if (data) setEntries(JSON.parse(data));
    };
    loadEntries();
  }, []);

  const moodData = moods.map(mood =>
    entries.filter(entry => entry.mood === mood).length
  );

  const dateCounts = entries.reduce((acc, entry) => {
    acc[entry.date] = (acc[entry.date] || 0) + 1;
    return acc;
  }, {});
  const dates = Object.keys(dateCounts);
  const counts = Object.values(dateCounts);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mood Overview</Text>
      <LineChart
        data={{
          labels: moods,
          datasets: [{ data: moodData }]
        }}
        width={Dimensions.get('window').width - 30}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
      <Text style={styles.header}>Entries Over Time</Text>
      <LineChart
        data={{
          labels: dates,
          datasets: [{ data: counts }]
        }}
        width={Dimensions.get('window').width - 30}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 10 },
  moodContainer: { flexDirection: 'row', marginBottom: 10 },
  mood: { fontSize: 24, marginHorizontal: 5 },
  selectedMood: { backgroundColor: '#ddd', borderRadius: 5 },
  entry: { padding: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }
});
