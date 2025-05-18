const questions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is the largest mammal in the world?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correct: 1
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Fe", "Au", "Cu"],
        correct: 2
    }
];

let currentQuestion = 0;
let score = 0;
let quizCompleted = false;
let timeLeft;
let timerInterval;
const questionTime = 30;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('save-btn').addEventListener('click', saveScore);
document.getElementById('restart-btn').addEventListener('click', restartQuiz);

function initializeQuiz() {
    document.getElementById('total-questions').textContent = questions.length;
    showQuestion(currentQuestion);
    updateProgress();
    updateLeaderboard();
}

function showQuestion(index) {
    startTimer();
    const question = questions[index];
    document.getElementById('question').textContent = question.question;
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, i) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(i);
        if (question.selected === i) {
            button.classList.add(question.correct === i ? 'correct' : 'wrong');
        }
        optionsContainer.appendChild(button);
    });

    document.getElementById('current-question').textContent = index + 1;
    document.getElementById('next-btn').style.display = 'none';
}

function selectAnswer(selectedIndex) {
    if (quizCompleted) return;
    clearInterval(timerInterval);
    
    const question = questions[currentQuestion];
    const options = document.querySelectorAll('.option-btn');
    
    options.forEach((option, index) => {
        option.disabled = true;
        if (index === question.correct) {
            option.classList.add('correct');
            if (index === selectedIndex) playSound('correct');
        } else if (index === selectedIndex && index !== question.correct) {
            option.classList.add('wrong');
            playSound('wrong');
        }
    });

    if (selectedIndex === question.correct) {
        score++;
        document.getElementById('score').textContent = score;
    }

    document.getElementById('next-btn').style.display = 'block';
    question.selected = selectedIndex;
}

function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        showQuestion(currentQuestion);
        updateProgress();
    } else {
        showFinalResults();
    }
}

function updateProgress() {
    const progress = (currentQuestion / questions.length) * 100;
    document.querySelector('.progress').style.width = `${progress}%`;
}

function showFinalResults() {
    quizCompleted = true;
    document.querySelector('.quiz-header').style.display = 'none';
    document.getElementById('options-container').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('final-score').textContent = `${score}/${questions.length}`;
    
    const emoji = document.getElementById('emoji');
    const percentage = (score / questions.length) * 100;
    
    if (percentage >= 80) {
        emoji.textContent = '🎉🥳👏';
        showConfetti();
    } else if (percentage >= 50) {
        emoji.textContent = '😊👍';
    } else {
        emoji.textContent = '😕👏';
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = questionTime;
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('timer-circle').style.stroke = 'var(--primary-color)';
    document.getElementById('time').style.color = 'var(--primary-color)';
    
    const timerCircle = document.getElementById('timer-circle');
    const circumference = 2 * Math.PI * 20;
    timerCircle.style.strokeDasharray = circumference;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        const offset = circumference - (timeLeft/questionTime) * circumference;
        timerCircle.style.strokeDashoffset = offset;

        if(timeLeft <= 5) {
            timerCircle.style.stroke = '#ff7675';
            document.getElementById('time').style.color = '#ff7675';
            playSound('timeout');
        }

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    const options = document.querySelectorAll('.option-btn');
    options.forEach(opt => opt.disabled = true);
    document.getElementById('next-btn').style.display = 'block';
}

function updateLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    leaderboard.sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        list.appendChild(li);
    });
}

function saveScore() {
    const name = document.getElementById('name-input').value.trim();
    if(!name) return;
    
    leaderboard.push({
        name: name,
        score: score
    });
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
    showConfetti();
    restartQuiz();
}

function playSound(type) {
    const audio = document.getElementById(`${type}-sound`);
    if(audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

function showConfetti() {
    for(let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    quizCompleted = false;
    document.getElementById('score').textContent = '0';
    document.querySelector('.quiz-header').style.display = 'block';
    document.getElementById('options-container').style.display = 'grid';
    document.getElementById('result-container').style.display = 'none';
    questions.forEach(q => delete q.selected);
    initializeQuiz();
}

document.addEventListener('DOMContentLoaded', initializeQuiz);