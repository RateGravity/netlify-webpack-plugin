import { createRedirectFile } from "../redirects";

describe("createRedirectFile", () => {
  it("writes redirect rules", () => {
    const content = createRedirectFile([
      {
        from: "/netlify/*",
        to: "https://www.netlify.com/docs/:splat",
        status: 301,
        force: true
      },
      {
        from: "/pass-through/*",
        to: "https://www.netlify.com/docs/:splat",
        status: 200,
        force: false
      },
      {
        from: "/*",
        to: "/index.html",
        status: 200,
        force: false
      }
    ]);
    expect(content).toBe(
      `/netlify/*    https://www.netlify.com/docs/:splat    301!
/pass-through/*    https://www.netlify.com/docs/:splat    200
/*    /index.html    200`
    );
  });
  it("defaults to 301 if not specified", () => {
    const content = createRedirectFile([
      {
        from: "/netlify/*",
        to: "https://www.netlify.com/docs/:splat",
        force: false
      }
    ]);
    expect(content).toBe(
      "/netlify/*    https://www.netlify.com/docs/:splat    301"
    );
  });
  it("defaults to not force if not specified", () => {
    const content = createRedirectFile([
      {
        from: "/netlify/*",
        to: "https://www.netlify.com/docs/:splat",
        status: 301
      }
    ]);
    expect(content).toBe(
      "/netlify/*    https://www.netlify.com/docs/:splat    301"
    );
  });
});
