import React, { useState, useRef, useEffect } from 'react';
import { SECT_ICON_OPTIONS, SectIconOption } from '../types/thatTuyetBang';
import { SectIcon } from './SectIcon';
import { Sparkles, ChevronDown } from 'lucide-react';

interface SectIconPickerProps {
  value: string;
  onChange: (iconUrlOrEmoji: string, sectNameHint?: string) => void;
  sectName?: string;
  className?: string;
}

export const SectIconPicker: React.FC<SectIconPickerProps> = ({
  value,
  onChange,
  sectName,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const imageOptions = SECT_ICON_OPTIONS.filter((opt) => opt.type === 'image');
  const emojiOptions = SECT_ICON_OPTIONS.filter((opt) => opt.type === 'emoji');

  const handleSelect = (option: SectIconOption) => {
    onChange(option.url, option.name.split(' ')[0]);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (customInput.trim()) {
      onChange(customInput.trim());
      setCustomInput('');
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 bg-slate-950/90 hover:bg-slate-900 border border-white/20 hover:border-amber-400/60 rounded-lg p-1.5 transition-all shadow-sm group min-w-[42px] h-[34px]"
        title="Chọn Icon Lưu Phái (Nghịch Thủy Hàn & Emoji)"
      >
        <SectIcon icon={value} name={sectName} size="md" />
        <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-amber-300" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-slate-900 border border-amber-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
            <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Icon Nghịch Thủy Hàn</span>
            </span>
            <span className="text-[10px] text-slate-400">7 Lưu Phái</span>
          </div>

          {/* Official Sect WebP Icons */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 mb-1.5">
              Icon Phái (HD WebP):
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {imageOptions.map((opt) => {
                const isSelected = value === opt.url;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-950/60 border-white/10 hover:bg-slate-800/80 hover:border-white/25'
                    }`}
                    title={opt.name}
                  >
                    <img
                      src={opt.url}
                      alt={opt.name}
                      className="w-7 h-7 object-contain drop-shadow"
                    />
                    <span className="text-[9px] font-bold text-slate-300 truncate w-full text-center mt-1">
                      {opt.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Martial Arts Emojis */}
          <div className="mb-2.5">
            <div className="text-[10px] font-bold text-slate-400 mb-1.5">
              Biểu Tượng Emoji:
            </div>
            <div className="grid grid-cols-6 gap-1">
              {emojiOptions.map((opt) => {
                const isSelected = value === opt.url;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`p-1.5 rounded-lg border text-base flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400'
                        : 'bg-slate-950/60 border-white/10 hover:bg-slate-800'
                    }`}
                    title={opt.name}
                  >
                    <span>{opt.url}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Input */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Nhập emoji hoặc URL..."
              className="flex-1 bg-slate-950/80 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyCustom();
                }
              }}
            />
            <button
              type="button"
              onClick={handleApplyCustom}
              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10px] transition-colors shrink-0"
            >
              Chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
