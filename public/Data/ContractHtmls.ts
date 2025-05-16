export const contractTemplates1 = {
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


export const contractTemplates = {
  "service-agreement-classic": {
    id: "service-agreement-classic",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Professional Service Agreement</title>
  <style>
    /* Base styles optimized for PDF conversion */
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      color: #000000;
      background-color: #ffffff;
    }
    
    .contract-container {
      width: 8.5in;
      padding: 1in 0.75in;
      box-sizing: border-box;
      background-color: #ffffff;
      line-height: 1.5;
    }

    .contract-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #000000;
    }

    .contract-title {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #000000;
    }

    .contract-subtitle {
      font-size: 14pt;
      font-weight: bold;
      margin: 1.5rem 0 0.75rem;
      color: #000000;
    }

    .contract-text {
      margin-bottom: 1rem;
      font-size: 11pt;
      color: #000000;
    }

    .editable {
      display: inline-block;
      min-width: 100px;
      padding: 0.25rem 0.5rem;
      border-bottom: 1px solid #000000;
      color: #000000;
      background-color: #ffffff;
    }

    .signature-block {
      margin-top: 2rem;
      page-break-inside: avoid;
    }

    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 3rem;
    }

    .signature-column {
      width: 45%;
    }

    .signature-label {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #000000;
    }

    #client-signature-canvas, 
    #provider-signature-canvas {
      width: 100%;
      height: 80px;
      border-bottom: 1px solid #000000;
      margin-bottom: 0.5rem;
      background-color: #ffffff;
    }

    .signature-name {
      font-weight: bold;
      color: #000000;
    }

    .section {
      margin-bottom: 1.5rem;
      page-break-inside: avoid;
    }
      @media screen and (max-width: 768px) {
  .contract-container {
    width: 100% !important;
    padding: 1rem !important;
    box-sizing: border-box !important;
  }
  
  .contract-title {
    font-size: 20pt !important;
  }
  
  .contract-subtitle {
    font-size: 12pt !important;
  }
  
  .signature-row {
    flex-direction: column !important;
  }
  
  .signature-column {
    width: 100% !important;
    margin-bottom: 2rem !important;
  }
}

/* Ensure PDF-specific styles are only applied when printing or generating PDFs */
@media print {
  .contract-container {
    width: 8.5in !important;
    padding: 1in 0.75in !important;
  }
  
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
}
  </style>
