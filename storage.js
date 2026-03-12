/**
 * storage.js - localStorage 数据层
 */

const STORAGE_KEY = 'quiz_user_data';

class StorageManager {
    constructor() {
        this.userData = this.loadUserData();
    }

    loadUserData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    saveUserData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.userData));
    }

    getQuestionStat(qid) {
        return this.userData[qid] || { correct: 0, wrong: 0, note: '' };
    }

    updateCorrect(qid) {
        if (!this.userData[qid]) this.userData[qid] = { correct: 0, wrong: 0, note: '' };
        this.userData[qid].correct++;
        this.saveUserData();
    }

    updateWrong(qid) {
        if (!this.userData[qid]) this.userData[qid] = { correct: 0, wrong: 0, note: '' };
        this.userData[qid].wrong++;
        this.saveUserData();
    }

    saveNote(qid, note) {
        if (!this.userData[qid]) this.userData[qid] = { correct: 0, wrong: 0, note: '' };
        this.userData[qid].note = note;
        this.saveUserData();
    }

    getNote(qid) {
        const stat = this.getQuestionStat(qid);
        return stat.note || '';
    }
}

export const storage = new StorageManager();
