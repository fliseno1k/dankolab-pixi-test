import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";

import buttonTexture from "./assets/media/button.png";
import dogecointTexture from "./assets/media/dogecoin.png";

import "./styles/index.css";

type SketchProps = {
    dom?: HTMLElement;
};

type Status = "idle" | "animating" | "waiting";

const main = ({ dom }: SketchProps) => {
    let waitingTime = 0;
    let status: Status = "idle";

    const app = new PIXI.Application({
        resizeTo: window,
    });

    (dom ?? document.body).appendChild(app.view as HTMLCanvasElement);

    const screen = new PIXI.Container();

    const screenBg = new PIXI.Graphics();
    screenBg.beginFill(0xcca9a2);
    screenBg.drawRect(0, 0, app.view.width, app.view.height);

    const coin = new PIXI.Sprite(PIXI.Texture.from(dogecointTexture));
    coin.anchor.set(0.5);
    coin.width = app.screen.width / 6;
    coin.height = app.screen.width / 6;
    coin.x = app.screen.width / 2;
    coin.y = app.screen.height / 2;

    const button = new PIXI.Sprite(PIXI.Texture.from(buttonTexture));
    button.anchor.set(0.5, 1);
    button.x = app.screen.width / 2;
    button.y = app.screen.height - 20;
    button.zIndex = 1;
    button.scale.set(Math.min(app.screen.width / 4 / 126, 1.5));

    button.interactive = true;
    button.cursor = "pointer";

    const handleIdleOff = () => {
        if (status === "animating") {
            return;
        }

        new TWEEDLE.Tween(coin)
            .to({ y: app.screen.height / 4 }, 300)
            .repeat(1)
            .yoyo(true)
            .yoyoEasing(TWEEDLE.Easing.Sinusoidal.InOut)
            .start()
            .onStart(() => {
                status = "animating";
            })
            .onComplete(() => {
                status = "waiting";
                waitingTime = 0;
            });
    };

    const resize = () => {
        setTimeout(() => {
            screenBg.drawRect(0, 0, app.view.width, app.view.height);

            coin.width = app.screen.width / 6;
            coin.height = app.screen.width / 6;
            coin.x = app.screen.width / 2;
            coin.y = app.screen.height / 2;

            button.x = app.screen.width / 2;
            button.y = app.screen.height - 40;
            button.scale.set(Math.min(app.screen.width / 4 / 126, 1.5));
        }, 0);
    };

    const render = (delta: number) => {
        waitingTime += delta;

        if (status === "waiting" && waitingTime >= 200) {
            status = "idle";
            waitingTime = 0;
        }

        if (status === "idle") {
            coin.transform.rotation -= 0.02 * delta;
        }

        TWEEDLE.Group.shared.update();
    };

    button.on("pointerdown", handleIdleOff);

    screen.addChild(screenBg, coin, button);
    app.stage.addChild(screen);
    app.ticker.add((delta: number) => render(delta));

    window.addEventListener("resize", resize);
};

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector<HTMLDivElement>("#root");

    if (!root) {
        return;
    }

    main({ dom: root });
});
