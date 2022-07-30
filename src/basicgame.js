"use strict";
const CARD_WIDTH = 10; // must match cardgamestyle.css
const CARD_HEIGHT = CARD_WIDTH * 323.55 / 222.783; // must match the card dimensions
const CLOCK_RADIUS = 50 - CARD_HEIGHT
const WASTE_PILE_X = 99 - CARD_WIDTH;
const WASTE_PILE_Y = 99 - CARD_HEIGHT;

var timeoutLength = 500; // intended to be set by a slider in the main page
var numClicks = 0;
var lastClickedNumericalRank = 0; // if 13, is stored as 0 instead
var fullDeck = createDeck();
var currGameNumber = -1;

function setupGame() {
	fullDeck.shuffle();
	numClicks = 0;
	lastClickedNumericalRank = 0;
	currGameNumber++;

	for (let i = 0; i < fullDeck.cards.length; i++) {
		// create the card image
		let card = fullDeck.cards[i];
		card.addImageTo(document.getElementById('main'));
		card.flip(false); // face down

		// arrange the DOM element visually on the page
		let pileNumber = i%13;
		let offset = Math.floor(i/13)/2;
		let x, y;
		if(i%13 == 0) {
			// king cards in the center
			x = 44 - CARD_WIDTH/2 + offset;
			y = 44 - CARD_HEIGHT/2 + offset;
		} else {
			// all the normal clock number cards 
			x = 44 + CLOCK_RADIUS * Math.sin(2*Math.PI * (i%13)/12) - CARD_WIDTH/2 + offset;
			y = 44 + CLOCK_RADIUS * -Math.cos(2*Math.PI * (i%13)/12) - CARD_WIDTH/2 + offset;
		}
		card.domElement.style['left'] = x + '%';
		card.domElement.style['top'] = y + '%';
		card.domElement.style['zIndex'] = 'auto';
	}
}

function startGame(){
	for (let i = 0; i < fullDeck.cards.length; i++) {
		let card = fullDeck.cards[i];
		card.domElement.style['cursor'] = 'pointer';

		// add click to all the cards
		card.changeClickFnc(function(clickevent){
			// Note: Javascript scoping rules of `let` preserve the value of i for each card
			if(lastClickedNumericalRank === i%13) {
				if(!this.faceUp) {
					this.flip();
					this.moveImageTo(WASTE_PILE_X, WASTE_PILE_Y);
					this.domElement.style['zIndex'] = 1000 + numClicks;
					this.domElement.style['cursor'] = 'auto';

					numClicks++;
					lastClickedNumericalRank = getNumericalRank(this.rank)%13;
				}
			}
		});
	}

	fullDeck.cards[52 - 13].domElement.onclick();
}

function startAutoGame(){
	for (let i = 0; i < fullDeck.cards.length; i++) {
		let card = fullDeck.cards[i];

		// add a custom property to the cards
		/** returns true if this move is possible, false otherwise */
		card.autoClickFunction = function(){
			// no checks when run automatically
			if(!this.faceUp) {
				this.flip();
				this.moveImageTo(WASTE_PILE_X, WASTE_PILE_Y);
				this.domElement.style['zIndex'] = 1000 + numClicks;

				numClicks++;
				lastClickedNumericalRank = getNumericalRank(this.rank)%13;
				return true;
			} else {
				return false;
			}
		};
	}

	/** thisGameNumber is the number that this instance of mainloop belongs to */
	function mainloop(thisGameNumber){
		let i = 52 - 13 + lastClickedNumericalRank;
		let tryMove = false;

		// keep trying to move cards. If it doesn't work, try the previous one in the same pile
		while(!tryMove) {
			tryMove = fullDeck.cards[i].autoClickFunction();
			i -= 13;
			if(i < 0){
				// we just tried the last card in our pile. Stop, no matter what.
				break;
			}
		}
		// if we could successfully find a card to move
		if(tryMove){
			if(currGameNumber > thisGameNumber){
				// oh wait our game has already ended. Don't continue this loop.
				return;
			}
			setTimeout(() => mainloop(thisGameNumber), timeoutLength);
		} else {
			console.log("done with game " + thisGameNumber + "!");
		}
	}

	mainloop(currGameNumber);
}