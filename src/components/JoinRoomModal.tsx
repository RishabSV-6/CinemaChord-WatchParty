import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, KeyRound, AlertCircle, User } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (code: string, userName: string) => void;
  initialCode?: string;
  defaultUserName?: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  initialCode = '',
  defaultUserName = '',
}) => {
  const [userName, setUserName] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedName = defaultUserName || localStorage.getItem('cinemachord_user_name') || '';
      setUserName(savedName);

      if (initialCode && initialCode.length === 6) {
        setDigits(initialCode.split(''));
      } else {
        setDigits(['', '', '', '', '', '']);
      }
      setError(null);

      setTimeout(() => {
        if (!savedName) {
          nameInputRef.current?.focus();
        } else if (!initialCode || initialCode.length < 6) {
          inputRefs.current[0]?.focus();
        }
      }, 60);
    }
  }, [isOpen, initialCode, defaultUserName]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    const char = value.slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    // Auto advance
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      submitCode();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const submitCode = (providedCode?: string) => {
    const trimmedName = userName.trim();
    if (!trimmedName) {
      setError('Please enter your name before joining the room.');
      nameInputRef.current?.focus();
      return;
    }

    const code = providedCode || digits.join('');
    if (code.length !== 6) {
      setError('Please enter a full 6-digit room code.');
      return;
    }

    try {
      localStorage.setItem('cinemachord_user_name', trimmedName);
    } catch {
      // ignore
    }

    onJoinRoom(code, trimmedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d0f12] border border-white/10 shadow-2xl p-6 sm:p-8 text-[#F7F5F0]">
        {/* Notebook Top Rule Accent */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-teal-500/60 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close join room dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F7F5F0]">
            Join Watch Party
          </h2>
        </div>
        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          Enter your name and the 6-digit party ID to jump straight into the live synchronized screening session.
        </p>

        {/* User Name Input (Mandatory) */}
        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 mb-1.5">
            <User className="w-3.5 h-3.5 text-teal-400" />
            <span>YOUR DISPLAY NAME</span>
            <span className="text-rose-400">*</span>
          </label>
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Enter your name (e.g. Maya S.)"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (digits.join('').length === 6) {
                  submitCode();
                } else {
                  inputRefs.current[0]?.focus();
                }
              }
            }}
            maxLength={32}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#14171d] border border-white/10 text-sm text-[#F7F5F0] placeholder:text-zinc-600 focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        {/* 6 Digit Room Key Section */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 mb-1.5">
            <KeyRound className="w-3.5 h-3.5 text-teal-400" />
            <span>6-DIGIT PARTY ID</span>
            <span className="text-rose-400">*</span>
          </label>
          <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-mono font-semibold bg-[#12151a] border border-white/10 rounded-xl text-teal-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-4 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Action */}
        <button
          onClick={() => submitCode()}
          className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-teal-400 hover:bg-teal-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
        >
          <span>Join Synchronized Party</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
