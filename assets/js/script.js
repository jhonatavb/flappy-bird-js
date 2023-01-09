const createElement = (tagName, className) => {
    const el = document.createElement(tagName);
    el.className = className;
    
    return el;
}

class Barrier {
    constructor(reverse = false) {
        this.element = createElement('div', 'barrier');

        const barrierBorder = createElement('div', 'barrier-border');
        const barrierBody = createElement('div', 'barrier-body');
        this.element.appendChild(reverse ? barrierBody : barrierBorder);
        this.element.appendChild(reverse ? barrierBorder : barrierBody);

        this.setHeight = barrierHeight => barrierBody.style.height = `${ barrierHeight }px`;
    }
}

// testing first part
// const b = new Barrier(true);
// b.setHeight(300);
// document.querySelector('.flappy-content').appendChild(b.element);

class BarriersContainer {
    constructor(barrierHeight, opening, positionX) {
        this.element = createElement('div', 'barriers-content');

        this.upper = new Barrier(true);
        this.bottom = new Barrier(false);

        this.element.appendChild(this.upper.element);
        this.element.appendChild(this.bottom.element);

        this.raffleOpening = () => {
            const heightUpper = Math.random() * (barrierHeight - opening);
            const heightBottom = barrierHeight - opening - heightUpper;
            this.upper.setHeight(heightUpper);
            this.bottom.setHeight(heightBottom);
        };

        this.getPositionX = () => parseInt(this.element.style.left.split('px')[0], 10);
        this.setPositionX = positionX => this.element.style.left = `${ positionX }px`;
        this.getWidth = () => this.element.clientWidth;

        this.raffleOpening();
        this.setPositionX(positionX);
    }
}

// testing second part
// const b = new BarriersContainer(700, 200, 400);
// document.querySelector('.flappy-content').appendChild(b.element);

class Barriers {
    constructor(heightGame, widthGame, openingBarriers, distanceBarriers, notifyPoint) {
        this.pairs = [
            new BarriersContainer(heightGame, openingBarriers, widthGame),
            new BarriersContainer(heightGame, openingBarriers, widthGame + distanceBarriers),
            new BarriersContainer(heightGame, openingBarriers, widthGame + distanceBarriers * 2),
            new BarriersContainer(heightGame, openingBarriers, widthGame + distanceBarriers * 3)
        ];

        const DISPLACEMENT_BARRIERS = 3;

        this.animate = () => {
            this.pairs.forEach(pair => {
                pair.setPositionX(pair.getPositionX() - DISPLACEMENT_BARRIERS);

                if(pair.getPositionX() < -pair.getWidth()) {
                    pair.setPositionX(pair.getPositionX() + distanceBarriers * this.pairs.length);
                    pair.raffleOpening();
                }

                const halfGameScreen = widthGame / 2;
                const passedMiddle = pair.getPositionX() + DISPLACEMENT_BARRIERS >= halfGameScreen
                    && pair.getPositionX() < halfGameScreen;

                if(passedMiddle) notifyPoint();
            });
        };
    }
}

class Bird {
    constructor(heightGame) {
        let flying = false;

        this.element = createElement('img', 'bird');
        this.element.src = './assets/imgs/bird.png';

        this.getPositionY = () => parseInt(this.element.style.bottom.split('px')[0], 10);
        this.setPositionY = y => this.element.style.bottom = `${ y }px`;

        window.onkeydown = () => flying = true;
        window.onkeyup = () => flying = false;

        this.animate = () => {
            const newAxisY = this.getPositionY() + (flying ? 8 : -5);
            const maxFlightHeight = heightGame - (this.element.clientHeight + 8);

            if(newAxisY <= 0) {
                this.setPositionY(0);
            } else if(newAxisY >= maxFlightHeight) {
                this.setPositionY(maxFlightHeight);
            } else {
                this.setPositionY(newAxisY);
            } 
        };

        this.setPositionY(heightGame / 2);
    }
}


// testing third part
// const b = new Barriers(700, 1200, 200, 400);
// const bird = new Bird(700);
// const area = document.querySelector('.flappy-content');
// 
// area.appendChild(bird.element);
// b.pairs.forEach(pair => area.appendChild(pair.element));
// setInterval(() => {
//     b.animate();
//     bird.animate();
// }, 20);

class Progress {
    constructor() {
        this.element = createElement('span', 'progress');
        this.updateScore = points => {
            this.element.innerHTML = points;
        };

        this.updateScore(0);
    }
}

// testing fourth part
// const b = new Barriers(700, 1200, 200, 400);
// const bird = new Bird(700);
// const area = document.querySelector('.flappy-content');
// 
// area.appendChild(bird.element);
// area.appendChild(new Progress().element);
// b.pairs.forEach(pair => area.appendChild(pair.element));
// setInterval(() => {
//     b.animate();
//     bird.animate();
// }, 20);

function wasCollision(elementA, elementB) {
    const firstEl = elementA.getBoundingClientRect();
    const secondEl = elementB.getBoundingClientRect();

    const onHorizontal = firstEl.left + firstEl.width >= secondEl.left
        && secondEl.left + secondEl.width >= firstEl.left;
    const onVertically = firstEl.top + firstEl.height >= secondEl.top
        && secondEl.top + secondEl.height >= firstEl.top;

    return onHorizontal && onVertically;
}

function collided(bird, barriers) {
    let collided = false;

    barriers.pairs.forEach(pair => {
        if(!collided) {
            const top = pair.upper.element;
            const bottom = pair.bottom.element;

            collided = wasCollision(bird.element, top)
                || wasCollision(bird.element, bottom);
        }
    });

    return collided;
}


class PlayFlappyBird {
    constructor() {
        let points = 0;

        const gameArea = document.querySelector('.flappy-content');
        const gameHeight = gameArea.clientHeight;
        const gameWidth = gameArea.clientWidth;

        const progress = new Progress();
        const barriers = new Barriers(gameHeight, gameWidth, 200, 400,
            () => progress.updateScore(++points));
        const bird = new Bird(gameHeight);

        gameArea.appendChild(progress.element);
        gameArea.appendChild(bird.element);
        barriers.pairs.forEach(pair => gameArea.appendChild(pair.element));

        this.start = () => {
            const timer = setInterval(() => {
                barriers.animate();
                bird.animate();

                if(collided(bird, barriers)) {
                    clearInterval(timer);
                }
            }, 20);
        }
    }
}

new PlayFlappyBird().start();

