import React from "react";
import siteData from "../../data/data.json";

type SocialsInput = {
  [key: string]: any;
  custom?: Array<{ label: string; link: string; iconUrl?: string }>;
};

const ICON = {
  github: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.2-3.37-1.2-.46-1.17-1.12-1.48-1.12-1.48-.91-.62.07-.6.07-.6 1 .07 1.53 1.06 1.53 1.06.9 1.53 2.36 1.09 2.93.83.09-.66.35-1.1.63-1.36-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .85-.27 2.78 1.02a9.6 9.6 0 0 1 5.06 0c1.93-1.29 2.78-1.02 2.78-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M3 3h4.1l5.1 7.2L17.1 3H21l-7.5 10.4L21.2 21h-4.1l-5.3-7.5L6.4 21H3l7.7-10.6L3 3z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5 2.5 2.5 0 0 1 4.98 3.5zM.5 8.5h4V24h-4zM7.5 8.5h3.8v2.1h.1c.6-1.1 2-2.1 3.9-2.1 3.9 0 7.7 2.5 7.7 8.5V24h-4v-6c0-3-1.1-5.2-3.9-5.2-2 0-3.3 1.4-3.8 2.7-.2.4-.3 1-.3 1.6V24h-4z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5zm6-1.3a1.3 1.3 0 1 0 1.3 1.3 1.3 1.3 0 0 0-1.3-1.3z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M22 12A10 10 0 1 0 10.5 21.9v-7h-2.6V12h2.6V9.7c0-2.6 1.5-4 3.8-4 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  ),
  twitch: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M4 2h18v12l-5 5h-4l-3 3H8v-3H4zM8 4v9h7l3-3V4zM13 7h2v4h-2zm-4 0h2v4H9z" />
    </svg>
  ),
  dribbble: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm6.8 6.2a8.1 8.1 0 0 1 1.1 4.1c-2.3-.4-4.3-.4-6 .1-.2-.5-.4-1-.7-1.6 2-.9 3.8-2.2 5.6-2.6zM12 3.9c1.5 1.6 2.7 3.3 3.5 5-1.6.6-3.2 1.1-4.8 1.3-.6-1.2-1.3-2.5-2.3-3.9A8.1 8.1 0 0 1 12 3.9zM7.3 7.5c.9 1.3 1.7 2.6 2.3 3.8-2 .2-4.2.2-6.6 0a8.1 8.1 0 0 1 4.3-3.8zm-4.6 5c2.9.2 5.2.2 7.1-.1.2.5.4 1 .6 1.5-1.7.5-3.6 1.6-5.8 3.5a8.1 8.1 0 0 1-1.9-4.9zm3.2 6.1c1.9-1.6 3.5-2.6 5-3 1.1 2.9 1.9 5.1 2.2 6.2a8.1 8.1 0 0 1-7.2-3.2zm9.6 2.5c-.3-1.1-1.1-3.3-2.2-6.1 1.5-.4 3.3-.5 5.5-.2a8.1 8.1 0 0 1-3.3 6.3z" />
    </svg>
  ),
  behance: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M3 6h6a4 4 0 0 1 0 8H3V6zm6 6a2 2 0 0 0 0-4H5v4h4zm10.2-2.5c2 0 3.8 1.4 3.8 4V14h-6.4c.2 1 1 1.6 2.2 1.6.9 0 1.5-.2 2.2-.8l1.5 1.4c-1 1-2.3 1.6-3.8 1.6-2.5 0-4.3-1.7-4.3-4.3 0-2.5 1.8-4 3.8-4zm-1.9 3h3.8c-.2-.9-.9-1.3-1.9-1.3s-1.7.5-1.9 1.3zM14 6h5v1.5h-5z" />
    </svg>
  ),
  medium: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M2 6.5c0-.3.1-.5.3-.7L4.7 3V2.5H0V3l2.1 2.5c.1.1.2.3.2.5v10.1c0 .2-.1.4-.2.5L0 19v.5h7.1V19l-2.3-2.9c-.1-.1-.2-.3-.2-.5V7.3l5.7 12.2h.7l4.9-12.2v9.7c0 .2 0 .4-.2.5l-1.8 2.2V19H24v-.5l-1.8-2.2c-.1-.1-.2-.3-.2-.5V5.2c0-.2.1-.4.2-.5L24 2.5V2h-7.3l-3.9 9.8L8.9 2H2v.5l2 2.4c.2.1.3.3.3.6v10z" />
    </svg>
  ),
  devto: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M7 8h2.8a2.2 2.2 0 1 1 0 4.4H9.2V16H7V8zm6 .1h2.9c1.9 0 3.1 1.2 3.1 2.9V13c0 1.8-1.3 3-3.3 3H13V8.1zm2.2 5.3h.6c.7 0 1.1-.4 1.1-1v-1c0-.6-.4-1-1.1-1h-.6v3zM2 5h20v14H2z" />
    </svg>
  ),
  hashnode: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5zm0 5.2L7.7 12 12 16.3 16.3 12 12 7.7z" />
    </svg>
  ),
  polywork: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M4 4h16v6H4zM4 14h9v6H4zM15 14h5v6h-5z" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.4 6H15.9A15.6 15.6 0 0 0 14.2 3.9 8 8 0 0 1 19.4 8zM12 4c.8 1.1 1.5 2.5 2 4h-4c.5-1.5 1.2-2.9 2-4zM4.6 8A8 8 0 0 1 9.8 3.9 15.6 15.6 0 0 0 8.1 8H4.6zM4 12c0-.7 0-1.4.1-2h3.6a17 17 0 0 0 0 4H4.1c0-.6-.1-1.3-.1-2zm.6 4h3.5a15.6 15.6 0 0 0 1.7 4.1A8 8 0 0 1 4.6 16zM12 20c-.8-1.1-1.5-2.5-2-4h4c-.5 1.5-1.2 2.9-2 4zm2.2 0A17.5 17.5 0 0 0 16.7 16h3.6a8 8 0 0 1-6.1 4zM20 12c0 .7 0 1.4-.1 2h-3.6a17 17 0 0 0 0-4h3.6c.1.6.1 1.3.1 2z" />
    </svg>
  ),
  stackoverflow: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M17 21H5v-7h2v5h10v2zM7 18h8v-2H7v2zm.3-4.3 8.2 1.7.4-1.9-8.2-1.7-.4 1.9zm1.5-4.7 7 3.7.9-1.7-7-3.7-.9 1.7zM13.8 3l-1.2 1.6 6 4.6L20 7.6 13.8 3z" />
    </svg>
  ),
  codepen: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 2 1 8v8l11 6 11-6V8L12 2zm8 12-8 4.4L4 14v-4l8-4.4L20 10v4zM8.5 9.2 6 10.7v2.6l2.5 1.5L11 13v-2.1L8.5 9.2zm7 0L13 10.9V13l2.5 1.8 2.5-1.5v-2.6l-2.5-1.5z" />
    </svg>
  ),
  codesandbox: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 1 2 6.5v11L12 23l10-5.5v-11L12 1zm0 2.3 7.7 4.3L12 12 4.3 7.6 12 3.3zM4 9.3l7 3.9v7.5L4 16.8V9.3zm16 0v7.5l-7 3.9v-7.5l7-3.9z" />
    </svg>
  ),
  fiverr: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M9 6h6v2H9v2h6v8h-2v-6H9v6H7V6h2zM4 10h2v8H4v-8zm16 0h2v8h-2v-8z" />
    </svg>
  ),
  upwork: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M4 6h2v6c0 1.7 1.3 3 3 3s3-1.3 3-3V6h2v6c0 2.8-2.2 5-5 5s-5-2.2-5-5V6zm14 .1c2.2 0 4 1.8 4 4V16h-2v-5.9c0-1.1-.9-2-2-2-.9 0-1.7.6-2 1.4V16h-2V6.3h2v1.3c.6-.9 1.7-1.5 3-1.5z" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M20 4a18 18 0 0 0-4.4-1.4l-.2.5A16 16 0 0 1 12 3a16 16 0 0 1-3.4.1l-.2-.5A18 18 0 0 0 4 4c-1.8 2.7-2 5.4-2 8a14 14 0 0 0 9 8.5l.6-2.1a10 10 0 0 1-2.3-.9l.5-1.8c.8.3 1.7.5 2.6.5s1.8-.2 2.6-.5l.5 1.8c-.8.4-1.6.7-2.4.9l.6 2.1A14 14 0 0 0 22 12c0-2.6-.2-5.3-2-8zM9.5 13.5c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7zm5 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7z" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M9.5 15.5 9 20l2.9-2.5 5.7 4.1L22 4 2 11.6l5.4 2 12.1-7.6-10 10.5z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M20 12a8 8 0 0 1-11.7 7L4 20l1-4.3A8 8 0 1 1 20 12zm-8.8-3.5c-.2-.5-.4-.5-.7-.5h-.7c-.2 0-.5.1-.7.4s-1 1-1 2.4 1 2.8 1.2 3c.2.3 2 3.2 5 4 2.5.6 3.1.5 3.6.5s1.8-.7 2-1.4.2-1.3.1-1.4-.2-.2-.5-.3l-1.8-.8c-.3-.1-.4-.1-.6.1s-.7.8-.8.9-.3.2-.6.1-1.1-.4-2-1.2c-.7-.6-1.2-1.4-1.3-1.6s0-.4.1-.6.3-.4.4-.5.2-.3.3-.4c.1-.1.1-.3 0-.5l-.8-1.9c-.2-.4-.3-.5-.5-.6z" />
    </svg>
  ),
  skype: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M6.5 2A4.5 4.5 0 0 0 2 6.5c0 .6.1 1.2.3 1.8A8.7 8.7 0 0 0 6.5 22 4.5 4.5 0 0 0 22 17.5a8.7 8.7 0 0 0-13.7-9.7c-.6-.2-1.2-.3-1.8-.3zM12 8c2.2 0 4 1.1 4 2.5 0 1.1-1 1.8-2.6 2.1l-1.2.2c-.7.1-1.2.3-1.2.6 0 .3.5.6 1.2.6 1 0 1.6-.3 2.2-.6l.9 1.6c-.8.5-1.7.9-3.1 1-2.2 0-4-1.1-4-2.6 0-1.1.9-1.8 2.6-2.1l1.2-.2c.7-.1 1.1-.3 1.1-.6 0-.3-.4-.6-1.2-.6-.9 0-1.7.3-2.4.7l-.9-1.6C9.1 8.4 10.4 8 12 8z" />
    </svg>
  ),
  snapchat: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 2c3 0 5.4 2.4 5.4 5.4 0 1.6-.5 2.7-.6 3-.2.4.1.7.9 1 .8.3 1.7.6 1.7 1.3s-1.3 1-2.1 1.1c-.8.1-1.2.5-1.2.9 0 .4.4.7 1 .9.6.2 1.7.2 1.7.9s-1.5 1-2.6 1.1c-1.1.1-1.8.8-2.2 1.3-.7.9-1.6 1.2-2 1.2s-1.3-.3-2-1.2c-.4-.5-1.1-1.2-2.2-1.3-1.1-.1-2.6-.4-2.6-1.1s1.1-.7 1.7-.9c.6-.2 1-.5 1-.9 0-.4-.4-.8-1.2-.9C3 14.7 1.7 14.4 1.7 13.7s.9-1 1.7-1.3c.8-.3 1.1-.6.9-1-.1-.3-.6-1.4-.6-3C4.6 4.4 7 2 10 2h2z" />
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2.1.2-3l1.3-5s-.3-.6-.3-1.4c0-1.3.7-2.2 1.6-2.2.8 0 1.2.6 1.2 1.3 0 .8-.5 2-0.8 3.1-.2 1 .4 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.6 0-2.4-1.7-4.1-4.2-4.1-2.8 0-4.4 2.1-4.4 4.3 0 .9.4 1.8.9 2.3.1.1.1.1.1-.1l.3-1.2c0-.2 0-.3-.2-.5-.2-.7 0-1.9 1.3-1.9 1.1 0 1.8.8 1.8 1.9 0 1.3-.9 3.1-2.1 3.1-.6 0-1.1-.5-.9-1.2l.3-1c.1-.4.1-.8 0-1.1-.2-.5-.7-.9-1.3-.9-1 0-1.8.9-1.8 2.2 0 .8.3 1.3.3 1.3l-1 4.2c-.2 1-.1 2.5-.1 2.5A10 10 0 1 0 12 2z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M15 3h2a5 5 0 0 0 5 5V10a7 7 0 0 1-5-2v7a6 6 0 1 1-6-6c.3 0 .7 0 1 .1V11a3.5 3.5 0 1 0 2 3.1V3z" />
    </svg>
  ),
  reddit: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M22 12.5c0-1-.8-1.8-1.8-1.8-.7 0-1.3.4-1.6 1a8.3 8.3 0 0 0-4.6-1.5l.8-3.8 2.6.6c.1.8.8 1.4 1.7 1.4 1 0 1.8-.8 1.8-1.8S20.1 4 19 4c-.7 0-1.2.4-1.5.9l-3.3-.8-1.1 5.1h-.5a8.3 8.3 0 0 0-4.7 1.5c-.3-.6-.9-1-1.6-1C4.8 10.7 4 11.5 4 12.5c0 .6.3 1.1.8 1.4a3.7 3.7 0 0 0 0 .7c0 2.9 3.2 5.3 7.2 5.3s7.2-2.4 7.2-5.3c0-.2 0-.5-.1-.7.5-.3.9-.8.9-1.4zM9 13.5c0-.8.7-1.4 1.5-1.4s1.5.6 1.5 1.4-.7 1.4-1.5 1.4S9 14.3 9 13.5zm8.2 2.1c-.9 1.3-2.9 2.2-5 2.2s-4.1-.9-5-2.2c-.2-.3.2-.6.5-.3.9 1 2.7 1.7 4.5 1.7 1.8 0 3.6-.7 4.5-1.7.3-.3.8 0 .5.3zM12.5 13.5c0-.8.7-1.4 1.5-1.4s1.5.6 1.5 1.4-.7 1.4-1.5 1.4-1.5-.6-1.5-1.4z" />
    </svg>
  ),
  tumblr: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M14 3h-3C11 6 9 8 6 8v3h3v5c0 2.9 2 5 5 5 1.2 0 2-.2 3-.6v-3c-.6.3-1.3.5-2 .5-1.2 0-2-.8-2-2v-5h4V8h-4V3z" />
    </svg>
  ),
  quora: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 2C6.8 2 3 5.7 3 11s3.8 9 9 9c1.8 0 3.4-.4 4.7-1.2l1.7 2.2h2.8l-3-3.8c1.7-1.6 2.8-3.9 2.8-6.2 0-5.3-3.8-9-9-9zm0 15.2c-3.3 0-5.7-2.6-5.7-6.2S8.7 4.8 12 4.8c3.2 0 5.7 2.6 5.7 6.2 0 1.7-.7 3.3-1.8 4.3l-1.2-1.5H12v2.9z" />
    </svg>
  ),
  gitlab: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M22 13.5 19 4l-2.2 6.8H7.2L5 4 2 13.5 12 22l10-8.5z" />
    </svg>
  ),
  bitbucket: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M3 3h18l-2.5 18H5.5L3 3zm12.6 12L17 9H7l1.4 6h7.2z" />
    </svg>
  ),
  rss: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M4 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-.5-6.5v3A8.5 8.5 0 0 1 12 23h3A11.5 11.5 0 0 0 3.5 11.5zm0-6v3A14.5 14.5 0 0 1 18 23h3A17.5 17.5 0 0 0 3.5 5z" />
    </svg>
  ),
} as const satisfies Record<string, React.ReactElement>;

