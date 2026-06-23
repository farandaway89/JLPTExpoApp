import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Button, Surface } from 'react-native-paper';
import DatabaseManager from '../database/DatabaseManager';
import { upcomingEvents, formatEventDate } from '../data/events';

const HomeScreen = ({ navigation }) => {
  const [statistics, setStatistics] = useState({
    totalWords: 0,
    studiedWords: 0,
    studyStreak: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const stats = await DatabaseManager.getStudyStatistics();
    setStatistics(stats);
  };

  const navigateToLevelSelect = (mode) => {
    navigation.navigate('LevelSelect', { mode });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{statistics.studiedWords}</Text>
          <Text style={styles.statLabel}>학습한 단어</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{statistics.studyStreak}</Text>
          <Text style={styles.statLabel}>연속 학습일</Text>
        </Surface>
      </View>

      {/* Upcoming Events */}
      <Card style={styles.eventPreviewCard}>
        <Card.Content>
          <Title style={styles.eventPreviewTitle}>다가오는 오프라인 행사</Title>
          {upcomingEvents.slice(0, 2).map((event) => (
            <View key={event.id} style={styles.eventPreviewItem}>
              <Text style={styles.eventPreviewRegion}>{event.region}</Text>
              <Text style={styles.eventPreviewDate}>
                {formatEventDate(event.date)} · {event.venue}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.eventPreviewButton}
            onPress={() => navigation.navigate('Events')}>
            <Text style={styles.eventPreviewButtonText}>전체 행사 일정 보기 →</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Progress Card */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <Title style={styles.progressTitle}>학습 진도</Title>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(statistics.studiedWords / statistics.totalWords) * 100}%`,
                },
              ]}
            />
          </View>
          <Paragraph style={styles.progressText}>
            {statistics.studiedWords} / {statistics.totalWords} 단어 완료
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Main Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigateToLevelSelect('flashcard')}>
          <Text style={styles.buttonText}>플래시카드 학습</Text>
          <Text style={styles.buttonSubtext}>단어 카드로 학습하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigateToLevelSelect('test')}>
          <Text style={styles.buttonText}>단어 테스트</Text>
          <Text style={styles.buttonSubtext}>실력 확인하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.tertiaryButton]}
          onPress={() => navigation.navigate('Statistics')}>
          <Text style={styles.buttonText}>학습 통계</Text>
          <Text style={styles.buttonSubtext}>진도 확인하기</Text>
        </TouchableOpacity>
      </View>

      {/* JLPT Level Quick Access */}
      <Card style={styles.levelCard}>
        <Card.Content>
          <Title>JLPT 레벨별 바로가기</Title>
          <View style={styles.levelGrid}>
            {[5, 4, 3, 2, 1].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.levelButton, getLevelButtonStyle(level)]}
                onPress={() =>
                  navigation.navigate('Flashcard', { jlptLevel: level })
                }>
                <Text style={styles.levelButtonText}>N{level}</Text>
                <Text style={styles.levelButtonSubtext}>
                  {getLevelName(level)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const getLevelButtonStyle = (level) => {
  const colors = {
    5: '#4CAF50', // Green
    4: '#2196F3', // Blue
    3: '#FF9800', // Orange
    2: '#f44336', // Red
    1: '#9E9E9E', // Grey
  };
  return { backgroundColor: colors[level] };
};

const getLevelName = (level) => {
  const names = {
    5: '기초',
    4: '초급',
    3: '중급',
    2: '중고급',
    1: '고급',
  };
  return names[level];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventPreviewCard: {
    marginBottom: 16,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  eventPreviewTitle: {
    color: '#9C27B0',
    fontSize: 16,
    marginBottom: 8,
  },
  eventPreviewItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  eventPreviewRegion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  eventPreviewDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  eventPreviewButton: {
    marginTop: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  eventPreviewButtonText: {
    color: '#9C27B0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressCard: {
    marginBottom: 16,
    elevation: 4,
  },
  progressTitle: {
    color: '#E91E63',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  actionButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#E91E63',
  },
  secondaryButton: {
    backgroundColor: '#9C27B0',
  },
  tertiaryButton: {
    backgroundColor: '#673AB7',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  levelCard: {
    marginBottom: 16,
    elevation: 4,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  levelButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
});

export default HomeScreen;