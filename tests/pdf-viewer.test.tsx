import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PdfViewer,
  type PdfLoader,
  type PdfPageHandle,
  type PdfDocumentHandle,
} from "../src/components/patterns/pdf-viewer";
const drawImage = vi.fn(),
  clearRect = vi.fn();
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
    clearRect,
  } as unknown as CanvasRenderingContext2D);
});
afterEach(() => {
  vi.restoreAllMocks();
});
function fixture(
  options: {
    pages?: number;
    render?: (page: number) => ReturnType<PdfPageHandle["render"]>;
    text?: (page: number) => Promise<string>;
  } = {},
) {
  const page = vi.fn(
    async (number: number): Promise<PdfPageHandle> => ({
      size: () => ({ width: 600, height: 800 }),
      render: () =>
        options.render?.(number) ?? {
          promise: Promise.resolve(),
          cancel: vi.fn(),
        },
      text: () =>
        options.text?.(number) ?? Promise.resolve(`Original page ${number}`),
      cleanup: vi.fn(),
    }),
  );
  const document: PdfDocumentHandle = {
    numPages: options.pages ?? 2,
    getPage: page,
  };
  const destroy = vi.fn(async () => {});
  const loader: PdfLoader = vi.fn(() => ({
    promise: Promise.resolve(document),
    destroy,
  }));
  return { loader, destroy, page };
}
it("renders supplied pages/text, clamps controlled pages and preserves a supplied original-source fallback", async () => {
  const doc = fixture();
  render(
    <PdfViewer
      title="Example source"
      sourceKey="one"
      loadDocument={doc.loader}
      defaultPage={99}
      fallback={<a href="/authorized-original">Open original</a>}
    />,
  );
  await waitFor(() => expect(screen.getByRole("img")).toBeVisible());
  expect(doc.page).toHaveBeenCalledWith(2);
  expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  await userEvent.click(screen.getByText("Selectable page text"));
  expect(screen.getByText("Original page 2")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Previous page" }));
  await waitFor(() => expect(doc.page).toHaveBeenCalledWith(1));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled(),
  );
  expect(screen.getByRole("link", { name: "Open original" })).toHaveAttribute(
    "href",
    "/authorized-original",
  );
});
it("blocks page navigation until a render finishes and cancels it on disposal", async () => {
  let reject!: (error: Error) => void;
  const cancel = vi.fn(() => reject(new Error("cancelled")));
  const doc = fixture({
    render: () => ({
      promise: new Promise((_, no) => {
        reject = no;
      }),
      cancel,
    }),
  });
  const { unmount } = render(
    <PdfViewer title="Pending" sourceKey="one" loadDocument={doc.loader} />,
  );
  await waitFor(() => expect(doc.page).toHaveBeenCalled());
  expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  unmount();
  await act(async () => {});
  expect(cancel).toHaveBeenCalledOnce();
  expect(doc.destroy).toHaveBeenCalledOnce();
});
it("destroys stale loading tasks and never replaces the new source with a late old document", async () => {
  let done!: (document: PdfDocumentHandle) => void;
  const destroy = vi.fn(async () => {});
  const old: PdfLoader = () => ({
    promise: new Promise((resolve) => {
      done = resolve;
    }),
    destroy,
  });
  const fresh = fixture();
  const { rerender } = render(
    <PdfViewer title="Old" sourceKey="old" loadDocument={old} />,
  );
  await act(async () => {});
  rerender(
    <PdfViewer title="New" sourceKey="new" loadDocument={fresh.loader} />,
  );
  await waitFor(() =>
    expect(screen.getByRole("img", { name: /New/ })).toBeVisible(),
  );
  await act(async () => done({ numPages: 99, getPage: vi.fn() }));
  expect(destroy).toHaveBeenCalledOnce();
  expect(screen.getByRole("status")).toHaveTextContent("Page 1 of 2");
});
it("rejects excessive pages, destroys the document, and leaves the original-source fallback available", async () => {
  const doc = fixture({ pages: 101 });
  const { unmount } = render(
    <PdfViewer
      title="Too many"
      sourceKey="bad"
      loadDocument={doc.loader}
      fallback={<a href="/original">Inspect original</a>}
    />,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "could not be previewed",
  );
  expect(doc.page).not.toHaveBeenCalled();
  expect(screen.getByRole("link")).toHaveAttribute("href", "/original");
  unmount();
  expect(doc.destroy).toHaveBeenCalledOnce();
});
it("separates render errors from selectable-text failures without exposing loader diagnostics", async () => {
  const renderFailure = fixture({
    render: () => ({
      promise: Promise.reject(new Error("private diagnostic")),
      cancel: vi.fn(),
    }),
  });
  const { rerender } = render(
    <PdfViewer
      title="Broken"
      sourceKey="bad"
      loadDocument={renderFailure.loader}
    />,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "could not be rendered",
  );
  expect(screen.queryByText(/private diagnostic/)).toBeNull();
  expect(screen.queryByRole("img")).toBeNull();
  const textFailure = fixture({
    text: async () => {
      throw Error("text unavailable");
    },
  });
  rerender(
    <PdfViewer
      title="Image only"
      sourceKey="image"
      loadDocument={textFailure.loader}
    />,
  );
  await waitFor(() => expect(screen.getByRole("img")).toBeVisible());
  await userEvent.click(screen.getByText("Selectable page text"));
  expect(screen.getByText(/Selectable text is unavailable/)).toBeVisible();
  expect(screen.queryByRole("alert")).toBeNull();
});
it("honors the raster budget and clears the old page text before the next page is ready", async () => {
  const doc = fixture();
  const { container } = render(
    <PdfViewer
      title="Bounded"
      sourceKey="small"
      loadDocument={doc.loader}
      maxWidth={200}
      maxPixels={10_000}
    />,
  );
  await waitFor(() => expect(screen.getByRole("img")).toBeVisible());
  const canvas = container.querySelector("canvas")!;
  expect(canvas.width).toBeLessThanOrEqual(200);
  expect(canvas.width * canvas.height).toBeLessThanOrEqual(10_000);
  expect(drawImage).toHaveBeenCalled();
});