</head>
<body>
  <div class="contract-container">
    <div class="contract-header">
      <h1 class="contract-title">SERVICE AGREEMENT</h1>
      <p class="contract-text">This Agreement is made on <span class="editable" contenteditable="true">[Date]</span> between <span class="editable" contenteditable="true">[Client Name]</span> ("Client") and <span class="editable" contenteditable="true">[Service Provider]</span> ("Provider").</p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">1. SCOPE OF SERVICES</h2>
      <p class="contract-text editable" contenteditable="true">
        [Describe the services to be provided in detail, including deliverables, milestones, and timelines.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">2. PAYMENT TERMS</h2>
      <p class="contract-text editable" contenteditable="true">
        [Specify payment amount, schedule, method of payment, and any late payment penalties.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">3. TERM AND TERMINATION</h2>
      <p class="contract-text editable" contenteditable="true">
        [State the effective date, duration of the agreement, and conditions under which either party may terminate the agreement.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">4. CONFIDENTIALITY</h2>
      <p class="contract-text editable" contenteditable="true">
        [Detail confidentiality obligations, including the definition of confidential information and the duration of confidentiality requirements.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">5. INTELLECTUAL PROPERTY</h2>
      <p class="contract-text editable" contenteditable="true">
        [Specify ownership rights to work products, pre-existing materials, and licensing terms if applicable.]
      </p>
    </div>

    <div class="signature-block">
      <h2 class="contract-subtitle">6. SIGNATURES</h2>
      <p class="contract-text">IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.</p>
      
      <div class="signature-row">
        <div class="signature-column">
          <div class="signature-label">CLIENT:</div>
          <div id="client-signature-canvas"></div>
          <p class="signature-name editable" contenteditable="true">[Client Name]</p>
        </div>
        
        <div class="signature-column">
          <div class="signature-label">PROVIDER:</div>
          <div id="provider-signature-canvas"></div>
          <p class="signature-name editable" contenteditable="true">[Provider Name]</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  
  "service-agreement-modern": {
    id: "service-agreement-modern",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modern Service Agreement</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #000000;
      background-color: #ffffff;
    }
    
    .contract-container {
      width: 8.5in;
      padding: 1in 0.75in;
      box-sizing: border-box;
      background-color: #ffffff;
      line-height: 1.6;
    }

    .contract-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #3b82f6;
    }

    .contract-title {
      font-size: 26pt;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #000000;
    }

    .contract-subtitle {
      font-size: 14pt;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem;
      color: #000000;
      border-left: 4px solid #3b82f6;
      padding-left: 0.5rem;
    }

    .contract-text {
      margin-bottom: 1rem;
      font-size: 11pt;
      color: #000000;
    }

    .editable {
      display: inline-block;
      min-width: 100px;
      padding: 0.25rem 0.5rem;
      border-bottom: 1px dashed #3b82f6;
      color: #000000;
      background-color: #ffffff;
    }

    .signature-block {
      margin-top: 2rem;
      page-break-inside: avoid;
      background-color: #f8fafc;
      padding: 1rem;
    }

    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }

    .signature-column {
      width: 45%;
      padding: 1rem;
      background-color: #ffffff;
    }

    .signature-label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #000000;
    }

    #client-signature-canvas, 
    #provider-signature-canvas {
      width: 100%;
      height: 80px;
      border-bottom: 1px solid #000000;
      margin-bottom: 0.5rem;
      background-color: #ffffff;
    }

    .signature-name {
      font-weight: 600;
      color: #000000;
    }

    .section {
      margin-bottom: 1.5rem;
      page-break-inside: avoid;
    }
      @media screen and (max-width: 768px) {
  .contract-container {
    width: 100% !important;
    padding: 1rem !important;
    box-sizing: border-box !important;
  }
  
  .contract-title {
    font-size: 20pt !important;
  }
  
  .contract-subtitle {
    font-size: 12pt !important;
  }
  
  .signature-row {
    flex-direction: column !important;
  }
  
  .signature-column {
    width: 100% !important;
    margin-bottom: 2rem !important;
  }
}

/* Ensure PDF-specific styles are only applied when printing or generating PDFs */
@media print {
  .contract-container {
    width: 8.5in !important;
    padding: 1in 0.75in !important;
  }
  
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
}
  </style>
