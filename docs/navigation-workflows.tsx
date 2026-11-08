import { useRef, useState, type FormEvent } from "react";
import {
  AppShell,
  Header,
  PrimaryNavigation,
  Sidebar,
  Breadcrumbs,
  SectionNavigation,
} from "../src/components/patterns/navigation";
import { MobileNavigation } from "../src/components/patterns/mobile-navigation";
import { FormFeedback } from "../src/components/patterns/form-feedback";
import { ConfirmationDialog } from "../src/components/patterns/confirmation-dialog";
import { RepeatableFields } from "../src/components/patterns/repeatable-fields";
import { FileSelection } from "../src/components/patterns/file-selection";
import {
  UploadQueue,
  type UploadQueueItem,
} from "../src/components/patterns/upload-queue";
import {
  ReviewLayout,
  HistoryTimeline,
} from "../src/components/patterns/review-layout";
import { TextInput, Select } from "../src/components/ui/fields";
import { Button } from "../src/components/ui/button";

export function NavigationWorkflows() {
  const [product, setProduct] = useState("workspace");
  const service = product === "service";
  const items = service
    ? [
        { label: "Inbox", href: "#sample-home" },
        { label: "People", href: "#sample-secondary" },
      ]
    : [
        { label: "Projects", href: "#sample-home" },
        { label: "Resources", href: "#sample-secondary" },
      ];
  const [name, setName] = useState("Harbour project"),
    [fields, setFields] = useState([{ id: "first", value: "Alex" }]);
  const nextId = useRef(0),
    inFlight = useRef(false);
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [fail, setFail] = useState(true);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]),
    [decisions, setDecisions] = useState(0);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      if (fail) {
        setError(
          "The simulated save failed. Your entries are retained; change Save outcome and submit again.",
        );
      } else {
        setSuccess(`Saved ${name} locally. No network request was made.`);
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return (
    <>
      <section id="application-navigation">
        <p className="eyebrow">Milestone 3 / Application navigation</p>
        <h2>Your product supplies the map.</h2>
        <p>
          Branding, links, current route and account controls are supplied by
          the product. Switch products: the same shell, header, sidebar, mobile
          navigation and breadcrumbs render both without changes to shared
          components.
        </p>
        <Select
          label="Example product"
          value={product}
          onChange={(event) => setProduct(event.target.value)}
          options={[
            { value: "workspace", label: "Harbour workspace" },
            { value: "service", label: "Atlas support" },
          ]}
        />
        <div className="example">
          <AppShell
            contentAs="div"
            header={
              <Header
                brand={
                  <a href="#sample-home">
                    {service ? "Atlas Support" : "Harbour"}
                  </a>
                }
                navigation={
                  <PrimaryNavigation items={items} activeHref="#sample-home" />
                }
                mobileNavigation={
                  <MobileNavigation
                    items={items}
                    activeHref="#sample-home"
                    navigationKey={product}
                  />
                }
                accountControl={<span>Demo account</span>}
              />
            }
            sidebar={
              <Sidebar
                label={service ? "Service desk" : "Workspace"}
                items={[
                  ...items,
                  { label: "Coming soon", href: "#future", disabled: true },
                ]}
                activeHref="#sample-home"
              />
            }
          >
            <Breadcrumbs
              items={[
                {
                  label: service ? "Service" : "Workspace",
                  href: "#sample-home",
                },
                { label: service ? "Inbox" : "Projects" },
              ]}
            />
            <h3 id="sample-home">
              {service ? "Incoming requests" : "Your projects"}
            </h3>
            <SectionNavigation
              label="Example sections"
              items={[
                { label: "Overview", href: "#sample-home" },
                { label: "Details", href: "#sample-secondary" },
              ]}
              activeHref="#sample-home"
            />
            <p id="sample-secondary">
              The product chooses routes, authorization, route matching, labels
              and account actions. These examples use native anchors; finance
              supplies a Next.js Link adapter.
            </p>
          </AppShell>
        </div>
        <p>
          On phones, open Menu, use Tab through the links, then Escape to close
          and return focus. Selecting a link, moving focus outside, an outside
          pointer action, or changing the supplied navigation key closes it.
          This is a navigation disclosure, not a modal or ARIA menu. AppShell
          supports a skip link and a single main landmark; nested shells use
          contentAs="div".
        </p>
      </section>
      <section id="form-review-workflows">
        <p className="eyebrow">Milestone 4 / Forms & review</p>
        <h2>Keep the work. Make the next action clear.</h2>
        <p>
          Try a failed save, retry with a successful outcome, add or remove
          people, and confirm a decision. All examples are local simulations
          with fictional data.
        </p>
        <div className="example">
          <ReviewLayout
            evidenceLabel="Example source"
            reviewLabel="Example review"
            evidence={
              <div>
                <h3 id="workflow-evidence">Source evidence</h3>
                <p>Fictional project brief · revision 2 · page 1</p>
                <p>
                  Keep original evidence visible beside the review.
                  Authorization, document viewers and provenance links belong to
                  the product.
                </p>
                <HistoryTimeline
                  events={[
                    {
                      id: "draft",
                      title: "Draft created",
                      dateLabel: "November 8, 2026",
                      dateTime: "2026-11-08",
                      detail: "Alex · fictional example",
                      source: (
                        <a href="#workflow-evidence">View supplied source</a>
                      ),
                    },
                    ...(decisions
                      ? [
                          {
                            id: "review",
                            title: "Review confirmed",
                            dateLabel: "Just now",
                            detail: `${decisions} local confirmation(s)`,
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            }
          >
            <form
              aria-label="Example project form"
              aria-busy={pending}
              onSubmit={save}
            >
              <fieldset disabled={pending} className="docs-workflow-form">
                <TextInput
                  label="Project name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
                <RepeatableFields
                  label="Project contacts"
                  maxItems={3}
                  items={fields.map((field, index) => ({
                    id: field.id,
                    label: `Contact ${index + 1}`,
                    content: (
                      <TextInput
                        label={`Contact name ${index + 1}`}
                        value={field.value}
                        onChange={(event) =>
                          setFields((rows) =>
                            rows.map((row) =>
                              row.id === field.id
                                ? { ...row, value: event.target.value }
                                : row,
                            ),
                          )
                        }
                        required
                      />
                    ),
                  }))}
                  onAdd={() =>
                    setFields((rows) => [
                      ...rows,
                      { id: `contact-${++nextId.current}`, value: "" },
                    ])
                  }
                  onRemove={(id) =>
                    setFields((rows) => rows.filter((row) => row.id !== id))
                  }
                  addLabel="Add contact"
                />
                <Select
                  label="Save outcome"
                  value={fail ? "error" : "success"}
                  onChange={(event) => setFail(event.target.value === "error")}
                  options={[
                    { value: "error", label: "Simulate failure" },
                    { value: "success", label: "Simulate success" },
                  ]}
                />
                <Button type="submit" loading={pending}>
                  Save project
                </Button>
              </fieldset>
              <FormFeedback pending={pending} error={error} success={success} />
            </form>
            <ConfirmationDialog
              title="Confirm review?"
              description="This records a local example decision. No real record will change."
              trigger={
                <Button variant="secondary">Confirm example review</Button>
              }
              confirmLabel="Confirm review"
              onConfirm={async () => {
                await new Promise((resolve) => setTimeout(resolve, 650));
                if (fail) throw new Error("Simulated failure");
                setDecisions((count) => count + 1);
              }}
            />
          </ReviewLayout>
        </div>
        <p>
          Confirmation starts on Cancel, blocks repeat submission and dismissal
          while pending, stays open after failure, and restores trigger focus on
          close. The callback determines success. Repeatable fields keep stable
          product IDs and focus the added row or the next available remove
          action. Products own serialization, validation, minimum/maximum counts
          and reset policy.
        </p>
        <div className="example">
          <FileSelection
            label="Select example attachments"
            description="PDF or text, up to 1 MB per file. Files stay in this browser; this demo never reads or uploads their contents."
            accept={["application/pdf", "text/plain", ".txt"]}
            maxBytes={1024 * 1024}
            onFiles={(files) =>
              setQueue((rows) => [
                ...rows,
                ...files.map((file) => ({
                  id: `file-${++nextId.current}`,
                  name: file.name,
                  status: "Queued",
                  progress: 0,
                })),
              ])
            }
          />
          <UploadQueue
            items={queue.map((item) => ({
              ...item,
              actions: (
                <div className="button-row">
                  <Button
                    size="compact"
                    variant="secondary"
                    onClick={() =>
                      setQueue((rows) =>
                        rows.map((row) =>
                          row.id === item.id
                            ? {
                                ...row,
                                status: "Complete (simulated)",
                                progress: 100,
                                message:
                                  "The product supplies transport and server validation.",
                              }
                            : row,
                        ),
                      )
                    }
                  >
                    Simulate completion / retry
                  </Button>
                  <Button
                    size="compact"
                    variant="tertiary"
                    onClick={() =>
                      setQueue((rows) =>
                        rows.map((row) =>
                          row.id === item.id
                            ? {
                                ...row,
                                status: "Failed (simulated)",
                                progress: undefined,
                                message: "Original selection is retained.",
                              }
                            : row,
                        ),
                      )
                    }
                  >
                    Simulate failure
                  </Button>
                  <Button
                    size="compact"
                    variant="tertiary"
                    onClick={() =>
                      setQueue((rows) =>
                        rows.filter((row) => row.id !== item.id),
                      )
                    }
                  >
                    Remove {item.name}
                  </Button>
                </div>
              ),
            }))}
          />
        </div>
        <p>
          FileSelection checks the supplied type and size rules, empty files and
          duplicate selection within one batch. This is client feedback; the
          server must validate content, authorization and confirmed duplicates.
          UploadQueue displays supplied progress, statuses and action slots. It
          does not fetch, upload, hash, authorize, retry or discard files.
          HistoryTimeline preserves caller ordering and supplied
          timestamps/source links; it is not an audit store.
        </p>
        <p>
          <a href="https://github.com/stephane-brochu/product-ui/blob/v0.5.0/docs/migrations/v0.5.0.md">
            Read navigation and workflow contracts
          </a>
        </p>
      </section>
    </>
  );
}
