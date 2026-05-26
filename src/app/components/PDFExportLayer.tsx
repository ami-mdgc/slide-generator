import { useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Slide } from "../utils/markdown-parser";
import { DesignSystem } from "../types/design-system";
import { TEMPLATE_REGISTRY } from "../types/slide-template";
import { parseTemplateData } from "../utils/template-parser";

const SLIDE_W = 1920;
const SLIDE_H = 1080;
const PDF_W_MM = 254;
const PDF_H_MM = 142.875;

interface PDFExportLayerProps {
  slides: Slide[];
  projectName: string;
  designSystem: DesignSystem;
  onDone: () => void;
  onError: (err: Error) => void;
}

export function PDFExportLayer({
  slides,
  projectName,
  designSystem,
  onDone,
  onError,
}: PDFExportLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      if (!containerRef.current) return;

      // Wait for all fonts (including Gen Interface JP) to finish loading.
      // Rendering the slides above already triggered font requests.
      await document.fonts.ready;

      // Extra buffer for layout and any async font measurement
      await new Promise<void>((r) => setTimeout(r, 500));

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [PDF_W_MM, PDF_H_MM],
      });

      const children = Array.from(containerRef.current.children) as HTMLElement[];

      for (let i = 0; i < children.length; i++) {
        const slideEl = children[i];

        const canvas = await html2canvas(slideEl, {
          width: SLIDE_W,
          height: SLIDE_H,
          // Tell html2canvas the "window" matches the slide design size
          windowWidth: SLIDE_W,
          windowHeight: SLIDE_H,
          scale: 0.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        if (i > 0) pdf.addPage([PDF_W_MM, PDF_H_MM], "landscape");
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.92),
          "JPEG",
          0,
          0,
          PDF_W_MM,
          PDF_H_MM
        );
      }

      pdf.save(`${projectName}.pdf`);
    };

    run().then(onDone).catch(onError);
  }, []);

  return (
    // Rendered inside the React tree so Tailwind CSS + custom properties apply.
    // z-index: -1 keeps it invisible behind the solid app background.
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: "none",
        width: SLIDE_W,
      }}
    >
      {slides.map((slide) => {
        const templateDef = slide.templateId
          ? TEMPLATE_REGISTRY[slide.templateId]
          : null;

        return (
          <div
            key={slide.id}
            style={{
              width: SLIDE_W,
              height: SLIDE_H,
              overflow: "hidden",
              background: "#ffffff",
              position: "relative",
            }}
          >
            {templateDef ? (
              (() => {
                const TemplateComponent = templateDef.component;
                const data = parseTemplateData(
                  slide.templateId!,
                  slide,
                  slide.content
                );
                return <TemplateComponent data={data} />;
              })()
            ) : (
              <div
                style={{
                  padding: "80px 96px",
                  fontFamily: "'Gen Interface JP', sans-serif",
                  fontSize: 36,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  boxSizing: "border-box",
                  width: "100%",
                  height: "100%",
                  backgroundColor: designSystem.colors.background || "#ffffff",
                  color: designSystem.colors.text || "#1e293b",
                }}
              >
                {slide.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
