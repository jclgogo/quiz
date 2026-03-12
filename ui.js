/**
 * ui.js - 渲染题目 UI
 */

export const ui = {
    /**
     * 获取题目容器
     */
    getContainer() {
        return {
            question: document.getElementById('question'),
            options: document.getElementById('options'),
            submit: document.getElementById('submit'),
            result: document.getElementById('result'),
            explanation: document.getElementById('explanation'),
            stats: document.getElementById('stats'),
            noteArea: document.getElementById('note-area'),
            noteText: document.getElementById('note-text'),
            saveNote: document.getElementById('save-note'),
            nextBtn: document.getElementById('next-btn')
        };
    },

    /**
     * 渲染题目
     * @param {Object} question 
     * @param {number} index 
     * @param {number} total 
     */
    renderQuestion(question, index, total) {
        const { question: qDiv, options: oDiv, submit, result, explanation, stats, noteArea, nextBtn } = this.getContainer();
        
        // 重置 UI
        qDiv.innerHTML = `<h3>[${this.getTypeLabel(question.type)}] ${index + 1}/${total}</h3><p>${question.question}</p>`;
        oDiv.innerHTML = '';
        result.innerHTML = '';
        explanation.innerHTML = '';
        stats.innerHTML = '';
        noteArea.style.display = 'none';
        submit.style.display = 'block';
        nextBtn.style.display = 'none';

        // 渲染选项
        question.options.forEach((opt, i) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            const char = String.fromCharCode(65 + i); // A, B, C...
            
            input.type = question.type === 'multi' ? 'checkbox' : 'radio';
            input.name = 'option';
            input.value = char;
            
            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${opt}`));
            oDiv.appendChild(label);
        });
    },

    /**
     * 获取题目类型标签
     */
    getTypeLabel(type) {
        const labels = {
            'judge': '判断题',
            'single': '单选题',
            'multi': '多选题'
        };
        return labels[type] || '未知类型';
    },

    /**
     * 获取用户选择的答案
     * @param {string} type 
     */
    getUserAnswer(type) {
        const inputs = document.querySelectorAll('input[name="option"]:checked');
        if (type === 'multi') {
            return Array.from(inputs).map(i => i.value).sort().join('');
        }
        return inputs.length > 0 ? inputs[0].value : '';
    },

    /**
     * 渲染结果和解析
     * @param {boolean} isCorrect 
     * @param {Object} question 
     * @param {Object} stat {correct, wrong, note}
     */
    renderResult(isCorrect, question, stat) {
        const { submit, result, explanation, stats, noteArea, noteText, nextBtn } = this.getContainer();
        
        submit.style.display = 'none';
        nextBtn.style.display = 'block';

        result.innerHTML = isCorrect 
            ? '<span style="color: green; font-weight: bold;">回答正确！</span>' 
            : `<span style="color: red; font-weight: bold;">回答错误。正确答案是：${question.answer}</span>`;
        
        explanation.innerHTML = `<h4>解析：</h4><p>${question.explanation || '暂无解析'}</p>`;
        
        stats.innerHTML = `<h4>统计：</h4><p>正确次数：${stat.correct}，错误次数：${stat.wrong}</p>`;
        
        noteArea.style.display = 'block';
        noteText.value = stat.note || '';
    }
};
