export const contractTemplates = {
  "service-agreement": {
    id: "service-agreement",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contract Agreement</title>
  <style>
    .contract-container {
      width: 100%;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      font-family: Arial, sans-serif;
      line-height: 1.8;
      color: #000000;
    }

    .contract-header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .contract-title {
      color: #000000;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .contract-subtitle {
      color: #2563eb;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .contract-text {
      margin-bottom: 1.5rem;
      color: #374151;
    }

    .editable {
      background-color: #f8fafc;
      padding: 0.5rem 0.75rem;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      min-height: 2.5rem;
      display: inline-block;
      color: #1e40af;
    }

    .signature-block {
      margin-top: 3rem;
      padding: 1.5rem;
      background-color: #f8fafc;
      border-radius: 6px;
    }

    .signature-label {
      font-weight: 500;
      color: #1e40af;
      margin-bottom: 1rem;
    }

    .signature-line {
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, transparent, #94a3b8, transparent);
      margin: 2rem 0;
    }

    .signature-name {
      font-weight: 500;
      color: #1e40af;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 0.5rem;
    }

    .section-content {
      color: #374151;
      line-height: 1.6;
    }

    @media (max-width: 640px) {
      .contract-container {
        width: 100%;
        padding: 1.5rem;
      }

      .contract-title {
        font-size: 1.5rem;
      }

      .contract-subtitle {
        font-size: 1.1rem;
      }
    }
  </style>
</head>
<body>
  <div class="contract-container">
    <div class="contract-header">
      <h1 class="contract-title">Service Agreement</h1>
      <p class="contract-text">This contract ("Agreement") is entered into on <span class="editable" contenteditable="true">[Date]</span> between <span class="editable" contenteditable="true">[Client Name]</span> and <span class="editable" contenteditable="true">[Service Provider]</span>.</p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">1. Scope of Work</h2>
      <div class="section-content">
        <p class="contract-text editable" contenteditable="true">
          [Describe the services to be provided here...]
        </p>
      </div>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">2. Payment Terms</h2>
      <div class="section-content">
        <p class="contract-text editable" contenteditable="true">
          [Describe the payment structure, amount, deadlines, etc.]
        </p>
      </div>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">3. Termination</h2>
      <div class="section-content">
        <p class="contract-text editable" contenteditable="true">
          [Conditions for termination of the agreement...]
        </p>
      </div>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">4. Confidentiality</h2>
      <div class="section-content">
        <p class="contract-text editable" contenteditable="true">
          [Confidentiality terms go here...]
        </p>
      </div>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">5. Signatures</h2>
      <div class="signature-block">
        <div class="signature-label">Creator Signature:</div>
        <div id="client-signature-canvas"></div>
        <div class="signature-line"></div>
        <p class="signature-name editable" contenteditable="true">[Client Name]</p>
      </div>

      <div class="signature-block">
        <div class="signature-label">Service Provider Signature:</div>
        <div id="provider-signature-canvas"></div>
        <div class="signature-line"></div>
        <p class="signature-name editable" contenteditable="true">[Service Provider Name]</p>
      </div>
    </div>
  </div>
</body>
</html>`
  }
};
