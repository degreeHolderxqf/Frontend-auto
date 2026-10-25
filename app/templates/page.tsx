import { TemplateEditor } from "@/components/templates/TemplateEditor";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">Email Templates</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Edit the separate outreach copy for Shopify store owners, app developers, and agencies.
        </p>
      </div>
      <TemplateEditor />
    </div>
  );
}
