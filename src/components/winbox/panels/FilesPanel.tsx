import { Folder, File, HardDrive } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'directory' | 'rif' | 'txt' | 'backup';
  size: string;
  modified: string;
  isDir?: boolean;
}

const FILES: FileItem[] = [
  { name: 'flash', type: 'directory', size: '', modified: '2025-06-20 07:31:17', isDir: true },
  { name: 'flash/log.0.txt', type: 'txt', size: '13.3 KiB', modified: '2025-06-20 18:43:02' },
  { name: 'flash/log.1.txt', type: 'txt', size: '99.0 KiB', modified: '2025-06-20 10:47:18' },
  { name: 'flash/skins', type: 'directory', size: '', modified: '1970-01-01 03:00:00', isDir: true },
  { name: 'autosupout.old.rif', type: 'rif', size: '399.3 KiB', modified: '2025-05-06 13:59:19' },
  { name: 'autosupout.rif', type: 'rif', size: '394.0 KiB', modified: '2025-05-08 16:56:19' },
];

export function FilesPanel() {
  return (
    <div className="h-full flex flex-col bg-[#101E2D]">
      {/* Tabs */}
      <div className="flex border-b border-[#2A3F55] bg-[#1A2B3C]">
        {['File List', 'File', 'Cloud Backup'].map((t, i) => (
          <button
            key={t}
            className={`px-4 py-2 text-xs transition-colors ${
              i === 0 ? 'bg-[#101E2D] text-white border-b-2 border-[#1B6EBE]' : 'text-[#8BA3BF] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2A3F55]">
        <button className="px-2 py-0.5 bg-[#1B6EBE] hover:bg-[#1557A0] text-white rounded text-xs">+ New</button>
        <button className="px-2 py-0.5 bg-[#1A2B3C] border border-[#2A3F55] hover:bg-[#243549] text-[#8BA3BF] rounded text-xs">Remove</button>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Find..."
          className="px-2 py-0.5 bg-[#0D1B2A] border border-[#2A3F55] rounded text-xs text-[#C8D6E5] outline-none w-28"
        />
        <button className="px-2 py-0.5 bg-[#1A2B3C] border border-[#2A3F55] hover:bg-[#243549] text-[#8BA3BF] rounded text-xs">Filter</button>
      </div>

      {/* Table header */}
      <div className="grid text-xs text-[#4A90D9] bg-[#142030] border-b border-[#2A3F55]" style={{ gridTemplateColumns: '24px 1fr 80px 80px 160px' }}>
        {['', 'File Name', 'Type', 'Size', 'Last Modified'].map((h, i) => (
          <div key={i} className="px-2 py-1.5 font-medium">{h}</div>
        ))}
      </div>

      {/* Files */}
      <div className="flex-1 overflow-auto">
        {FILES.map((f, i) => (
          <div
            key={i}
            className="grid text-xs text-[#C8D6E5] border-b border-[#1A2B3C] hover:bg-[#1A2B3C] transition-colors items-center"
            style={{ gridTemplateColumns: '24px 1fr 80px 80px 160px' }}
          >
            <div className="px-2 py-1 flex items-center">
              {f.isDir ? (
                <Folder className="w-3 h-3 text-yellow-400" />
              ) : f.type === 'rif' ? (
                <HardDrive className="w-3 h-3 text-[#4A90D9]" />
              ) : (
                <File className="w-3 h-3 text-[#8BA3BF]" />
              )}
            </div>
            <div className="px-2 py-1 font-mono">{f.name}</div>
            <div className="px-2 py-1 text-[#8BA3BF]">{f.isDir ? 'disk' : f.type === 'txt' ? 'txt file' : f.type}</div>
            <div className="px-2 py-1 text-right pr-4">{f.size}</div>
            <div className="px-2 py-1 text-[#8BA3BF]">{f.modified}</div>
          </div>
        ))}
      </div>

      <div className="px-3 py-1 border-t border-[#2A3F55] text-[#4A90D9] text-xs">
        {FILES.length} items &nbsp;|&nbsp; 12.5 MiB of 16.0 MiB used &nbsp; 21% free
      </div>
    </div>
  );
}
