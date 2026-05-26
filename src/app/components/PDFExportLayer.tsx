import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Slide } from "../utils/markdown-parser";
import { DesignSystem } from "../types/design-system";
import { TEMPLATE_REGISTRY } from "../types/slide-template";
import { parseTemplateData } from "../utils/template-parser";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";

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
  const [idx, setIdx] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<jsPDF | null>(null);

  if (!pdfRef.current) {
    pdfRef.current = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [1440, 810],
    });
  }

  useEffect(() => {
    if (idx >= slides.length) return;

    const capture = async () => {
      try {
        await document.fonts.ready;
        // Wait for layout to fully settle (fonts swap, images, etc.)
        await new Promise((r) => setTimeout(r, 600));

        const el = slideRef.current;
        if (!el) throw new Error("Slide element not found");

        const canvas = await toCanvas(el, {
          width: 1920,
          height: 1080,
          // Embed all fonts and resources into the SVG
          skipFonts: false,
          pixelRatio: 1,
        });

        const pdf = pdfRef.current!;
        const imgData = canvas.toDataURL("image/png");

        if (idx > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, 1440, 810);

        setIdx((i) => i + 1);
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    capture();
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // All slides captured — save PDF
  useEffect(() => {
    if (idx === 0 || idx < slides.length) return;
    pdfRef.current!.save(`${projectName}.pdf`);
    onDone();
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const slide = slides[idx] ?? slides[slides.length - 1];
  const templateDef = slide?.templateId ? TEMPLATE_REGISTRY[slide.templateId] : null;

  return createPortal(
    // Render off-screen but NOT clipped by viewport.
    // html-to-image uses virtual SVG rendering so viewport size doesn't matter,
    // but the element must be in the DOM and not display:none.
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "-9999px",
        width: 1920,
        height: 1080,
        overflow: "visible",
        zIndex: -1,
      }}
    >
      <div
        ref={slideRef}
        style={{ width: 1920, height: 1080, overflow: "hidden", position: "relative" }}
      >
        {templateDef ? (
          (() => {
            const TemplateComponent = templateDef.component;
            const data = parseTemplateData(slide.templateId!, slide, slide.content, {
          accent: designSystem.colors.accent,
          primary: designSystem.colors.primary,
        });
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
    </div>,
    document.body
  );
}
