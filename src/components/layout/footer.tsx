export function Footer() {
    return (
        <footer className="border-t py-6 md:py-0 mt-auto">
            <div className="container mx-auto max-w-screen-xl flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row px-4 lg:px-8">
                <p className="text-sm leading-loose text-muted-foreground text-center md:text-left">
                    Built by <span className="font-semibold text-foreground">The Private Briefing</span>. The Next Generation Personal Media.
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                </div>
            </div>
        </footer>
    );
}
