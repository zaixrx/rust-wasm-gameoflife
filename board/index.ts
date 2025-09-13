import init, { get_frame_buffer, populate_frame_buffer } from "pkg";

function get_random_dark() {
    return Math.random() * 100;
}

function get_random_light() {
    return Math.random() * 0x7f + 0x7f;
}

const target_fps = 5;

async function run_wasm() {
    const { memory } = await init();

    const canvas = document.querySelector("canvas");
    if (!canvas) throw new Error("canvas must not be undefined");
    const canvas_context = canvas.getContext("2d");
    if (!canvas_context) throw new Error("canvas must have 2D context");
    const canvas_image_data = canvas_context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
    );

    const board_dimension = 8;
    const board_stride = 4;
    const frame_buffer_size = board_dimension * board_dimension * board_stride;

    const render = () => {
        populate_frame_buffer(
            get_random_light(),
            get_random_light(),
            get_random_light(),
            get_random_dark(),
            get_random_dark(),
            get_random_dark(),
        );

        const wasm_memory = new Uint8Array(memory.buffer);
        const frame_buffer_ptr = get_frame_buffer();
        const frame_array = wasm_memory.slice(
            frame_buffer_ptr,
            frame_buffer_ptr + frame_buffer_size,
        );
        canvas_image_data.data.set(frame_array);

        canvas_context.clearRect(0, 0, canvas.width, canvas.height);
        canvas_context.putImageData(canvas_image_data, 0, 0);

        setTimeout(render, 1000 / target_fps);
    };

    render();
}

run_wasm();
