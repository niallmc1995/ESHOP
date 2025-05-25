import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'ui-gallery',
    templateUrl: './gallery.component.html',
    styles: []
})
export class GalleryComponent implements OnChanges {
    @Input() images: string[] = [];
    selectedImageUrl: string = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['images'] && this.hasImages) {
            this.selectedImageUrl = this.images[0];
        }
    }

    changeSelectedImage(imageUrl: string) {
        this.selectedImageUrl = imageUrl;
    }

    get hasImages(): boolean {
        return Array.isArray(this.images) && this.images.length > 0;
    }
}
