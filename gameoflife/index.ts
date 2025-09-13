import init, { Universe } from "pkg";

async function run_wasm() {
    await init();

    const canvas = document.getElementById("gol-canvas");
    if (!canvas)
        throw new Error('element with id: "gol-canvas", must be defiend');
    const fps_counter = document.getElementById("fps-counter");
    if (!fps_counter)
        throw new Error('element with id: "fps-counter", must be defiend');
    const universe = Universe.new();

    const draw = () => {
        canvas.textContent = universe.render();
        universe.tick();
    };

    let prev = Date.now();
    let dt = 0;

    const update = () => {
        draw();

        let now = Date.now();
        fps_counter.textContent = `${(1000 / (dt = now - prev)).toFixed(0)} FPS`;
        prev = now;

        return requestAnimationFrame(update);
    };

    return update();
}

run_wasm();
