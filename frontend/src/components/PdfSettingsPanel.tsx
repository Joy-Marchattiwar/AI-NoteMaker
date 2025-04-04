// PdfSettingsPanel.tsx
import React from "react";

interface PdfSettings {
  lineSpacing: number;
  pageBreaks: boolean;
  fontSize: number;
  margins: number;
  showPageNumbers: boolean;
}

interface PdfSettingsPanelProps {
  settings: PdfSettings;
  onSettingsChange: (settings: PdfSettings) => void;
}

export const PdfSettingsPanel = React.memo(({
  settings,
  onSettingsChange
}: PdfSettingsPanelProps) => {
  const handleChange = (
    key: keyof PdfSettings,
    value: string | number | boolean
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <h3 className="text-lg font-medium mb-3">PDF Export Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Line Spacing
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={settings.lineSpacing}
            onChange={(e) => handleChange("lineSpacing", parseFloat(e.target.value))}
          >
            <option value="1">Single</option>
            <option value="1.15">Narrow</option>
            <option value="1.5">1.5 lines</option>
            <option value="2">Double</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Size
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={settings.fontSize}
            onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
          >
            <option value="10">Small (10pt)</option>
            <option value="12">Normal (12pt)</option>
            <option value="14">Large (14pt)</option>
            <option value="16">Extra Large (16pt)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Margins
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={settings.margins}
            onChange={(e) => handleChange("margins", parseInt(e.target.value))}
          >
            <option value="10">Narrow (10mm)</option>
            <option value="15">Normal (15mm)</option>
            <option value="25">Wide (25mm)</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="pageBreaks"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={settings.pageBreaks}
            onChange={(e) => handleChange("pageBreaks", e.target.checked)}
          />
          <label
            htmlFor="pageBreaks"
            className="ml-2 block text-sm text-gray-700"
          >
            Add page breaks at headings
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="showPageNumbers"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={settings.showPageNumbers}
            onChange={(e) => handleChange("showPageNumbers", e.target.checked)}
          />
          <label
            htmlFor="showPageNumbers"
            className="ml-2 block text-sm text-gray-700"
          >
            Show page numbers
          </label>
        </div>
      </div>
    </div>
  );
});