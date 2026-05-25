export interface Slide {
  id: string;
  content: string;
  title?: string;
  templateId?: string;
  slideType?: string;
  metadata?: Record<string, any>;
}

export function parseMarkdownToSlides(markdown: string): Slide[] {
  // Extract frontmatter (YAML between ---) if present
  let metadata: Record<string, any> = {};
  let slideType: string | undefined;
  let contentWithoutFrontmatter = markdown;

  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split('\n');

    lines.forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key] = value.trim();

        if (key === 'slideType') {
          slideType = value.trim();
        }
      }
    });

    // Remove frontmatter from content
    contentWithoutFrontmatter = markdown.substring(frontmatterMatch[0].length);
  }

  // Split by horizontal rule (---) to create slides
  const slideContents = contentWithoutFrontmatter.split(/\n---\n|\n---$/);

  // If slideType is specified, assign template IDs based on order
  const templateMapping: Record<string, string[]> = {
    '月次総会': ['template01', 'template02', 'template03', 'template04', 'template05'],
  };

  const templates = slideType && templateMapping[slideType]
    ? templateMapping[slideType]
    : [];

  return slideContents
    .map((content, index) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return null;

      // Extract title from first heading if present
      const titleMatch = trimmedContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : `スライド ${index + 1}`;

      return {
        id: `slide-${index}`,
        content: trimmedContent,
        title,
        templateId: templates[index],
        slideType,
        metadata,
      };
    })
    .filter((slide): slide is Slide => slide !== null);
}

export function formatMarkdownContent(content: string): string {
  // Convert markdown to formatted HTML-like structure
  let formatted = content;

  // Convert headings
  formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^#### (.+)$/gm, '<h4>$1</h4>');

  // Convert bold
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Convert italic
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');

  // Convert lists
  formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  return formatted;
}
