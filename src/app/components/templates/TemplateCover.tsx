import { SlideTemplateData } from "../../types/slide-template";

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
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[10px]" style={{ backgroundColor: primary }} />


      {/* Main content */}
      <div className="absolute inset-0 flex flex-col justify-center pl-[96px] pr-[480px]">
        {data.subtitle && (
          <p className="font-['Gen_Interface_JP_Display:SemiBold',sans-serif] text-[36px] leading-normal mb-[16px] not-italic" style={{ color: accent }}>
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
      <div className="absolute bottom-[80px] left-[96px] right-[96px] h-[1px] bg-[#18191e] opacity-10" />
    </div>
  );
}
