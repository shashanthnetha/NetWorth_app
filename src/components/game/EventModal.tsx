'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../engine/gameStore';
import GlowButton from '../ui/GlowButton';

export default function EventModal() {
  const show = useGameStore((s) => s.ui.showEventModal);
  const event = useGameStore((s) => s.pendingEvent);
  const handleChoice = useGameStore((s) => s.handleEventChoice);
  const dismiss = useGameStore((s) => s.dismissEvent);

  if (!event) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={event.choices ? undefined : dismiss}
          />
          <motion.div
            className="relative w-full max-w-[400px] bg-[#111827] border border-white/10 rounded-3xl p-6 overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Event Header */}
            <div className="text-center mb-5">
              <motion.span
                className="text-5xl block mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              >
                {event.icon}
              </motion.span>
              <h3 className="font-heading text-xl font-bold text-gray-100">{event.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{event.description}</p>
            </div>

            {/* Choices */}
            {event.choices && event.choices.length > 0 ? (
              <div className="space-y-3">
                {event.choices.map((choice, i) => (
                  <GlowButton
                    key={i}
                    variant={i === 0 ? 'primary' : 'ghost'}
                    fullWidth
                    onClick={() => handleChoice(i)}
                  >
                    <div className="text-left w-full">
                      <p className="font-semibold text-sm">{choice.label}</p>
                      <p className="text-xs opacity-60 mt-0.5">{choice.description}</p>
                    </div>
                  </GlowButton>
                ))}
              </div>
            ) : (
              <GlowButton variant="primary" fullWidth onClick={dismiss}>
                OK
              </GlowButton>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
