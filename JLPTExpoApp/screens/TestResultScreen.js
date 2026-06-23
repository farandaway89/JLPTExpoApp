import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

const TestResultScreen = ({ navigation, route }) => {
  const {
    jlptLevel,
    totalQuestions,
    correctAnswers,
    userAnswers,
    duration,
  } = route.params;

  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getGrade = (accuracy) => {
    if (accuracy >= 90) return { grade: 'A', color: '#4CAF50' };
    if (accuracy >= 80) return { grade: 'B', color: '#2196F3' };
    if (accuracy >= 70) return { grade: 'C', color: '#FF9800' };
    if (accuracy >= 60) return { grade: 'D', color: '#FFC107' };
    return { grade: 'F', color: '#f44336' };
  };

  const gradeInfo = getGrade(accuracy);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const goHome = () => {
    navigation.navigate('Home');
  };

  const retakeTest = () => {
    navigation.replace('Test', { jlptLevel });
  };

  const viewStatistics = () => {
    navigation.navigate('Statistics');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Result Header */}
      <Card style={styles.resultCard}>
        <Card.Content style={styles.resultContent}>
          <Text style={styles.resultTitle}>테스트 완료</Text>
          <Text style={[styles.grade, { color: gradeInfo.color }]}>
            {gradeInfo.grade}
          </Text>
          <Text style={styles.accuracy}>{accuracy}%</Text>
        </Card.Content>
      </Card>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{correctAnswers}</Text>
          <Text style={styles.statLabel}>정답</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#f44336' }]}>
            {incorrectAnswers}
          </Text>
          <Text style={styles.statLabel}>오답</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatTime(duration)}</Text>
          <Text style={styles.statLabel}>소요시간</Text>
        </View>
      </View>

      {/* Performance Message */}
      <Card style={styles.messageCard}>
        <Card.Content>
          <Title style={styles.messageTitle}>
            {accuracy >= 80
              ? '훌륭합니다'
              : accuracy >= 60
              ? '잘했습니다'
              : '더 연습이 필요합니다'}
          </Title>
          <Paragraph style={styles.messageText}>
            {accuracy >= 80
              ? 'JLPT 시험에서 좋은 성과를 낼 수 있을 것 같아요!'
              : accuracy >= 60
              ? '조금만 더 연습하면 실력이 크게 향상될 거예요!'
              : '꾸준한 학습을 통해 실력을 키워나가세요!'}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Detailed Results */}
      <Card style={styles.detailCard}>
        <Card.Content>
          <Title style={styles.detailTitle}>상세 결과</Title>
          {userAnswers.map((answer, index) => (
            <View
              key={index}
              style={[
                styles.answerItem,
                answer.isCorrect ? styles.correctAnswer : styles.incorrectAnswer,
              ]}>
              <View style={styles.answerHeader}>
                <Text style={styles.questionNum}>Q{index + 1}</Text>
                <Text
                  style={[
                    styles.answerIcon,
                    { color: answer.isCorrect ? '#4CAF50' : '#f44336' },
                  ]}>
                  {answer.isCorrect ? '✓' : '✗'}
                </Text>
              </View>
              <Text style={styles.wordText}>
                {answer.word.kanji || answer.word.reading}
                {answer.word.kanji && ` (${answer.word.reading})`}
              </Text>
              <Text style={styles.correctAnswerText}>
                정답: {answer.correctAnswer}
              </Text>
              {!answer.isCorrect && (
                <Text style={styles.userAnswerText}>
                  선택: {answer.selectedAnswer}
                </Text>
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={retakeTest}
          style={[styles.actionButton, styles.retakeButton]}
          contentStyle={styles.buttonContent}>
          다시 테스트
        </Button>
        <Button
          mode="outlined"
          onPress={viewStatistics}
          style={[styles.actionButton, styles.statsButton]}
          contentStyle={styles.buttonContent}>
          통계 보기
        </Button>
        <Button
          mode="text"
          onPress={goHome}
          style={[styles.actionButton, styles.homeButton]}
          contentStyle={styles.buttonContent}>
          홈으로
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  resultCard: {
    marginBottom: 20,
    elevation: 8,
  },
  resultContent: {
    alignItems: 'center',
    padding: 30,
  },
  resultEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  grade: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  accuracy: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  messageCard: {
    marginBottom: 20,
    elevation: 4,
  },
  messageTitle: {
    color: '#E91E63',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  detailCard: {
    marginBottom: 20,
    elevation: 4,
  },
  detailTitle: {
    color: '#E91E63',
    marginBottom: 16,
  },
  answerItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  correctAnswer: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50',
  },
  incorrectAnswer: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#f44336',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  questionNum: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  answerIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  wordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 2,
  },
  userAnswerText: {
    fontSize: 14,
    color: '#f44336',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  retakeButton: {
    backgroundColor: '#E91E63',
  },
  statsButton: {
    borderColor: '#E91E63',
  },
  homeButton: {},
  buttonContent: {
    paddingVertical: 8,
  },
});

export default TestResultScreen;