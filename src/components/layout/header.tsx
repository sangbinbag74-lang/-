import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle"; // We will create this next

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between px-4 lg:px-8">
                <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-brand-deepNavy dark:text-foreground">
                    The Private Briefing.
                </Link>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/posts" className="transition-colors hover:text-foreground text-foreground/60">Articles</Link>
                        <Link href="/shorts" className="transition-colors hover:text-foreground text-foreground/60">Shorts</Link>
                        <Link href="/about" className="transition-colors hover:text-foreground text-foreground/60">About</Link>
                    </nav>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
