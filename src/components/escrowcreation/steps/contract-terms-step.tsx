import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download } from "lucide-react";
// @ts-ignore
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { SignaturePadComponent } from "@/components/escrowcreation/signature_pad/signature-pad";
import { contractTemplates } from "@/../public/Data/ContractHtmls";
import { toast } from "react-toastify";

export default function ContractTermsStep({
  contractEnabled,
  setContractEnabled,
  contractHtml,
  setContractHtml,
  editedContractHtml,
  setEditedContractHtml,
  clientSignature,
  setClientSignature,
  providerSignature,
  setProviderSignature,
  hasSavedContract,
  setHasSavedContract,
  showDownloadBtn,
  setShowDownloadBtn,
}: {
  contractEnabled: boolean;
  setContractEnabled: (v: boolean) => void;
  contractHtml: string;
  setContractHtml: (v: string) => void;
  editedContractHtml: string;
  setEditedContractHtml: (v: string) => void;
  clientSignature: string;
  setClientSignature: (v: string) => void;
  providerSignature: string;
  setProviderSignature: (v: string) => void;
  hasSavedContract: boolean;
  setHasSavedContract: (v: boolean) => void;
  showDownloadBtn: boolean;
  setShowDownloadBtn: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  const resetContractState = () => {
    setContractEnabled(false);
    setContractHtml("");
    setEditedContractHtml("");
    setClientSignature("");
    setProviderSignature("");
    setHasSavedContract(false);
    setShowDownloadBtn(false);
  };

  const onToggle = (checked: boolean) => {
    setContractEnabled(checked);
    if (checked && !hasSavedContract) {
      setContractHtml(contractTemplates["service-agreement-classic"].content);
      setEditedContractHtml(contractTemplates["service-agreement-classic"].content);
      setOpen(true);
    }
  };

  const handleClientSig = (sig: string) => {
    setClientSignature(sig);
    let html = editedContractHtml || contractHtml;
    const ph = '<div id="client-signature-canvas"></div>';
    const img = `<img src="${sig}" alt="Client Signature" style="max-width: 100%; height: auto;" />`;
    if (html.includes(ph)) html = html.replace(ph, img);
    else {
      const existing = html.match(/<img[^>]*alt="Client Signature"[^>]*>/);
      if (existing) html = html.replace(existing[0], img);
    }
    setEditedContractHtml(html);
    setContractHtml(html);
    toast.success("signature saved");
  };

  const handleProviderSig = (sig: string) => {
    setProviderSignature(sig);
    let html = editedContractHtml || contractHtml;
    const ph = '<div id="provider-signature-canvas"></div>';
    const img = `<img src="${sig}" alt="Provider Signature" style="max-width: 100%; height: auto;" />`;
    if (html.includes(ph)) html = html.replace(ph, img);
    else {
      const existing = html.match(/<img[^>]*alt="Provider Signature"[^>]*>/);
      if (existing) html = html.replace(existing[0], img);
    }
    setEditedContractHtml(html);
    setContractHtml(html);
    alert("Service provider signature saved");
  };

  const onSaveChanges = () => {
    if (!clientSignature) {
      toast.error("Please add your signature before saving changes");
      return;
    }
    setContractHtml(editedContractHtml);
    setHasSavedContract(true);
    setShowDownloadBtn(true);
    setOpen(false);
  };

  const handleAttemptClose = () => {
    if (!clientSignature) {
      const proceed = window.confirm(
        "Please sign the contract. If you close now, all progress on the contract will be lost."
      );
      if (!proceed) return false;
      resetContractState();
    }
    return true;
  };

  const handleCancel = () => {
    if (!handleAttemptClose()) return;
    setOpen(false);
  };

  const handleDownloadPDF = async () => {
    try {
      let current = editedContractHtml || contractHtml;

      // create offscreen container
      const container = document.createElement("div");
      container.style.width = "8.5in";
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.backgroundColor = "#ffffff";
      document.body.appendChild(container);
      container.innerHTML = current;

      // strip contenteditable & inputs
      container.querySelectorAll("[contenteditable='true']").forEach((el) => {
        (el as HTMLElement).removeAttribute("contenteditable");
        (el as HTMLElement).setAttribute("style", "border:none;background:transparent;");
      });
      container.querySelectorAll("input, textarea").forEach((el) => {
        const v = (el as HTMLInputElement | HTMLTextAreaElement).value || (el as HTMLInputElement | HTMLTextAreaElement).placeholder;
        const div = document.createElement("div");
        div.textContent = v;
        el.parentNode?.replaceChild(div, el);
      });

      // replace placeholders with signatures if present
      const placeClient = container.querySelector("#client-signature-canvas");
      if (clientSignature && placeClient) {
        const img = document.createElement("img");
        img.src = clientSignature;
        img.alt = "Client Signature";
        img.style.maxWidth = "100%";
        placeClient.parentNode?.replaceChild(img, placeClient);
      }
      const placeProvider = container.querySelector("#provider-signature-canvas");
      if (providerSignature && placeProvider) {
        const img = document.createElement("img");
        img.src = providerSignature;
        img.alt = "Provider Signature";
        img.style.maxWidth = "100%";
        placeProvider.parentNode?.replaceChild(img, placeProvider);
      }

      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
      const imgWidth = 7.5;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0.5, 0.5, imgWidth, imgHeight);

      let heightLeft = imgHeight - 10; // per page body height
      let position = 0;
      while (heightLeft > 0) {
        position += 10;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0.5, 0.5 - position, imgWidth, imgHeight);
        heightLeft -= 10;
      }

      pdf.save("contract.pdf");
      document.body.removeChild(container);
    } catch (e) {
      console.error(e);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4 w-full">
        {!contractHtml && (
          <div className="flex items-center space-x-2">
            <Checkbox id="showContractTerms" checked={contractEnabled} onCheckedChange={(c) => onToggle(!!c)} />
            <Label htmlFor="showContractTerms" className="text-zinc-700 font-medium dark:text-zinc-100">
              Add Contract Terms <span className=" text-zinc-500 dark:text-zinc-400">(optional)</span>
            </Label>
          </div>
        )}

        {contractHtml && (
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Contract terms have been added. Click below to view or edit.
              </p>

              <Dialog
                open={open}
                onOpenChange={(v) => {
                  if (!v) {
                    const ok = handleAttemptClose();
                    if (!ok) {
                      setOpen(true);
                      return;
                    }
                  }
                  setOpen(v);
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">View Contract</Button>
                </DialogTrigger>
                <DialogContent className="w-full lg:min-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Contract Terms</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div
                      contentEditable
                      className="prose max-w-none p-4 border rounded-lg min-h-[400px] focus:outline-none focus:ring-2 focus:ring-[#BB7333]"
                      dangerouslySetInnerHTML={{ __html: editedContractHtml || contractHtml }}
                      onBlur={(e) => setEditedContractHtml(e.currentTarget.innerHTML)}
                    />

                    <div className="mt-8 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Your Signature</h3>
                        <SignaturePadComponent onSave={handleClientSig} canvasId="client-signature-canvas" />
                      </div>
                      {/* Optional provider signature:
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Service Provider Signature</h3>
                        <SignaturePadComponent onSave={handleProviderSig} canvasId="provider-signature-canvas" />
                      </div> */}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button className="hover:bg-red-700 bg-red-700/80" type="button" variant="secondary" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={onSaveChanges} className="flex items-center gap-2">
                        Save Changes
                      </Button>

                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>

      {showDownloadBtn && (
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
}
