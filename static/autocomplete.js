// global variables to store certain values
var players;
var player;
var teams;
var score = 0;
var incorrect = 0;

// function that gets all players when the page loads and then calls a 
// series of functions to choose a random player and gets the teams of the player
function getAllPlayers() {
    fetch('/getAllPlayers', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        players = data;
        choosePlayer();
    })
    .catch(error => {
        console.error("Error fetching data", error);
    })
}

// chooses a random player from the list of all players
function choosePlayer() {
    if (players && players.length > 0) {
        let randIndex = Math.floor(Math.random() * players.length);
        player = players[randIndex]
        console.log(player);
        getTeams();
    } else {
        console.error("No players available");
    }
}

// calls the function to getAllPlayers when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    getAllPlayers();
});

// functions that gets the teams of the random player chosen 
function getTeams() {
    if (player) {
        const playerID = player.playerID;
        fetch('/getTeams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerID: playerID })
        })
        .then(response => response.json())
        .then(data => {
            teams = data;
            showTeams();
        })
        .catch(error => {
            console.error("No teams found", error);
        })
    }
}

// function that loads the images of the teams of the specific player
function showTeams() {
    const images = document.getElementById("team-images");
    while (images.firstChild) {
        images.removeChild(images.firstChild);
    }
    if (teams.length > 13) {
        for (const team of teams) {
            const image = document.createElement("img");
            image.classList.add("url-image-14");
            image.src = team.imageURL;
            images.appendChild(image);
        }
    } else if (teams.length > 10) {
        for (const team of teams) {
            const image = document.createElement("img");
            image.classList.add("url-image-11");
            image.src = team.imageURL;
            images.appendChild(image);
        }
    } else if (teams.length > 6) {
        for (const team of teams) {
            const image = document.createElement("img");
            image.classList.add("url-image-7");
            image.src = team.imageURL;
            images.appendChild(image);
        }
    } else {
        for (const team of teams) {
            const image = document.createElement("img");
            image.classList.add("url-image-6");
            image.src = team.imageURL;
            images.appendChild(image);
        }
    }
}

// variables needed for the autocomplete search bar
const inputBox = document.getElementById("input-box");
const resultBox = document.getElementById("result-box");

// whenever the input value is changed it returns the players that are close to what was guessed
inputBox.onkeyup = function() {
    let result = [];
    let input = inputBox.value;
    if (input.length) {
        result = players.filter((keyword) => {
            return keyword.playerFullName.toLowerCase().includes(input.toLowerCase());
        });
    }
    display(result)
    if (!result.length) {
        resultBox.innerHTML = '';
    }
}

// functions that shows the top 8 closest players to the player the user is typing
function display(result) {
    const top10results = result.slice(0, 8);
    const content = top10results.map((list) => {
        return "<li onclick=selectInput(this)>" + list.playerFullName + "</li>";
    });
    resultBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

// once the user selects a player, it will replace the input value with the guess and then checks the answer
function selectInput(list) {
    inputBox.value = list.innerHTML;
    resultBox.innerHTML = '';
    checkAnswer(inputBox.value);
    inputBox.value = ''
}

// function that checks the users guess since multiple answers are possible for certain teams
// also updates the score and number of incorrect answers (ends game if there are 3 incorrect)
function checkAnswer(playerName) {
    fetch('/checkAnswer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player: playerName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Correct") {
            let score_text = document.getElementById("score-text");
            score += 1;
            score_text.innerText = "Score: " + score;
            correctAnswer();
            choosePlayer();
        } else {
            let wrong_text = document.getElementById("wrong-text");
            incorrect += 1;
            wrong_text.innerText = "Incorrect: " + incorrect;
            incorrectAnswer();
            if (incorrect === 3) {
                endGame();
                return;
            }
            choosePlayer();
        }  
    })
}

// function that flashes the background light red when the answer is incorrect
function incorrectAnswer() {
    const background = document.getElementById("background");
    const originalColor = background.style.backgroundColor;
    background.style.backgroundColor = 'lightcoral';
    setTimeout(() => {
        background.style.backgroundColor = originalColor;
    }, 1000); 
}

// function that flashes the background green when the answer is correct
function correctAnswer() {
    const background = document.getElementById("background");
    const originalColor = background.style.backgroundColor;
    background.style.backgroundColor = 'lightgreen';
    setTimeout(() => {
        background.style.backgroundColor = originalColor;
    }, 1000);
}

// function that ends the game once the user has had 3 incorrect guesses
function endGame() {
    const bottomRow = document.getElementsByClassName("bottom-row")[0];
    while (bottomRow.firstChild) {
        bottomRow.removeChild(bottomRow.firstChild);
    }
    const endText = document.createElement("h1");
    bottomRow.appendChild(endText);
    endText.classList.add("end-text");
    endText.innerText = "Sorry that's 3 incorrect answers. Press the reset button to start over!";

    const score_text = document.createElement("h1");
    score_text.classList.add("score-text");
    bottomRow.appendChild(score_text);
    score_text.innerText = "Final Score: " + score;

    const correctAnswer = document.createElement("h1");
    bottomRow.appendChild(correctAnswer);
    correctAnswer.classList.add("end-text");
    correctAnswer.innerText = "Correct Answer: " + player.playerFullName;

    bottomRow.style.flexDirection = 'column';
    bottomRow.style.alignItems = 'center';
}

function resetGame() {
    location.reload();
}
