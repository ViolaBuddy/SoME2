"use strict";
function createEnum(values) {
  const enumObject = {};
  for (const val of values) {
    enumObject[val] = val;
  }
  return Object.freeze(enumObject);
}

const Suit = createEnum(['Diamonds', 'Clubs', 'Hearts', 'Spades']);
const Rank = createEnum(['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King']);

/** returns an integer representation of the rank */
function getNumericalRank(rank){
	switch(rank){
		case Rank.Ace:
			return 1;
		case Rank.Two:
			return 2;
		case Rank.Three:
			return 3;
		case Rank.Four:
			return 4;
		case Rank.Five:
			return 5;
		case Rank.Six:
			return 6;
		case Rank.Seven:
			return 7;
		case Rank.Eight:
			return 8;
		case Rank.Nine:
			return 9;
		case Rank.Ten:
			return 10;
		case Rank.Jack:
			return 11;
		case Rank.Queen:
			return 12;
		case Rank.King:
			return 13;
		default:
			return null;
	}
}

/** a representation of a card, along with a visualization of it */
class Card {
	static IMAGE_DIRECTORY = 'img';
	static FACEDOWN_IMAGE_PATH = Card.IMAGE_DIRECTORY + '/' + 'card_back_v2.svg';

	/** Note that clickFnc will have `this` be bound to the Card object */
	constructor(suit, rank, clickFnc=null){
		this.suit = suit;
		this.rank = rank;
		this.faceUp = true;

		this.faceUpImg = document.createElement("img");
		this.faceUpImg.src = this.getImagePath();
		this.faceUpImg.alt = this.rank + ' of ' + this.suit;

		this.faceDownImg = document.createElement("img");
		this.faceDownImg.src = Card.FACEDOWN_IMAGE_PATH;
		this.faceDownImg.alt = 'facedown card';

		this.domElement = document.createElement("div");
		this.domElement.appendChild(this.faceUpImg);
		this.domElement.classList.add("playing-card");
		let thisThis = this;

		if(clickFnc != null){
			this.domElement.onclick = clickFnc.bind(this);
		}
	}

	/** Note that clickFnc will have `this` be bound to the Card object */
	changeClickFnc(clickFnc=null){
		if(clickFnc != null){
			this.domElement.onclick = clickFnc.bind(this);
		} else{
			this.domElement.onclick = null;
		}
	}

	moveImageTo(destX, destY){
		this.domElement.style['left'] = destX + '%';
		this.domElement.style['top'] = destY + '%';
	}

	/** add this Card's visual element to the div provided in the argument */
	addImageTo(div) {
		div.appendChild(this.domElement);
	}

	/** flip this card faceUp/faceDown */
	flip(newFaceUp=null) {
		if(newFaceUp===this.faceUp) {
			return;
			// nothing to be done if we're already in the desired state
		}
		if(this.faceUp){
			this.domElement.removeChild(this.faceUpImg);
			this.domElement.appendChild(this.faceDownImg);
			this.faceUp = false;
		} else {
			this.domElement.removeChild(this.faceDownImg);
			this.domElement.appendChild(this.faceUpImg);
			this.faceUp = true;
		}
	}

	/** returns a string representation of the card*/
	getName(){
		return this.rank + " of " + this.suit;
	}

	/** returns a string representing the path to the svg image */
	getImagePath() {
		let suitName = this.suit.toLowerCase();
		let trailingTwo = "";
		let rankName;
		switch(this.rank){
			case Rank.Two:
			case Rank.Three:
			case Rank.Four:
			case Rank.Five:
			case Rank.Six:
			case Rank.Seven:
			case Rank.Eight:
			case Rank.Nine:
			case Rank.Ten:
				rankName = getNumericalRank(this.rank).toString();
				break;
			case Rank.Jack:
			case Rank.Queen:
			case Rank.King:
				trailingTwo = "2";
				rankName = this.rank.toLowerCase();
				break;
			case Rank.Ace:
			default:
				rankName = this.rank.toLowerCase();
				break;
		}
		return Card.IMAGE_DIRECTORY + "/" + rankName + "_of_" + suitName + trailingTwo + ".svg";
	}
}

/** a list of Cards. Has no visual element*/
class Deck {
	constructor(listOfCards=null){
		if (listOfCards == null) {
			this.cards = [];
		} else{
			this.cards = listOfCards;
		}
	}

	shuffle() {
		// https://bost.ocks.org/mike/shuffle/
		let m = this.cards.length;
		let i, temp;
		while(m > 0) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * m);
			m--;
			// And swap it with the current element.
			temp = this.cards[m];
			this.cards[m] = this.cards[i];
			this.cards[i] = temp;
		}
	}

	// sort(sortBy=function(d){return d;}){
	//
	// }
}

/** stateful generator */
const handNameGenerator = (function* (){
	let myNum = 0;
	while(true){
		yield "hand"+myNum;
		myNum++;
	}
})();

/** a Deck (a list of Cards), with a visual element*/
class Hand extends Deck{
	constructor(listOfCards=null){
		super(listOfCards);

		this.domElement = document.createElement("div");
		this.domElement.id = handNameGenerator.next().value;

		// https://stackoverflow.com/questions/28930846/how-to-use-cssstylesheet-insertrule-properly
		this.styleElement = document.createElement("style");
		this.styleElement.type = 'text/css';
		this.styleElement.appendChild(document.createTextNode(""));
		document.head.appendChild(this.styleElement);

		for (const card in listOfCards) {
			card.addImageTo(this.domElement);
		}
	}

	addCard(newCard){
		this.cards.push(newCard);
		newCard.addImageTo(this.domElement);
	}

	/** add this Hand's visual element to the div provided in the argument */
	addImageTo(div) {
		div.appendChild(this.domElement);
	}

	arrangeHand(spacing='30px') {
		this.styleElement.sheet.insertRule('#' + this.domElement.id + ' .playing-card {width: '+ spacing + ';}', 0);
	}
}

function createDeck(clickFnc=null){
	let deck = [];
	for (const suit in Suit) {
		for (const rank in Rank) {
			deck.push(new Card(suit, rank, clickFnc));
		}
	}
	return new Deck(deck);
}