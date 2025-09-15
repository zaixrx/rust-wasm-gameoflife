use wasm_bindgen_test::{wasm_bindgen_test, wasm_bindgen_test_configure};
use wasm_examples_gol::Universe;

#[cfg(test)]
pub fn input_universe() -> Universe {
    let mut universe = Universe::new(5, 5);
    universe.set_rs_cells(&[(1, 1), (3, 1), (2, 2), (1, 3), (3, 3)]);
    universe
}

#[cfg(test)]
pub fn expected_universe() -> Universe {
    let mut universe = Universe::new(5, 5);
    universe.set_rs_cells(&[(2, 1), (1, 2), (3, 2), (2, 3)]);
    universe
}

#[wasm_bindgen_test]
pub fn test_tick() {
    wasm_bindgen_test_configure!(run_in_browser);
    let mut input_universe = input_universe();
    input_universe.tick();
    let expected_universe = expected_universe();
    assert_eq!(input_universe.get_rs_cells(), expected_universe.get_rs_cells());
}