</head>
<body>
  <div class="contract-container">
    <div class="contract-header">
      <h1 class="contract-title">SERVICE AGREEMENT</h1>
      <p class="contract-text">This Agreement is made on <span class="editable" contenteditable="true">[Date]</span> between <span class="editable" contenteditable="true">[Client Name]</span> ("Client") and <span class="editable" contenteditable="true">[Service Provider]</span> ("Provider").</p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">1. SCOPE OF SERVICES</h2>
      <p class="contract-text editable" contenteditable="true">
        [Describe the services to be provided in detail, including deliverables, milestones, and timelines.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">2. PAYMENT TERMS</h2>
      <p class="contract-text editable" contenteditable="true">
        [Specify payment amount, schedule, method of payment, and any late payment penalties.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">3. TERM AND TERMINATION</h2>
      <p class="contract-text editable" contenteditable="true">
        [State the effective date, duration of the agreement, and conditions under which either party may terminate the agreement.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">4. CONFIDENTIALITY</h2>
      <p class="contract-text editable" contenteditable="true">
        [Detail confidentiality obligations, including the definition of confidential information and the duration of confidentiality requirements.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">5. INTELLECTUAL PROPERTY</h2>
      <p class="contract-text editable" contenteditable="true">
        [Specify ownership rights to work products, pre-existing materials, and licensing terms if applicable.]
      </p>
    </div>

    <div class="signature-block">
      <h2 class="contract-subtitle">6. SIGNATURES</h2>
      <p class="contract-text">IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.</p>
      
      <div class="signature-row">
        <div class="signature-column">
          <div class="signature-label">CLIENT:</div>
          <div id="client-signature-canvas"></div>
          <p class="signature-name editable" contenteditable="true">[Client Name]</p>
        </div>
        
        <div class="signature-column">
          <div class="signature-label">PROVIDER:</div>
          <div id="provider-signature-canvas"></div>
          <p class="signature-name editable" contenteditable="true">[Provider Name]</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  
  "service-agreement-minimal": {
    id: "service-agreement-minimal",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Minimalist Service Agreement</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      color: #000000;
      background-color: #ffffff;
    }
    
    .contract-container {
      width: 8.5in;
      padding: 1in 0.75in;
      box-sizing: border-box;
      background-color: #ffffff;
      line-height: 1.5;
    }

    .contract-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .contract-title {
      font-size: 24pt;
      font-weight: normal;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #000000;
    }

    .contract-subtitle {
      font-size: 14pt;
      font-weight: normal;
      margin: 2rem 0 1rem;
      color: #000000;
      border-bottom: 1px solid #000000;
      padding-bottom: 0.5rem;
    }

    .contract-text {
      margin-bottom: 1rem;
      font-size: 11pt;
      color: #000000;
    }

    .editable {
      display: inline-block;
      min-width: 100px;
      padding: 0.25rem 0;
      border-bottom: 1px solid #000000;
      color: #000000;
      background-color: #ffffff;
    }

    .signature-block {
      margin-top: 3rem;
      page-break-inside: avoid;
    }

    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 3rem;
    }

    .signature-column {
      width: 45%;
    }

    .signature-label {
      font-weight: normal;
      margin-bottom: 0.5rem;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 10pt;
    }

    #client-signature-canvas, 
    #provider-signature-canvas {
      width: 100%;
      height: 80px;
      border-bottom: 1px solid #000000;
      margin-bottom: 0.5rem;
      background-color: #ffffff;
    }

    .signature-name {
      font-weight: normal;
      color: #000000;
    }

    .section {
      margin-bottom: 2rem;
      page-break-inside: avoid;
    }

    @media screen and (max-width: 768px) {
  .contract-container {
    width: 100% !important;
    padding: 1rem !important;
    box-sizing: border-box !important;
  }
  
  .contract-title {
    font-size: 20pt !important;
  }
  
  .contract-subtitle {
    font-size: 12pt !important;
  }
  
  .signature-row {
    flex-direction: column !important;
  }
  
  .signature-column {
    width: 100% !important;
    margin-bottom: 2rem !important;
  }
}

/* Ensure PDF-specific styles are only applied when printing or generating PDFs */
@media print {
  .contract-container {
    width: 8.5in !important;
    padding: 1in 0.75in !important;
  }
  
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
}
  </style>
</head>
<body>
  <div class="contract-container">
    <div class="contract-header">
      <h1 class="contract-title">SERVICE AGREEMENT</h1>
      <p class="contract-text">This Agreement is made on <span class="editable" contenteditable="true">[Date]</span> between <span class="editable" contenteditable="true">[Client Name]</span> ("Client") and <span class="editable" contenteditable="true">[Service Provider]</span> ("Provider").</p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">1. SCOPE OF SERVICES</h2>
      <p class="contract-text editable" contenteditable="true">
        [Describe the services to be provided in detail, including deliverables, milestones, and timelines.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">2. PAYMENT TERMS</h2>
      <p class="contract-text editable" contenteditable="true">
        [Specify payment amount, schedule, method of payment, and any late payment penalties.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">3. TERM AND TERMINATION</h2>
      <p class="contract-text editable" contenteditable="true">
        [State the effective date, duration of the agreement, and conditions under which either party may terminate the agreement.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">4. CONFIDENTIALITY</h2>
      <p class="contract-text editable" contenteditable="true">
        [Detail confidentiality obligations, including the definition of confidential information and the duration of confidentiality requirements.]
      </p>
    </div>

    <div class="section">
      <h2 class="contract-subtitle">5. INTELLECTUAL PROPERTY</h2>
      <p class="contract-text editable" contenteditable="true">
        [Specify ownership rights to work products, pre-existing materials, and licensing terms if applicable.]
      </p>
    </div>

    <div class="signature-block">
      <h2 class="contract-subtitle">6. SIGNATURES</h2>
      <p class="contract-text">IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.</p>
      
      <div class="signature-row">
        <div class="signature-column">
          <div class="signature-label">CLIENT:</div>
          <div id="client-signature-canvas"></div>
          <p class="signature-name editable" contenteditable="true">[Client Name]</p>
        </div>
        
        <div class="signature-column">
          <div class="signature-label">PROVIDER:</div>
          <div id="provider-signature-canvas"></div>
          <p class="signature-name editable" contenteditable="true">[Provider Name]</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  }
};
