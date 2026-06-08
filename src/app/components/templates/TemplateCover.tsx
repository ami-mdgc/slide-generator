import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface TemplateCoverData extends SlideTemplateData {
  title: string;
  subtitle?: string;
  date?: string;
  colors?: { accent: string; primary: string };
}

export default function TemplateCover({ data }: { data: TemplateCoverData }) {
  const accent = data.colors?.accent || '#c4ab46';
  const primary = data.colors?.primary || '#5969a7';

  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="templateCover">
      {/* Left accent bar — スライド端の装飾なのでSafeArea外 */}
      <div className="absolute left-0 top-0 bottom-0 w-[10px]" style={{ backgroundColor: primary }} />

      <SafeArea>
        {/* Main content */}
        <div className="absolute inset-0 flex flex-col justify-center pr-[384px]">
          {data.subtitle && (
            <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] text-[40px] leading-normal mb-[8px] not-italic" style={{ color: accent }}>
              {data.subtitle}
            </p>
          )}
          <h1 className="font-['Gen_Interface_JP_Display:Medium',sans-serif] text-[#18191e] text-[88px] leading-[1.2] mb-[56px] not-italic [word-break:break-word]">
            {data.title}
          </h1>
          {data.date && (
            <p className="font-['Gen_Interface_JP_Display:Regular',sans-serif] text-[#18191e] text-[32px] leading-normal not-italic opacity-60">
              {data.date}
            </p>
          )}
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#18191e] opacity-10" />
      </SafeArea>
    </div>
  );
}
