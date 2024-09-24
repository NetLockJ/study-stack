const cardBody = document.getElementById("card-body");
const cardFront = document.getElementById("text-front");
const cardBack = document.getElementById("text-back");
const progressNumber = document.getElementById("progress");
const fileInput = document.getElementById("file-input");
const setTitle = document.getElementById("set-title");

isEdit = false;

var flashcards = null;
var cardIndex = 0;

if (window.localStorage.getItem("flashcard-sets") == null) {
  window.localStorage.setItem("flashcard-sets", "");
}

document.getElementById("card-body").onpointerup = (event) => {
  if (
    isEdit &&
    (!!event.target.classList[0].match("mjx|MJX|MathJax|mjx-i") ||
      event.target.classList.contains("text"))
  ) {
  } else {
    if (!event.target.classList.contains("marker-selector")) {
      flipCard();
    }
  }
};

cardFront.addEventListener("pointerup", (event) => {
  if (isEdit && cardFront.children.length > 0 && flashcards != null) {
    if (cardFront.contains(event.target)) {
      cardFront.innerHTML = flashcards[cardIndex].front;
    }
  }
});

cardBack.addEventListener("pointerup", (event) => {
  if (isEdit && cardBack.children.length > 0 && flashcards != null) {
    if (cardBack.contains(event.target)) {
      cardBack.innerHTML = flashcards[cardIndex].back;
    }
  }
});

cardFront.addEventListener("input", (event) => {
  if (flashcards != null) {
    flashcards[cardIndex].front = cardFront.innerHTML.replace("<br>", "");
  }
});

cardBack.addEventListener("input", (event) => {
  if (flashcards != null) {
    flashcards[cardIndex].back = cardBack.innerHTML.replace("<br>", "");
  }
});

/**
 * Marks the card
 */
function mark() {
  for (i = 0; i < 2; i++) {
    document
      .getElementsByClassName("marker-selector")
      [i].classList.toggle("filled");
  }

  if (flashcards != null) {
    flashcards[cardIndex].toggleMark();
  }

  cardBody.classList.remove("card-shake");
  cardBody.classList.remove("change");
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
    this.marked = false;
  }

  toggleMark() {
    this.marked = !this.marked;
  }

  isMarked() {
    return this.marked;
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

  document.body.style.setProperty("--angle", Math.random() * 50 - 25 + "deg");

  if (flashcards != null) {
    if (isForward) {
      if (cardIndex < flashcards.length - 1) {
        cardIndex++;
        cardBody.classList.remove("change");
        void cardBody.offsetWidth;
        cardBody.classList.add("change");
      }
    } else {
      if (cardIndex > 0) {
        cardIndex--;
        cardBody.classList.remove("change");
        void cardBody.offsetWidth;
        cardBody.classList.add("change");
      }
    }

    updateProgress();

    cardFront.innerHTML = flashcards[cardIndex].front;
    cardBack.innerHTML = flashcards[cardIndex].back;

    MathJax.typeset();

    for (i = 0; i < 2; i++) {
      document
        .getElementsByClassName("marker-selector")
        [i].classList.remove("filled");
    }
  }
}

/**
 * Reads the flashcard set and puts them in the deck
 * @param {*} text JSON or CSV string for set
 */
function readSet(text) {
  flashcards = [];
  isCSV = fileInput.files[0].name.endsWith(".csv");
  cardIndex = 0;

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

  for (i = 0; i < 2; i++) {
    document
      .getElementsByClassName("marker-selector")
      [i].classList.remove("filled");

    if (flashcards[cardIndex].isMarked()) {
      document
        .getElementsByClassName("marker-selector")
        [i].classList.add("filled");
    }
  }
}

function addCard() {
  if (flashcards != null) {
    flashcards.splice(
      cardIndex + 1,
      0,
      new Card("(Front)", "(Back)")
    );
    moveCard(true);
  } else {
    alert("You probably should upload a set before adding cards!");
  }
}

function toggleEdit() {
  edit = document.getElementById("edit");
  edit.src =
    "svg/" + (edit.src.match("edit-on") ? "edit-off" : "edit-on") + ".svg";

  isEdit = !isEdit;

  if (cardFront.isContentEditable) {
    cardFront.contentEditable = false;
    cardBack.contentEditable = false;
  } else {
    cardFront.contentEditable = true;
    cardBack.contentEditable = true;
  }
}

function getAvailableSets() {
  sets = window.localStorage.getItem("flashcard-sets");
}

function saveSet() {
  var mjxCheck;

  if (cardBody.style.transform === "") {
    mjxCheck = cardFront;
  } else {
    mjxCheck = cardBack;
  }

  if (flashcards != null && mjxCheck.children.length == 0) {
    flashcards[cardIndex].front = cardFront.innerHTML;
    flashcards[cardIndex].back = cardBack.innerHTML;

    MathJax.typeset();
  } else {
    alert("Only save Math text when it has not been rendered!");
  }
}
