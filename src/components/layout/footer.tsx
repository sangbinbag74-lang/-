export function Footer() {
    return (
        <footer className="border-t py-6 md:py-0 mt-auto">
            <div className="container mx-auto max-w-screen-xl flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row px-4 lg:px-8">
                <p className="text-sm leading-loose text-muted-foreground text-center md:text-left">
                    <span className="font-semibold text-foreground">비공개 브리핑</span> 제작. 차세대 1인 미디어 플랫폼.
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
                    <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
                </div>
            </div>
        </footer>
    );
}
