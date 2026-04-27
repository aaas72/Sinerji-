"use client";
import { useAutoAuth } from "@/hooks/useAuth";
export default function AuthHydrator() {
  useAutoAuth();
  return null;
}