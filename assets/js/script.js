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

// testing third part
// const b = new Barriers(700, 1200, 200, 400);
// const area = document.querySelector('.flappy-content');
// b.pairs.forEach(pair => area.appendChild(pair.element));
// setInterval(() => {
//     b.animate();
// }, 20);


