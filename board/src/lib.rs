// comes with wasm-pack for setting up bindings with javascript
use wasm_bindgen::prelude::*;

const BOARD_DIMENSION: usize = 8;
const FRAME_BUFFER_STRIDE: usize = 4;
const FRAME_BUFFER_SIZE: usize = BOARD_DIMENSION * BOARD_DIMENSION * FRAME_BUFFER_STRIDE;
static mut FRAME_BUFFER: [u8; FRAME_BUFFER_SIZE] = [0; FRAME_BUFFER_SIZE];

// works with the linear memory nature of wasm
#[wasm_bindgen]
#[allow(static_mut_refs)] // TODO: no
pub fn get_frame_buffer() -> *const u8 {
    let ptr: *const u8;
    unsafe {
        ptr = FRAME_BUFFER.as_ptr();
    }
    return ptr;
}

#[wasm_bindgen]
pub fn populate_frame_buffer(lr: u8, lg: u8, lb: u8, dr: u8, dg: u8, db: u8) {
    for y in 0..BOARD_DIMENSION {
        for x in 0..BOARD_DIMENSION {
            let square_color = if (y % 2 == 0) ^ (x % 2 == 0) {
                (dr, dg, db, 0xFF)
            } else {
                (lr, lg, lb, 0xFF)
            };
            let base_index: usize = (y * BOARD_DIMENSION + x) * FRAME_BUFFER_STRIDE;
            unsafe {
                FRAME_BUFFER[base_index + 0] = square_color.0;
                FRAME_BUFFER[base_index + 1] = square_color.1;
                FRAME_BUFFER[base_index + 2] = square_color.2;
                FRAME_BUFFER[base_index + 3] = square_color.3;
            }
        }
    }
}
