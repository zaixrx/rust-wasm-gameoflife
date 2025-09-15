# Usage

1. Install [rust](https://www.rust-lang.org/tools/install)
2. Install wasm-pack using cargo

```sh
cargo install wasm-pack
```

3. Building and setting up bindings and dependencies

```sh
wasm-pack build --target web
npm i
```

4. run the development server

```sh
npm run dev # npx webpack serve
```

# Testing

```sh
wasm-pack test --firefox [--headless]
```

# Resources
