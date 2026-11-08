import { createPdfJsLoader } from "../src/components/patterns/pdfjs-loader";
const { getDocument, worker, cancel, cleanup, getViewport, render } =
  vi.hoisted(() => ({
    getDocument: vi.fn(),
    worker: { workerSrc: "" },
    cancel: vi.fn(),
    cleanup: vi.fn(),
    getViewport: vi.fn(({ scale }: { scale: number }) => ({
      width: 600 * scale,
      height: 800 * scale,
    })),
    render: vi.fn(() => ({ promise: Promise.resolve(), cancel })),
  }));
vi.mock("pdfjs-dist", () => ({ getDocument, GlobalWorkerOptions: worker }));
it("requires explicit worker setup and keeps source/auth/header choices in the caller", async () => {
  const destroy = vi.fn(async () => {});
  getDocument.mockReturnValue({
    destroy,
    promise: Promise.resolve({
      numPages: 2,
      getPage: async () => ({
        getViewport,
        render,
        cleanup,
        getTextContent: async () => ({
          items: [{ str: "Original" }, { str: "text" }, {}],
        }),
      }),
    }),
  });
  const task = createPdfJsLoader({
    url: "/authorized-source",
    workerSrc: "/matching-worker.mjs",
    withCredentials: true,
    httpHeaders: { "X-Example": "fictional" },
  })();
  const doc = await task.promise;
  expect(worker.workerSrc).toBe("/matching-worker.mjs");
  expect(getDocument).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "/authorized-source",
      withCredentials: true,
      httpHeaders: { "X-Example": "fictional" },
      stopAtErrors: true,
      verbosity: 0,
    }),
  );
  const page = await doc.getPage(1);
  expect(page.size()).toEqual({ width: 600, height: 800 });
  expect(await page.text()).toBe("Original text ");
  const canvas = document.createElement("canvas");
  vi.spyOn(canvas, "getContext").mockReturnValue(
    {} as CanvasRenderingContext2D,
  );
  page.render(canvas, 0.5).cancel();
  expect(cancel).toHaveBeenCalled();
  page.cleanup?.();
  expect(cleanup).toHaveBeenCalled();
  await task.destroy();
  expect(destroy).toHaveBeenCalledOnce();
});
it("does not enable credentials implicitly", () => {
  getDocument.mockReturnValue({
    promise: Promise.resolve({ numPages: 1 }),
    destroy: vi.fn(),
  });
  createPdfJsLoader({ url: "/public-source", workerSrc: "/worker.mjs" })();
  expect(getDocument).toHaveBeenLastCalledWith(
    expect.objectContaining({ withCredentials: false }),
  );
  expect(() => createPdfJsLoader({ url: "", workerSrc: "" })).toThrow();
});
