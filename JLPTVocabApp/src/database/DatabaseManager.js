import SQLite from 'react-native-sqlite-storage';

class DatabaseManager {
  constructor() {
    this.db = null;
    this.initDatabase();
  }

  async initDatabase() {
    try {
      this.db = await SQLite.openDatabase({
        name: 'jlpt_vocab.db',
        location: 'default',
      });
      await this.createTables();
      await this.initializeVocabularyData();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  async createTables() {
    const createWordsTable = `
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kanji TEXT,
        reading TEXT NOT NULL,
        meaning TEXT NOT NULL,
        english TEXT,
        jlpt_level INTEGER NOT NULL,
        part_of_speech TEXT,
        example TEXT,
        example_meaning TEXT
      );
    `;

    const createLearningProgressTable = `
      CREATE TABLE IF NOT EXISTS learning_progress (
        word_id INTEGER PRIMARY KEY,
        learned_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        last_studied DATETIME,
        next_review DATETIME,
        difficulty INTEGER DEFAULT 1,
        FOREIGN KEY (word_id) REFERENCES words (id)
      );
    `;

    const createTestRecordsTable = `
      CREATE TABLE IF NOT EXISTS test_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jlpt_level INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        test_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER
      );
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `;

    await this.db.executeSql(createWordsTable);
    await this.db.executeSql(createLearningProgressTable);
    await this.db.executeSql(createTestRecordsTable);
    await this.db.executeSql(createSettingsTable);
  }

  async initializeVocabularyData() {
    try {
      // Check if data already exists
      const [results] = await this.db.executeSql('SELECT COUNT(*) as count FROM words');
      if (results.rows.item(0).count > 0) {
        return; // Data already exists
      }

      // Load vocabulary data from JSON file
      const vocabularyData = require('../../assets/jlpt_vocabulary.json');

      for (const word of vocabularyData) {
        await this.db.executeSql(
          `INSERT INTO words (kanji, reading, meaning, english, jlpt_level, part_of_speech, example, example_meaning)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            word.kanji,
            word.reading,
            word.meaning,
            word.english,
            word.jlpt_level,
            word.part_of_speech,
            word.example,
            word.example_meaning
          ]
        );
      }
      console.log('Vocabulary data initialized successfully');
    } catch (error) {
      console.error('Error initializing vocabulary data:', error);
    }
  }

  async getWordsByLevel(jlptLevel) {
    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM words WHERE jlpt_level = ? ORDER BY RANDOM()',
        [jlptLevel]
      );

      const words = [];
      for (let i = 0; i < results.rows.length; i++) {
        words.push(results.rows.item(i));
      }
      return words;
    } catch (error) {
      console.error('Error getting words by level:', error);
      return [];
    }
  }

  async getWordsForReview() {
    try {
      const [results] = await this.db.executeSql(`
        SELECT w.*, lp.next_review, lp.difficulty
        FROM words w
        LEFT JOIN learning_progress lp ON w.id = lp.word_id
        WHERE lp.next_review IS NULL OR lp.next_review <= datetime('now')
        ORDER BY lp.difficulty DESC, RANDOM()
        LIMIT 20
      `);

      const words = [];
      for (let i = 0; i < results.rows.length; i++) {
        words.push(results.rows.item(i));
      }
      return words;
    } catch (error) {
      console.error('Error getting words for review:', error);
      return [];
    }
  }

  async updateLearningProgress(wordId, isCorrect) {
    try {
      const now = new Date().toISOString();

      // Get current progress
      const [results] = await this.db.executeSql(
        'SELECT * FROM learning_progress WHERE word_id = ?',
        [wordId]
      );

      let difficulty = 1;
      let learnedCount = 1;
      let correctCount = isCorrect ? 1 : 0;

      if (results.rows.length > 0) {
        const current = results.rows.item(0);
        difficulty = isCorrect ? Math.max(1, current.difficulty - 1) : Math.min(5, current.difficulty + 1);
        learnedCount = current.learned_count + 1;
        correctCount = current.correct_count + (isCorrect ? 1 : 0);
      }

      // Calculate next review time using spaced repetition
      const nextReview = this.calculateNextReview(difficulty);

      await this.db.executeSql(`
        INSERT OR REPLACE INTO learning_progress
        (word_id, learned_count, correct_count, last_studied, next_review, difficulty)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [wordId, learnedCount, correctCount, now, nextReview, difficulty]);

    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  }

  calculateNextReview(difficulty) {
    const intervals = [
      1,    // 1 day
      3,    // 3 days
      7,    // 1 week
      14,   // 2 weeks
      30    // 1 month
    ];

    const intervalIndex = Math.min(difficulty - 1, intervals.length - 1);
    const days = intervals[intervalIndex];

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview.toISOString();
  }

  async saveTestRecord(jlptLevel, totalQuestions, correctAnswers, duration) {
    try {
      await this.db.executeSql(
        'INSERT INTO test_records (jlpt_level, total_questions, correct_answers, duration) VALUES (?, ?, ?, ?)',
        [jlptLevel, totalQuestions, correctAnswers, duration]
      );
    } catch (error) {
      console.error('Error saving test record:', error);
    }
  }

  async getTestHistory() {
    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM test_records ORDER BY test_date DESC LIMIT 10'
      );

      const history = [];
      for (let i = 0; i < results.rows.length; i++) {
        history.push(results.rows.item(i));
      }
      return history;
    } catch (error) {
      console.error('Error getting test history:', error);
      return [];
    }
  }

  async getStudyStatistics() {
    try {
      const [totalWords] = await this.db.executeSql('SELECT COUNT(*) as count FROM words');
      const [studiedWords] = await this.db.executeSql('SELECT COUNT(*) as count FROM learning_progress');
      const [streakResults] = await this.db.executeSql(`
        SELECT COUNT(DISTINCT DATE(last_studied)) as streak
        FROM learning_progress
        WHERE last_studied >= date('now', '-30 days')
      `);

      return {
        totalWords: totalWords.rows.item(0).count,
        studiedWords: studiedWords.rows.item(0).count,
        studyStreak: streakResults.rows.item(0).streak
      };
    } catch (error) {
      console.error('Error getting study statistics:', error);
      return { totalWords: 0, studiedWords: 0, studyStreak: 0 };
    }
  }
}

export default new DatabaseManager();