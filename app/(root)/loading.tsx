
"use client";

import { AnimatePresence } from "framer-motion";
import Preloader from "@/components/organisms/preloader";

export default function Loading() {
  return (
    <AnimatePresence mode="wait">
      <Preloader />
    </AnimatePresence>
  );
}