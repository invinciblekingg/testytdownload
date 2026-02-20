export const metadata = {
  title: "YTFlow — Download & Transcribe YouTube Videos",
  description:
    "The fastest way to download YouTube videos and generate AI-powered transcriptions in 140+ languages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" rel="preload" as="script" />
      </head>
      <body>{children}</body>
    </html>
  );
}
