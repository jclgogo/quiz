/**
 * app.js - 主逻辑控制
 */

import { storage } from './storage.js';
import { ui } from './ui.js';

class QuizApp {
    constructor() {
        this.allQuestions = [];
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.mode = 'sequential'; // 'sequential' or 'random'
        this.selectedTypes = ['judge', 'single', 'multi'];
        
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
        this.startQuiz();
    }

    /**
     * 加载题库数据
     */
    async loadQuestions() {
        const files = [
            'data/judge_process.txt',
            'data/single_process.txt',
            'data/multi_process.txt'
        ];

        try {
            const results = await Promise.all(files.map(f => fetch(f).then(r => r.text())));
            
            this.allQuestions = results.flatMap(text => 
                text.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        try {
                            return JSON.parse(line);
                        } catch (e) {
                            console.warn("JSON parse error:", line);
                            return null;
                        }
                    })
                    .filter(q => q !== null)
            );
            
            console.log(`已加载 ${this.allQuestions.length} 道题目`);
        } catch (error) {
            console.error('加载题库失败:', error);
            alert('加载题库失败，请检查网络或文件路径。');
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        const { submit, nextBtn, saveNote } = ui.getContainer();
        
        submit.onclick = () => this.handleAnswerSubmit();
        nextBtn.onclick = () => this.nextQuestion();
        saveNote.onclick = () => this.handleSaveNote();

        // 模式切换
        document.getElementById('mode-select').onchange = (e) => {
            this.mode = e.target.value;
            this.startQuiz();
        };

        // 题型筛选
        document.querySelectorAll('input[name="type-filter"]').forEach(checkbox => {
            checkbox.onchange = () => {
                this.selectedTypes = Array.from(document.querySelectorAll('input[name="type-filter"]:checked'))
                    .map(cb => cb.value);
                this.startQuiz();
            };
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    /**
     * 开始刷题
     */
    startQuiz() {
        let baseQuestions = this.allQuestions.filter(q => this.selectedTypes.includes(q.type));

        if (this.mode === 'wrong') {
            this.currentQuestions = baseQuestions.filter(q => {
                const stat = storage.getQuestionStat(`${q.type}_${q.id}`);
                return stat.wrong > 0;
            });
        } else {
            this.currentQuestions = [...baseQuestions];
        }
        
        if (this.mode === 'random') {
            this.shuffle(this.currentQuestions);
        } else {
            // 按序，可以根据 id 排序
            this.currentQuestions.sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.id.localeCompare(b.id, undefined, { numeric: true });
            });
        }

        this.currentIndex = 0;
        if (this.currentQuestions.length > 0) {
            this.showCurrentQuestion();
        } else {
            alert('没有符合筛选条件的题目！');
        }
    }

    /**
     * 显示当前题目
     */
    showCurrentQuestion() {
        const question = this.currentQuestions[this.currentIndex];
        ui.renderQuestion(question, this.currentIndex, this.currentQuestions.length);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /**
     * 处理提交答案
     */
    handleAnswerSubmit() {
        const question = this.currentQuestions[this.currentIndex];
        const userAnswer = ui.getUserAnswer(question.type);
        
        if (!userAnswer) {
            alert('请先选择答案！');
            return;
        }

        let correctAnswer = question.answer;
        if (question.type === 'multi') {
            correctAnswer = correctAnswer.split('').sort().join('');
        }
        const isCorrect = userAnswer === correctAnswer;
        const qid = `${question.type}_${question.id}`;

        if (isCorrect) {
            storage.updateCorrect(qid);
        } else {
            storage.updateWrong(qid);
        }

        const stat = storage.getQuestionStat(qid);
        ui.renderResult(isCorrect, question, stat);
    }

    /**
     * 下一题
     */
    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < this.currentQuestions.length) {
            this.showCurrentQuestion();
        } else {
            alert('恭喜，已做完当前题库！将从头开始。');
            this.currentIndex = 0;
            this.showCurrentQuestion();
        }
    }

    /**
     * 保存笔记
     */
    handleSaveNote() {
        const question = this.currentQuestions[this.currentIndex];
        const qid = `${question.type}_${question.id}`;
        const note = document.getElementById('note-text').value;
        storage.saveNote(qid, note);
        alert('笔记已保存！');
    }

    /**
     * Fisher-Yates shuffle 算法
     * @param {Array} arr 
     */
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    /**
     * 处理键盘快捷键
     * @param {KeyboardEvent} e 
     */
    handleKeyPress(e) {
        // 在输入笔记时禁用快捷键
        if (e.target.tagName === 'TEXTAREA') return;

        const { submit, nextBtn } = ui.getContainer();

        // 数字键选择选项 (1-8)
        if (e.key >= '1' && e.key <= '8') {
            const index = parseInt(e.key) - 1;
            const options = document.querySelectorAll('input[name="option"]');
            if (options[index]) {
                options[index].click();
            }
        }

        // Enter 键提交或下一题
        if (e.key === 'Enter') {
            if (submit.style.display === 'block') {
                this.handleAnswerSubmit();
            } else if (nextBtn.style.display === 'block') {
                this.nextQuestion();
            }
        }

        // N 键下一题
        if (e.key.toLowerCase() === 'n') {
            if (nextBtn.style.display === 'block') {
                this.nextQuestion();
            }
        }
    }
}

// 启动应用
new QuizApp();
