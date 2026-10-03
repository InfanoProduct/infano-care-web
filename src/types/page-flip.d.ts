declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, setting: Record<string, any>);
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void;
    loadFromImages(images: string[]): void;
    turnToPage(page: number): void;
    flipNext(): void;
    flipPrev(): void;
    flip(page: number): void;
    destroy(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    on(event: string, callback: (e: any) => void): void;
    off(event: string, callback: (e: any) => void): void;
    update(): void;
  }
}
