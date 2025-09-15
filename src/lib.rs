use rand::Rng;
use wasm_bindgen::prelude::*;

pub struct Stack {
    top: usize,
    count: usize,
    size: usize,
    items: Vec<Vec<Cell>>,
}

impl Stack {
    pub fn new(size: usize) -> Stack {
        Stack {
            top: 0,
            count: 0,
            size,
            items: vec![Vec::new(); size]
        }
    }

    pub fn push(&mut self, item: Vec<Cell>) {
        self.top = (self.top + 1) % self.size;
        self.items[self.top] = item;
        if self.count < self.size {
            self.count += 1;
        }
    }

    pub fn pop(&mut self) -> Option<Vec<Cell>> {
        if self.count <= 0 {
            return None;
        }
        let item = self.items[self.top].clone();
        self.top = (self.top - 1) % self.size;
        self.count -= 1;
        return Some(item);
    }
}

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
    action_stack: Stack,
}

impl Universe {
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

    pub fn get_rs_cells(&self) -> &[Cell] {
        self.cells.as_slice()
    }

    pub fn set_rs_cells(&mut self, cells: &[(usize, usize)]) {
        for cell in cells.iter().cloned() {
            let index = self.get_index(cell.0, cell.1);
            self.cells[index] = Cell::Alive;
        }
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn new(width: usize, height: usize) -> Self {
        Self {
            width,
            height,
            cells: (0..width * height).map(|_| Cell::Dead).collect(),
            action_stack: Stack::new(10),
        }
    }

    pub fn back(&mut self) {
        match self.action_stack.pop() {
            Some(cells) => {
                self.cells = cells;
            },
            None => (),
        };
    }

    pub fn tick(&mut self) {
        self.action_stack.push(self.cells.clone());
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

    pub fn get_cells(&self) -> *const Cell {
        return self.cells.as_ptr();
    }

    pub fn toggle_cell(&mut self, row: usize, col: usize) {
        self.action_stack.push(self.cells.clone());
        let index = self.get_index(row, col);
        self.cells[index] = if self.cells[index] == Cell::Alive {
            Cell::Dead
        } else {
            Cell::Alive
        };
    }

    pub fn reset_cells(&mut self) {
        self.action_stack.push(self.cells.clone());
        for i in 0..self.cells.len() {
            self.cells[i] = Cell::Dead;
        }
    }

    pub fn randomize_cells(&mut self) {
        self.action_stack.push(self.cells.clone());
        let mut rng = rand::rng();
        for i in 0..self.cells.len() {
            self.cells[i] = if rng.random_bool(0.5) {
                Cell::Alive
            } else {
                Cell::Dead
            };
        }
    }

    pub fn draw_glider(&mut self, row: usize, col: usize) {
        self.action_stack.push(self.cells.clone());
        for di in [self.height - 1, 0, 1].iter().cloned() {
            for dj in [self.width - 1, 0, 1].iter().cloned() {
                if di == self.height - 1 && dj == self.width - 1 {
                    continue;
                }
                if di == 0 && dj == self.width - 1 {
                    continue;
                }
                if di == self.height - 1 && dj == 1 {
                    continue;
                }
                if di == 0 && dj == 0 {
                    continue;
                }

                let index = self.get_index((row + di) % self.height, (col + dj) % self.width);
                self.cells[index] = Cell::Alive;
            }
        }
    }

    pub fn get_width(&self) -> usize {
        self.width
    }

    pub fn get_height(&self) -> usize {
        self.height
    }

    pub fn set_width(&mut self, width: usize) {
        self.width = width;
        self.cells = (0..self.width * self.height).map(|_| Cell::Dead).collect();
    }

    pub fn set_height(&mut self, height: usize) {
        self.height = height;
        self.cells = (0..self.width * self.height).map(|_| Cell::Dead).collect();
    }
}

