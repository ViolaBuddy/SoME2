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
var numVictories = 0;
var numLosses = 0;
var gameIsRunning = false;

function setupGame() {
	fullDeck.shuffle();
	numClicks = 0;
	lastClickedNumericalRank = 0;
	currGameNumber++;
	gameIsRunning = false;

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

/** endfunction = once the game is over, what function should we run? */
function startAutoGame(endfunction=null, animate=true){
	gameIsRunning = true;
	for (let i = 0; i < fullDeck.cards.length; i++) {
		let card = fullDeck.cards[i];

		// add custom properties to the cards
		// 
		card.used = false;
		/** returns true if this move is possible, false otherwise */
		card.autoClickFunction = function(){
			// no checks when run automatically
			if(!this.used) {
				this.used = true;
				if(animate){
					this.flip();
					this.moveImageTo(WASTE_PILE_X, WASTE_PILE_Y);
					this.domElement.style['zIndex'] = 1000 + numClicks;
				}

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
		if(tryMove){
			// if we could successfully find a card to move
			if(currGameNumber > thisGameNumber){
				// Oh wait, our game has already ended through an external signal.
				// Don't continue this loop.
				return;
			}
			if(animate){
				setTimeout(() => mainloop(thisGameNumber), timeoutLength);
			} else {
				mainloop(thisGameNumber);
			}
		} else {
			if(52-numClicks == 0) {
				numVictories++;
			} else{
				numLosses++;
			}
			if(endfunction){
				endfunction();
			}
			gameIsRunning = false;
		}
	}

	mainloop(currGameNumber);
}

/** resultsDivs will be passed to updateResultsDivs if it is not null */
function setupAndStartMultiAutoGame(numtimes, animate=true, resultsDivs=null){
	setupGame();
	startAutoGame(function(){
		// first update any graphs
		if(resultsDivs){
			updateResultsDivs(resultsDivs);
		}

		// then loop
		if(numtimes > 1) {
			setTimeout(
				() => setupAndStartMultiAutoGame(numtimes-1, animate, resultsDivs),
				timeoutLength
			);
		}
	}, animate);
}

/** resultsDiv is an object of (k,v) pairs where v is the div to output results in.
  * valid keys are "numVictories", "numLosses", "numGames", and "victoryRatio" */
function updateResultsDivs(resultsDivs){
	let currDiv;


	currDiv = resultsDivs["numVictories"];
	if(currDiv) {
		currDiv.textContent = numVictories;
	}
	
	currDiv = resultsDivs["numLosses"];
	if(currDiv) {
		currDiv.textContent = numLosses;
	}
	
	currDiv = resultsDivs["numGames"];
	if(currDiv) {
		currDiv.textContent = (numVictories + numLosses);
	}
	
	currDiv = resultsDivs["victoryRatio"];
	if(currDiv) {
		currDiv.textContent = (numVictories * 100/(numVictories + numLosses)).toFixed(2);
	}
}