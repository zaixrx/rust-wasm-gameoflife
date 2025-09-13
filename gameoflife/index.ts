import init, { Cell, Universe } from "pkg";

const CELL_SIZE = 5;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";
const TARGET_FPS = 10;

async function run_wasm() {
    const { memory } = await init();

    const canvas = document.querySelector("canvas");
    if (!canvas) throw new Error("canvas must not be undefined");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas must have 2D context");

    const universe = Universe.new();
    const width = universe.get_width();
    const height = universe.get_height();

    canvas.height = (CELL_SIZE + 1) * height + 1;
    canvas.width = (CELL_SIZE + 1) * width + 1;

    const update = () => {
        universe.tick();

        ctx.strokeStyle = GRID_COLOR;
        for (let i = 0; i <= width; ++i) {
            ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
            ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
        }
        for (let j = 0; j <= height; ++j) {
            ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
            ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
        }
        ctx.stroke();

        const cellsPtr = universe.get_cells();
        const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
        ctx.beginPath();
        for (let i = 0; i < height; ++i) {
            for (let j = 0; j < width; ++j) {
                ctx.fillStyle =
                    cells[i * width + j] === Cell.Dead
                        ? DEAD_COLOR
                        : ALIVE_COLOR;
                ctx.fillRect(
                    j * (CELL_SIZE + 1) + 1,
                    i * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE,
                );
            }
        }
        ctx.stroke();

        return setTimeout(update, 1000 / TARGET_FPS);
    };

    return update();
}

run_wasm();
