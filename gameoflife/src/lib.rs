use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: usize,
    height: usize,
    cells: Vec<Cell>,
}

impl Universe {
    pub fn get_cells(&self) -> &[Cell] {
        &self.cells
    }

    pub fn set_cells(&mut self, cells: &[(usize, usize)]) -> () {
        for cell in cells.iter().cloned() {
            let index = self.get_index(cell.0, cell.1);
            self.cells[index] = Cell::Alive;
        }
    }

    fn get_index(&self, row: usize, col: usize) -> usize {
        return row * self.width + col;
    }

    fn get_neighbours_count(&self, row: usize, col: usize) -> u8 {
        let mut count = 0;
        for di in [self.height - 1, 0, 1].iter().cloned() {
            for dj in [self.width - 1, 0, 1].iter().cloned() {
                if (dj == 0) && (di == 0) {
                    continue;
                }

                let index = self.get_index((row + di) % self.height, (col + dj) % self.width);
                count += self.cells[index] as u8;
            }
        }
        count
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn new(width: usize, height: usize) -> Self {
        Self {
            width,
            height,
            cells: Vec::with_capacity(width * height),
        }
    }

    pub fn set_cells_default(&mut self) {
        self.cells = (0..self.width * self.height)
            .map(|i| {
                if (i % 2 == 0) || (i % 7 == 0) {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();
    }

    pub fn set_width(&mut self, width: usize) -> () {
        self.width = width;
        self.cells = (0..self.width * self.height).map(|_| Cell::Dead).collect();
    }

    pub fn set_height(&mut self, height: usize) -> () {
        self.height = height;
        self.cells = (0..self.width * self.height).map(|_| Cell::Dead).collect();
    }

    pub fn get_width(&self) -> usize {
        self.width
    }

    pub fn get_height(&self) -> usize {
        self.height
    }

    pub fn get_cells_ptr(&self) -> *const Cell {
        return self.cells.as_ptr();
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for i in 0..self.width {
            for j in 0..self.height {
                let cell_index = self.get_index(i, j);
                next[cell_index] = match (self.cells[cell_index], self.get_neighbours_count(i, j)) {
                    (Cell::Alive, x) if x < 2 || x > 3 => Cell::Dead,
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    (Cell::Dead, 3) => Cell::Alive,
                    (default, _) => default,
                };
            }
        }
        self.cells = next;
    }
}
