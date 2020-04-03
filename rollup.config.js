import { main } from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default {
  input: "src/index.ts",
  output: {
    file: main,
    format: "cjs"
  },
  plugins: [
    resolve({
      extensions: [".ts"]
    }),
    babel({ extensions: [".ts"] })
  ]
};
