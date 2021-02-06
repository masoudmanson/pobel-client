class Wobble {
    constructor(elem, color) {
        const TWO_PI = Math.PI * 2;
        const HALF_PI = Math.PI / 2;
        this.canvas = document.createElement("canvas");
        this.c = this.canvas.getContext("2d");
        this.color = color;
        this.width = elem.getBoundingClientRect().width;
        this.height = elem.getBoundingClientRect().height;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.globalCompositeOperation='destination-over';
        this.canvas.style.position = 'absolute';
        this.canvas.style.transform = 'scaleX(-1)';
        this.canvas.style.filter = 'FlipH';
        this.canvas.style.top= 0;
        this.canvas.style.right= 0;
        this.canvas.style.zIndex= 0;
        elem.prepend(this.canvas);

        this.wobbleIncrement = 100;
        this.radius = 2 * elem.getBoundingClientRect().width + Math.floor(Math.random() * 200) - 200;
        this.segments = 10;
        this.step = HALF_PI / this.segments;
        this.anchors = [];
        this.radii = [];
        this.thetaOff = [];

        const bumpRadius = 150;
        const halfBumpRadius = bumpRadius / 2;

        for (let i = 0; i < this.segments + 2; i++) {
            this.anchors.push(0, 0);
            this.radii.push(Math.random() * bumpRadius - halfBumpRadius);
            this.thetaOff.push(Math.random() * 2 * Math.PI);
        }

        this.theta = 0;
        this.thetaRamp = 0;
        this.thetaRampDest = 12;
        this.rampDamp = 25;
    }

    update() {
        this.thetaRamp += (this.thetaRampDest - this.thetaRamp) / this.rampDamp;
        this.theta += 0.02;

        this.anchors = [0, this.radius];
        for (let i = 0; i <= this.segments + 2; i++) {
            const sine = Math.sin(this.thetaOff[i] + this.theta + this.thetaRamp);
            const rad = this.radius + this.radii[i] * sine;
            const x = rad * Math.sin(this.step * i);
            const y = rad * Math.cos(this.step * i);
            this.anchors.push(x, y);
        }

        this.c.save();
        this.c.translate(-10, -10);
        this.c.scale(0.6, 0.6);
        this.c.fillStyle = this.color;
        this.c.beginPath();
        this.c.moveTo(0, 0);
        this.bezierSkin(this.c, this.anchors, false);

        this.c.lineTo(0, 0);
        this.c.fill();
        this.c.restore();
    }

    bezierSkin() {
        let bez = this.anchors;
        const avg = this.calcAvgs(bez);
        const leng = bez.length;

        if (closed) {
            this.c.moveTo(avg[0], avg[1]);
            for (let i = 2; i < leng; i += 2) {
                let n = i + 1;
                this.c.quadraticCurveTo(bez[i], bez[n], avg[i], avg[n]);
            }
            this.c.quadraticCurveTo(bez[0], bez[1], avg[0], avg[1]);
        } else {
            this.c.moveTo(bez[0], bez[1]);
            this.c.lineTo(avg[0], avg[1]);
            for (let i = 2; i < leng - 2; i += 2) {
                let n = i + 1;
                this.c.quadraticCurveTo(bez[i], bez[n], avg[i], avg[n]);
            }
            this.c.lineTo(bez[leng - 2], bez[leng - 1]);
        }
    }

    calcAvgs (p) {
        const avg = [];
        const leng = p.length;
        let prev;

        for (let i = 2; i < leng; i++) {
            prev = i - 2;
            avg.push((p[prev] + p[i]) / 2);
        }

        avg.push((p[0] + p[leng - 2]) / 2, (p[1] + p[leng - 1]) / 2);
        return avg;
    }
}

export default Wobble;