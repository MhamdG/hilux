import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CanvasSignatureComponent } from '../shared/canvas-signature/canvas-signature.component';

interface UserSignature {
  ownerId: string;
  name: string;
  signatureImage: string | null;
}

@Component({
  selector: 'app-signature-test',
  templateUrl: './signature-test.component.html',
  styleUrls: ['./signature-test.component.css']
})
export class SignatureTestComponent {
  users: UserSignature[] = [
    { ownerId: '123', name: 'Mohamed', signatureImage: null },
    { ownerId: '124', name: 'Ahmed', signatureImage: null },
    { ownerId: '125', name: 'Ali', signatureImage: null }
  ];

  selectedUser: UserSignature | null = null;
  @ViewChild(CanvasSignatureComponent) canvasSignature!: CanvasSignatureComponent;

  constructor(
    public ngxSmartModalService: NgxSmartModalService,
    private cdr: ChangeDetectorRef
  ) {}

  openSignaturePopup(user: UserSignature) {
    this.selectedUser = user;
    if (this.canvasSignature) {
       this.canvasSignature.clear(); // Ensure canvas is blank
    }
    this.ngxSmartModalService.getModal('signatureModal').open();
  }

  onSignatureSaved(base64Image: string) {
    if (this.selectedUser) {
      // Even if empty, let's keep it null if no signature
      this.selectedUser.signatureImage = base64Image ? base64Image : null;
      
      this.cdr.detectChanges(); // Force angular to detect the new image
    }
    this.ngxSmartModalService.getModal('signatureModal').close();
  }

  clearSignature(user: UserSignature) {
    user.signatureImage = null;
    this.cdr.detectChanges();
  }
}
