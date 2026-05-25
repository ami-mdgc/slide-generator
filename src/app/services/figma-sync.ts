import { DesignSystem } from "../types/design-system";

interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: string;
  valuesByMode: Record<string, any>;
}

interface FigmaFileVariables {
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, any>;
  };
}

interface FigmaStyle {
  key: string;
  name: string;
  styleType: string;
  description?: string;
}

export class FigmaDesignSystemSync {
  private fileKey: string;
  private accessToken: string;

  constructor(fileKey: string, accessToken: string) {
    this.fileKey = fileKey;
    this.accessToken = accessToken;
  }

  private async fetchFigmaAPI(endpoint: string): Promise<any> {
    const url = `https://api.figma.com/v1/${endpoint}`;
    console.log('Fetching Figma API:', url);
    console.log('Token starts with:', this.accessToken.substring(0, 5) + '...');

    try {
      const response = await fetch(url, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Figma API Error Response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        if (response.status === 403) {
          // Check if error mentions required scope
          if (errorText.includes('file_variables:read')) {
            throw new Error(
              `必要なスコープが不足しています (403)。\n` +
              `トークン作成時に「File variables」スコープを選択してください。`
            );
          }
          throw new Error(
            `アクセス権限がありません (403)。\n` +
            `アクセストークンに必要なスコープ（File variables）が付与されているか確認してください。`
          );
        } else if (response.status === 404) {
          throw new Error(
            `ファイルが見つかりません (404)。\n` +
            `ファイルキーが正しいか確認してください。`
          );
        } else {
          throw new Error(`Figma APIエラー (${response.status}): ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error) {
      // CORS error or network error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          `ネットワークエラーまたはCORS制限が発生しました。\n\n` +
          `Figma APIはブラウザからの直接アクセスに制限があります。\n` +
          `この機能を使用するには、バックエンドプロキシサーバーが必要です。\n\n` +
          `詳細は開発者コンソールを確認してください。`
        );
      }
      throw error;
    }
  }

  async getVariables(): Promise<FigmaFileVariables> {
    return this.fetchFigmaAPI(`files/${this.fileKey}/variables/local`);
  }

  async getStyles(): Promise<{ meta: { styles: FigmaStyle[] } }> {
    return this.fetchFigmaAPI(`files/${this.fileKey}/styles`);
  }

  async getFile(): Promise<any> {
    return this.fetchFigmaAPI(`files/${this.fileKey}`);
  }

  async syncDesignSystem(): Promise<DesignSystem> {
    let variablesError: Error | null = null;
    let fileError: Error | null = null;

    // Try Variables API first (requires file_variables:read)
    try {
      console.log('🔍 Trying Variables API...');
      const variablesData = await this.getVariables();
      const stylesData = await this.getStyles();
      const designSystem = this.parseDesignSystem(variablesData, stylesData);
      console.log('✅ Successfully synced using Variables API');
      return designSystem;
    } catch (varError) {
      variablesError = varError instanceof Error ? varError : new Error(String(varError));
      console.warn('⚠️ Variables API failed:', variablesError.message);
    }

    // Fallback to File API (requires file_content:read)
    try {
      console.log('🔍 Trying File API as fallback...');
      const fileData = await this.getFile();
      const designSystem = this.parseDesignSystemFromFile(fileData);
      console.log('✅ Successfully synced using File API (styles)');
      return designSystem;
    } catch (fileErr) {
      fileError = fileErr instanceof Error ? fileErr : new Error(String(fileErr));
      console.error('❌ File API also failed:', fileError.message);
    }

    // Both methods failed
    console.error('❌ All sync methods failed');
    throw new Error(
      `Figma同期に失敗しました。\n\n` +
      `Variables API: ${variablesError?.message || '不明なエラー'}\n` +
      `File API: ${fileError?.message || '不明なエラー'}\n\n` +
      `必要なスコープ:\n` +
      `- 有料プラン: "File variables" (file_variables:read)\n` +
      `- 無料プラン: "File content" (file_content:read)\n\n` +
      `どちらか1つのスコープが付与されたトークンを使用してください。`
    );
  }

  private parseDesignSystem(
    variablesData: FigmaFileVariables,
    stylesData: { meta: { styles: FigmaStyle[] } }
  ): DesignSystem {
    const variables = variablesData.meta.variables;
    const colors: Record<string, string> = {};

    // Parse color variables
    Object.values(variables).forEach((variable) => {
      if (variable.resolvedType === 'COLOR') {
        const name = variable.name.toLowerCase().replace(/\s+/g, '');
        const modeId = Object.keys(variable.valuesByMode)[0];
        const colorValue = variable.valuesByMode[modeId];

        // Convert Figma color format (0-1 range) to hex
        if (colorValue && typeof colorValue === 'object' && 'r' in colorValue) {
          const hex = this.rgbaToHex(
            colorValue.r,
            colorValue.g,
            colorValue.b,
            colorValue.a || 1
          );

          // Map to design system color keys
          if (name.includes('primary')) {
            colors.primary = hex;
          } else if (name.includes('secondary')) {
            colors.secondary = hex;
          } else if (name.includes('background')) {
            colors.background = hex;
          } else if (name.includes('text')) {
            colors.text = hex;
          } else if (name.includes('accent')) {
            colors.accent = hex;
          }
        }
      }
    });

    // Create design system object
    const designSystem: DesignSystem = {
      id: `figma-${this.fileKey}`,
      name: 'Figma同期デザインシステム',
      colors: {
        primary: colors.primary || '#1e40af',
        secondary: colors.secondary || '#64748b',
        background: colors.background || '#ffffff',
        text: colors.text || '#1e293b',
        accent: colors.accent || '#3b82f6',
      },
      fonts: {
        heading: 'system-ui, sans-serif',
        body: 'system-ui, sans-serif',
      },
      layout: {
        titleAlignment: 'left',
        contentPadding: 'normal',
      },
    };

    return designSystem;
  }

  private rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  private parseDesignSystemFromFile(fileData: any): DesignSystem {
    console.log('Parsing design system from File API...');
    const colors: Record<string, string> = {};
    const typography: any = {};
    const spacing: any = {};

    // Parse color styles from the file
    if (fileData.styles) {
      Object.values(fileData.styles).forEach((style: any) => {
        if (style.styleType === 'FILL' && style.name) {
          const name = style.name.toLowerCase().replace(/\s+/g, '');

          // Try to get color from style
          if (style.fills && style.fills.length > 0) {
            const fill = style.fills[0];
            if (fill.type === 'SOLID' && fill.color) {
              const hex = this.rgbaToHex(
                fill.color.r,
                fill.color.g,
                fill.color.b,
                fill.color.a || 1
              );

              // Map style names to color keys
              if (name.includes('primary')) {
                colors.primary = hex;
              } else if (name.includes('secondary')) {
                colors.secondary = hex;
              } else if (name.includes('background')) {
                colors.background = hex;
              } else if (name.includes('text')) {
                colors.text = hex;
              } else if (name.includes('accent')) {
                colors.accent = hex;
              }
            }
          }
        }

        // Parse text styles
        if (style.styleType === 'TEXT' && style.name) {
          const name = style.name.toLowerCase().replace(/\s+/g, '');

          if (style.fontSize) {
            if (name.includes('h1') || name.includes('heading1')) {
              typography.h1Size = style.fontSize;
              typography.h1Weight = style.fontWeight;
            } else if (name.includes('h2') || name.includes('heading2')) {
              typography.h2Size = style.fontSize;
              typography.h2Weight = style.fontWeight;
            } else if (name.includes('h3') || name.includes('heading3')) {
              typography.h3Size = style.fontSize;
              typography.h3Weight = style.fontWeight;
            } else if (name.includes('body') || name.includes('paragraph')) {
              typography.bodySize = style.fontSize;
            }
          }

          if (style.lineHeightPx && !typography.lineHeight) {
            typography.lineHeight = style.lineHeightPx / style.fontSize;
          }
        }
      });
    }

    // Also check document for color styles and spacing
    if (fileData.document && fileData.document.children) {
      this.extractColorsFromNodes(fileData.document.children, colors);
      this.extractSpacingFromNodes(fileData.document.children, spacing);
    }

    console.log('Extracted from file:', { colors, typography, spacing });

    const designSystem: DesignSystem = {
      id: `figma-${this.fileKey}`,
      name: 'Figma同期デザインシステム（スタイル）',
      colors: {
        primary: colors.primary || '#1e40af',
        secondary: colors.secondary || '#64748b',
        background: colors.background || '#ffffff',
        text: colors.text || '#1e293b',
        accent: colors.accent || '#3b82f6',
      },
      fonts: {
        heading: 'system-ui, sans-serif',
        body: 'system-ui, sans-serif',
      },
      typography: Object.keys(typography).length > 0 ? typography : undefined,
      spacing: Object.keys(spacing).length > 0 ? spacing : undefined,
      layout: {
        titleAlignment: 'left',
        contentPadding: 'normal',
      },
    };

    return designSystem;
  }

  private extractColorsFromNodes(nodes: any[], colors: Record<string, string>) {
    nodes.forEach((node) => {
      // Check if node has fills
      if (node.fills && Array.isArray(node.fills)) {
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color && node.name) {
            const name = node.name.toLowerCase().replace(/\s+/g, '');
            const hex = this.rgbaToHex(
              fill.color.r,
              fill.color.g,
              fill.color.b,
              fill.color.a || 1
            );

            if (name.includes('primary') && !colors.primary) {
              colors.primary = hex;
            } else if (name.includes('secondary') && !colors.secondary) {
              colors.secondary = hex;
            } else if (name.includes('background') && !colors.background) {
              colors.background = hex;
            } else if (name.includes('text') && !colors.text) {
              colors.text = hex;
            } else if (name.includes('accent') && !colors.accent) {
              colors.accent = hex;
            }
          }
        });
      }

      // Recursively check children
      if (node.children && Array.isArray(node.children)) {
        this.extractColorsFromNodes(node.children, colors);
      }
    });
  }

  private extractSpacingFromNodes(nodes: any[], spacing: Record<string, number>) {
    nodes.forEach((node) => {
      if (node.name) {
        const name = node.name.toLowerCase().replace(/\s+/g, '');

        // Look for spacing/padding indicators in frame names
        if (name.includes('slide') || name.includes('template')) {
          if (node.paddingTop && !spacing.slideTop) {
            spacing.slideTop = node.paddingTop;
          }
          if (node.paddingBottom && !spacing.slideBottom) {
            spacing.slideBottom = node.paddingBottom;
          }
          if (node.paddingLeft && !spacing.slideLeft) {
            spacing.slideLeft = node.paddingLeft;
          }
          if (node.paddingRight && !spacing.slideRight) {
            spacing.slideRight = node.paddingRight;
          }
          if (node.itemSpacing && !spacing.contentGap) {
            spacing.contentGap = node.itemSpacing;
          }
        }

        // Look for list spacing
        if (name.includes('list') && node.itemSpacing && !spacing.listItemGap) {
          spacing.listItemGap = node.itemSpacing;
        }
      }

      // Recursively check children
      if (node.children && Array.isArray(node.children)) {
        this.extractSpacingFromNodes(node.children, spacing);
      }
    });
  }
}

// Helper function to extract file key from Figma URL
export function extractFileKeyFromUrl(url: string): string | null {
  // Support multiple URL patterns:
  // - https://www.figma.com/file/FILE_KEY/...
  // - https://www.figma.com/design/FILE_KEY/...
  // - https://figma.com/file/FILE_KEY/...
  // File key can contain alphanumeric, hyphens, and underscores
  const patterns = [
    /figma\.com\/(?:file|design)\/([a-zA-Z0-9_-]+)/,
    /figma\.com\/([a-zA-Z0-9_-]{22,})/  // Direct file key (22+ chars)
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
