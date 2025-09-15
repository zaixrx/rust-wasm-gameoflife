import init, { Cell, Universe } from "pkg";

function mustGetElementById<T extends HTMLElement>(
    id: string,
    ctor: { new (): T },
): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`failed to get element with id: "${id}"`);
    if (!(element instanceof (ctor as any)))
        throw new Error(`unexpected type for "${id}"`);
    return element as T;
}

abstract class GameBase {
    public width: number;
    public height: number;
    protected universe: Universe;
    protected readonly memory: WebAssembly.Memory;

    constructor(memory: WebAssembly.Memory, width: number, height: number) {
        this.memory = memory;
        this.universe = Universe.new(width, height);
        this.width = this.universe.get_width();
        this.height = this.universe.get_height();
    }

    public reset_cells() {
        this.universe.reset_cells();
        this.drawNextFrame();
    }

    public randomize_cells() {
        this.universe.randomize_cells();
        this.drawNextFrame();
    }

    public toggle_cell(row: number, col: number) {
        this.universe.toggle_cell(row, col);
        this.drawNextFrame();
    }

    public draw_glider(row: number, col: number) {
        this.universe.draw_glider(row, col);
        this.drawNextFrame();
    }

    public tick() {
        this.universe.tick();
        this.drawNextFrame();
    }

    public back() {
	this.universe.back();
	this.drawNextFrame();
    }

    public drawNextFrame?(): void;
}

class GameRenderer extends GameBase {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    public cellSize = 5;
    public gridColor = "#CCCCCC";
    public deadColor = "#FFFFFF";
    public aliveColor = "#000000";

    constructor(
        canvas: HTMLCanvasElement,
        memory: WebAssembly.Memory,
        width: number,
        height: number,
    ) {
        super(memory, width, height);

        this.canvas = canvas;
        this.canvas.height = (this.cellSize + 1) * height + 1;
        this.canvas.width = (this.cellSize + 1) * width + 1;

        this.ctx = this.canvas.getContext("2d");
        if (!this.ctx) throw new Error("canvas must have 2D context");
    }

    public drawNextFrame(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = this.gridColor;
        for (let i = 0; i <= this.width; ++i) {
            this.ctx.moveTo(i * (this.cellSize + 1) + 1, 0);
            this.ctx.lineTo(
                i * (this.cellSize + 1) + 1,
                (this.cellSize + 1) * this.height + 1,
            );
        }
        for (let j = 0; j <= this.height; ++j) {
            this.ctx.moveTo(0, j * (this.cellSize + 1) + 1);
            this.ctx.lineTo(
                (this.cellSize + 1) * this.width + 1,
                j * (this.cellSize + 1) + 1,
            );
        }
        this.ctx.stroke();

        const cells = new Uint8Array(
            this.memory.buffer,
            this.universe.get_cells(),
            this.width * this.height,
        );

        this.ctx.beginPath();
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++j) {
                this.ctx.fillStyle =
                    cells[i * this.width + j] === Cell.Dead
                        ? this.deadColor
                        : this.aliveColor;
                this.ctx.fillRect(
                    j * (this.cellSize + 1) + 1,
                    i * (this.cellSize + 1) + 1,
                    this.cellSize,
                    this.cellSize,
                );
            }
        }
        this.ctx.stroke();
    }
}

interface GameState {
    animationId: number;
    renderer: GameRenderer;
}

(async () => {
    const { memory } = await init();
    const [canvas, backward, control, forward, clear, random, stopOnDraw] = [
        mustGetElementById("canvas", HTMLCanvasElement),
        mustGetElementById("step-backward", HTMLButtonElement),
        mustGetElementById("control", HTMLButtonElement),
        mustGetElementById("step-forward", HTMLButtonElement),
        mustGetElementById("clear", HTMLButtonElement),
        mustGetElementById("random", HTMLButtonElement),
        mustGetElementById("stop-when-drawing", HTMLInputElement),
    ];
    let { renderer, animationId } = {
        renderer: new GameRenderer(canvas, memory, 32, 32),
        animationId: null,
    } as GameState;

    const stopLoop = () => {
        control.textContent = "▶";
        cancelAnimationFrame(animationId);
        animationId = null;
    };
    const startLoop = () => {
        control.textContent = "⏸";
        run();
    };
    const get_row_col = (clientX: number, clientY: number) => {
        const boundingRect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / boundingRect.width;
        const scaleY = canvas.height / boundingRect.height;

        const canvasLeft = (clientX - boundingRect.left) * scaleX;
        const canvasTop = (clientY - boundingRect.top) * scaleY;

        const row = Math.min(
            Math.floor(canvasTop / (renderer.cellSize + 1)),
            renderer.height - 1,
        );
        const col = Math.min(
            Math.floor(canvasLeft / (renderer.cellSize + 1)),
            renderer.width - 1,
        );

        return [row, col];
    };

    backward.onclick = () => {
	stop();
	renderer.back();
    };
    control.onclick = () => (animationId ? stopLoop() : startLoop());
    forward.onclick = () => {
        stop();
        renderer.tick();
    };
    clear.onclick = () => renderer.reset_cells();
    random.onclick = () => renderer.randomize_cells();
    canvas.onclick = (ev: PointerEvent) => {
        if (stopOnDraw.checked) stopLoop();
        const [row, col] = get_row_col(ev.clientX, ev.clientY);
        if (ev.ctrlKey) {
            renderer.draw_glider(row, col);
        } else {
            renderer.toggle_cell(row, col);
        }
    };

    renderer.drawNextFrame();
    const run = () => {
        animationId = requestAnimationFrame(() => {
            renderer.tick();
            run();
        });
    };
})();