type IconKey = keyof typeof ICON;

const ALIAS: Record<string, IconKey> = {
  x: "twitter",
  site: "website",
  portfolio: "website",
};

function pickIcon(key: string): React.ReactElement {
  const k = key.toLowerCase();
  const normalized: IconKey = (ALIAS[k] ?? (k in ICON ? (k as IconKey) : "website")) as IconKey;
  return ICON[normalized];
}

export const Footer: React.FC<{ socials: SocialsInput }> = ({ socials }) => {
  const items = Object.entries(socials || {})
    .filter(([k]) => k !== "custom")
    .filter(([_, v]) => typeof v === "string" && !!v);

  const custom = Array.isArray(socials?.custom) ? socials.custom : [];

  const name = siteData?.personal?.name || "Tri Yatna";
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 text-sm">
      <div
        aria-hidden="true"
        className="ft-topline pointer-events-none absolute inset-x-0 -top-px h-px"
      />

      <div className="w-full border-t border-subtle bg-[color:var(--bg)]/65 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mx-auto grid max-w-3xl grid-cols-[repeat(auto-fit,minmax(44px,1fr))] gap-3">
            {items.map(([key, url]) => (
              <a
                key={key}
                href={String(url)}
                target="_blank"
                rel="noreferrer"
                aria-label={key}
                title={key}
                className="group inline-flex items-center justify-center rounded-xl p-2 border border-subtle bg-[color:var(--bg)]/55 hover:bg-[color:var(--accent)]/10 transition shadow-sm hover:shadow focus-ring"
              >
                <span className="text-[color:var(--text)] group-hover:text-[color:var(--accent)] transition-colors">
                  {pickIcon(key)}
                </span>
              </a>
            ))}

            {custom.map((c, i) => (
              <a
                key={`custom-${i}`}
                href={c.link}
                target="_blank"
                rel="noreferrer"
                title={c.label}
                className="group col-span-2 sm:col-span-1 inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-subtle bg-[color:var(--bg)]/55 hover:bg-[color:var(--accent)]/10 transition shadow-sm hover:shadow focus-ring"
              >
                {c.iconUrl ? (
                  <img
                    src={c.iconUrl}
                    alt=""
                    className="h-4 w-4 rounded-sm object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-[color:var(--accent)]">{pickIcon("website")}</span>
                )}
                <span className="truncate text-[color:var(--text)] group-hover:text-[color:var(--accent)] text-xs font-medium">
                  {c.label}
                </span>
              </a>
            ))}
          </div>

          <div aria-hidden="true" className="ft-divider mx-auto my-6 h-px max-w-3xl" />

          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-muted">
              Copyright © {year} {name}. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">Built with ❤️</span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-subtle bg-[color:var(--bg)]/55 px-2 py-1 text-xs">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" />
                <span className="text-muted">TY Studio DEV</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="ft-backdrop pointer-events-none absolute inset-x-0 bottom-0 h-24 -z-10"
      />

      <style>{`
        .ft-topline {
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.6;
        }
        .ft-divider {
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.25;
        }
        .ft-backdrop {
          background: radial-gradient(60% 100% at 50% 100%, color-mix(in oklch, var(--accent) 20%, transparent) 0%, transparent 70%);
          filter: blur(20px);
          opacity: 0.6;
        }
      `}</style>
    </footer>
  );
};
