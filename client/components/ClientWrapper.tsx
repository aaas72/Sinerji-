"use client";
import AuthHydrator from "@/components/auth/AuthHydrator";
import React from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <>
    <AuthHydrator />
    {children}
  </>;
}