import { main } from "./package.json";
import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    file: main,
    format: "cjs"
  },
  plugins: [babel()]
};
