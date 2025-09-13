import init, { Cell, Universe } from "pkg";

abstract class GameBase {
    protected readonly memory: WebAssembly.Memory;
    protected universe: Universe;
    protected width: number;
    protected height: number;

    constructor(memory: WebAssembly.Memory, width: number, height: number) {
        this.memory = memory;
        this.universe = Universe.new(width, height);
        this.width = this.universe.get_width();
        this.height = this.universe.get_height();
    }

    public update() {
        this.universe.tick();
        this.render!();
    }

    protected render?(): void;
}

class GameRenderer extends GameBase {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    public cellSize = 5;
    public gridColor = "#CCCCCC";
    public deadColor = "#FFFFFF";
    public aliveColor = "#000000";

    constructor(memory: WebAssembly.Memory, width: number, height: number) {
        super(memory, width, height);

        const canvas = document.querySelector("canvas");
        if (!canvas) throw new Error("canvas must not be undefined");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas must have 2D context");

        this.canvas = canvas;
        canvas.height = (this.cellSize + 1) * height + 1;
        canvas.width = (this.cellSize + 1) * width + 1;
        this.ctx = ctx;
    }

    protected render(): void {
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

(async () => {
    const { memory } = await init();
    const renderer = new GameRenderer(memory, 200, 200);
    function run() {
        renderer.update();
        return requestAnimationFrame(run);
    }
    run();
})();
