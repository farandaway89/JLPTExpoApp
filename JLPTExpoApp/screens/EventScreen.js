import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { upcomingEvents, formatEventDate } from '../data/events';

const EventScreen = ({ navigation }) => {
  const handleStartStudy = (event) => {
    navigation.navigate('Flashcard', { jlptLevel: event.recommendedLevel });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.introCard}>
        <Card.Content>
          <Title style={styles.introTitle}>지역별 JLPT 오프라인 행사</Title>
          <Paragraph style={styles.introText}>
            전국 각 지역을 순회하는 JLPT 설명회·박람회 일정입니다. 행사장에서
            Wi-Fi 없이도 바로 단어 학습을 시작할 수 있습니다.
          </Paragraph>
        </Card.Content>
      </Card>

      {upcomingEvents.map((event) => (
        <Card key={event.id} style={styles.eventCard}>
          <Card.Content>
            <View style={styles.eventHeader}>
              <Text style={styles.regionBadge}>{event.region}</Text>
              <Chip mode="outlined" style={styles.levelChip}>
                {event.levels}
              </Chip>
            </View>

            <Title style={styles.eventDate}>{formatEventDate(event.date)}</Title>
            <Paragraph style={styles.venue}>📍 {event.venue}</Paragraph>
            <Paragraph style={styles.description}>{event.description}</Paragraph>

            <TouchableOpacity
              style={styles.studyButton}
              onPress={() => handleStartStudy(event)}>
              <Text style={styles.studyButtonText}>
                행사 맞춤 학습 시작 (N{event.recommendedLevel})
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  introCard: {
    marginBottom: 16,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  introTitle: {
    color: '#E91E63',
    fontSize: 18,
  },
  introText: {
    color: '#666',
    lineHeight: 22,
    marginTop: 4,
  },
  eventCard: {
    marginBottom: 12,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionBadge: {
    backgroundColor: '#E91E63',
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  levelChip: {
    backgroundColor: '#FCE4EC',
  },
  eventDate: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  venue: {
    color: '#555',
    marginBottom: 6,
  },
  description: {
    color: '#777',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  studyButton: {
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  studyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default EventScreen;
