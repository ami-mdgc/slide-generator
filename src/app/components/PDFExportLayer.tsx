import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Slide } from "../utils/markdown-parser";
import { DesignSystem } from "../types/design-system";
import { TEMPLATE_REGISTRY } from "../types/slide-template";
import { parseTemplateData } from "../utils/template-parser";

interface PDFExportLayerProps {
  slides: Slide[];
  projectName: string;
  designSystem: DesignSystem;
  onDone: () => void;
  onError: (err: Error) => void;
}

export function PDFExportLayer({ slides, designSystem, onDone }: PDFExportLayerProps) {
  useEffect(() => {
    // Give React time to render all slides, then open print dialog
    const timer = setTimeout(() => window.print(), 600);

    const handleAfterPrint = () => onDone();
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onDone]);

  // Render as a portal directly into <body> so that
  // `body > *:not(#pdf-print-layer)` correctly hides the app root
  return createPortal(
    <div id="pdf-print-layer">
      {slides.map((slide) => {
        const templateDef = slide.templateId
          ? TEMPLATE_REGISTRY[slide.templateId]
          : null;

        return (
          <div key={slide.id} className="pdf-slide-page">
            <div className="pdf-slide-wrapper">
              <div className="pdf-slide-inner">
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
            </div>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
