import { createRoot } from "react-dom/client";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { TextInput } from "./components/ui/fields";
import { FormSection, FormActions } from "./components/patterns/form-section";
import { AppShell, Header, PrimaryNavigation, Sidebar } from "./components/patterns/navigation";
import "./styles.css";
function App() {
  const [name, setName] = useState("");
  return (
    <div className="starter" data-ui-theme="studio">
    <AppShell mainId="product-main" header={<Header brand={<a href="#welcome">Harbour</a>} navigation={<PrimaryNavigation items={[{label:"Workspace",href:"#welcome"}]} />} />} sidebar={<Sidebar label="Workspace" items={[{label:"Get started",href:"#welcome"}]} />}>
      <h1>Your next product</h1>
      <p>A small starting point built on Product UI v0.6.0.</p>
      <FormSection
        id="welcome"
        title="Get started"
        description="Replace this example with your product workflow."
      >
        <TextInput
          label="Project name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <FormActions>
          <Button disabled={!name.trim()}>Create project</Button>
        </FormActions>
      </FormSection>
    </AppShell>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
