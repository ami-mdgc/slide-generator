import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createElement } from "react";
import { Slide } from "./markdown-parser";
import { DesignSystem } from "../types/design-system";
import { TEMPLATE_REGISTRY } from "../types/slide-template";
import { parseTemplateData } from "./template-parser";

const SLIDE_W = 1920;
const SLIDE_H = 1080;
// PDF page size: 16:9 at standard 10" width
const PDF_W_MM = 254;
const PDF_H_MM = 142.875;

async function renderSlideToCanvas(
  slide: Slide,
  designSystem: DesignSystem
): Promise<HTMLCanvasElement> {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: -${SLIDE_W + 100}px;
    width: ${SLIDE_W}px;
    height: ${SLIDE_H}px;
    overflow: hidden;
    background: #ffffff;
    font-family: 'Gen Interface JP', sans-serif;
  `;
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    if (slide.templateId && TEMPLATE_REGISTRY[slide.templateId]) {
      const template = TEMPLATE_REGISTRY[slide.templateId];
      const TemplateComponent = template.component;
      const data = parseTemplateData(slide.templateId, slide, slide.content);
      root.render(createElement(TemplateComponent, { data }));
    } else {
      // Basic fallback for untyped slides
      root.render(
        createElement(
          "div",
          {
            style: {
              padding: "80px 96px",
              fontFamily: "'Gen Interface JP', sans-serif",
              backgroundColor: designSystem.colors.background || "#ffffff",
              color: designSystem.colors.text || "#1e293b",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              fontSize: "36px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            },
          },
          slide.content
        )
      );
    }

    // Wait for React render + any layout
    await new Promise<void>((r) => {
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)));
    });

    return await html2canvas(container, {
      width: SLIDE_W,
      height: SLIDE_H,
      scale: 0.5, // Capture at 960×540 for reasonable file size
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

export async function exportToPDF(
  slides: Slide[],
  projectName: string,
  designSystem: DesignSystem,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [PDF_W_MM, PDF_H_MM],
  });

  for (let i = 0; i < slides.length; i++) {
    onProgress?.(i + 1, slides.length);

    const canvas = await renderSlideToCanvas(slides[i], designSystem);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    if (i > 0) pdf.addPage([PDF_W_MM, PDF_H_MM], "landscape");
    pdf.addImage(imgData, "JPEG", 0, 0, PDF_W_MM, PDF_H_MM);
  }

  pdf.save(`${projectName}.pdf`);
}
