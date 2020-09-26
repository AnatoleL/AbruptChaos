const quizzScreenElement = document.getElementById('quizz-screen');
const videoScreenElement = document.getElementById('video-screen');
const homeScreenElement = document.getElementById('home-screen');
const resultScreenElement = document.getElementById('result-screen');
const leftAnswerElement = document.getElementById('left-answer');
const rightAnswerElement = document.getElementById('right-answer');
const stages = {
    HOME: 'HOME',
    FIRST_LOOK: 'FIRST_LOOK',
    QUESTION: 'QUESTION',
    SOLUTION: 'SOLUTION',
    RESULT: 'RESULT',
};

let goodAnswer = true;

let currentIndex = 0;
let player;
let currentStage = stages.HOME;

const games = [
    {
        video: {
            id: 'M7lc1UVf-VE',
            start: 5,
            cut: 7,
            end: 10,
        },
        quizz: {
            goodAnswer: 'Un mec fait coucou',
            badAnswer: 'Un mec fait prout'
        }
    },
];

function prepareAnswers() {
    const currentQuizz = games[currentIndex].quizz;
    if (Math.random() < .5) {
        leftAnswerElement.innerHTML = currentQuizz.goodAnswer;
        rightAnswerElement.innerHTML = currentQuizz.badAnswer;
    } else {
        leftAnswerElement.innerHTML = currentQuizz.badAnswer;
        rightAnswerElement.innerHTML = currentQuizz.goodAnswer;
    }
}

function onAnswer(e) {
    if (e.target.innerHTML === games[currentIndex].quizz.goodAnswer)
        goodAnswer = true;
    else    
        goodAnswer = false;
    pickAndPlayNextVideo();
    currentStage = stages.SOLUTION;
}

// YOUTUBE API


function pickAndPlayNextVideo() {
    if (currentStage === stages.QUESTION) {
        const solutionVideo = games[currentIndex].video;

        player.loadVideoById({
            videoId: solutionVideo.id,
            startSeconds: solutionVideo.start,
            endSeconds: solutionVideo.end,
        })
    }
    else {
        const nextVideo = games[currentIndex + 1].video;

        player.loadVideoById({
            videoId: nextVideo.id,
            startSeconds: nextVideo.start,
            endSeconds: nextVideo.cut,
        })
    }
}


function setResult() {
    document.getElementById('result-h1').innerHTML = goodAnswer 
        ? 'You got it right !'
        : 'You got it wrong';
}

function onYouTubeIframeAPIReady() {
    let firstVideo = games[currentIndex].video;
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        playerVars: {
            start: firstVideo.start,
            end: firstVideo.cut,
            controls: 0,
        },
        videoId: firstVideo.id,
        events: { 'onStateChange': onPlayerStateChange }
    });
}


function start() {
    const firstVideo = games[0].video;
    player.loadVideoById({
        videoId: firstVideo.id,
        startSeconds: firstVideo.start,
        endSeconds: firstVideo.cut,
    });
    currentStage = stages.FIRST_LOOK;
    prepareAnswers();
}

function startNextGame() {
    const firstVideo = games[(++currentIndex) % games.length].video;
    player.loadVideoById({
        videoId: firstVideo.id,
        startSeconds: firstVideo.start,
        endSeconds: firstVideo.cut,
    });
    currentStage = stages.FIRST_LOOK;
    prepareAnswers();
}

function switchScreen(oldElement, newElement) {
    oldElement.style.display = 'none';
    newElement.style.display = 'flex';
}

function onPlayerStateChange(e) {
    if (e.data === YT.PlayerState.ENDED) {
        player.stopVideo();
        switch(currentStage) {
            case (stages.FIRST_LOOK):
                switchScreen(videoScreenElement, quizzScreenElement);
                currentStage = stages.QUESTION;
                break;

            case (stages.SOLUTION):
                setResult();
                switchScreen(videoScreenElement, resultScreenElement);
                currentStage = stages.RESULT;
                break;
        }
    }
    else if (e.data === YT.PlayerState.PLAYING) {
        switch(currentStage) {
            case (stages.FIRST_LOOK):
                switchScreen(homeScreenElement, videoScreenElement);
                break;
            case(stages.SOLUTION):
                switchScreen(quizzScreenElement, videoScreenElement);
        }
    }
}