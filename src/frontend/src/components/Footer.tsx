export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t-2 border-border bg-muted/50 py-6 text-center">
      <p className="text-muted-foreground text-sm font-body">
        🤖 Francis — A fun tech world for kids! © {year}. Built with ❤️ using{" "}
        <a
          href={utmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-secondary hover:text-accent transition-colors"
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}
