"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Save, RefreshCw, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { fetchEmailTemplates, saveEmailTemplate, setActiveEmailTemplate } from "@/lib/api/templates";
import type { EmailTemplate, EmailTemplateId } from "@/lib/api/templates";

const FALLBACK_TARGETS: { id: EmailTemplateId; label: string }[] = [
  { id: "freelancingStores", label: "Freelancing Stores" },
  { id: "appDevelopers", label: "App Developers" },
  { id: "agencies", label: "Agencies" }
];

export function TemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<EmailTemplateId>("freelancingStores");
  const [activeId, setActiveId] = useState<EmailTemplateId>("freelancingStores");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const toast = useToast();

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) || null,
    [templates, selectedId]
  );

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await fetchEmailTemplates();
      setTemplates(response.templates);
      setActiveId(response.activeTemplateId);
      const active = response.templates.find((template) => template.id === selectedId) || response.templates[0];
      if (active) {
        setSelectedId(active.id);
        setSubject(active.subject);
        setBody(active.body);
      }
    } catch (error: any) {
      setLoadError(error.message || "Could not load the email templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
    // Load the configuration once when the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTargetChange = (id: EmailTemplateId) => {
    const next = templates.find((template) => template.id === id);
    if (!next) return;
    setSelectedId(id);
    setSubject(next.subject);
    setBody(next.body);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    try {
      setIsSaving(true);
      const response = await saveEmailTemplate({ id: selectedTemplate.id, subject, body });
      setTemplates((current) => current.map((template) => (
        template.id === response.template.id ? response.template : template
      )));
      setSubject(response.template.subject);
      setBody(response.template.body);
      toast.success("Template saved", `${response.template.target} is ready to use.`);
    } catch (error: any) {
      toast.error("Could not save template", error.message || "Check the required variable and template content.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseForOutreach = async () => {
    if (!selectedTemplate) return;
    try {
      setIsSaving(true);
      if (isDirty) {
        const saved = await saveEmailTemplate({ id: selectedTemplate.id, subject, body });
        setTemplates((current) => current.map((template) => (
          template.id === saved.template.id ? saved.template : template
        )));
        setSubject(saved.template.subject);
        setBody(saved.template.body);
      }
      const response = await setActiveEmailTemplate(selectedTemplate.id);
      setActiveId(response.activeTemplateId);
      toast.success("Outreach template selected", `${selectedTemplate.target} will be used for new email outreach.`);
    } catch (error: any) {
      toast.error("Could not select template", error.message || "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = Boolean(selectedTemplate && (subject !== selectedTemplate.subject || body !== selectedTemplate.body));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Email template targets</CardTitle>
            <CardDescription>Choose a template to edit, then select which one new email outreach should use.</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void loadTemplates()} disabled={isLoading || isSaving}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Reload
          </Button>
        </CardHeader>

        <label htmlFor="template-target" className="mb-2 block text-xs font-medium text-slate-300">Template to edit</label>
        <select
          id="template-target"
          value={selectedId}
          onChange={(event) => handleTargetChange(event.target.value as EmailTemplateId)}
          disabled={isLoading || templates.length === 0}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        >
          {FALLBACK_TARGETS.map((target) => (
            <option key={target.id} value={target.id}>{target.label}</option>
          ))}
        </select>

        {selectedTemplate && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <span className="text-xs text-slate-300">
              {activeId === selectedTemplate.id ? `${selectedTemplate.target} is used for outreach.` : `Current outreach template: ${templates.find((template) => template.id === activeId)?.target || activeId}.`}
            </span>
            {activeId !== selectedTemplate.id && (
              <Button variant="secondary" size="sm" onClick={handleUseForOutreach} disabled={isSaving || isLoading}>
                Use for outreach
              </Button>
            )}
          </div>
        )}

        {selectedTemplate && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-400">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <span><strong className="text-slate-200">{selectedTemplate.audience}</strong> · Required variable: <code className="text-sky-300">&#123;&#123;{selectedTemplate.variable}&#125;&#125;</code></span>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{selectedTemplate?.target || "Template content"}</CardTitle>
            <CardDescription>Edit the subject and plain-text email body.</CardDescription>
          </div>
        </CardHeader>

        {isLoading ? (
          <p className="text-sm text-slate-400">Loading templates…</p>
        ) : loadError ? (
          <div className="space-y-3">
            <p className="text-sm text-rose-300">{loadError}</p>
            <Button variant="secondary" size="sm" onClick={() => void loadTemplates()}>Try again</Button>
          </div>
        ) : selectedTemplate ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="template-subject" className="mb-2 block text-xs font-medium text-slate-300">Subject line</label>
              <input
                id="template-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={200}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
              <p className="mt-1 text-right text-[11px] text-slate-500">{subject.length}/200</p>
            </div>

            <div>
              <label htmlFor="template-body" className="mb-2 block text-xs font-medium text-slate-300">Email body</label>
              <textarea
                id="template-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={18}
                maxLength={10000}
                spellCheck
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
              <div className="mt-1 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500">
                <span>Keep <code className="text-sky-300">&#123;&#123;{selectedTemplate.variable}&#125;&#125;</code> in the body for personalization.</span>
                <span>{body.length}/10,000</span>
              </div>
            </div>

            {selectedTemplate.id === "freelancingStores" && (
              <p className="text-xs text-slate-400">The required portfolio link is <span className="text-sky-300">https://himanshusoni-lilac.vercel.app/</span>.</p>
            )}

            <div className="flex justify-end border-t border-slate-800 pt-4">
              <Button onClick={handleSave} isLoading={isSaving} disabled={!isDirty || isLoading}>
                <Save className="h-4 w-4" />
                Save template
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No templates are available from the backend.</p>
        )}
      </Card>
    </div>
  );
}
