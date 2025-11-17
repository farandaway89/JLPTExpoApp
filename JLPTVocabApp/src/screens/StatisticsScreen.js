import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, Surface } from 'react-native-paper';
import DatabaseManager from '../database/DatabaseManager';

const StatisticsScreen = ({ navigation }) => {
  const [statistics, setStatistics] = useState({
    totalWords: 0,
    studiedWords: 0,
    studyStreak: 0,
  });
  const [testHistory, setTestHistory] = useState([]);
  const [levelProgress, setLevelProgress] = useState({});

  useEffect(() => {
    loadAllStatistics();
  }, []);

  const loadAllStatistics = async () => {
    try {
      const stats = await DatabaseManager.getStudyStatistics();
      setStatistics(stats);

      const history = await DatabaseManager.getTestHistory();
      setTestHistory(history);

      // Load progress for each level
      const progress = {};
      for (let level = 1; level <= 5; level++) {
        const words = await DatabaseManager.getWordsByLevel(level);
        const [studiedResults] = await DatabaseManager.db.executeSql(`
          SELECT COUNT(*) as count
          FROM learning_progress lp
          JOIN words w ON lp.word_id = w.id
          WHERE w.jlpt_level = ?
        `, [level]);

        progress[level] = {
          total: words.length,
          studied: studiedResults.rows.item(0).count,
        };
      }
      setLevelProgress(progress);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const getLevelName = (level) => {
    const names = { 5: '기초', 4: '초급', 3: '중급', 2: '중고급', 1: '고급' };
    return names[level];
  };

  const getLevelColor = (level) => {
    const colors = {
      5: '#4CAF50',
      4: '#2196F3',
      3: '#FF9800',
      2: '#f44336',
      1: '#9E9E9E',
    };
    return colors[level];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getAverageAccuracy = () => {
    if (testHistory.length === 0) return 0;
    const totalAccuracy = testHistory.reduce(
      (sum, test) => sum + (test.correct_answers / test.total_questions) * 100,
      0
    );
    return Math.round(totalAccuracy / testHistory.length);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Overall Statistics */}
      <Card style={styles.overallCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>전체 학습 현황</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.studiedWords}</Text>
              <Text style={styles.statLabel}>학습한 단어</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.studyStreak}</Text>
              <Text style={styles.statLabel}>연속 학습일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testHistory.length}</Text>
              <Text style={styles.statLabel}>테스트 횟수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{getAverageAccuracy()}%</Text>
              <Text style={styles.statLabel}>평균 정확도</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Level Progress */}
      <Card style={styles.levelCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>JLPT 레벨별 진도</Title>
          {Object.entries(levelProgress).map(([level, progress]) => {
            const percentage = progress.total > 0
              ? Math.round((progress.studied / progress.total) * 100)
              : 0;

            return (
              <View key={level} style={styles.levelProgress}>
                <View style={styles.levelHeader}>
                  <View style={styles.levelInfo}>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: getLevelColor(parseInt(level)) },
                      ]}>
                      <Text style={styles.levelBadgeText}>N{level}</Text>
                    </View>
                    <Text style={styles.levelName}>
                      {getLevelName(parseInt(level))}
                    </Text>
                  </View>
                  <Text style={styles.levelPercentage}>{percentage}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor: getLevelColor(parseInt(level)),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress.studied} / {progress.total} 단어
                  </Text>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Test History */}
      <Card style={styles.historyCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>최근 테스트 기록</Title>
          {testHistory.length === 0 ? (
            <Paragraph style={styles.noHistory}>
              아직 테스트 기록이 없습니다.
            </Paragraph>
          ) : (
            testHistory.slice(0, 5).map((test, index) => {
              const accuracy = Math.round(
                (test.correct_answers / test.total_questions) * 100
              );
              const grade = accuracy >= 80 ? 'A' : accuracy >= 60 ? 'B' : 'C';
              const gradeColor = accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#f44336';

              return (
                <Surface key={test.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyLevel}>N{test.jlpt_level}</Text>
                    <Text style={styles.historyDate}>
                      {formatDate(test.test_date)}
                    </Text>
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyScore}>
                      {test.correct_answers}/{test.total_questions}
                    </Text>
                    <Text style={[styles.historyGrade, { color: gradeColor }]}>
                      {grade} ({accuracy}%)
                    </Text>
                  </View>
                  {test.duration && (
                    <Text style={styles.historyDuration}>
                      {Math.floor(test.duration / 60)}분 {test.duration % 60}초
                    </Text>
                  )}
                </Surface>
              );
            })
          )}
        </Card.Content>
      </Card>

      {/* Study Tips */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>📚 학습 팁</Title>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • 매일 조금씩이라도 꾸준히 학습하세요
            </Text>
            <Text style={styles.tipItem}>
              • 틀린 문제는 반복해서 복습하세요
            </Text>
            <Text style={styles.tipItem}>
              • 예문을 통해 단어의 사용법을 익히세요
            </Text>
            <Text style={styles.tipItem}>
              • 정기적으로 테스트를 통해 실력을 확인하세요
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  overallCard: {
    marginBottom: 16,
    elevation: 4,
  },
  levelCard: {
    marginBottom: 16,
    elevation: 4,
  },
  historyCard: {
    marginBottom: 16,
    elevation: 4,
  },
  tipsCard: {
    marginBottom: 24,
    elevation: 4,
  },
  cardTitle: {
    color: '#E91E63',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  levelProgress: {
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  levelBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  noHistory: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  historyItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyScore: {
    fontSize: 14,
    color: '#333',
  },
  historyGrade: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyDuration: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default StatisticsScreen;