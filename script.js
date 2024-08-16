const cardBody = document.getElementById("card-body");
const cardFront = document.getElementById("text-front");
const cardBack = document.getElementById("text-back");
const progressNumber = document.getElementById("progress");
const fileInput = document.getElementById("file-input");
const setTitle = document.getElementById("set-title");

var flashcards = null;
var cardIndex = 0;

// flip card when clicked
document.getElementById("card-body").onclick = (event) => {
  // only flip if non-marker part of card is selected
  if (!event.target.classList.contains("marker-selector")) {
    flipCard();
  }
};

/**
 * Marks the card
 */
function mark() {
  for (i = 0; i < 2; i++) {
    document
      .getElementsByClassName("marker-selector")
      [i].classList.toggle("filled");
  }

  cardBody.classList.remove("card-shake");
  void cardBody.offsetWidth;
  cardBody.classList.add("card-shake");
}

// Load new file on file change
fileInput.onchange = function () {
  reader = new FileReader();
  reader.readAsText(fileInput.files[0]);

  reader.onload = function () {
    readSet(reader.result);
  };
};

class Card {
  constructor(front, back) {
    this.front = front;
    this.back = back;
  }
}

/**
 * Changes the progress bar (the 1/10) at the bottom
 */
function updateProgress() {
  progressNumber.innerHTML = cardIndex + 1 + "/" + flashcards.length;
}

/**
 * When card is clicked on, it will flip and change the text
 */
function flipCard() {
  if (cardBody.style.transform == "") {
    cardBody.style.transform = "rotateX(180deg)";
    if (flashcards != null) {
      cardBack.innerHTML = flashcards[cardIndex].back;
    }
  } else {
    cardBody.style.transform = "";
    if (flashcards != null) {
      cardFront.innerHTML = flashcards[cardIndex].front;
    }
  }

  MathJax.typeset();
}

/**
 * Flips to the next card
 * @param {*} isForward is true if stack is moving in the forward direction
 */
function moveCard(isForward) {
  // if card is already on back
  if (cardBody.style.transform != "") {
    flipCard();
  }

  if (isForward) {
    cardIndex = cardIndex < flashcards.length - 1 ? cardIndex + 1 : cardIndex;
  } else {
    cardIndex = cardIndex > 0 ? cardIndex - 1 : 0;
  }

  updateProgress();

  cardFront.innerHTML = flashcards[cardIndex].front;

  MathJax.typeset();

  for (i = 0; i < 2; i++) {
    document
      .getElementsByClassName("marker-selector")
      [i].classList.remove("filled");
  }
}

/**
 * Reads the flashcard set and puts them in the deck
 * @param {*} text JSON or CSV string for set
 */
function readSet(text) {
  flashcards = [];
  isCSV = fileInput.files[0].name.endsWith(".csv");

  if (isCSV) {
    data = Papa.parse(text).data;
  } else {
    data = JSON.parse(text);
  }

  for (i = isCSV ? 1 : 0; i < data.length; i++) {
    flashcards.push(
      isCSV
        ? new Card(data[i][0], data[i][1])
        : new Card(data[i].front, data[i].back)
    );
  }

  cardFront.innerHTML = flashcards[cardIndex].front;
  cardBack.innerHTML = flashcards[cardIndex].back;

  updateProgress();

  cardBack.classList.remove("first-card");
  cardFront.classList.remove("first-card");

  MathJax.typeset();
}
