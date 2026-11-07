import { createRoot } from "react-dom/client";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { TextInput } from "./components/ui/fields";
import { FormSection, FormActions } from "./components/patterns/form-section";
import "./styles.css";
function App() {
  const [name, setName] = useState("");
  return (
    <main data-ui-theme="studio">
      <h1>Your next product</h1>
      <p>A small starting point built on Product UI v0.1.0.</p>
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
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
