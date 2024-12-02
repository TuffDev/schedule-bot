import { motion } from "framer-motion";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p>
          This is an AI-powered scheduling assistant that helps you schedule
          time with our team. Simply chat with the bot about your scheduling
          needs, and it will help you find available time slots and schedule
          events.
        </p>
        <p>
          Try asking questions like:
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>"When are you free tomorrow afternoon?"</li>
            <li>"I need help with my lawn!"</li>
            <li>"Are there any available times this week?"</li>
          </ul>
        </p>
      </div>
    </motion.div>
  );
};
