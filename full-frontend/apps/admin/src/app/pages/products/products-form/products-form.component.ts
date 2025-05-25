import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService, Product, ProductsService } from '@redmane/products';
import { MessageService } from 'primeng/api';
import { lastValueFrom, timer } from 'rxjs';

@Component({
    selector: 'admin-products-form',
    templateUrl: './products-form.component.html',
    styles: []
})
export class ProductsFormComponent implements OnInit {
    editmode = false;
    form: FormGroup;
    isSubmitted = false;
    categories = [];
    imageDisplay: string | ArrayBuffer;
    currentProductId: string;
    galleryFiles: File[] = [];
    galleryPreview: string[] = [];
    existingGalleryImages: string[] = []; // For images already saved in DB
    image: File | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private productsService: ProductsService,
        private categoriesService: CategoriesService,
        private messageService: MessageService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._getCategories();
        this._checkEditMode();
    }

    private _initForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            brand: ['', Validators.required],
            price: ['', Validators.required],
            category: ['', Validators.required],
            countInStock: ['', Validators.required],
            description: ['', Validators.required],
            richDescription: [''],
            image: ['', Validators.required],
            isFeatured: [false]
        });
    }

    private _getCategories() {
        this.categoriesService.getCategories().subscribe((categories) => {
            this.categories = categories;
        });
    }

    private _addProduct(productData: FormData) {
        this.productsService.createProduct(productData).subscribe(
            (product: Product) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Product ${product.name} is created!`
                });
                timer(2000)
                    .toPromise()
                    .then(() => {
                        this.location.back();
                    });
            },
            () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Product is not created!'
                });
            }
        );
    }

    private _updateProduct(productFormData: FormData) {
        this.productsService.updateProduct(productFormData, this.currentProductId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Product is updated!'
                });

                // Delay 2s before navigating back
                // timer(2000).subscribe(() => {
                //     this.location.back();
                // });
            },
            error: (error) => {
                console.error('Update failed:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Product is not updated!'
                });
            }
        });
    }

    private _checkEditMode() {
        this.route.params.subscribe((params) => {
            if (params.id) {
                this.editmode = true;
                this.currentProductId = params.id;
                this.productsService.getProduct(params.id).subscribe((product) => {
                    this.productForm.name.setValue(product.name);
                    this.productForm.category.setValue(product.category.id);
                    this.productForm.brand.setValue(product.brand);
                    this.productForm.price.setValue(product.price);
                    this.productForm.countInStock.setValue(product.countInStock);
                    this.productForm.isFeatured.setValue(product.isFeatured);
                    this.productForm.description.setValue(product.description);
                    this.productForm.richDescription.setValue(product.richDescription);
                    this.imageDisplay = product.image;
                    this.existingGalleryImages = product.images || [];
                    this.productForm.image.setValidators([]);
                    this.productForm.image.updateValueAndValidity();
                });
            }
        });
    }

    removeExistingImage(index: number) {
        this.existingGalleryImages.splice(index, 1);
    }

    removeNewGalleryImage(index: number) {
        this.galleryFiles.splice(index, 1);
        this.galleryPreview.splice(index, 1);
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) return;

        const productFormData = new FormData();
        Object.keys(this.productForm).forEach((key) => {
            const value = this.productForm[key].value;
            if (value !== null && value !== undefined) {
                productFormData.append(key, value);
            }
        });

        // Retained existing images
        this.existingGalleryImages.forEach((url) => productFormData.append('existingImages', url));

        // Newly added images
        this.galleryFiles.forEach((file) => productFormData.append('images', file));

        if (this.editmode) {
            this._updateProduct(productFormData);
        } else {
            this._addProduct(productFormData);
        }
    }

    onCancel() {
        this.location.back();
    }

    onImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.form.patchValue({ image: file });
            this.form.get('image').updateValueAndValidity();
            const fileReader = new FileReader();
            fileReader.onload = () => {
                this.imageDisplay = fileReader.result;
            };
            fileReader.readAsDataURL(file);
        }
    }

    onGalleryUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const newFiles = Array.from(input.files);
            newFiles.forEach((file) => {
                this.galleryFiles.push(file);
                const reader = new FileReader();
                reader.onload = () => {
                    this.galleryPreview.push(reader.result as string);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    get productForm() {
        return this.form.controls;
    }
}
