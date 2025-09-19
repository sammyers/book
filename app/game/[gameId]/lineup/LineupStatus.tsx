import { Spinner } from "@heroui/spinner";
import { CheckIcon, ClockIcon, PencilLineIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

import { useLineupStatus } from "./context";

import type { ReactNode } from "react";

const containerVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

const iconVariants = {
  initial: { rotate: -90, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 90, opacity: 0 },
};

const transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

interface StatusContainerProps {
  containerKey: string;
  className?: string;
  children: ReactNode;
}

function StatusContainer({ containerKey, className, children }: StatusContainerProps) {
  return (
    <motion.div
      key={containerKey}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className={`absolute inset-0 flex items-center justify-center ${className || ""}`}
    >
      {children}
    </motion.div>
  );
}

interface IconWrapperProps {
  children: ReactNode;
}

function IconWrapper({ children }: IconWrapperProps) {
  return (
    <motion.div
      variants={iconVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

export function LineupStatus() {
  const { isDirty, isSaving, preventSaving } = useLineupStatus();

  // Determine content based on state
  let content;
  if (isSaving) {
    content = (
      <StatusContainer containerKey="saving">
        <Spinner size="sm" color="default" />
      </StatusContainer>
    );
  } else if (preventSaving && isDirty) {
    content = (
      <StatusContainer
        containerKey="preventSaving"
        className="size-6 rounded-full bg-warning-100 text-warning opacity-75"
      >
        <IconWrapper>
          <ClockIcon size={16} weight="duotone" />
        </IconWrapper>
      </StatusContainer>
    );
  } else if (isDirty) {
    content = (
      <StatusContainer
        containerKey="dirty"
        className="size-6 rounded-full bg-warning-100 text-warning opacity-75"
      >
        <IconWrapper>
          <PencilLineIcon size={16} weight="duotone" />
        </IconWrapper>
      </StatusContainer>
    );
  } else {
    content = (
      <StatusContainer
        containerKey="clean"
        className="size-6 rounded-full bg-success-100 text-success opacity-75"
      >
        <IconWrapper>
          <CheckIcon size={16} weight="bold" />
        </IconWrapper>
      </StatusContainer>
    );
  }

  return (
    <div className="relative size-6">
      <AnimatePresence mode="wait">{content}</AnimatePresence>
    </div>
  );
}
