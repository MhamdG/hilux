import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Field } from '../fields';
import { FieldsService } from 'src/app/shared/fields.service';
import { ControlContainer, NgForm } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CanvasSignatureComponent } from 'src/app/shared/canvas-signature/canvas-signature.component';

@Component({
  selector: 'app-signature-collection-field',
  templateUrl: './signature-collection-field.component.html',
  styleUrls: ['./signature-collection-field.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class SignatureCollectionFieldComponent implements OnInit {
  dataOptions: any;

  @Input() field: Field;
  @Input() customClass: string;
  @Input() formData: any;
  @Input() row: any;
  @Input() index: any = 0;
  @Input() fullFormData: any;
  @Input() formErrors: any;
  @Input() defaultValues: any;

  selectedRow: any = null;
  @ViewChild(CanvasSignatureComponent) canvasSignature!: CanvasSignatureComponent;

  constructor(
    private service: FieldsService, 
    public ngxSmartModalService: NgxSmartModalService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Make sure formData object exists for this field
    if (!this.formData) this.formData = {};
    if (!this.formData[this.field.fieldID]) {
        this.formData[this.field.fieldID] = {};
    }

    this.service.getFieldData(this.field, this.fullFormData).subscribe({
      next: (data) => {
        // Automatically unwrap if API returns {status: 'success', data: [...]}
        if (data && data.data && Array.isArray(data.data)) {
          this.dataOptions = data.data;
        } else {
          this.dataOptions = data;
        }
      },
      error: (err) => {
        console.error('[SignatureComponent] Error fetching data:', err);
      }
    });
  }

  getFieldName(name: string, index: any) {
    return this.service.getFieldName(name, this.row, this.index) + `_${index}`;
  }

  showErrors(field_name: any) {
    return this.service.showErrors(field_name, this.formErrors);
  }

  getErrors(field_name: any) {
    return this.service.getErrors(field_name, this.formErrors);
  }

  getName(field_name) {
    return this.service.getFieldName(field_name, this.row, this.index);
  }

  getText(field: any, key: string) {
    return this.service.getText(field, key);
  }

  hasErrors() {
    let errors = false;
    if (this.field.required == 'true') {
      errors = this.allSignaturesCollected === null;
    }
    return errors;
  }

  get allSignaturesCollected(): string | null {
    if (!this.dataOptions || this.dataOptions.length === 0) {
      // If data is loading or no signees, we check if it is explicitly required?
      // Usually, if no signees are required, it shouldn't block, but let's be safe.
      return "EMPTY"; 
    }
    
    const requiredSignaturesCount = this.dataOptions.length;
    const signaturesObj = this.formData[this.field.fieldID] || {};
    
    // Only count signatures that have an actual base64 string
    const collectedSignaturesCount = Object.keys(signaturesObj).filter(key => !!signaturesObj[key]).length;
    
    if (collectedSignaturesCount >= requiredSignaturesCount) {
      return "ALL_SIGNED";
    }
    
    return null;
  }

  isRequired() {
    return this.service.isRequired(this.field.required, this.field.fieldID);
  }

  getSignature(entityID: string) {
    if (!this.formData || !this.formData[this.field.fieldID]) return null;
    return this.formData[this.field.fieldID][entityID];
  }

  get modalId() {
    return 'signatureModal_' + this.field.fieldID;
  }

  openSignaturePopup(row: any) {
    this.selectedRow = row;
    if (this.canvasSignature) {
       this.canvasSignature.clear(); // Ensure canvas is blank
    }
    this.ngxSmartModalService.getModal(this.modalId).open();
  }

  onSignatureSaved(base64Image: string) {
    if (this.selectedRow) {
      if (base64Image) {
        if (!this.formData) this.formData = {};
        if (!this.formData[this.field.fieldID]) this.formData[this.field.fieldID] = {};
        this.formData[this.field.fieldID][this.selectedRow.entityID] = base64Image;
      }
      this.cdr.detectChanges(); // Force angular to detect the new image
    }
    this.ngxSmartModalService.getModal(this.modalId).close();
  }

  clearSignature(row: any) {
    if (this.formData && this.formData[this.field.fieldID]) {
      delete this.formData[this.field.fieldID][row.entityID];
    }
    this.cdr.detectChanges();
  }
}
